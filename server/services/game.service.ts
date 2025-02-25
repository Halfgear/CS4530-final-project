import GameModel from '../models/games.model';
import { FindGameQuery, GameInstanceID, GamesResponse, GameState, GameStatus } from '../types/game';
import { GameType } from '../types/gameConstants';

/**
 * Retrieves games from the database based on the specified game type and status.
 *
 * This function builds a query based on the provided filters (`gameType` and `status`) and
 * fetches games from the `GameModel` collection, returning the list of games matching the query.
 * If there is an error, an empty array is returned.
 *
 * @param {GameType | undefined} gameType The type of the game to filter by (e.g., 'Nim').
 * @param {GameStatus | undefined} status The status of the game to filter by (e.g., 'IN_PROGRESS').
 * @returns {Promise<GamesResponse>} A promise that resolves to a list of games matching the query.
 */
const findGames = async (
  gameType: GameType | undefined,
  status: GameStatus | undefined,
): Promise<GamesResponse> => {
  const query: FindGameQuery = {};

  // Build database query based on provided filters
  if (gameType) {
    query.gameType = gameType;
  }

  if (status) {
    query['state.status'] = status;
  }

  try {
    const games = await GameModel.find(query).lean();

    if (games === null) {
      throw new Error('No games found');
    }

    // Format and return the games in reverse order (most recent first)
    return games
      .map(game => ({
        state: game.state as GameState,
        gameID: game.gameID as GameInstanceID,
        players: game.players as string[],
        gameType: game.gameType as GameType,
      }))
      .reverse();
  } catch (error) {
    return [];
  }
};

export default findGames;
