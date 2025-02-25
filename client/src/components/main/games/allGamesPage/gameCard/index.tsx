import React from 'react';
import './index.css';
import { GameInstance } from '../../../../../types';

/**
 * Component to display a game card with details about a specific game instance.
 * @param game The game instance to display.
 * @param handleJoin Function to handle joining the game. Takes the game ID as an argument.
 * @returns A React component rendering the game details and a join button if the game is waiting to start.
 */
const GameCard = ({
  game,
  handleJoin,
}: {
  game: GameInstance;
  handleJoin: (gameID: string) => void;
}) => {
  // This was added to prevent the game card from crashing when the game is not loaded.
  if (!game || !game.state) {
    return <div className='game-item'>Invalid game data</div>;
  }

  return (
    <div className='game-item'>
      <p>
        <strong>Game ID:</strong> {game.gameID} | <strong>Status:</strong> {game.state.status}
      </p>
      <ul className='game-players'>
        {game.players?.map((player: string) => <li key={`${game.gameID}-${player}`}>{player}</li>)}
      </ul>
      {game.state.status === 'WAITING_TO_START' && (
        <button className='btn-join-game' onClick={() => handleJoin(game.gameID)}>
          Join Game
        </button>
      )}
    </div>
  );
};

export default GameCard;
