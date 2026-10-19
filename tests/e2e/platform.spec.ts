import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { PeerServer } from 'peer';
import { animationsDone, openTable, settled, shot, startGame, tapSettled, whichPhone } from './helpers';

async function contrastViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
  return results.violations.flatMap((violation) =>
    violation.nodes.map((node) => `${node.target.join(' ')} → ${node.failureSummary?.split('\n').slice(1).join(' ').trim()}`),
  );
}

test('ignore un appui fantôme juste après un changement d’écran', async ({ browser }) => {
  const table = await openTable(browser);
  const [a] = table.phones;
  await settled(a);
  await a.clock.install();
  await a.locator('.game', { hasText: 'Puissance 4' }).tap();
  const ready = a.getByRole('button', { name: 'Je suis prêt !' });
  await ready.waitFor();
  await expect(a.locator('.phone.guarded')).toHaveCount(1);
  await ready.tap({ force: true });
  await expect(table.tv.locator('.who.ok')).toHaveCount(0);
  await a.clock.runFor(500);
  await settled(a);
  await ready.tap();
  await expect(table.tv.locator('.who.ok')).toHaveCount(1);
  await table.context.close();
});

test('met la partie en pause quand un téléphone part, et la reprend à son retour', async ({ browser }) => {
  const table = await openTable(browser);
  await startGame(table, 'Puissance 4');
  const [, b] = table.phones;
  await b.close();
  await expect(table.tv.locator('.overlay h2')).toContainText('En attente de Tom', { timeout: 15_000 });
  await expect(table.tv.locator('.chip .away')).toHaveCount(1);
  await shot(table.tv, 'tv-paused');
  const back = await table.context.newPage();
  await back.setViewportSize({ width: 390, height: 844 });
  await back.goto(`/?room=${table.code}&transport=local`);
  await back.fill('#name', 'Tom');
  await back.locator('button[type="submit"]').tap();
  await expect(table.tv.locator('.overlay h2')).toContainText('C’est reparti', { timeout: 10_000 });
  await expect(table.tv.locator('.overlay h2')).toBeHidden({ timeout: 10_000 });
  await expect(table.tv.locator('.chip .away')).toHaveCount(0);
  table.phones[1] = back;
  const current = await whichPhone(table, '.drop');
  const phone = table.phones[current];
  await tapSettled(phone, phone.locator('.column').nth(3));
  await tapSettled(phone, phone.locator('.column').nth(3));
  await expect(table.tv.locator('.discs .disc')).toHaveCount(1);
  await table.context.close();
});

test('garde des textes lisibles (contraste) sur les écrans principaux', async ({ browser }) => {
  const table = await openTable(browser);
  const failures: string[] = [];
  const check = async (label: string, page: Page) => {
    await animationsDone(page);
    for (const issue of await contrastViolations(page)) failures.push(`${label}: ${issue}`);
  };
  await check('tv menu', table.tv);
  await check('phone menu', table.phones[0]);
  await tapSettled(table.phones[0], table.phones[0].locator('.game', { hasText: 'Quiz' }));
  await check('tv rules', table.tv);
  await check('phone rules', table.phones[0]);
  for (const phone of table.phones) await tapSettled(phone, phone.getByRole('button', { name: 'Je suis prêt !' }));
  await expect(table.tv.locator('.quiz')).toBeVisible({ timeout: 10_000 });
  await check('tv quiz', table.tv);
  for (const [index, phone] of table.phones.entries()) await check(`phone quiz ${index}`, phone);
  expect(failures, failures.join('\n')).toEqual([]);
  await table.context.close();
});

test('fonctionne avec une vraie connexion PeerJS entre appareils séparés', async ({ browser }) => {
  let httpServer: { close(callback: () => void): void } | null = null;
  PeerServer({ port: 9123, path: '/', host: '127.0.0.1' }, (server) => (httpServer = server));
  try {
    const query = 'peer=127.0.0.1:9123';
    const tvContext = await browser.newContext();
    const tv = await tvContext.newPage();
    await tv.setViewportSize({ width: 1920, height: 1080 });
    await tv.goto(`/?${query}`);
    await expect(tv.locator('.qr svg')).toBeVisible({ timeout: 20_000 });
    const code = ((await tv.locator('.code b').textContent()) ?? '').trim();
    const phones: Page[] = [];
    for (const name of ['Léa', 'Tom']) {
      const context = await browser.newContext({ hasTouch: true });
      const phone = await context.newPage();
      await phone.setViewportSize({ width: 390, height: 844 });
      await phone.goto(`/?room=${code}&${query}`);
      await phone.fill('#name', name);
      await phone.locator('button[type="submit"]').tap();
      phones.push(phone);
    }
    await expect(tv.locator('.menu h1')).toBeVisible({ timeout: 30_000 });
    await expect(phones[1].locator('.menu h1')).toBeVisible();
    await phones[1].reload();
    await phones[1].fill('#name', 'Tom');
    await phones[1].locator('button[type="submit"]').tap();
    await expect(phones[1].locator('.menu h1')).toBeVisible({ timeout: 30_000 });
    await expect(tv.locator('.chip .away')).toHaveCount(0);
    await tapSettled(phones[0], phones[0].locator('.game', { hasText: 'Quiz' }));
    await expect(tv.locator('.rules h1')).toHaveText('Quiz');
    await tvContext.close();
    for (const phone of phones) await phone.context().close();
  } finally {
    await new Promise<void>((resolve) => (httpServer ? httpServer.close(() => resolve()) : resolve()));
  }
});
