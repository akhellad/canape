import { battleship } from './battleship/logic';
import { connect4 } from './connect4/logic';
import { couple } from './couple/logic';
import { guesswho } from './guesswho/logic';
import { mastermind } from './mastermind/logic';
import { memory } from './memory/logic';
import { petitbac } from './petitbac/logic';
import { quiz } from './quiz/logic';
import { reversi } from './reversi/logic';
import { sketch } from './sketch/logic';
import { taboo } from './taboo/logic';
import type { GameDefinition, GameId } from './types';
import { yams } from './yams/logic';

export const CATALOG: Readonly<Record<GameId, GameDefinition>> = {
  sketch,
  couple,
  taboo,
  quiz,
  petitbac,
  guesswho,
  mastermind,
  battleship,
  connect4,
  reversi,
  yams,
  memory,
};

export const GAME_ORDER: GameId[] = [
  'sketch',
  'couple',
  'taboo',
  'quiz',
  'petitbac',
  'guesswho',
  'mastermind',
  'battleship',
  'connect4',
  'reversi',
  'yams',
  'memory',
];
