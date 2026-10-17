import { expect, test } from '@playwright/test';
import {
  backToMenu,
  contrastIssues,
  look,
  openTable,
  resultVisible,
  settled,
  shot,
  startGame,
  tapSettled,
  whichPhone,
  type Table,
} from './helpers';

test.describe.configure({ mode: 'serial' });

let table: Table;

test.beforeAll(async ({ browser }) => {
  table = await openTable(browser);
  await look(table.tv, 'tv-menu');
  await look(table.phones[0], 'phone-menu');
});

test.afterAll(async () => {
  await table.context.close();
});

test('Puissance 4 se joue jusqu’à la victoire', async () => {
  await startGame(table, 'Puissance 4');
  await shot(table.tv, 'tv-connect4-start');
  const columns = [0, 1];
  let moves = 0;
  while (!(await resultVisible(table)) && moves < 20) {
    const current = await whichPhone(table, '.drop');
    if (current < 0) break;
    const phone = table.phones[current];
    const col = columns[moves % 2];
    await tapSettled(phone, phone.locator('.column').nth(col));
    await tapSettled(phone, phone.locator('.column').nth(col));
    moves += 1;
    await expect(table.tv.locator('.discs .disc')).toHaveCount(moves);
    if (moves === 5) {
      await look(table.tv, 'tv-connect4-play');
      await look(phone, 'phone-connect4-play');
    }
    await table.tv.waitForTimeout(150);
    if (await table.tv.locator('.disc.win').count()) break;
  }
  await expect(table.tv.locator('.overlay .card h1')).toContainText('aligne quatre jetons', { timeout: 10_000 });
  await look(table.tv, 'tv-connect4-result');
  await shot(table.phones[0], 'phone-connect4-result');
  await backToMenu(table);
});

test('Touché-coulé se joue jusqu’au naufrage', async () => {
  await startGame(table, 'Touché-coulé');
  const [a, b] = table.phones;
  const firstShip = await a
    .locator('.sea .ship')
    .first()
    .evaluate((ship) => {
      const style = (ship as HTMLElement).style;
      return Math.round(parseFloat(style.top) / 12.5) * 8 + Math.round(parseFloat(style.left) / 12.5);
    });
  await tapSettled(a, a.locator('.sea .cell').nth(firstShip));
  await expect(a.locator('.ship.selected')).toHaveCount(1);
  await look(a, 'phone-battleship-place');
  await tapSettled(a, a.getByRole('button', { name: 'Je suis prêt' }));
  await tapSettled(b, b.getByRole('button', { name: 'Je suis prêt' }));
  const fired = [new Set<number>(), new Set<number>()];
  let shots = 0;
  while (!(await resultVisible(table)) && shots < 80) {
    const shooter = await whichPhone(table, '.fire');
    if (shooter < 0) break;
    const defender = table.phones[shooter === 0 ? 1 : 0];
    const phone = table.phones[shooter];
    await settled(defender);
    const cells = await defender
      .locator('.sea')
      .first()
      .locator('.ship')
      .evaluateAll((ships) =>
        ships.flatMap((ship) => {
          const style = (ship as HTMLElement).style;
          const col = Math.round(parseFloat(style.left) / 12.5);
          const row = Math.round(parseFloat(style.top) / 12.5);
          const width = Math.round(parseFloat(style.width) / 12.5);
          const height = Math.round(parseFloat(style.height) / 12.5);
          const result: number[] = [];
          for (let r = row; r < row + height; r++) for (let c = col; c < col + width; c++) result.push(r * 8 + c);
          return result;
        }),
      );
    const target = cells.find((cell) => !fired[shooter].has(cell));
    if (target === undefined) break;
    fired[shooter].add(target);
    await tapSettled(phone, phone.locator('.sea').first().locator('.cell').nth(target));
    await tapSettled(phone, phone.locator('.fire'));
    shots += 1;
    if (shots === 3) {
      await table.tv.waitForTimeout(500);
      await shot(table.tv, 'tv-battleship-firing');
      await table.tv.waitForTimeout(700);
      await shot(table.tv, 'tv-battleship-hit');
      await look(defender, 'phone-battleship-defend');
    }
    await expect(phone.locator('.fire'))
      .toBeHidden({ timeout: 10_000 })
      .catch(() => undefined);
  }
  await expect(table.tv.locator('.overlay .card h1')).toContainText('coulé toute la flotte', { timeout: 15_000 });
  await look(table.tv, 'tv-battleship-result');
  await backToMenu(table);
});

test('Kif-Kif se joue jusqu’à la dernière carte', async () => {
  await startGame(table, 'Kif-Kif');
  await look(table.tv, 'tv-kifkif-start');
  await look(table.phones[0], 'phone-kifkif-start');
  const [a] = table.phones;
  const wrong = await a.locator('.stack .card').last().locator('[data-symbol]').first().getAttribute('data-symbol');
  const centerSymbols = async () => {
    const center = await table.tv.locator('.kif').getAttribute('data-center');
    return table.tv
      .locator(`.big [data-card="${center}"] [data-symbol]`)
      .evaluateAll((items) => items.map((item) => item.getAttribute('data-symbol')));
  };
  if (wrong && !(await centerSymbols()).includes(wrong)) {
    await tapSettled(a, a.locator(`.stack [data-symbol="${wrong}"]`).first());
    await expect(a.locator('.penalty')).toBeVisible();
    await shot(table.tv, 'tv-kifkif-miss');
    await shot(a, 'phone-kifkif-miss');
    await expect(a.locator('.penalty')).toBeHidden({ timeout: 4000 });
  }
  let turns = 0;
  while (!(await resultVisible(table)) && turns < 120) {
    const phone = table.phones[turns % 2];
    await settled(phone);
    const center = await centerSymbols();
    const mine = await phone
      .locator('.stack .card')
      .last()
      .locator('[data-symbol]')
      .evaluateAll((items) => items.map((item) => item.getAttribute('data-symbol')));
    const common = mine.find((symbol) => center.includes(symbol));
    if (common) await phone.locator(`.stack .card`).last().locator(`[data-symbol="${common}"]`).tap();
    turns += 1;
    if (turns === 6) {
      await table.tv.waitForTimeout(250);
      await shot(table.tv, 'tv-kifkif-match');
    }
    await table.tv.waitForTimeout(450);
  }
  await expect(table.tv.locator('.overlay .card h1')).toContainText('l’œil le plus rapide', { timeout: 15_000 });
  await shot(table.tv, 'tv-kifkif-result');
  await backToMenu(table);
});

test('Agents doubles se joue jusqu’à la mission accomplie', async () => {
  await startGame(table, 'Agents doubles');
  let guard = 0;
  let clueShot = false;
  while (!(await resultVisible(table)) && guard++ < 80) {
    const cluing = await (async () => {
      for (const [index, phone] of table.phones.entries()) if (await phone.locator('.clue-form').isVisible()) return index;
      return -1;
    })();
    if (cluing >= 0) {
      const phone = table.phones[cluing];
      await settled(phone);
      if (!clueShot) await look(phone, 'phone-agents-clue');
      await phone.locator('.clue-form input').fill('indice');
      await tapSettled(phone, phone.getByRole('button', { name: 'Envoyer l’indice' }));
      await table.tv.waitForTimeout(300);
      if (!clueShot) {
        clueShot = true;
        await look(table.tv, 'tv-agents-clue');
      }
      continue;
    }
    const guessing = await (async () => {
      for (const [index, phone] of table.phones.entries()) if (await phone.locator('.clue b').isVisible()) return index;
      return -1;
    })();
    if (guessing < 0) {
      await table.tv.waitForTimeout(200);
      continue;
    }
    const guesser = table.phones[guessing];
    const giver = table.phones[guessing === 0 ? 1 : 0];
    await settled(giver);
    const targets = await giver
      .locator('.grid .tile')
      .evaluateAll((tiles) =>
        tiles
          .map((tile, index) => (tile.classList.contains('key-agent') && !tile.classList.contains('found') ? index : -1))
          .filter((index) => index >= 0),
      );
    if (!targets.length) {
      await table.tv.waitForTimeout(300);
      continue;
    }
    await tapSettled(guesser, guesser.locator('.grid .tile').nth(targets[0]));
    await tapSettled(guesser, guesser.getByRole('button', { name: /^Valider/ }));
    await expect(table.tv.locator('.tile.found')).not.toHaveCount(0);
    await table.tv.waitForTimeout(1100);
    if (guard === 4) {
      await look(table.tv, 'tv-agents-play');
      await look(guesser, 'phone-agents-guess');
    }
  }
  await expect(table.tv.locator('.overlay .card h1')).toContainText('Mission accomplie', { timeout: 15_000 });
  await shot(table.tv, 'tv-agents-result');
  await backToMenu(table);
});

test('Gribouille se joue sur toutes les manches, dessin en direct', async () => {
  await startGame(table, 'Gribouille');
  for (let round = 0; round < 6; round++) {
    const drawer = await whichPhone(table, '.choice');
    if (drawer < 0) break;
    const phone = table.phones[drawer];
    const other = table.phones[drawer === 0 ? 1 : 0];
    if (round === 0) await look(phone, 'phone-sketch-choose');
    await tapSettled(phone, phone.locator('.choice').first());
    const canvas = phone.locator('canvas');
    await canvas.waitFor();
    await settled(phone);
    const box = await canvas.boundingBox();
    if (!box) throw new Error('canvas missing');
    await phone.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.3);
    await phone.mouse.down();
    for (let step = 1; step <= 12; step++) {
      await phone.mouse.move(box.x + box.width * (0.2 + step * 0.05), box.y + box.height * (0.3 + Math.sin(step / 2) * 0.2));
      await phone.waitForTimeout(16);
    }
    await phone.mouse.up();
    await table.tv.waitForTimeout(400);
    const painted = await table.tv.locator('.canvas-wrap canvas').evaluate((element) => {
      const canvasElement = element as HTMLCanvasElement;
      const context = canvasElement.getContext('2d');
      if (!context) return 0;
      const data = context.getImageData(0, 0, canvasElement.width, canvasElement.height).data;
      let count = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 0) count++;
      return count;
    });
    expect(painted).toBeGreaterThan(50);
    if (round === 0) {
      await look(table.tv, 'tv-sketch-draw');
      await look(phone, 'phone-sketch-draw');
    }
    const word = ((await phone.locator('.target').textContent()) ?? '').trim();
    await settled(other);
    await other.locator('.guess input').fill('banane flambée');
    await tapSettled(other, other.getByRole('button', { name: 'Proposer' }));
    await other.locator('.guess input').fill(word);
    if (round === 0) await look(other, 'phone-sketch-guess');
    await tapSettled(other, other.getByRole('button', { name: 'Proposer' }));
    await expect(table.tv.locator('.overlay.result.success')).toBeVisible();
    if (round === 0) await shot(table.tv, 'tv-sketch-found');
    if (round < 5) await expect(table.tv.locator('.overlay.result')).toBeHidden({ timeout: 8000 });
  }
  await expect(table.tv.locator('.overlay .card h1')).toContainText('Score d’équipe', { timeout: 10_000 });
  await shot(table.tv, 'tv-sketch-result');
  await shot(table.phones[0], 'phone-sketch-result');
});

test('aucun texte illisible sur les écrans des jeux', () => {
  expect(contrastIssues, contrastIssues.join('\n')).toEqual([]);
});
