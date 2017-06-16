import uuidV4 from 'uuid/v4';
import { getRandomWord, saveGame, linkGameToClient } from './gameHelper';

export default async function newGame({ clientId = null, playing = false, lifeLeft = 6, timeBegin = 'now' }) {
    const word = await getRandomWord();
    const gameId = uuidV4();
    const game = {
        gameId,
        playing,
        result: null,
        word: word.split('').map(char => '*').join(''),
        realWord: word, // This is the real word which should never leave the server. ever.
        lostMoves: 0,
        points: 0, // Future impl
        moves: [],
        level: 0,
        lifeLeft,
        timeBegin: (timeBegin === 'now') ? Math.floor(new Date() / 1000) : timeBegin,
        timeEnd: null,
    };

    await saveGame(game);

    if (clientId) {
        await linkGameToClient(gameId, clientId);
    }

    return game;
}
