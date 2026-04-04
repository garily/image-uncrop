// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const FILE_URL = `file://${path.join(__dirname, '..', 'index.html')}`;

// App uses Meta on macOS, Ctrl on other platforms
const isMacRunner = process.platform === 'darwin';
const undo = isMacRunner ? 'Meta+z' : 'Control+z';
const redo = isMacRunner ? 'Meta+Shift+z' : 'Control+y';

// Helper: load the page with a specific browser language
async function load(page, languages = ['en-CA']) {
    await page.context().setExtraHTTPHeaders({});
    // Override navigator.languages before page load
    await page.addInitScript((langs) => {
        Object.defineProperty(navigator, 'languages', { get: () => langs });
        Object.defineProperty(navigator, 'language',  { get: () => langs[0] });
    }, languages);
    await page.goto(FILE_URL);
}

// Helper: load a small test image onto the canvas
async function loadImage(page) {
    const dataURL = await page.evaluate(() => {
        const c = document.createElement('canvas');
        c.width = 100; c.height = 80;
        c.getContext('2d').fillStyle = 'red';
        c.getContext('2d').fillRect(0, 0, 100, 80);
        return c.toDataURL('image/png');
    });
    const buffer = Buffer.from(dataURL.split(',')[1], 'base64');
    await page.locator('#imageUpload').setInputFiles({
        name: 'test.png',
        mimeType: 'image/png',
        buffer,
    });
    await expect(page.locator('#workspaceContainer')).toBeVisible();
    // Wait for canvas to be sized by the app (not the default 300x150)
    await page.waitForFunction(() => document.getElementById('canvas').width === 100);
}

// Helper: fill a number input, replacing its value, then commit with Tab
async function fillInput(page, selector, value) {
    await page.locator(selector).click({ clickCount: 3 });
    await page.locator(selector).fill(String(value));
    await page.locator(selector).press('Tab');
}

test.describe('i18n — locale detection', () => {
    test('defaults to English', async ({ page }) => {
        await load(page, ['en-US']);
        await expect(page.locator('#downloadBtn')).toHaveText('Save Image');
        await expect(page).toHaveTitle('Simple Image Uncrop Utility');
    });

    test('detects Japanese', async ({ page }) => {
        await load(page, ['ja-JP']);
        await expect(page.locator('#downloadBtn')).toHaveText('保存');
        await expect(page).toHaveTitle('画像アンクロップツール');
        await expect(page.locator('html')).toHaveAttribute('lang', 'ja');
    });

    test('detects Traditional Chinese (Taiwan)', async ({ page }) => {
        await load(page, ['zh-TW']);
        await expect(page.locator('#downloadBtn')).toHaveText('儲存圖片');
        await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
    });

    test('detects Traditional Chinese (Hong Kong)', async ({ page }) => {
        await load(page, ['zh-HK']);
        await expect(page.locator('#downloadBtn')).toHaveText('儲存圖片');
        await expect(page.locator('html')).toHaveAttribute('lang', 'zh-HK');
    });

    test('detects Simplified Chinese', async ({ page }) => {
        await load(page, ['zh-CN']);
        await expect(page.locator('#downloadBtn')).toHaveText('保存图片');
        await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
    });

    test('falls back to English for unsupported locale', async ({ page }) => {
        await load(page, ['fr-FR']);
        await expect(page.locator('#downloadBtn')).toHaveText('Save Image');
    });
});

test.describe('i18n — manual language switcher', () => {
    test('switching to Japanese updates all labels and title', async ({ page }) => {
        await load(page);
        await page.locator('#langSelect').selectOption('ja-JP');
        await expect(page.locator('#downloadBtn')).toHaveText('保存');
        await expect(page.locator('[data-i18n="zoom"]')).toHaveText('ズーム');
        await expect(page).toHaveTitle('画像アンクロップツール');
    });

    test('switching to Simplified Chinese updates labels', async ({ page }) => {
        await load(page);
        await page.locator('#langSelect').selectOption('zh-CHS');
        await expect(page.locator('#downloadBtn')).toHaveText('保存图片');
        await expect(page.locator('[data-i18n="center"]')).toHaveText('居中');
    });

    test('switching language updates html lang attribute', async ({ page }) => {
        await load(page);
        await page.locator('#langSelect').selectOption('zh-CHT-TW');
        await expect(page.locator('html')).toHaveAttribute('lang', 'zh-TW');
    });

    test('both desktop and mobile selectors stay in sync', async ({ page }) => {
        await load(page);
        await page.locator('#langSelect').selectOption('ja-JP');
        await expect(page.locator('#langSelectMobile')).toHaveValue('ja-JP');
    });
});

// ─── Help modal ──────────────────────────────────────────────────────────────

test.describe('Help modal', () => {
    test('is hidden on load', async ({ page }) => {
        await load(page);
        await expect(page.locator('#helpOverlay')).not.toHaveClass(/open/);
    });

    test('opens when desktop help button is clicked', async ({ page }) => {
        await load(page);
        await page.locator('#helpBtnDesktop').click();
        await expect(page.locator('#helpOverlay')).toHaveClass(/open/);
    });

    test('closes when "Got it" is clicked', async ({ page }) => {
        await load(page);
        await page.locator('#helpBtnDesktop').click();
        await page.locator('#helpClose').click();
        await expect(page.locator('#helpOverlay')).not.toHaveClass(/open/);
    });

    test('closes when backdrop is clicked', async ({ page }) => {
        await load(page);
        await page.locator('#helpBtnDesktop').click();
        await page.locator('#helpOverlay').click({ position: { x: 5, y: 5 } });
        await expect(page.locator('#helpOverlay')).not.toHaveClass(/open/);
    });

    test('help modal content is translated when language changes', async ({ page }) => {
        await load(page);
        await page.locator('#langSelect').selectOption('ja-JP');
        await page.locator('#helpBtnDesktop').click();
        await expect(page.locator('h2[data-i18n="helpTitle"]')).toHaveText('使い方');
        await expect(page.locator('#helpClose')).toHaveText('閉じる');
    });
});

// ─── Canvas / image loading ───────────────────────────────────────────────────

test.describe('Image loading', () => {
    test('workspace is hidden before image is loaded', async ({ page }) => {
        await load(page);
        await expect(page.locator('#workspaceContainer')).toBeHidden();
    });

    test('workspace becomes visible after image load', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await expect(page.locator('#workspaceContainer')).toBeVisible();
    });

    test('canvas dimensions match image dimensions on load', async ({ page }) => {
        await load(page);
        await loadImage(page);
        const dims = await page.evaluate(() => ({
            w: document.getElementById('canvas').width,
            h: document.getElementById('canvas').height,
        }));
        expect(dims.w).toBe(100);
        expect(dims.h).toBe(80);
    });

    test('width and height inputs reflect image dimensions', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await expect(page.locator('#widthInput')).toHaveValue('100');
        await expect(page.locator('#heightInput')).toHaveValue('80');
    });

    test('all margin inputs are zero on fresh load', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await expect(page.locator('#marginTop')).toHaveValue('0');
        await expect(page.locator('#marginBottom')).toHaveValue('0');
        await expect(page.locator('#marginLeft')).toHaveValue('0');
        await expect(page.locator('#marginRight')).toHaveValue('0');
    });
});

// ─── Margin inputs ────────────────────────────────────────────────────────────

test.describe('Margin inputs', () => {
    test('increasing top margin grows canvas height', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await fillInput(page, '#marginTop', 20);
        await expect(page.locator('#heightInput')).toHaveValue('100');
    });

    test('increasing bottom margin grows canvas height', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await fillInput(page, '#marginBottom', 20);
        await expect(page.locator('#heightInput')).toHaveValue('100');
    });

    test('increasing left margin grows canvas width', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await fillInput(page, '#marginLeft', 50);
        await expect(page.locator('#widthInput')).toHaveValue('150');
    });

    test('increasing right margin grows canvas width', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await fillInput(page, '#marginRight', 50);
        await expect(page.locator('#widthInput')).toHaveValue('150');
    });

    test('width input directly sets canvas width', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await fillInput(page, '#widthInput', 200);
        const w = await page.evaluate(() => document.getElementById('canvas').width);
        expect(w).toBe(200);
    });

    test('height input directly sets canvas height', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await fillInput(page, '#heightInput', 160);
        const h = await page.evaluate(() => document.getElementById('canvas').height);
        expect(h).toBe(160);
    });
});

// ─── Center button ────────────────────────────────────────────────────────────

test.describe('Center Image button', () => {
    test('centers image by equalizing margins after canvas was extended', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await fillInput(page, '#widthInput', 200);
        await fillInput(page, '#heightInput', 160);
        await page.locator('#centerBtn').click();
        await expect(page.locator('#marginLeft')).toHaveValue('50');
        await expect(page.locator('#marginRight')).toHaveValue('50');
        await expect(page.locator('#marginTop')).toHaveValue('40');
        await expect(page.locator('#marginBottom')).toHaveValue('40');
    });
});

// ─── Undo / Redo ──────────────────────────────────────────────────────────────

test.describe('Undo / Redo', () => {
    test('Ctrl+Z undoes a margin change', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await fillInput(page, '#marginTop', 30);
        await expect(page.locator('#heightInput')).toHaveValue('110');
        await page.locator('body').click();
        await page.keyboard.press(undo);
        await expect(page.locator('#heightInput')).toHaveValue('80');
    });

    test('Ctrl+Shift+Z redoes after undo', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await fillInput(page, '#marginTop', 30);
        await page.locator('body').click();
        await page.keyboard.press(undo);
        await page.keyboard.press(redo);
        await expect(page.locator('#heightInput')).toHaveValue('110');
    });

    test('Ctrl+Y redoes after undo', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await fillInput(page, '#marginTop', 30);
        await page.locator('body').click();
        await page.keyboard.press(undo);
        await page.keyboard.press(redo);
        await expect(page.locator('#heightInput')).toHaveValue('110');
    });

    test('new action after undo clears redo stack', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await fillInput(page, '#marginTop', 30);
        await page.locator('body').click();
        await page.keyboard.press(undo);
        await fillInput(page, '#marginLeft', 10);
        await page.locator('body').click();
        await page.keyboard.press(redo);
        await expect(page.locator('#marginTop')).toHaveValue('0');
    });
});

// ─── Zoom ─────────────────────────────────────────────────────────────────────

test.describe('Zoom slider', () => {
    test('zoom label updates when slider changes', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await page.locator('#zoomSlider').evaluate(el => {
            el.value = '0.5';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await expect(page.locator('#zoomLabel')).toHaveText('50%');
    });

    test('zoom label shows 100% on load', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await expect(page.locator('#zoomLabel')).toHaveText('100%');
    });

    test('canvas pixel dimensions are unchanged after zoom', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await page.locator('#zoomSlider').evaluate(el => {
            el.value = '0.5';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        const dims = await page.evaluate(() => ({
            w: document.getElementById('canvas').width,
            h: document.getElementById('canvas').height,
        }));
        expect(dims.w).toBe(100);
        expect(dims.h).toBe(80);
    });
});

// ─── Color picker ─────────────────────────────────────────────────────────────

test.describe('Color picker', () => {
    test('color picker defaults to white (#ffffff)', async ({ page }) => {
        await load(page);
        await expect(page.locator('#colorPicker')).toHaveValue('#ffffff');
    });

    test('changing color updates the picker value', async ({ page }) => {
        await load(page);
        await page.locator('#colorPicker').evaluate(el => {
            el.value = '#ff0000';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await expect(page.locator('#colorPicker')).toHaveValue('#ff0000');
    });
});

// ─── Save button ──────────────────────────────────────────────────────────────

test.describe('Save button', () => {
    test('download is triggered with correct filename', async ({ page }) => {
        await load(page);
        await loadImage(page);
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.locator('#downloadBtn').click(),
        ]);
        expect(download.suggestedFilename()).toBe('uncropped_100x80.png');
    });

    test('filename reflects updated canvas dimensions', async ({ page }) => {
        await load(page);
        await loadImage(page);
        await page.locator('#marginRight').fill('50');
        await page.locator('#marginRight').press('Tab');
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.locator('#downloadBtn').click(),
        ]);
        expect(download.suggestedFilename()).toBe('uncropped_150x80.png');
    });
});
