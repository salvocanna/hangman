import { dispatcher } from '../utils/connectionClient'

const defaultState = {
    // ...
    // misc
    duplicateClientPaused: false,
    clientsCount: 0,
    erorrMessage: null,
    connectionLost: false,

    // All games management page
    managementAuthorised: false,
    allGames: null,

    // User specific values.
    previousGames: null,
    clientId: null,
    name: null,
    playedCount: null,


    // Game specific values.
    gameId: null,
    playing: false,
    result: null,
    word: '',
    realWord: null,
    totalCharsCount: 7,
    //totalRevealed: 0,
    lostMoves: 0,
    lifeLeft: null,
    points: 0,
    moves: [],
    level: 0, // 0 / 1 / 2 => easy / mid / hard => not currently implemented
    timeBegin: 0,
}

/**
 * Main reducer: This is mostly used for incoming actions from websocket
 */
function main(state = defaultState, action) {
    console.info(state, action);
    switch (action.type) {
        case 'UPDATE_CLIENTS_COUNT':
            return { ...state, ...{clientsCount: action.count}};
        case 'GAME_BEGIN':
            return { ...state, ...action.game};
        case 'CLIENT_INFO':
            return { ...state, ...{
                clientId: action.clientId,
                // User name is not implement atm, but here's the right place for it
                //name: action.name,
                playedCount: action.playedCount,
            }};
        case 'DUPLICATE_CLIENT_PAUSED':
            return { ...state, ...{duplicateClientPaused: true} };
        case 'DUPLICATE_CLIENT_PLAY':
            return { ...state, ...{duplicateClientPaused: false} };
        case 'REVEAL_PARTIAL_WORD':
            return { ...state, ...{word: action.word} };
        case 'SYNC_GAME':
            return { ...state, ...{
                gameId: action.gameId,
                playing: action.playing,
                result: action.result,
                word: action.word,
                realWord: action.realWord,
                lostMoves: action.lostMoves,
                lifeLeft: action.lifeLeft,
                points: action.points,
                moves: action.moves,
                level: action.level,
                timeBegin: action.timeBegin,
            }};
        case 'GAME_HISTORY':
            return { ...state, ...{
                previousGames: action.previousGames,
            }};
        case 'GAME_OVER':
            return { ...state, ...{
                playing: false,
                realWord: action.realWord, // so the user has a feedback
                result: action.result // 'win' / 'lost' / null
            }};
        case 'GENERIC_ERORR':
            return { ...state, ...{
                erorrMessage: message,
            }};

        case 'CONNECTION_LOST':
            return { ...state, ...{
                connectionLost: action.connectionLost,
            }};
        case 'GO_MANAGEMENT':
            return { ...state, ...{
                managementAuthorised: action.authorised,
            }};
        case 'LOAD_ALL_GAMES_RESULT':
            return { ...state, ...{
                allGames: action.allGames,
            }};

        default:
            return state;
    }
}

export default main;
