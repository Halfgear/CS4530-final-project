import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, getGames } from '../services/gamesService';
import { GameInstance, GameType } from '../types';

/**
 * Custom hook to manage the state and logic for the "All Games" page, including fetching games,
 * creating a new game, and navigating to game details.
 * @returns An object containing the following:
 * - `availableGames`: The list of available game instances.
 * - `handleJoin`: A function to navigate to the game details page for a selected game.
 * - `fetchGames`: A function to fetch the list of available games.
 * - `isModalOpen`: A boolean indicating whether the game creation modal is open.
 * - `handleToggleModal`: A function to toggle the visibility of the game creation modal.
 * - `handleSelectGameType`: A function to select a game type, create a new game, and close the modal.
 */
const useAllGamesPage = () => {
  const navigate = useNavigate();
  const [availableGames, setAvailableGames] = useState<GameInstance[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGames = async () => {
    const games = await getGames(undefined, undefined);
    setAvailableGames(games);
  };

  const handleCreateGame = async (gameType: GameType) => {
    const game = await createGame(gameType);
    setAvailableGames([...availableGames, game]);
    fetchGames(); // Refresh the list after creating a game
  };

  const handleJoin = (gameID: string) => {
    navigate(`/games/${gameID}`);
  };

  useEffect(() => {
    fetchGames();
  }, []); // Empty dependency array means this runs once on mount

  const handleToggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSelectGameType = (gameType: GameType) => {
    handleCreateGame(gameType);
    handleToggleModal();
  };

  return {
    availableGames,
    handleJoin,
    fetchGames,
    isModalOpen,
    handleToggleModal,
    handleSelectGameType,
  };
};

export default useAllGamesPage;
