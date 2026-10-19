import { isInt, isRecord, other, type GameContext, type GameDefinition, type GameInstance, type Slot } from '../types';
import { PEOPLE } from './people';

const FINISH_DELAY_MS = 3200;

export interface GuessWhoTv {
  phase: 'play' | 'over';
  turn: Slot;
  turns: number;
  down: [boolean[], boolean[]];
  left: [number, number];
  guess: { by: Slot; person: number; correct: boolean } | null;
  secrets: [number, number] | null;
  winner: Slot | null;
}

export interface GuessWhoPhone {
  phase: 'play' | 'over';
  me: Slot;
  myTurn: boolean;
  turns: number;
  secret: number;
  down: boolean[];
  left: [number, number];
  guess: { by: Slot; person: number; correct: boolean } | null;
  theirs: number | null;
  winner: Slot | null;
  guard: string;
}

class GuessWho implements GameInstance {
  private phase: GuessWhoTv['phase'] = 'play';
  private turn: Slot;
  private turns = 0;
  private readonly secrets: [number, number];
  private readonly down: [boolean[], boolean[]] = [PEOPLE.map(() => false), PEOPLE.map(() => false)];
  private guess: GuessWhoTv['guess'] = null;
  private winner: Slot | null = null;

  constructor(private readonly ctx: GameContext) {
    this.turn = ctx.starter;
    const first = ctx.rng.int(PEOPLE.length);
    let second = ctx.rng.int(PEOPLE.length - 1);
    if (second >= first) second += 1;
    this.secrets = [first, second];
    ctx.fx('turn', [this.turn]);
  }

  act(slot: Slot, action: unknown): void {
    if (this.phase !== 'play' || !isRecord(action) || typeof action.type !== 'string') return;
    if (action.type === 'toggle' && isInt(action.person, 0, PEOPLE.length - 1)) {
      this.down[slot][action.person] = !this.down[slot][action.person];
      this.ctx.fx('flip', [slot]);
      this.ctx.update();
      return;
    }
    if (slot !== this.turn) return;
    if (action.type === 'end') {
      this.turn = other(this.turn);
      this.turns += 1;
      this.ctx.fx('turn', [this.turn]);
      this.ctx.update();
    } else if (action.type === 'guess' && isInt(action.person, 0, PEOPLE.length - 1)) {
      const correct = action.person === this.secrets[other(slot)];
      this.guess = { by: slot, person: action.person, correct };
      this.phase = 'over';
      this.winner = correct ? slot : other(slot);
      this.ctx.fx(correct ? 'correct' : 'error', 'all');
      this.ctx.update();
      const winner = this.winner;
      const loser = other(winner);
      this.ctx.after(FINISH_DELAY_MS, () =>
        this.ctx.finish({
          winner,
          title: correct
            ? `${this.ctx.name(winner)} a démasqué ${PEOPLE[this.secrets[loser]].name} !`
            : `Raté, ${this.ctx.name(slot)} s’est trompé !`,
          detail: `${this.ctx.name(0)} était ${PEOPLE[this.secrets[0]].name}, ${this.ctx.name(1)} était ${PEOPLE[this.secrets[1]].name}.`,
        }),
      );
    }
  }

  private left(slot: Slot): number {
    return this.down[slot].filter((flag) => !flag).length;
  }

  tv(): GuessWhoTv {
    return {
      phase: this.phase,
      turn: this.turn,
      turns: this.turns,
      down: [[...this.down[0]], [...this.down[1]]],
      left: [this.left(0), this.left(1)],
      guess: this.guess,
      secrets: this.phase === 'over' ? [...this.secrets] : null,
      winner: this.winner,
    };
  }

  phone(slot: Slot): GuessWhoPhone {
    return {
      phase: this.phase,
      me: slot,
      myTurn: this.phase === 'play' && slot === this.turn,
      turns: this.turns,
      secret: this.secrets[slot],
      down: [...this.down[slot]],
      left: [this.left(0), this.left(1)],
      guess: this.guess,
      theirs: this.phase === 'over' ? this.secrets[other(slot)] : null,
      winner: this.winner,
      guard: `${this.turns}-${this.phase}`,
    };
  }
}

export const guesswho: GameDefinition = {
  id: 'guesswho',
  title: 'Qui est-ce ?',
  tagline: 'Chacun son suspect secret. Posez les bonnes questions !',
  accent: '#ffc4dc',
  coop: false,
  rules: [
    'Ton téléphone te donne un personnage secret. L’autre doit le trouver parmi les 24 suspects, et toi le sien.',
    'Chacun son tour, pose une question à voix haute (« Il a des lunettes ? »). L’autre répond par oui ou par non.',
    'Touche les suspects pour les écarter, puis passe ton tour. Quand tu es sûr de toi, tente ta chance : si tu te trompes, tu perds !',
  ],
  create: (ctx) => new GuessWho(ctx),
};
