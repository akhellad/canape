import type { Component } from 'svelte';
import type { Seats } from '../room/protocol';
import type { GameId, Slot } from './types';
import AgentsPhone from './agents/Phone.svelte';
import AgentsTv from './agents/Tv.svelte';
import BattleshipPhone from './battleship/Phone.svelte';
import BattleshipTv from './battleship/Tv.svelte';
import Connect4Phone from './connect4/Phone.svelte';
import Connect4Tv from './connect4/Tv.svelte';
import KifKifPhone from './kifkif/Phone.svelte';
import KifKifTv from './kifkif/Tv.svelte';
import SketchPhone from './sketch/Phone.svelte';
import SketchTv from './sketch/Tv.svelte';

export interface TvViewProps {
  view: any;
  seats: Seats;
}

export interface PhoneViewProps {
  view: any;
  seats: Seats;
  me: Slot;
  act: (action: unknown) => void;
}

export const VIEWS: Record<GameId, { Tv: Component<TvViewProps>; Phone: Component<PhoneViewProps> }> = {
  connect4: { Tv: Connect4Tv, Phone: Connect4Phone },
  battleship: { Tv: BattleshipTv, Phone: BattleshipPhone },
  kifkif: { Tv: KifKifTv, Phone: KifKifPhone },
  agents: { Tv: AgentsTv, Phone: AgentsPhone },
  sketch: { Tv: SketchTv, Phone: SketchPhone },
};
