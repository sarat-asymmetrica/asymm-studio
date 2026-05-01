import { expect, test, type Page } from '@playwright/test';

const routes = [
  '/',
  '/aesthetic-engine/',
  '/aesthetic-engine/explorer/',
  '/aesthetic-engine/compare/',
  '/aesthetic-engine/components/',
  '/bio-resonance/calibration/',
  '/bio-resonance/gaze-cursor/',
  '/bio-resonance/stress-adaptive/',
  '/bio-resonance/continuous-auth/',
  '/integration/',
  '/integration/aesthetic-auth/',
  '/manifesto/'
] as const;

const widths = [320, 768, 1024, 1440] as const;
const baseUrl = process.env.LAB_AUDIT_BASE_URL ?? 'http://127.0.0.1:4322';

async function auditPage(page: Page, route: string, width: number): Promise<void> {
  await page.setViewportSize({ width, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });

  const metrics = await page.evaluate(() => {
    const visibleElements = Array.from(document.querySelectorAll<HTMLElement>('body *')).filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    });

    function parseRgb(color: string): [number, number, number] | null {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?/);
      if (!match) return null;
      if (match[4] !== undefined && Number(match[4]) === 0) return null;
      return [Number(match[1]), Number(match[2]), Number(match[3])];
    }

    function luminance([red, green, blue]: [number, number, number]): number {
      const values = [red, green, blue].map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
    }

    function contrastRatio(foreground: [number, number, number], background: [number, number, number]): number {
      const light = Math.max(luminance(foreground), luminance(background));
      const dark = Math.min(luminance(foreground), luminance(background));
      return (light + 0.05) / (dark + 0.05);
    }

    const contrastFailures = visibleElements
      .filter((element) => (element.textContent ?? '').trim().length > 0)
      .filter((element) => Array.from(element.children).every((child) => (child.textContent ?? '').trim().length === 0))
      .map((element) => {
        const style = getComputedStyle(element);
        const foreground = parseRgb(style.color);
        let parent: HTMLElement | null = element;
        let background: [number, number, number] | null = null;
        while (parent && !background) {
          const color = parseRgb(getComputedStyle(parent).backgroundColor);
          if (color) background = color;
          parent = parent.parentElement;
        }
        const ratio = foreground && background ? contrastRatio(foreground, background) : 21;
        const fontSize = Number.parseFloat(style.fontSize);
        const fontWeight = Number.parseInt(style.fontWeight, 10);
        const largeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
        return { text: (element.textContent ?? '').trim().slice(0, 80), ratio, required: largeText ? 3 : 4.5 };
      })
      .filter((result) => result.ratio < result.required);

    const interactive = Array.from(document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, summary'));
    const unreachable = interactive.filter((element) => element.tabIndex < 0 || element.getAttribute('aria-hidden') === 'true').map((element) => element.outerHTML.slice(0, 120));

    return {
      hasHeader: document.querySelector('header') !== null,
      hasMain: document.querySelector('main') !== null,
      hasNav: document.querySelector('nav') !== null,
      hasFooter: document.querySelector('footer') !== null,
      headingCount: document.querySelectorAll('h1').length,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      runningAnimations: Array.from(document.getAnimations()).filter((animation) => animation.playState === 'running').length,
      contrastFailures,
      unreachable
    };
  });

  expect(metrics.hasHeader).toBe(true);
  expect(metrics.hasMain).toBe(true);
  expect(metrics.hasNav).toBe(true);
  expect(metrics.hasFooter).toBe(true);
  expect(metrics.headingCount).toBeGreaterThanOrEqual(1);
  expect(metrics.horizontalOverflow).toBeLessThanOrEqual(1);
  expect(metrics.runningAnimations).toBe(0);
  expect(metrics.unreachable).toEqual([]);
  expect(metrics.contrastFailures).toEqual([]);
}

for (const route of routes) {
  for (const width of widths) {
    test(`${route} has responsive accessible layout at ${width}px`, async ({ page }) => {
      await auditPage(page, route, width);
    });
  }
}
