const React = require('react');
const ReactDOMServer = require('react-dom/server');

const express = require('express');
const app = express();
const path = require('path');
const port = process.env.PORT || 3000;
import Page from './components/Page';
import newGame from './utils/gameGenerator'

import assets from '../build/assets.json'

import { storageNeedSync, updateWordsStorage } from '../src/utils/dictManagement'
import { loadGame, getGamesForClient, saveGame, getAllGames, deleteGame } from './utils/gameHelper'

const scripts = [assets.client.js];
const totalLifeAllowed = 6; /* Are 6 even enough? */

app.use('/public/', express.static('build/public'));

storageNeedSync().then(async (res) => {
    if (res) {
        await updateWordsStorage();
    }

    app.use('/', function(req, res) {
        res.send(ReactDOMServer.renderToStaticMarkup(<Page scripts={scripts} />));
    });

}).catch((err) => {
    console.error("Just got this huge error", err);
});


const server = require('http').createServer(app);
server.listen(port, function () {
    console.log('Server listening at port %d', port);
});


const io = require('socket.io')(server, {
    pingInterval: 5000,
    pingTimeout: 11000
});

let numUsers = 0;
let connectedKnownClients = [];

io.on('connection', (socket) => {
    ++numUsers;
    let connectionClientId = null,
        currentlyPlayingGameId = null;

    console.log('New user connected!');

    io.emit('UPDATE_CLIENTS_COUNT', { count: numUsers});

    socket.on('NEW_GAME_REQUEST', async () => {
        if (!connectionClientId) {
            //If I don't know who you are, you get no game!
            socket.emit('NEW_GAME_DENIED');
            return;
        }


        const game = await newGame({clientId: connectionClientId, playing: true, lifeLeft: totalLifeAllowed});
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
        //I have the opportunity here to decide if yes or no ...
        // ...
        socket.emit('GO_MANAGEMENT_RESULT', {authorised: true});
    });

    socket.on('LOAD_ALL_GAMES', async () => {
        //Retrieve all the games from somewhere!
        const allGames = await getAllGames();
        socket.emit('LOAD_ALL_GAMES_RESULT', allGames);
    });


    socket.on('LOAD_GAME', async (data) => {
        const gameId = data.gameId;
        currentlyPlayingGameId = gameId;
        ///load it from wherever...
        const game = await loadGame(gameId);

        if (game === null) {
            emitError('Unable to load game!!1', socket);
            return;
        }

        //Set playing : true!
        game.playing = true;
        await saveGame(game);

        //then let's answer our client
        syncGame(game, socket);

        //Update it in background! (this will add the new one... )
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
            //How did the frontend allow you do this action?!
            return null;
        }

        //Save for reference.
        game.moves.push(char);


        //Check if move was successful
        // if (game.realWord.toLowerCase().indexOf(char) < 0) {
        //     //If you really lost it, so you lost it. Right? Lost. L o s t. Get over it.
        //     ++game.lostMoves;
        // }

        //let's update the masked string
        game.word = game.realWord.split('').map((char) => {
            return game.moves.indexOf(char) > -1 ? char : '*';
        }).join('');

        // let discoveredChars = game.word.split('').reduce((acc, val) => {
        //     return acc.indexOf(val) > -1 ? acc.push(val) : acc;
        // });

        let allCharsDiscovered = game.word.length > 0;
        game.word.split('').forEach((chr) => {
            allCharsDiscovered = allCharsDiscovered && game.moves.indexOf(chr) > -1;
        });

        //Did you just lost?!
        let wrongChars = 0;
        for (const usedChar of game.moves) {
            wrongChars += (game.word.indexOf(usedChar) < 0) ? 1 : 0;
        }

        console.log("Wrong chars!", wrongChars, game.lifeLeft, totalLifeAllowed);

        game.lifeLeft = totalLifeAllowed - wrongChars;

        await saveGame(game);

        //then answer the client!
        syncGame(game, socket);

        if (allCharsDiscovered) {
            //Let's announce a winning game!
            //update the game here...
            game.playing = false;
            game.result = 'win';
            game.end = Math.floor(new Date() / 1000);

            socket.emit('GAME_OVER', {result: 'win', realWord: game.realWord});
        } else if (game.lifeLeft < 1) {

            //update the game here...
            game.playing = false;
            game.result = 'lost';
            game.timeEnd = Math.floor(new Date() / 1000);

            socket.emit('GAME_OVER', {result: 'lost', realWord: game.realWord});
        }

        await saveGame(game);

        //Update it in background!
        sendGameHistory(connectionClientId, socket);
    });

    socket.on('CLIENT_ID', async (client) => {
        //let's see if the client has actually any games with us!
        let clientId = client.id;

        if (!clientId) {
            // No answer? My mama once told me never talk to strangers! LOL
            return;
        }

        //let's save it as connection global!
        connectionClientId = clientId;

        let clientsKnown = connectedKnownClients.filter(client => client.id === clientId);

        //let's save it anyway, as we will need it an disconnect time!
        connectedKnownClients.push({id: clientId, socket, date: new Date()});

        if (clientsKnown.length > 0) {
            //Shoot! We already got a client with the same ID!
            //Stop everything!
            for (const client of clientsKnown) {
                client.socket.emit('DUPLICATE_CLIENT_PAUSED');
            }
            socket.emit('DUPLICATE_CLIENT_PAUSED');
            return;
        }

        sendGameHistory(connectionClientId, socket);
    });


    socket.on('disconnect', () => {
        // WS should detect client disconnection in a fair way...
        --numUsers;

        //let's first of all remove yourself! you dead m8!!
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
                //Still too many!
                for (const client of sameClientIdConnections) {
                    client.socket.emit('DUPLICATE_CLIENT_PAUSED');
                }
            } else if (sameClientIdConnections.length === 1) {
                sameClientIdConnections[0].socket.emit('DUPLICATE_CLIENT_PLAY');
            }
        }

        console.info('connectedKnownClients', connectedKnownClients);

        //we should be good to go now!
        io.emit('UPDATE_CLIENTS_COUNT', { count: numUsers});
    });
});

function findAllClientsFromClientId(list, clientId) {
    return list.filter((item) => item.id && item.id === clientId);
}


function syncGame(game, socket) {
    // Then emits your data!
    socket.emit('SYNC_GAME', {...game, realWord: ((game.result === null) ? null : game.realWord)});
}
function emitError(errorMessage, socket) {
    socket.emit('GENERIC_ERROR', errorMessage);
}
async function sendGameHistory(clientId, socket) {
    // let's do a heavy intensive job here and find the user's games!
    // all of this completely async! poor redis..

    const games = (await getGamesForClient(clientId)).map(game => ({...game,
        realWord: ((game.result === null) ? null : game.realWord)
    }));

    console.info("Just got client id and user games!", games);

    socket.emit('GAME_HISTORY', games);
}
