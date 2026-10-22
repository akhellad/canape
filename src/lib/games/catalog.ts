import { battleship } from './battleship/logic';
import { bluff } from './bluff/logic';
import { connect4 } from './connect4/logic';
import { couple } from './couple/logic';
import { crossword } from './crossword/logic';
import { guesswho } from './guesswho/logic';
import { heart } from './heart/logic';
import { memories } from './memories/logic';
import { petitbac } from './petitbac/logic';
import { quiz } from './quiz/logic';
import { sketch } from './sketch/logic';
import { sweet } from './sweet/logic';
import { telephone } from './telephone/logic';
import { wavelength } from './wavelength/logic';
import type { GameDefinition, GameId } from './types';

export const CATALOG: Readonly<Record<GameId, GameDefinition>> = {
  sketch,
  telephone,
  couple,
  memories,
  sweet,
  wavelength,
  heart,
  quiz,
  petitbac,
  crossword,
  bluff,
  guesswho,
  battleship,
  connect4,
};

export const GAME_ORDER: GameId[] = [
  'sketch',
  'telephone',
  'couple',
  'wavelength',
  'memories',
  'sweet',
  'crossword',
  'heart',
  'quiz',
  'petitbac',
  'bluff',
  'guesswho',
  'battleship',
  'connect4',
];
