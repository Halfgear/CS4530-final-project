import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import { GameErrorPayload, GameInstance, GameUpdatePayload } from '../types';
import { joinGame, leaveGame } from '../services/gamesService';

/**
 * Custom hook to manage the state and logic for the game page, including joining, leaving the game, and handling game updates.
 * @returns An object containing the following:
 * - `gameState`: The current state of the game, or null if no game is joined.
 * - `error`: A string containing any error messages related to the game, or null if no errors exist.
 * - `handleLeaveGame`: A function to leave the current game and navigate back to the game list.
 */
const useGamePage = (): {
  gameState: GameInstance | null;
  error: string | null;
  handleLeaveGame: () => void;
} => {
  const { user, socket } = useUserContext();
  const { gameID } = useParams();
  const navigate = useNavigate();
  // - `gameState` to store the current game state or null if no game is joined.
  // - `joinedGameID` to store the ID of the joined game.
  // - `error` to display any error messages related to the game, or null if no error message.
  const [gameState, setGameState] = useState<GameInstance | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLeaveGame = async () => {
    // - If a game is joined and not over, make the appropriate API call to leave the game, and
    // emit a 'leaveGame' event to the server using the socket.
    if (gameState && gameState.state.status !== 'OVER') {
      setGameState(null);
      setError(null);
      await leaveGame(gameState.gameID, user.username);
      socket.emit('leaveGame', gameState.gameID);
    }
    // Always navigate back to the games page
    navigate('/games');
  };

  // making an API call, emitting a 'joinGame' event to the server using the socket,
  // and setting apporoiate state variables.
  useEffect(() => {
    const handleJoinGame = async (id: string) => {
      const game = await joinGame(id, user.username);
      if (game) {
        setGameState(game);
        setError(null);
        socket.emit('joinGame', id);
      } else {
        setError('Error while joining a game');
      }
    };

    if (gameID) {
      handleJoinGame(gameID);
    }

    const handleGameUpdate = (updatedState: GameUpdatePayload) => {
      setGameState(updatedState.gameState);
    };

    const handleGameError = (gameError: GameErrorPayload) => {
      setError(gameError.error);
    };

    socket.on('gameUpdate', handleGameUpdate);
    socket.on('gameError', handleGameError);

    return () => {
      socket.off('gameUpdate', handleGameUpdate);
      socket.off('gameError', handleGameError);
    };
  }, [gameID, socket, user.username]);

  return {
    gameState,
    error,
    handleLeaveGame,
  };
};

export default useGamePage;
