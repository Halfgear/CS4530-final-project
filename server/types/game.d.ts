import { Request } from 'express';

/**
 * Type representing the unique identifier for a game instance.
 */
export type GameInstanceID = string;

/**
 * Type representing the possible statuses of a game.
 */
export type GameStatus = 'IN_PROGRESS' | 'WAITING_TO_START' | 'OVER';

/**
 * Interface representing the state of a game, which includes:
 * - status - The current status of the game.
 */
export interface GameState {
  status: GameStatus;
}

/**
 * Interface representing a game instance, which contains:
 * - state - The current state of the game.
 * - gameID - The unique identifier for the game instance.
 * - players - An array of player IDs participating in the game.
 * - gameType - The type of game, such as 'Nim'.
 */
export interface GameInstance<T extends GameState> {
  state: T;
  gameID: GameInstanceID;
  players: string[];
  gameType: GameType;
}

/**
 * Interface extending GameState to represent a game state that has winners.
 * - winners - An optional array of player IDs who have won the game.
 */
export interface WinnableGameState extends GameState {
  winners?: ReadonlyArray<string>;
}

/**
 * Interface representing a move in the game.
 * - playerID - The ID of the player making the move.
 * - gameID - The ID of the game where the move is being made.
 * - move - The actual move made by the player.
 */
export interface GameMove<MoveType> {
  playerID: string;
  gameID: GameInstanceID;
  move: MoveType;
}

/**
 * Base interface for moves.
 */
export interface BaseMove {}

/**
 * Interface representing a move in a Nim game.
 * - numObjects - The number of objects the player wants to remove from the game.
 */
export interface NimMove extends BaseMove {
  numObjects: number;
}

/**
 * Interface representing the state of a Nim game.
 * - moves - A list of moves made in the game.
 * - player1 - The ID of the first player.
 * - player2 - The ID of the second player.
 * - remainingObjects - The number of objects remaining in the game.
 */
export interface NimGameState extends WinnableGameState {
  moves: ReadonlyArray<NimMove>;
  player1?: string;
  player2?: string;
  remainingObjects: number;
}

/**
 * Interface extending the request body when creating a game, which contains:
 * - gameType - The type of game to be created.
 */
export interface CreateGameRequest extends Request {
  body: {
    gameType: GameType;
  };
}

/**
 * Interface extending the request query parameters when retrieving games,
 * which contains:
 * - gameType - The type of game.
 * - status - The status of the game.
 */
export interface GetGamesRequest extends Request {
  query: {
    gameType: GameType;
    status: GameStatus;
  };
}

/**
 * Interface extending the request body when performing a game-related action,
 * which contains:
 * - gameID - The ID of the game.
 * - playerID - The ID of the player.
 */
export interface GameRequest extends Request {
  body: {
    gameID: GameInstanceID;
    playerID: string;
  };
}

/**
 * Interface for querying games based on game type and status.
 * - gameType - The type of game.
 * - state.status - The status of the game.
 */
export interface FindGameQuery {
  'gameType'?: GameType;
  'state.status'?: GameStatus;
}

/**
 * Type representing the list of game instances.
 */
export type GamesResponse = GameInstance<GameState>[];

/**
 * Interface representing the payload for a game move operation,
 * which contains:
 * - gameID - The ID of the game being played.
 * - move - The move being made.
 */
export interface GameMovePayload {
  gameID: GameInstanceID;
  move: GameMove<BaseMove>;
}

/**
 * Interface representing the payload for a game state update event,
 * which contains:
 * - gameState - The updated state of the game.
 */
export interface GameUpdatePayload {
  gameState: GameInstance<GameState>;
}

/**
 * Interface representing an error payload for a game operation,
 * which contains:
 * - player - The player ID who encountered the error.
 * - error - The error message.
 */
export interface GameErrorPayload {
  player: string;
  error: string;
}
