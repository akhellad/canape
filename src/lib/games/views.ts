import type { Component } from 'svelte';
import type { Seats } from '../room/protocol';
import type { GameId, Slot } from './types';
import BattleshipPhone from './battleship/Phone.svelte';
import BattleshipTv from './battleship/Tv.svelte';
import BluffPhone from './bluff/Phone.svelte';
import BluffTv from './bluff/Tv.svelte';
import Connect4Phone from './connect4/Phone.svelte';
import Connect4Tv from './connect4/Tv.svelte';
import CouplePhone from './couple/Phone.svelte';
import CoupleTv from './couple/Tv.svelte';
import CrosswordPhone from './crossword/Phone.svelte';
import CrosswordTv from './crossword/Tv.svelte';
import GuessWhoPhone from './guesswho/Phone.svelte';
import GuessWhoTv from './guesswho/Tv.svelte';
import HeartPhone from './heart/Phone.svelte';
import HeartTv from './heart/Tv.svelte';
import MemoriesPhone from './memories/Phone.svelte';
import MemoriesTv from './memories/Tv.svelte';
import PetitBacPhone from './petitbac/Phone.svelte';
import PetitBacTv from './petitbac/Tv.svelte';
import QuizPhone from './quiz/Phone.svelte';
import QuizTv from './quiz/Tv.svelte';
import SketchPhone from './sketch/Phone.svelte';
import SketchTv from './sketch/Tv.svelte';
import SweetPhone from './sweet/Phone.svelte';
import SweetTv from './sweet/Tv.svelte';
import TelephonePhone from './telephone/Phone.svelte';
import TelephoneTv from './telephone/Tv.svelte';
import WavelengthPhone from './wavelength/Phone.svelte';
import WavelengthTv from './wavelength/Tv.svelte';

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
  telephone: { Tv: TelephoneTv, Phone: TelephonePhone },
  crossword: { Tv: CrosswordTv, Phone: CrosswordPhone },
  bluff: { Tv: BluffTv, Phone: BluffPhone },
  heart: { Tv: HeartTv, Phone: HeartPhone },
  memories: { Tv: MemoriesTv, Phone: MemoriesPhone },
  sweet: { Tv: SweetTv, Phone: SweetPhone },
  wavelength: { Tv: WavelengthTv, Phone: WavelengthPhone },
  quiz: { Tv: QuizTv, Phone: QuizPhone },
  couple: { Tv: CoupleTv, Phone: CouplePhone },
  connect4: { Tv: Connect4Tv, Phone: Connect4Phone },
  battleship: { Tv: BattleshipTv, Phone: BattleshipPhone },
  petitbac: { Tv: PetitBacTv, Phone: PetitBacPhone },
  guesswho: { Tv: GuessWhoTv, Phone: GuessWhoPhone },
};
