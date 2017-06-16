import { push } from 'react-router-redux';
import SocketIOClient from 'socket.io-client';
import { updateOnlineClients, gameBegin, gameOver, duplicateClientPause, duplicateClientPlay,
    syncGame, loadPreviousGames, genericError, connectionLost, goManagement, allGamesResult } from '../actionCreator';
export const socket = SocketIOClient();


export const dispatcher = ({ type, ...args }) => {
    socket.emit(type, args);
};

/**
 * This is a "bridge" between the websocket and our store.
 * technically is not *really* needed, but this means we should
 * dispatch every action to redux every time. Which is not nice.
 * What if the server whats to sends some extra data that isnt even part
 * of the store?
 *
 * Anyway, ai posteri l'ardua sentenza
 */
export default function(store) {

    socket.on('UPDATE_CLIENTS_COUNT', (object) => {
        store.dispatch(updateOnlineClients(object.count));
    });

    socket.on('GAME_BEGIN', (object) => {
        store.dispatch(gameBegin(object));
        // Is this even a good place for this? Where should it be? The 'pure' store itself?!
        // It has to be it's own action, so before or after the `gameBegin` could be the same...
        // I ideally, overnight, I had an epiphany and I think this could go in its own
        // websocket action. I mean, if the server wanna redirect you somewhere, doesn't it have
        // the right to do so? Meh.
        store.dispatch(push(`/game/${object.gameId}`));
    });

    socket.on('DUPLICATE_CLIENT_PAUSED', () => {
        store.dispatch(duplicateClientPause());
    });
    socket.on('DUPLICATE_CLIENT_PLAY', () => {
        store.dispatch(duplicateClientPlay());
    });

    socket.on('SYNC_GAME', (object) => {
        store.dispatch(syncGame(object));
    });

    socket.on('GAME_OVER', (object) => {
        store.dispatch(gameOver(object));
    });
    socket.on('GAME_HISTORY', (object) => {
        store.dispatch(loadPreviousGames(object));
    });

    socket.on('GO_MANAGEMENT_RESULT', (object) => {
        store.dispatch(goManagement(object.authorised));
        if (object.authorised) {
            store.dispatch(push('/management'));
        }
    });

    socket.on('LOAD_ALL_GAMES_RESULT', (object) => {
        store.dispatch(allGamesResult(object));
    });


    socket.on('GENERIC_ERORR', (object) => {
        store.dispatch(genericError(object));
    });

    socket.on('NEW_GAME_DENIED', (object) => {
        // Old style alert. Love it 😂
        // Also love how I'm ignoring the error message LOL
        alert('We are just having some trouble right now. Try logging in again perhaps!');
    });


    socket.on('disconnect', () => {
        // Let's notify the user!
        store.dispatch(connectionLost(true));
    });

    socket.on('connect', () => {
        // Yay! We're back.
        store.dispatch(connectionLost(false));
    });
}
