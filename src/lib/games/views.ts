import type { Component } from 'svelte';
import type { Seats } from '../room/protocol';
import type { GameId, Slot } from './types';
import BattleshipPhone from './battleship/Phone.svelte';
import BattleshipTv from './battleship/Tv.svelte';
import Connect4Phone from './connect4/Phone.svelte';
import Connect4Tv from './connect4/Tv.svelte';
import CouplePhone from './couple/Phone.svelte';
import CoupleTv from './couple/Tv.svelte';
import GuessWhoPhone from './guesswho/Phone.svelte';
import GuessWhoTv from './guesswho/Tv.svelte';
import MastermindPhone from './mastermind/Phone.svelte';
import MastermindTv from './mastermind/Tv.svelte';
import MemoryPhone from './memory/Phone.svelte';
import MemoryTv from './memory/Tv.svelte';
import PetitBacPhone from './petitbac/Phone.svelte';
import PetitBacTv from './petitbac/Tv.svelte';
import QuizPhone from './quiz/Phone.svelte';
import QuizTv from './quiz/Tv.svelte';
import ReversiPhone from './reversi/Phone.svelte';
import ReversiTv from './reversi/Tv.svelte';
import SketchPhone from './sketch/Phone.svelte';
import SketchTv from './sketch/Tv.svelte';
import TabooPhone from './taboo/Phone.svelte';
import TabooTv from './taboo/Tv.svelte';
import YamsPhone from './yams/Phone.svelte';
import YamsTv from './yams/Tv.svelte';

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
  sketch: { Tv: SketchTv, Phone: SketchPhone },
  quiz: { Tv: QuizTv, Phone: QuizPhone },
  couple: { Tv: CoupleTv, Phone: CouplePhone },
  taboo: { Tv: TabooTv, Phone: TabooPhone },
  connect4: { Tv: Connect4Tv, Phone: Connect4Phone },
  reversi: { Tv: ReversiTv, Phone: ReversiPhone },
  battleship: { Tv: BattleshipTv, Phone: BattleshipPhone },
  petitbac: { Tv: PetitBacTv, Phone: PetitBacPhone },
  guesswho: { Tv: GuessWhoTv, Phone: GuessWhoPhone },
  mastermind: { Tv: MastermindTv, Phone: MastermindPhone },
  yams: { Tv: YamsTv, Phone: YamsPhone },
  memory: { Tv: MemoryTv, Phone: MemoryPhone },
};
