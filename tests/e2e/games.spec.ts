import { expect, test, type Page } from '@playwright/test';
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

test('Quiz se joue sur toutes les questions', async () => {
  await startGame(table, 'Quiz');
  await expect(table.tv.locator('.quiz .question')).toBeVisible();
  for (let question = 0; question < 10; question++) {
    await expect(table.tv.locator('.quiz .meta .count')).toContainText(`Question ${question + 1} /`, { timeout: 15_000 });
    for (const [index, phone] of table.phones.entries()) {
      await tapSettled(phone, phone.locator('.choice').nth(index));
    }
    await expect(table.tv.locator('.choice.right')).toHaveCount(1, { timeout: 5000 });
    if (question === 0) {
      await look(table.tv, 'tv-quiz-reveal');
      await look(table.phones[0], 'phone-quiz-reveal');
    }
  }
  await expect(table.tv.locator('.overlay .card h1')).toBeVisible({ timeout: 15_000 });
  await look(table.tv, 'tv-quiz-result');
  await backToMenu(table);
});

test('Qui de nous deux ? compte les réponses communes', async () => {
  await startGame(table, 'Qui de nous deux');
  for (let round = 0; round < 12; round++) {
    await expect(table.tv.locator('.couple .round')).toContainText(`Question ${round + 1} /`, { timeout: 15_000 });
    if (round === 0) await look(table.phones[0], 'phone-couple-ask');
    for (const phone of table.phones) await tapSettled(phone, phone.locator('.choice').first());
    await expect(table.tv.locator('.couple .verdict.match')).toBeVisible({ timeout: 5000 });
    if (round === 0) await look(table.tv, 'tv-couple-reveal');
  }
  await expect(table.tv.locator('.overlay .card h1')).toContainText('Âmes sœurs', { timeout: 15_000 });
  await look(table.tv, 'tv-couple-result');
  await backToMenu(table);
});

test('Mots interdits : une manche complète, carte cachée de la télé', async () => {
  await startGame(table, 'Mots interdits');
  const describer = await whichPhone(table, '.start');
  const phone = table.phones[describer];
  await look(table.tv, 'tv-taboo-ready');
  await tapSettled(phone, phone.locator('.start'));
  const word = ((await phone.locator('.card .word').textContent()) ?? '').trim();
  expect(word.length).toBeGreaterThan(1);
  await expect(table.tv.locator('.taboo')).not.toContainText(word);
  await look(phone, 'phone-taboo-card');
  for (const label of ['Trouvé !', 'Passer', 'Trouvé !', 'Buzz']) {
    await tapSettled(phone, phone.getByRole('button', { name: label, exact: true }));
  }
  await expect(table.tv.locator('.pile .card')).toHaveCount(4);
  await expect(table.tv.locator('.taboo')).toContainText(word);
  await look(table.tv, 'tv-taboo-play');
  await expect(table.tv.locator('.taboo .over')).toBeVisible({ timeout: 70_000 });
  await expect(table.tv.locator('.total b')).toHaveText('2');
  await tapSettled(table.phones[0], table.phones[0].getByRole('button', { name: 'Menu de la partie' }));
  await tapSettled(table.phones[0], table.phones[0].getByRole('button', { name: 'Quitter la partie' }));
  await tapSettled(table.phones[0], table.phones[0].getByRole('button', { name: 'Oui, quitter' }));
  await expect(table.tv.locator('.menu h1')).toBeVisible();
});

test('Reversi se joue jusqu’au plateau final', async () => {
  await startGame(table, 'Reversi');
  let moves = 0;
  while (!(await resultVisible(table)) && moves < 70) {
    const current = await whichPhone(table, '.place');
    if (current < 0) break;
    const phone = table.phones[current];
    const before = await table.tv.locator('.board .disc:not(.ghost)').count();
    await tapSettled(phone, phone.locator('.cell.playable').first());
    await tapSettled(phone, phone.locator('.cell.aimed'));
    await expect(table.tv.locator('.board .disc:not(.ghost)')).toHaveCount(before + 1);
    moves += 1;
    if (moves === 8) {
      await look(table.tv, 'tv-reversi-play');
      await look(phone, 'phone-reversi-play');
    }
  }
  await expect(table.tv.locator('.overlay .card h1')).toBeVisible({ timeout: 15_000 });
  await look(table.tv, 'tv-reversi-result');
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
  await backToMenu(table);
});

test('Qui est-ce ? se joue jusqu’à l’accusation', async () => {
  await startGame(table, 'Qui est-ce');
  const first = await whichPhone(table, '.actions .go');
  const asker = table.phones[first];
  for (const card of [0, 1, 2]) await tapSettled(asker, asker.locator('.grid .card').nth(card));
  await expect(table.tv.locator('.board .left').first()).toContainText('suspect');
  await look(asker, 'phone-guesswho-play');
  await tapSettled(asker, asker.getByRole('button', { name: 'J’ai fini mon tour' }));
  const guesser = table.phones[first === 0 ? 1 : 0];
  const target = ((await asker.locator('.mine .who b').textContent()) ?? '').trim();
  await look(table.tv, 'tv-guesswho-play');
  await tapSettled(guesser, guesser.getByRole('button', { name: 'Je sais qui c’est !' }));
  await tapSettled(guesser, guesser.getByRole('button', { name: target, exact: true }));
  await tapSettled(guesser, guesser.getByRole('button', { name: `Accuser ${target}` }));
  await expect(table.tv.locator('.overlay .card h1')).toContainText(`a démasqué ${target}`, { timeout: 15_000 });
  await look(table.tv, 'tv-guesswho-result');
  await backToMenu(table);
});

test('Code secret se joue jusqu’au code cassé', async () => {
  await startGame(table, 'Code secret');
  const codes = [
    [0, 1, 2, 3],
    [5, 5, 4, 4],
  ];
  for (const [index, phone] of table.phones.entries()) {
    for (const color of codes[index]) await tapSettled(phone, phone.locator('.palette .color').nth(color));
    await tapSettled(phone, phone.getByRole('button', { name: 'Valider mon code' }));
  }
  let guard = 0;
  while (!(await resultVisible(table)) && guard++ < 4) {
    const current = await whichPhone(table, '.palette');
    if (current < 0) break;
    const phone = table.phones[current];
    const guess = guard === 1 ? [1, 1, 1, 1] : codes[current === 0 ? 1 : 0];
    for (const color of guess) await tapSettled(phone, phone.locator('.palette .color').nth(color));
    await tapSettled(phone, phone.getByRole('button', { name: 'Proposer' }));
    if (guard === 2) await look(table.tv, 'tv-mastermind-play');
  }
  await expect(table.tv.locator('.overlay .card h1')).toContainText('cassé le code', { timeout: 15_000 });
  await look(table.tv, 'tv-mastermind-result');
  await backToMenu(table);
});

test('Petit Bac se joue sur les trois manches', async () => {
  await startGame(table, 'Petit Bac');
  const endings = ['ouette', 'abricot', 'amille', 'olive', 'ulysse', 'ivresse'];
  for (let round = 0; round < 3; round++) {
    const letter = ((await table.tv.locator('.bac .letter').first().textContent()) ?? '').trim();
    for (const [index, phone] of table.phones.entries()) {
      await settled(phone);
      const inputs = phone.locator('.answers input');
      for (let k = 0; k < 6; k++) await inputs.nth(k).fill(`${letter}${endings[k]}${index && k > 2 ? 'z' : ''}`);
    }
    if (round === 0) await look(table.phones[0], 'phone-petitbac-write');
    await tapSettled(table.phones[0], table.phones[0].locator('.stop'));
    await expect(table.tv.locator('.bac .stop')).toBeVisible();
    await expect(table.tv.locator('.bac .table')).toBeVisible({ timeout: 8000 });
    await tapSettled(table.phones[1], table.phones[1].locator('.their').first());
    await expect(table.tv.locator('.stamp.no')).toHaveCount(1);
    if (round === 0) {
      await look(table.tv, 'tv-petitbac-review');
      await look(table.phones[1], 'phone-petitbac-review');
    }
    for (const phone of table.phones) await tapSettled(phone, phone.getByRole('button', { name: 'C’est bon pour moi' }));
  }
  await expect(table.tv.locator('.overlay .card h1')).toContainText('Petit Bac', { timeout: 15_000 });
  await look(table.tv, 'tv-petitbac-result');
  await backToMenu(table);
});

test('Yams se joue jusqu’à la grille pleine', async () => {
  await startGame(table, 'Yams');
  for (let turn = 0; turn < 26; turn++) {
    const current = await whichPhone(table, '.roll');
    if (current < 0) break;
    const phone = table.phones[current];
    await tapSettled(phone, phone.locator('.roll'));
    await expect(table.tv.locator('.tray .die')).toHaveCount(5);
    if (turn === 0) {
      await tapSettled(phone, phone.locator('.dice .die').first());
      await expect(phone.locator('.dice .die').first()).toHaveAttribute('aria-pressed', 'true');
      await look(table.tv, 'tv-yams-play');
      await look(phone, 'phone-yams-play');
    }
    await tapSettled(phone, phone.locator('.sheet .maybe').first());
    await tapSettled(phone, phone.locator('.confirm'));
  }
  await expect(table.tv.locator('.overlay .card h1')).toBeVisible({ timeout: 15_000 });
  await look(table.tv, 'tv-yams-result');
  await backToMenu(table);
});

test('Memory se joue jusqu’à la dernière paire', async () => {
  await startGame(table, 'Memory');
  const known = new Map<number, string>();
  const matched = new Set<number>();
  let guard = 0;
  const reveal = async (phone: Page, index: number) => {
    await tapSettled(phone, phone.locator('.grid .card').nth(index));
    const card = table.tv.locator('.grid .card').nth(index);
    await expect(card).toHaveAttribute('data-symbol', /\d+/);
    const symbol = await card.getAttribute('data-symbol');
    known.set(index, symbol ?? '');
    return symbol ?? '';
  };
  while (!(await resultVisible(table)) && guard++ < 60) {
    const current = await whichPhone(table, '.status.mine');
    if (current < 0) break;
    const phone = table.phones[current];
    const pair = [...known.entries()].find(
      ([a, sa]) => !matched.has(a) && [...known.entries()].some(([b, sb]) => b !== a && sb === sa && !matched.has(b)),
    );
    let first: number;
    let second: number;
    if (pair) {
      first = pair[0];
      second = [...known.entries()].find(([b, sb]) => b !== first && sb === pair[1] && !matched.has(b))![0];
      await reveal(phone, first);
      await reveal(phone, second);
    } else {
      first = Array.from({ length: 24 }, (_, i) => i).find((i) => !known.has(i))!;
      const symbol = await reveal(phone, first);
      const twin = [...known.entries()].find(([b, sb]) => b !== first && sb === symbol);
      second = twin ? twin[0] : Array.from({ length: 24 }, (_, i) => i).find((i) => !known.has(i))!;
      await reveal(phone, second);
    }
    if (known.get(first) === known.get(second)) {
      matched.add(first);
      matched.add(second);
    }
    if (guard === 3) await look(table.tv, 'tv-memory-play');
    await expect(table.tv.locator('.verdict')).toBeHidden({ timeout: 5000 });
  }
  await expect(table.tv.locator('.overlay .card h1')).toBeVisible({ timeout: 15_000 });
  await look(table.tv, 'tv-memory-result');
  await backToMenu(table);
});

test('aucun texte illisible sur les écrans des jeux', () => {
  expect(contrastIssues, contrastIssues.join('\n')).toEqual([]);
});
