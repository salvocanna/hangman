import client from './persistentDataHelper'
import randomItemInArray from 'random-item-in-array'

export function loadGame(gameId) {
    return new Promise((resolve, reject) => client.get(`game:${gameId}`, (err, object) => {
        if (err === null) {
            resolve(JSON.parse(object));
        } else {
            reject(err);
        }
    }));
};

export async function saveGame(game) {
    return new Promise((resolve, reject) => client.set(`game:${game.gameId}`, JSON.stringify(game), (err, object) => {
        if (err === null) {
            resolve(object);
        } else {
            reject(err);
        }
    }));
};

export function linkGameToClient(gameId, clientId) {
    return new Promise((resolve, reject) => client.sadd(`client:${clientId}`, gameId, (err, object) => {
        if (err === null) {
            resolve(object);
        } else {
            reject(err);
        }
    }));
};

export async function getGamesForClient(clientId) {
    return new Promise((resolve, reject) => client.smembers(`client:${clientId}`, async (err, res) => {
        if (err === null) {
            //let's hydrate them now!
            let games = [];
            console.info('getGamesForClient');
            for (const gameId of res) {
                try {
                    const game = await loadGame(gameId);
                    if (game) {
                        games.push(game);
                    }
                } catch (e) {
                    // remove game from set!
                    // .. well.. it's defo on the TODO list!
                }
            }
            resolve(games.reverse());
        } else {
            reject(err);
        }
    }));
};

export async function deleteGame(gameId, clientId = null) {
    return new Promise((resolve, reject) => client.del(`game:${gameId}`, async (err, res) => {
        if (err === null) {
            resolve(res);
        } else {
            reject(err);
        }
    }));
};

export async function getAllGames() {
    //This is gonna be fun... DO NOT TRY THIS AT HOME LOL

    return new Promise((resolve, reject) => client.keys(`game:*`, async (err, res) => {
        if (err === null) {
            //let's hydrate them now!
            let games = [];
            console.log("JUST GOT", res);
            for (const gameId of res) {
                try {
                    const game = await loadGame(gameId.substr('game:'.length));
                    games.push(game);
                } catch (e) {
                    // Shh!! Error? Which error? You seen any error around?
                }
            }
            resolve(games);
        } else {
            reject(err);
        }
    }));
};

export async function getRandomWord(minLength = 7, maxLength = 10) {
    if (minLength < 7 || maxLength > 15) {
        throw new Error('I cannot find such word! It\'s out of range!');
    }

    return new Promise((resolve, reject) => client.zrangebyscore(`words`, minLength, maxLength, (err, res) => {
        if (err === null) {
            //return true if there are no elements there!
            //let's pick a random one!
            resolve(randomItemInArray(res));
        } else {
            reject(err);
        }
    }));

};
