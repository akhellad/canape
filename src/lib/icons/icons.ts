import fluent from './fluent.json';

export type IconName = keyof typeof fluent;

export const ICONS: Record<IconName, string> = fluent;
