import supertest from 'supertest';
import { app } from '../../app';
import GameManager from '../../services/games/gameManager';
import { GameInstance, NimGameState } from '../../types/game';
import * as util from '../../services/game.service';
import { MAX_NIM_OBJECTS } from '../../types/gameConstants';

const mockGameManager = GameManager.getInstance();

describe('POST /create', () => {
  const addGameSpy = jest.spyOn(mockGameManager, 'addGame');

  describe('200 OK Requests', () => {
    it('should return 200 with a game ID when successful', async () => {
      addGameSpy.mockResolvedValueOnce('testGameID');

      const response = await supertest(app).post('/games/create').send({ gameType: 'Nim' });

      expect(response.status).toEqual(200);
      expect(response.text).toEqual(JSON.stringify('testGameID'));
      expect(addGameSpy).toHaveBeenCalledWith('Nim');
    });
  });

  describe('400 Invalid Request', () => {
    it('should return 400 for an undefined response body', async () => {
      const response = await supertest(app).post('/games/create').send(undefined);

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for an empty response body', async () => {
      const response = await supertest(app).post('/games/create').send({});

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for an invalid game type', async () => {
      const response = await supertest(app).post('/games/create').send({ gameType: 'TicTacToe' });

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });
  });

  describe('500 Server Error Request', () => {
    it('should return 500 if addGame fails', async () => {
      addGameSpy.mockResolvedValueOnce({ error: 'test error' });

      const response = await supertest(app).post('/games/create').send({ gameType: 'Nim' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when creating game: test error');
      expect(addGameSpy).toHaveBeenCalledWith('Nim');
    });

    it('should return 500 if addGame throws an error', async () => {
      addGameSpy.mockRejectedValueOnce(new Error('test error'));

      const response = await supertest(app).post('/games/create').send({ gameType: 'Nim' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when creating game: test error');
      expect(addGameSpy).toHaveBeenCalledWith('Nim');
    });
  });
});

describe('POST /join', () => {
  const joinGameSpy = jest.spyOn(mockGameManager, 'joinGame');

  describe('200 OK Requests', () => {
    it('should return 200 with a game state when successful', async () => {
      const gameState: GameInstance<NimGameState> = {
        state: { moves: [], status: 'WAITING_TO_START', remainingObjects: MAX_NIM_OBJECTS },
        gameID: 'testGameID',
        players: ['user1'],
        gameType: 'Nim',
      };
      joinGameSpy.mockResolvedValueOnce(gameState);

      const response = await supertest(app)
        .post('/games/join')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(gameState);
      expect(joinGameSpy).toHaveBeenCalledWith('testGameID', 'user1');
    });
  });

  describe('400 Invalid Request', () => {
    it('should return 400 for an undefined response body', async () => {
      const response = await supertest(app).post('/games/join').send(undefined);

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for an empty response body', async () => {
      const response = await supertest(app).post('/games/join').send({});

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for a missing gameID', async () => {
      const response = await supertest(app).post('/games/join').send({ playerID: 'user1' });

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for a missing playerID', async () => {
      const response = await supertest(app).post('/games/join').send({ gameID: 'testGameID' });

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });
  });

  describe('500 Server Error Request', () => {
    it('should return 500 if joinGame fails', async () => {
      joinGameSpy.mockResolvedValueOnce({ error: 'test error' });

      const response = await supertest(app)
        .post('/games/join')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when joining game: test error');
    });

    it('should return 500 if joinGame throws an error', async () => {
      joinGameSpy.mockRejectedValueOnce(new Error('test error'));

      const response = await supertest(app)
        .post('/games/join')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when joining game: test error');
    });
  });
});

describe('POST /leave', () => {
  const leaveGameSpy = jest.spyOn(mockGameManager, 'leaveGame');

  describe('200 OK Requests', () => {
    it('should return 200 with a success message when successful', async () => {
      const gameState: GameInstance<NimGameState> = {
        state: { moves: [], status: 'OVER', winners: ['user1'], remainingObjects: MAX_NIM_OBJECTS },
        gameID: 'testGameID',
        players: ['user1'],
        gameType: 'Nim',
      };
      leaveGameSpy.mockResolvedValueOnce(gameState);

      const response = await supertest(app)
        .post('/games/leave')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(gameState);
      expect(leaveGameSpy).toHaveBeenCalledWith('testGameID', 'user1');
    });
  });

  describe('400 Invalid Request', () => {
    it('should return 400 for an undefined response body', async () => {
      const response = await supertest(app).post('/games/leave').send(undefined);

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for an empty response body', async () => {
      const response = await supertest(app).post('/games/leave').send({});

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for a missing gameID', async () => {
      const response = await supertest(app).post('/games/leave').send({ playerID: 'user1' });

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });

    it('should return 400 for a missing playerID', async () => {
      const response = await supertest(app).post('/games/leave').send({ gameID: 'testGameID' });

      expect(response.status).toEqual(400);
      expect(response.text).toEqual('Invalid request');
    });
  });

  describe('500 Server Error Request', () => {
    it('should return 500 if leaveGame fails', async () => {
      leaveGameSpy.mockResolvedValueOnce({ error: 'test error' });

      const response = await supertest(app)
        .post('/games/leave')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when leaving game: test error');
    });

    it('should return 500 if leaveGame throws an error', async () => {
      leaveGameSpy.mockRejectedValueOnce(new Error('test error'));

      const response = await supertest(app)
        .post('/games/leave')
        .send({ gameID: 'testGameID', playerID: 'user1' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when leaving game: test error');
    });
  });
});

describe('GET /games', () => {
  // findGames is the default export in the file
  const findGamesSpy = jest.spyOn(util, 'default');
  const gameState: GameInstance<NimGameState> = {
    state: { moves: [], status: 'WAITING_TO_START', remainingObjects: MAX_NIM_OBJECTS },
    gameID: 'testGameID',
    players: ['user1'],
    gameType: 'Nim',
  };

  describe('200 OK Requests', () => {
    it('should return 200 with a game state array when successful', async () => {
      findGamesSpy.mockResolvedValueOnce([gameState]);

      const response = await supertest(app)
        .get('/games/games')
        .query({ gameType: 'Nim', status: 'WAITING_TO_START' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([gameState]);
      expect(findGamesSpy).toHaveBeenCalledWith('Nim', 'WAITING_TO_START');
    });

    it('should return 200 with an empty game state array when successful', async () => {
      findGamesSpy.mockResolvedValueOnce([]);

      const response = await supertest(app)
        .get('/games/games')
        .query({ gameType: 'Nim', status: 'IN_PROGRESS' });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
      expect(findGamesSpy).toHaveBeenCalledWith('Nim', 'IN_PROGRESS');
    });
  });

  describe('500 Server Error Request', () => {
    it('should return 500 if leaveGame throws an error', async () => {
      findGamesSpy.mockRejectedValueOnce(new Error('test error'));

      const response = await supertest(app)
        .get('/games/games')
        .query({ gameType: 'Nim', status: 'WAITING_TO_START' });

      expect(response.status).toEqual(500);
      expect(response.text).toContain('Error when getting games: test error');
    });
  });
});
