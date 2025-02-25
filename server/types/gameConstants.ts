/**
 * A constant array representing the available types of games.
 */
export const GAME_TYPES = ['Nim'] as const;

/**
 * Type representing the possible game types.
 * This is derived from the GAME_TYPES constant.
 */
export type GameType = (typeof GAME_TYPES)[number];

/**
 * The maximum number of objects in a Nim game.
 */
export const MAX_NIM_OBJECTS = 21;
