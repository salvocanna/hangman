import SocketIOClient from 'socket.io-client';
import { updateOnlineClients, gameBegin, gameOver, duplicateClientPause, duplicateClientPlay,
    syncGame, loadPreviousGames, genericError, connectionLost, goManagement, allGamesResult } from '../actionCreator'
import { push } from 'react-router-redux'
export const socket = SocketIOClient();


export const dispatcher = ({type, ...args}) => {
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
        console.info("JUST RECEIVED THIS FROM WS", object);
        store.dispatch(updateOnlineClients(object.count));
    });

    socket.on('GAME_BEGIN', (object) => {
        store.dispatch(gameBegin(object));
        //is this even a good place for this? Which one should it be? the 'pure' store itself?
        //It has to be it's own action, so before or after the `newGameBegin` could be the same...
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
            store.dispatch(push(`/management`));
        }
    });

    socket.on('LOAD_ALL_GAMES_RESULT', (object) => {
        store.dispatch(allGamesResult(object));
    });


    socket.on('GENERIC_ERORR', (object) => {
        store.dispatch(genericError(object));
    });

    socket.on('NEW_GAME_DENIED', (object) => {
        alert('We are just having some trouble right now. Try logging in again perhaps!');
    });


    socket.on('disconnect', () => {
        store.dispatch(connectionLost(true));
    });

    socket.on('connect', () => {
        //Yay!
        store.dispatch(connectionLost(false));
    })

};