import AxeBuilder from '@axe-core/playwright';
import { expect, type Browser, type BrowserContext, type Locator, type Page } from '@playwright/test';

export interface Table {
  context: BrowserContext;
  tv: Page;
  phones: [Page, Page];
  code: string;
}

export const NAMES = ['Léa', 'Tom'] as const;

export async function openTable(browser: Browser, query = 'transport=local'): Promise<Table> {
  const context = await browser.newContext({ hasTouch: true });
  const tv = await context.newPage();
  await tv.setViewportSize({ width: 1920, height: 1080 });
  await tv.goto(`/?${query}`);
  await expect(tv.locator('.qr svg')).toBeVisible();
  const code = ((await tv.locator('.code b').textContent()) ?? '').trim();
  const phones: Page[] = [];
  for (const name of NAMES) {
    const phone = await context.newPage();
    await phone.setViewportSize({ width: 390, height: 844 });
    await phone.goto(`/?room=${code}&${query}`);
    await phone.fill('#name', name);
    await phone.locator('button[type="submit"]').tap();
    phones.push(phone);
  }
  await expect(tv.locator('.menu h1')).toHaveText('À quoi on joue ?');
  return { context, tv, phones: phones as [Page, Page], code };
}

export async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/screens/${name}.png` });
}

export const contrastIssues: string[] = [];

// Entrance animations fade elements in; measuring contrast mid-fade gives false alarms.
export async function animationsDone(page: Page): Promise<void> {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((animation) => animation.playState !== 'running' || animation.effect?.getTiming().iterations === Infinity),
  );
}

export async function look(page: Page, name: string): Promise<void> {
  await animationsDone(page);
  await shot(page, name);
  const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  for (const violation of results.violations) {
    for (const node of violation.nodes) {
      contrastIssues.push(`${name}: ${node.target.join(' ')} → ${node.failureSummary?.split('\n').slice(1).join(' ').trim()}`);
    }
  }
}

export async function settled(phone: Page): Promise<void> {
  await phone.locator('.phone:not(.guarded)').waitFor({ timeout: 15_000 });
}

export async function tapSettled(phone: Page, locator: Locator): Promise<void> {
  await locator.waitFor({ timeout: 15_000 });
  await settled(phone);
  await locator.tap();
}

export async function startGame(table: Table, title: string): Promise<void> {
  const phone = table.phones[0];
  // Match on the title only: taglines can mention other games' names.
  await tapSettled(phone, phone.locator('.game').filter({ has: phone.locator('.title', { hasText: title }) }));
  for (const phone of table.phones) {
    await tapSettled(phone, phone.getByRole('button', { name: 'Je suis prêt !' }));
  }
  await expect(table.tv.locator('.countdown')).toBeVisible();
  await expect(table.tv.locator('.countdown')).toBeHidden({ timeout: 10_000 });
}

export async function resultVisible(table: Table): Promise<boolean> {
  return table.tv.locator('.overlay .card h1').isVisible();
}

export async function backToMenu(table: Table): Promise<void> {
  await expect(table.phones[0].getByRole('button', { name: 'Changer de jeu' })).toBeVisible();
  await tapSettled(table.phones[0], table.phones[0].getByRole('button', { name: 'Changer de jeu' }));
  await expect(table.tv.locator('.menu h1')).toBeVisible();
}

export async function whichPhone(table: Table, selector: string): Promise<number> {
  for (let attempt = 0; attempt < 150; attempt++) {
    for (const [index, phone] of table.phones.entries()) {
      if (await phone.locator(selector).first().isVisible()) return index;
    }
    if (await resultVisible(table)) return -1;
    await table.tv.waitForTimeout(100);
  }
  throw new Error(`No phone shows ${selector}`);
}
