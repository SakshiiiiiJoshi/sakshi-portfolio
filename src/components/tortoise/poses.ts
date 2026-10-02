// poses — filled in by P03
export const TORTOISE_STATES = ['idle', 'walk', 'peek', 'hide', 'wave', 'sleep'] as const;
export type TortoiseState = (typeof TORTOISE_STATES)[number];
