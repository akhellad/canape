import { agents } from './agents/logic';
import { battleship } from './battleship/logic';
import { connect4 } from './connect4/logic';
import { kifkif } from './kifkif/logic';
import { sketch } from './sketch/logic';
import type { GameDefinition, GameId } from './types';

export const CATALOG: Readonly<Record<GameId, GameDefinition>> = {
  kifkif,
  agents,
  sketch,
  connect4,
  battleship,
};

export const GAME_ORDER: GameId[] = ['kifkif', 'agents', 'sketch', 'connect4', 'battleship'];
