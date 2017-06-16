import React from 'react';
import ReactDOMServer from 'react-dom/server';
import express from 'express';
import Page from './components/Page';
import newGame from './utils/gameGenerator';
import assets from '../build/assets.json';
import { storageNeedSync, updateWordsStorage } from '../src/utils/dictManagement';
import { loadGame, saveGame, getAllGames, deleteGame } from './utils/gameHelper';
import { getMaskedWord, syncGame, sendGameHistory, emitError, findAllClientsFromClientId } from './utils/socketHelper';

/**
 * Why this huge file?
 * I'm sorry.
 *
 * For sake of simplicity (KISS) and given the small size/count of
 * all the socket events, I prefer keeping all the callbacks here.
 *
 * Not ideal. Blame me. I know. Open to suggestions tho!
 *
 */

const app = express();
const port = process.env.PORT || 3000;

const scripts = [assets.client.js];
const totalLifeAllowed = 6; /* Are 6 even enough?! xD */

app.use('/public/', express.static('build/public'));
const server = require('http').createServer(app);

storageNeedSync().then(async (storageResult) => {
    if (storageResult) {
        await updateWordsStorage();
    }

    app.use('/', (req, res) => {
        res.send(ReactDOMServer.renderToStaticMarkup(<Page scripts={scripts} />));
    });
}).catch((err) => {
    console.error('Just got this huge error', err);
});

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});


const io = require('socket.io')(server, {
    pingInterval: 5000,
    pingTimeout: 11000,
});

let numUsers = 0;
const connectedKnownClients = [];

/**
 * Here you go, all the socket callbacks.
 */
io.on('connection', (socket) => {
    // A new user, yay
    ++numUsers;
    console.log('New user connected!');

    let connectionClientId = null;
    let currentlyPlayingGameId = null;

    io.emit('UPDATE_CLIENTS_COUNT', { count: numUsers });

    socket.on('NEW_GAME_REQUEST', async () => {
        if (!connectionClientId) {
            // If I don't know who you are, you get no game!
            socket.emit('NEW_GAME_DENIED');
            return;
        }

        const game = await newGame({ clientId: connectionClientId, playing: true, lifeLeft: totalLifeAllowed });
        currentlyPlayingGameId = game.gameId;
        socket.emit('GAME_BEGIN', game);
    });

    socket.on('RESUME_GAME_REQUEST', async (obj) => {
        const game = await loadGame(obj.gameId);

        if (game) {
            socket.emit('GAME_BEGIN', game);
        } else {
            emitError('Unable to begin game. Internal error.', socket);
        }
    });

    socket.on('DELETE_GAME_REQUEST', async (obj) => {
        await deleteGame(obj.gameId, connectionClientId);
        sendGameHistory(connectionClientId, socket);
    });


    socket.on('GO_MANAGEMENT', () => {
        // I have the opportunity here to decide if authorize you or not ...
        socket.emit('GO_MANAGEMENT_RESULT', { authorised: true });
    });

    socket.on('LOAD_ALL_GAMES', async () => {
        // Retrieve all the games from somewhere!
        const allGames = await getAllGames();
        socket.emit('LOAD_ALL_GAMES_RESULT', allGames);
    });

    socket.on('LOAD_GAME', async (data) => {
        const gameId = data.gameId;
        currentlyPlayingGameId = gameId;
        const game = await loadGame(gameId);

        if (game === null) {
            emitError('Unable to load game!!1', socket);
            return;
        }

        // Set playing : true!
        game.playing = true;
        await saveGame(game);

        // Then let's answer our client
        syncGame(game, socket);

        // ...and update the user game history in background!
        // (this will add the new one just created... )
        sendGameHistory(connectionClientId, socket);
    });


    socket.on('PICK_CHAR', async (data) => {
        let { char } = data;

        char = char.trim().toLowerCase();

        if (currentlyPlayingGameId === null || char.length !== 1) {
            // You! How did you get here eh?!
            return null;
        }

        const game = await loadGame(currentlyPlayingGameId);

        if (game.playing === false || game.result !== null || game.moves.indexOf(char) > -1) {
            // How did the frontend allow you do this action?!
            return null;
        }

        // Save for reference.
        game.moves.push(char);


        // Let's update the masked string
        game.word = getMaskedWord(game.realWord, game.moves);

        let allCharsDiscovered = game.word.length > 0;
        game.word
            .split('')
            .forEach((chr) => {
                allCharsDiscovered = allCharsDiscovered && game.moves.indexOf(chr) > -1;
            });

        // Did you just lost?!
        let wrongChars = 0;
        game.moves.forEach((usedChar) => {
            wrongChars += (game.word.indexOf(usedChar) < 0) ? 1 : 0;
        });

        game.lifeLeft = totalLifeAllowed - wrongChars;

        await saveGame(game);

        // ... then answer the client!
        syncGame(game, socket);

        if (allCharsDiscovered) {
            // Let's announce a winning game!
            // Update the game here...
            game.playing = false;
            game.result = 'win';
            game.end = Math.floor(new Date() / 1000);

            socket.emit('GAME_OVER', {result: 'win', realWord: game.realWord});
        } else if (game.lifeLeft < 1) {
            // user lost. booo!
            game.playing = false;
            game.result = 'lost';
            game.timeEnd = Math.floor(new Date() / 1000);

            socket.emit('GAME_OVER', { result: 'lost', realWord: game.realWord });
        }

        await saveGame(game);

        // Update it in background!
        sendGameHistory(connectionClientId, socket);
    });

    socket.on('CLIENT_ID', async (client) => {
        // Let's see if the client has actually any games with us!
        let clientId = client.id;

        if (!clientId) {
            // No answer? My mama once told me never talk to strangers!
            return;
        }

        // Let's save it as connection global! (not ideal perhaps)
        connectionClientId = clientId;

        const clientsKnown = connectedKnownClients.filter((client) => client.id === clientId);

        // Let's save it anyway, as we will need it an disconnect time!
        connectedKnownClients.push({ id: clientId, socket, date: new Date() });

        if (clientsKnown.length > 0) {
            // Shoot! We already got a client with the same ID!
            // Stop everything!
            for (const knownClient of clientsKnown) {
                knownClient.socket.emit('DUPLICATE_CLIENT_PAUSED');
            }
            socket.emit('DUPLICATE_CLIENT_PAUSED');
            return;
        }

        sendGameHistory(connectionClientId, socket);
    });


    socket.on('disconnect', () => {
        // WS should detect client disconnection in a fair way...
        --numUsers;

        // Let's first of all remove yourself! you dead maan!!
        const selfIndex = connectedKnownClients.findIndex(client => client.socket === socket);

        // Just to be extra paranoid
        if (selfIndex > -1) {
            connectedKnownClients.splice(selfIndex, 1);
        }

        // Are there any duplicates around like double sessions?!
        // Let's notify them if needed!
        if (connectionClientId) {
            const sameClientIdConnections = findAllClientsFromClientId(connectedKnownClients, connectionClientId);
            if (sameClientIdConnections.length > 1) {
                // Still too many with same id!
                sameClientIdConnections.forEach((client) => {
                    client.socket.emit('DUPLICATE_CLIENT_PAUSED');
                });
            } else if (sameClientIdConnections.length === 1) {
                sameClientIdConnections[0].socket.emit('DUPLICATE_CLIENT_PLAY');
            }
        }

        // Keep broadcasting the users count around!
        io.emit('UPDATE_CLIENTS_COUNT', { count: numUsers });
    });
});

