export function gameBegin(game) {
    return {
        type: 'GAME_BEGIN',
        game,
    }
}

export function loadPreviousGames(previousGames) {
    return {
        type: 'GAME_HISTORY',
        previousGames,
    }
}

export function gameOver({result, realWord}) {
    return {
        type: 'GAME_OVER',
        result,
        realWord,
    }
}

export function genericError(message) {
    return {
        type: 'GENERIC_ERORR',
        message,
    }
}


export function connectionLost(isLost) {
    return {
        type: 'CONNECTION_LOST',
        connectionLost: isLost,
    }
};

export function syncGame(values) {
    return {
        type: 'SYNC_GAME',
        ...values,
    }
}

export function goManagement(authorised) {
    return {
        type: 'GO_MANAGEMENT',
        authorised: authorised,
    }
}

export function allGamesResult(allGames) {
    return {
        type: 'LOAD_ALL_GAMES_RESULT',
        allGames,
    }
}

export function updateOnlineClients(count) {
    return {
        type: 'UPDATE_CLIENTS_COUNT',
        count,
    }
}

export function duplicateClientPause() {
    return {
        type: 'DUPLICATE_CLIENT_PAUSED'
    }
}

export function duplicateClientPlay() {
    return {
        type: 'DUPLICATE_CLIENT_PLAY'
    }
}

