import { getGamesForClient } from './gameHelper';

export function findAllClientsFromClientId(list, clientId) {
    return list.filter(item => item.id && item.id === clientId);
}

export function syncGame(game, socket) {
    // Then emits your data!
    socket.emit('SYNC_GAME', { ...game, realWord: ((game.result === null) ? null : game.realWord) });
}
export function emitError(errorMessage, socket) {
    socket.emit('GENERIC_ERROR', errorMessage);
}

export async function sendGameHistory(clientId, socket) {
    // let's do a heavy intensive job here and find the user's games!
    // all of this completely async! poor redis..

    const games = (await getGamesForClient(clientId))
        .map(game => ({ ...game, realWord: ((game.result === null) ? null : game.realWord) }));

    socket.emit('GAME_HISTORY', games);
}

export function getMaskedWord(fullWord, moves = []) {
    return fullWord
        .split('')
        .map((char) => {
            return moves.indexOf(char) > -1 ? char : '*';
        })
        .join('');
}
