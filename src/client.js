import React from 'react';
import { render } from 'react-dom';
import { Route, Switch, Redirect } from 'react-router-dom'
import { ConnectedRouter } from 'react-router-redux'
import { Provider } from 'react-redux'
import NotFound from './components/NotFound';
import Main from './components/Main';
import Game from './components/Game';
import store, { history } from './store'
import connectionClient, { dispatcher } from './utils/connectionClient'
import ManageGames from "./components/ManageGames";
import ls from 'local-storage'
import uuidV4 from 'uuid/v4'


// this will link store and socket together
connectionClient(store);

let clientToken = ls.get('token');

if (!clientToken) {
    clientToken = uuidV4();
    //Now you've got your unique id. BOOM!
    ls.set('token', clientToken);
}

dispatcher({type:'CLIENT_ID', id: clientToken});

render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <Switch>
                <Route exact path="/" component={Main} />
                <Route exact path="/game/:gameId" component={Game} />
                <Route exact path="/management" component={ManageGames} />
                <Route component={NotFound} />
            </Switch>
        </ConnectedRouter>
    </Provider>,
    document.getElementById('app')
);


