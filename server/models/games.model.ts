import mongoose from 'mongoose';
import gameSchema from './schema/games.schema';

/**
 * Mongoose model for the `Game` collection.
 *
 * This model is created using the `gameSchema`, representing the `Game` collection in the MongoDB database,
 * and provides an interface for interacting with the stored game data.
 */
const GameModel = mongoose.model('Game', gameSchema);

export default GameModel;
