import { Server } from 'socket.io';
import { AnswerUpdatePayload } from './answer';
import { CommentUpdatePayload } from './comment';
import { QuestionResponse, VoteUpdatePayload } from './question';
import { MessageUpdatePayload } from './message';
import { GameMovePayload, GameUpdatePayload } from './game';

/**
 * A type alias for the Socket.io Server instance that handles communication
 * between the client and server, using the defined events.
 */
export type FakeSOSocket = Server<ClientToServerEvents, ServerToClientEvents>;

/**
 * Interface representing the events the client can emit to the server.
 */
export interface ClientToServerEvents {
  makeMove: (move: GameMovePayload) => void;
  joinGame: (gameID: string) => void;
  leaveGame: (gameID: string) => void;
  joinChat: (chatID: string) => void;
  leaveChat: (chatID: string | undefined) => void;
}

/**
 * Interface representing the possible events that the server can emit to the client.
 */
export interface ServerToClientEvents {
  questionUpdate: (question: QuestionResponse) => void;
  answerUpdate: (result: AnswerUpdatePayload) => void;
  viewsUpdate: (question: QuestionResponse) => void;
  voteUpdate: (vote: VoteUpdatePayload) => void;
  commentUpdate: (comment: CommentUpdatePayload) => void;
  messageUpdate: (message: MessageUpdatePayload) => void;
  userUpdate: (user: UserUpdatePayload) => void;
  gameUpdate: (game: GameUpdatePayload) => void;
  gameError: (error: GameErrorPayload) => void;
  chatUpdate: (chat: ChatUpdatePayload) => void;
}
