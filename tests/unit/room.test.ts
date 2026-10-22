import { describe, expect, it } from 'vitest';
import { CATALOG } from '../../src/lib/games/catalog';
import type { Connect4Phone } from '../../src/lib/games/connect4/logic';
import type { Link } from '../../src/lib/net/link';
import type { ClientTransport, DialHandlers } from '../../src/lib/net/transport';
import { COUNTDOWN_MS, HostRoom, RESUME_MS, TIMEOUT_MS } from '../../src/lib/room/host-room';
import { PlayerClient } from '../../src/lib/room/player-client';
import { PROTOCOL, type HostMessage, type PhoneScreen } from '../../src/lib/room/protocol';
import { linkPair, ManualClock, settle } from './helpers';

class Phone {
  messages: HostMessage[] = [];

  constructor(
    readonly link: Link,
    readonly clientId: string,
  ) {
    link.onData((data) => {
      const message = data as HostMessage;
      this.messages.push(message);
      if (message.t === 'ping') link.send({ t: 'pong', at: message.at });
    });
  }

  get screen(): PhoneScreen | null {
    const screens = this.messages.filter((message): message is Extract<HostMessage, { t: 'screen' }> => message.t === 'screen');
    return screens.at(-1)?.screen ?? null;
  }

  hello(name: string) {
    this.link.send({ t: 'hello', protocol: PROTOCOL, clientId: this.clientId, name });
  }

  room(cmd: unknown) {
    this.link.send({ t: 'room', cmd });
  }

  game(action: unknown) {
    this.link.send({ t: 'game', action });
  }
}

function setup() {
  const clock = new ManualClock();
  let changes = 0;
  const saved = new Map<string, number>();
  const settings = new Map<string, unknown>();
  const room = new HostRoom({
    timers: clock,
    catalog: CATALOG,
    onChange: () => {
      changes += 1;
    },
    trophies: { load: (name) => saved.get(name) ?? 0, save: (name, count) => saved.set(name, count) },
    settings: { load: (game) => settings.get(game), save: (game, value) => settings.set(game, value) },
    seed: () => 1234,
  });
  const connect = (clientId: string) => {
    const [hostSide, phoneSide] = linkPair();
    room.accept(hostSide);
    return new Phone(phoneSide, clientId);
  };
  return { clock, room, connect, saved, settings, changes: () => changes };
}

async function startConnect4(env: ReturnType<typeof setup>) {
  const a = env.connect('client-aaaa');
  const b = env.connect('client-bbbb');
  a.hello('Léa');
  b.hello('Tom');
  await settle();
  a.room({ op: 'pick', game: 'connect4' });
  await settle();
  a.room({ op: 'ready' });
  b.room({ op: 'ready' });
  await settle();
  env.clock.advance(COUNTDOWN_MS);
  await settle();
  return { a, b };
}

describe('HostRoom', () => {
  it('seats two players and moves from lobby to menu', async () => {
    const env = setup();
    const a = env.connect('client-aaaa');
    a.hello('Léa');
    await settle();
    expect(a.messages[0]).toEqual({ t: 'welcome', slot: 0 });
    expect(env.room.tv().stage.kind).toBe('lobby');
    const b = env.connect('client-bbbb');
    b.hello('léa');
    await settle();
    expect(env.room.tv().stage.kind).toBe('menu');
    expect(env.room.tv().seats[1]?.name).toBe('léa 2');
    expect(b.screen?.kind).toBe('menu');
  });

  it('rejects a third phone while both seats are connected', async () => {
    const env = setup();
    env.connect('client-aaaa').hello('A');
    env.connect('client-bbbb').hello('B');
    const c = env.connect('client-cccc');
    c.hello('C');
    await settle();
    expect(c.messages).toContainEqual({ t: 'rejected', reason: 'full' });
  });

  it('gives the seat back to the same phone after a disconnection', async () => {
    const env = setup();
    const a = env.connect('client-aaaa');
    a.hello('Léa');
    env.connect('client-bbbb').hello('Tom');
    await settle();
    a.link.close();
    await settle();
    expect(env.room.tv().seats[0]?.connected).toBe(false);
    const again = env.connect('client-aaaa');
    again.hello('Léa');
    await settle();
    expect(again.messages[0]).toEqual({ t: 'welcome', slot: 0 });
    expect(env.room.tv().seats[0]?.connected).toBe(true);
  });

  it('lets a new phone take a disconnected seat', async () => {
    const env = setup();
    const a = env.connect('client-aaaa');
    a.hello('Léa');
    env.connect('client-bbbb').hello('Tom');
    await settle();
    a.link.close();
    await settle();
    const c = env.connect('client-cccc');
    c.hello('Zoé');
    await settle();
    expect(c.messages[0]).toEqual({ t: 'welcome', slot: 0 });
    expect(env.room.tv().seats[0]?.name).toBe('Zoé');
  });

  it('runs rules, countdown and the game, routing actions to the right player', async () => {
    const env = setup();
    const { a, b } = await startConnect4(env);
    const stage = env.room.tv().stage;
    expect(stage.kind).toBe('playing');
    const view = (screen: PhoneScreen | null) => (screen?.kind === 'playing' ? (screen.view as Connect4Phone) : null);
    const starter = view(a.screen)?.myTurn ? a : b;
    const waiting = starter === a ? b : a;
    waiting.game({ type: 'drop', col: 0 });
    await settle();
    expect(view(a.screen)?.moves).toBe(0);
    starter.game({ type: 'drop', col: 0 });
    await settle();
    expect(view(a.screen)?.moves).toBe(1);
    expect(view(waiting.screen)?.myTurn).toBe(true);
  });

  it('lets either player change the settings, which resets ready flags and reaches the game', async () => {
    const env = setup();
    const a = env.connect('client-aaaa');
    const b = env.connect('client-bbbb');
    a.hello('Léa');
    b.hello('Tom');
    await settle();
    a.room({ op: 'pick', game: 'sketch' });
    await settle();
    const rules = () => a.screen as Extract<PhoneScreen, { kind: 'rules' }>;
    expect(rules().settings).toEqual({ rounds: 6, time: 80, hints: 2 });
    a.room({ op: 'ready' });
    b.room({ op: 'set', key: 'time', value: 45 });
    b.room({ op: 'set', key: 'rounds', value: 7 });
    b.room({ op: 'set', key: 'nope', value: 1 });
    await settle();
    expect(rules().settings).toEqual({ rounds: 6, time: 45, hints: 2 });
    expect(rules().ready).toEqual([false, false]);
    expect(env.settings.get('sketch')).toEqual({ rounds: 6, time: 45, hints: 2 });
    a.room({ op: 'ready' });
    b.room({ op: 'ready' });
    await settle();
    env.clock.advance(COUNTDOWN_MS);
    await settle();
    const stage = env.room.tv().stage;
    expect(stage.kind === 'playing' && (stage.view as { total: number }).total).toBe(45);
  });

  it('remembers the settings from a previous visit to the TV', async () => {
    const env = setup();
    env.settings.set('petitbac', { categories: ['Pays', 'Ville', 'Animal'], rounds: 2, time: 60 });
    const a = env.connect('client-aaaa');
    const b = env.connect('client-bbbb');
    a.hello('Léa');
    b.hello('Tom');
    await settle();
    a.room({ op: 'pick', game: 'petitbac' });
    await settle();
    const stage = env.room.tv().stage;
    expect(stage.kind === 'rules' && stage.settings).toEqual({ categories: ['Pays', 'Ville', 'Animal'], rounds: 2, time: 60 });
    a.room({ op: 'set', key: 'categories', value: ['Pays'] });
    a.room({ op: 'set', key: 'categories', value: ['Pays', ' pays ', 'Ville', 'Fromage', ''] });
    await settle();
    const after = env.room.tv().stage;
    expect(after.kind === 'rules' && after.settings.categories).toEqual(['Pays', 'Ville', 'Fromage']);
  });

  it('alternates the starting player between games', async () => {
    const env = setup();
    const { a, b } = await startConnect4(env);
    const turnOf = () => ((a.screen as Extract<PhoneScreen, { kind: 'playing' }>).view as Connect4Phone).turn;
    const first = turnOf();
    a.room({ op: 'quit' });
    await settle();
    expect(env.room.tv().stage.kind).toBe('menu');
    expect(env.room.tv().toast?.text).toMatch(/Léa a quitté/);
    a.room({ op: 'pick', game: 'connect4' });
    await settle();
    a.room({ op: 'ready' });
    b.room({ op: 'ready' });
    await settle();
    env.clock.advance(COUNTDOWN_MS);
    await settle();
    expect(turnOf()).toBe(first === 0 ? 1 : 0);
  });

  it('pauses the game while a phone is away and resumes after a countdown', async () => {
    const env = setup();
    const { a, b } = await startConnect4(env);
    a.link.close();
    await settle();
    const stage = env.room.tv().stage;
    expect(stage.kind === 'playing' && stage.waitingFor).toEqual(['Léa']);
    expect(b.screen?.kind === 'playing' && b.screen.paused).toBe(true);
    const back = env.connect('client-aaaa');
    back.hello('Léa');
    await settle();
    const resumed = env.room.tv().stage;
    expect(resumed.kind === 'playing' && resumed.resumeAt).not.toBeNull();
    env.clock.advance(RESUME_MS);
    await settle();
    expect(back.screen?.kind === 'playing' && back.screen.paused).toBe(false);
  });

  it('drops a silent phone after the heartbeat timeout', async () => {
    const env = setup();
    const a = env.connect('client-aaaa');
    a.hello('Léa');
    await settle();
    a.link.onData(() => undefined);
    (a as unknown as { link: { send: () => boolean } }).link.send = () => false;
    env.clock.advance(TIMEOUT_MS + 3000);
    await settle();
    expect(env.room.tv().seats[0]?.connected).toBe(false);
  });

  it('records trophies for the winner and offers a rematch', async () => {
    const env = setup();
    const { a, b } = await startConnect4(env);
    const view = (screen: PhoneScreen | null) => (screen?.kind === 'playing' ? (screen.view as Connect4Phone) : null);
    const starter = view(a.screen)?.myTurn ? a : b;
    const otherPhone = starter === a ? b : a;
    for (const [phone, col] of [
      [starter, 0],
      [otherPhone, 1],
      [starter, 0],
      [otherPhone, 1],
      [starter, 0],
      [otherPhone, 1],
      [starter, 0],
    ] as const) {
      phone.game({ type: 'drop', col });
      await settle();
    }
    env.clock.advance(3000);
    await settle();
    expect(starter.screen?.kind).toBe('result');
    const name = starter === a ? 'Léa' : 'Tom';
    expect(env.saved.get(name)).toBe(1);
    expect(env.room.tv().seats[starter === a ? 0 : 1]?.trophies).toBe(1);
    starter.room({ op: 'again' });
    await settle();
    expect(env.room.tv().stage.kind).toBe('countdown');
  });
});

class FakeTransport implements ClientTransport {
  dials: { handlers: DialHandlers; cancelled: boolean }[] = [];

  dial(_code: string, handlers: DialHandlers) {
    const entry = { handlers, cancelled: false };
    this.dials.push(entry);
    return { cancel: () => (entry.cancelled = true) };
  }

  dispose() {}
}

describe('PlayerClient', () => {
  function setupClient() {
    const clock = new ManualClock();
    const transport = new FakeTransport();
    const client = new PlayerClient({
      transport,
      timers: clock,
      room: 'ABCD',
      clientId: 'client-zzzz',
      name: 'Léa',
      onChange: () => undefined,
    });
    client.start();
    return { clock, transport, client };
  }

  it('says hello, follows screens and answers pings', async () => {
    const { transport, client } = setupClient();
    const [phoneSide, hostSide] = linkPair();
    const received: unknown[] = [];
    hostSide.onData((data) => received.push(data));
    transport.dials[0].handlers.onOpen(phoneSide);
    await settle();
    expect(received[0]).toMatchObject({ t: 'hello', name: 'Léa', clientId: 'client-zzzz' });
    hostSide.send({ t: 'welcome', slot: 1 });
    hostSide.send({ t: 'ping', at: 5 });
    await settle();
    expect(client.status).toBe('online');
    expect(client.slot).toBe(1);
    expect(received).toContainEqual({ t: 'pong', at: 5 });
  });

  it('reconnects after the link drops and after a long silence', async () => {
    const { clock, transport, client } = setupClient();
    const [phoneSide, hostSide] = linkPair();
    transport.dials[0].handlers.onOpen(phoneSide);
    hostSide.send({ t: 'welcome', slot: 0 });
    await settle();
    hostSide.close();
    await settle();
    expect(client.status).toBe('retrying');
    clock.advance(1000);
    expect(transport.dials).toHaveLength(2);
    const [phoneSide2, hostSide2] = linkPair();
    transport.dials[1].handlers.onOpen(phoneSide2);
    hostSide2.send({ t: 'welcome', slot: 0 });
    await settle();
    expect(client.status).toBe('online');
    clock.advance(9000);
    await settle();
    expect(client.status).toBe('retrying');
  });

  it('stops retrying when the room is full', async () => {
    const { clock, transport, client } = setupClient();
    const [phoneSide, hostSide] = linkPair();
    transport.dials[0].handlers.onOpen(phoneSide);
    hostSide.send({ t: 'rejected', reason: 'full' });
    await settle();
    clock.advance(20000);
    expect(client.status).toBe('full');
    expect(transport.dials).toHaveLength(1);
  });

  it('retries when the television cannot be reached', () => {
    const { clock, transport, client } = setupClient();
    transport.dials[0].handlers.onError('unavailable');
    expect(client.status).toBe('unreachable');
    clock.advance(700);
    expect(transport.dials).toHaveLength(2);
    clock.advance(11000);
    expect(transport.dials.length).toBeGreaterThan(2);
  });
});
