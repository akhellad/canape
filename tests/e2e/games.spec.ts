import { expect, test, type Page } from '@playwright/test';
import { ENTRIES } from '../../src/lib/games/crossword/words';
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
      // Count ink, i.e. anything darker than the paper the drawing starts on.
      let count = 0;
      for (let i = 0; i < data.length; i += 4) if (data[i] + data[i + 1] + data[i + 2] < 600) count++;
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
    if (round === 0) {
      await look(other, 'phone-sketch-reveal');
      // The drawing stays up until someone moves on.
      await table.tv.waitForTimeout(6000);
      await expect(table.tv.locator('.overlay.result')).toBeVisible();
      await shot(table.tv, 'tv-sketch-found');
    }
    await tapSettled(other, other.getByRole('button', { name: round < 5 ? 'Dessin suivant' : 'Voir le score final' }));
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
    await expect(table.tv.locator('.bac .hint.next')).toBeVisible();
    if (round === 0) await look(table.phones[0], 'phone-petitbac-recap');
    await tapSettled(
      table.phones[round % 2],
      table.phones[round % 2].getByRole('button', { name: round < 2 ? 'Manche suivante' : 'Voir le résultat final' }),
    );
  }
  await expect(table.tv.locator('.overlay .card h1')).toContainText('Petit Bac', { timeout: 15_000 });
  await look(table.tv, 'tv-petitbac-result');
  await backToMenu(table);
});

test('on peut quitter une partie depuis le menu du téléphone', async () => {
  await startGame(table, 'Puissance 4');
  await tapSettled(table.phones[0], table.phones[0].getByRole('button', { name: 'Menu de la partie' }));
  await tapSettled(table.phones[0], table.phones[0].getByRole('button', { name: 'Quitter la partie' }));
  await tapSettled(table.phones[0], table.phones[0].getByRole('button', { name: 'Oui, quitter' }));
  await expect(table.tv.locator('.menu h1')).toBeVisible();
});

async function scribble(phone: Page) {
  const canvas = phone.locator('canvas').first();
  await canvas.waitFor();
  await settled(phone);
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas missing');
  await phone.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3);
  await phone.mouse.down();
  for (let step = 1; step <= 8; step++) {
    await phone.mouse.move(box.x + box.width * (0.3 + step * 0.05), box.y + box.height * (0.3 + Math.cos(step) * 0.15));
    await phone.waitForTimeout(16);
  }
  await phone.mouse.up();
}

test('Dessin téléphone fait circuler les carnets puis les montre page par page', async () => {
  await startGame(table, 'Dessin téléphone');
  for (const phone of table.phones) await tapSettled(phone, phone.locator('.choice').first());
  for (let step = 1; step <= 4; step++) {
    for (const [index, phone] of table.phones.entries()) {
      if (step % 2 === 1) {
        await scribble(phone);
        if (step === 1 && index === 0) await look(phone, 'phone-telephone-draw');
        await tapSettled(phone, phone.getByRole('button', { name: 'J’ai fini' }));
      } else {
        await settled(phone);
        await phone.locator('.write input').fill(`idée ${step}-${index}`);
        if (step === 2 && index === 0) await look(phone, 'phone-telephone-write');
        await tapSettled(phone, phone.getByRole('button', { name: 'Envoyer' }));
      }
    }
    if (step === 1) await look(table.tv, 'tv-telephone-play');
  }
  let pages = 0;
  while (!(await resultVisible(table)) && pages < 12) {
    const phone = table.phones[pages % 2];
    await expect(table.tv.locator('.show .page')).toBeVisible();
    if (pages === 1) await look(table.tv, 'tv-telephone-show');
    await tapSettled(phone, phone.locator('.show .btn'));
    pages += 1;
  }
  expect(pages).toBe(10);
  await expect(table.tv.locator('.overlay .card h1')).toContainText('Quel voyage', { timeout: 10_000 });
  await backToMenu(table);
});

test('Mots croisés se remplit à deux, chacun ses définitions', async () => {
  await startGame(table, 'Mots croisés');
  const answers = new Map(ENTRIES.map((entry) => [entry.clue, entry.word]));
  let guard = 0;
  while (!(await table.tv.locator('.end').isVisible()) && guard++ < 40) {
    for (const phone of table.phones) {
      const open = phone.locator('li:not(.theirs):not(.found) .clue');
      if (!(await open.count())) continue;
      const clue = ((await open.first().locator('.text').textContent()) ?? '').trim();
      await tapSettled(phone, open.first());
      if (guard === 1) {
        await phone.locator('.answer input').fill('zzz');
        await tapSettled(phone, phone.getByRole('button', { name: 'Valider' }));
        await look(phone, 'phone-crossword-play');
      }
      await phone.locator('.answer input').fill(answers.get(clue) ?? '');
      await tapSettled(phone, phone.getByRole('button', { name: 'Valider' }));
    }
    if (guard === 3) await look(table.tv, 'tv-crossword-play');
  }
  await expect(table.tv.locator('.end')).toContainText('Grille complète');
  await look(table.tv, 'tv-crossword-done');
  await tapSettled(table.phones[0], table.phones[0].getByRole('button', { name: 'Voir le résultat' }));
  await expect(table.tv.locator('.overlay .card h1')).toContainText('Grille complète', { timeout: 10_000 });
  await backToMenu(table);
});

test('Le menteur mélange les bluffs et la vraie définition', async () => {
  await startGame(table, 'Le menteur');
  for (let round = 0; round < 5; round++) {
    for (const [index, phone] of table.phones.entries()) {
      await settled(phone);
      await phone.locator('textarea').fill(`Petite chose étrange numéro ${round}-${index}`);
      if (round === 0 && index === 0) await look(phone, 'phone-bluff-write');
      await tapSettled(phone, phone.getByRole('button', { name: 'Envoyer mon bluff' }));
    }
    await expect(table.tv.locator('.options li')).toHaveCount(4);
    if (round === 0) await look(table.phones[0], 'phone-bluff-vote');
    for (const phone of table.phones) await tapSettled(phone, phone.locator('.option:not([disabled])').first());
    await expect(table.tv.locator('.next')).toBeVisible();
    if (round === 0) await look(table.tv, 'tv-bluff-reveal');
    const phone = table.phones[round % 2];
    await tapSettled(phone, phone.getByRole('button', { name: round < 4 ? 'Mot suivant' : 'Voir le résultat' }));
  }
  await expect(table.tv.locator('.overlay .card h1')).toBeVisible({ timeout: 10_000 });
  await look(table.tv, 'tv-bluff-result');
  await backToMenu(table);
});

test('Je te connais par cœur : l’un répond, l’autre parie, et le premier juge', async () => {
  await startGame(table, 'Je te connais par cœur');
  for (let round = 0; round < 10; round++) {
    for (const [index, phone] of table.phones.entries()) {
      await settled(phone);
      await phone.locator('.write input').fill(`Réponse ${round}-${index}`);
      if (round === 0 && index === 0) await look(phone, 'phone-heart-write');
      await tapSettled(phone, phone.getByRole('button', { name: 'Envoyer' }));
    }
    await expect(table.tv.locator('.duo .text')).toHaveCount(2);
    if (round === 0) await look(table.tv, 'tv-heart-reveal');
    const judge = await whichPhone(table, '.verdicts');
    if (round === 0) await look(table.phones[judge], 'phone-heart-judge');
    await tapSettled(table.phones[judge], table.phones[judge].getByRole('button', { name: 'Bien vu ! +2' }));
  }
  await expect(table.tv.locator('.overlay .card h1')).toBeVisible({ timeout: 10_000 });
  await look(table.tv, 'tv-heart-result');
  await backToMenu(table);
});

test('Nos souvenirs compare les deux versions', async () => {
  await startGame(table, 'Nos souvenirs');
  for (let round = 0; round < 8; round++) {
    for (const [index, phone] of table.phones.entries()) {
      await settled(phone);
      await phone.locator('.write input').fill(`Souvenir ${round}-${index}`);
      await tapSettled(phone, phone.getByRole('button', { name: 'Envoyer' }));
    }
    await expect(table.tv.locator('.duo .text')).toHaveCount(2);
    if (round === 0) {
      await look(table.tv, 'tv-memories-reveal');
      await look(table.phones[1], 'phone-memories-reveal');
    }
    const phone = table.phones[round % 2];
    await tapSettled(phone, phone.getByRole('button', { name: 'Même souvenir ! +2' }));
  }
  await expect(table.tv.locator('.overlay .card h1')).toContainText('Une seule et même mémoire', { timeout: 10_000 });
  await backToMenu(table);
});

test('Mots doux finit sur le carnet de tous les mots doux', async () => {
  await startGame(table, 'Mots doux');
  for (let round = 0; round < 5; round++) {
    for (const [index, phone] of table.phones.entries()) {
      await settled(phone);
      await phone.locator('textarea').fill(`Tu es merveilleux·se, version ${round}-${index}`);
      if (round === 0 && index === 0) await look(phone, 'phone-sweet-write');
      await tapSettled(phone, phone.getByRole('button', { name: 'Envoyer mon mot doux' }));
    }
    await expect(table.tv.locator('.duo .text')).toHaveCount(2);
    if (round === 0) await look(table.tv, 'tv-sweet-reveal');
    const phone = table.phones[round % 2];
    await tapSettled(phone, phone.getByRole('button', { name: round < 4 ? 'Mot doux suivant' : 'Voir notre carnet' }));
  }
  await expect(table.tv.locator('.book li')).toHaveCount(5);
  await look(table.tv, 'tv-sweet-book');
  await tapSettled(table.phones[0], table.phones[0].getByRole('button', { name: 'Terminer' }));
  await expect(table.tv.locator('.overlay .card h1')).toContainText('mots doux', { timeout: 10_000 });
  await backToMenu(table);
});

test('Même longueur d’onde : indice, aiguille et cible révélée', async () => {
  await startGame(table, 'Même longueur');
  for (let round = 0; round < 8; round++) {
    const psychic = await whichPhone(table, '.write input');
    const guesser = table.phones[psychic === 0 ? 1 : 0];
    if (round === 0) await look(table.phones[psychic], 'phone-wavelength-clue');
    await table.phones[psychic].locator('.write input').fill(`Indice ${round}`);
    await tapSettled(table.phones[psychic], table.phones[psychic].getByRole('button', { name: 'Envoyer l’indice' }));
    await settled(guesser);
    await guesser.locator('.slider').fill(String(20 + round * 8));
    if (round === 0) {
      await look(guesser, 'phone-wavelength-guess');
      await look(table.tv, 'tv-wavelength-guess');
    }
    await tapSettled(guesser, guesser.getByRole('button', { name: 'C’est là !' }));
    await expect(table.tv.locator('.verdict')).toBeVisible();
    if (round === 0) await look(table.tv, 'tv-wavelength-reveal');
    await tapSettled(guesser, guesser.getByRole('button', { name: round < 7 ? 'Manche suivante' : 'Voir le résultat' }));
  }
  await expect(table.tv.locator('.overlay .card h1')).toBeVisible({ timeout: 10_000 });
  await backToMenu(table);
});

test('aucun texte illisible sur les écrans des jeux', () => {
  expect(contrastIssues, contrastIssues.join('\n')).toEqual([]);
});
