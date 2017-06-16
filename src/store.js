import { createStore, applyMiddleware, compose } from 'redux';
import createHistory from 'history/createBrowserHistory';
import { routerMiddleware } from 'react-router-redux';
import reducers from './reducers';

// Create a history
export const history = createHistory();

let enhancer;
if (window.devToolsExtension) {
    enhancer = compose(
        applyMiddleware(routerMiddleware(history)),
        // Middleware for development:
        window.devToolsExtension()
    );
} else {
    enhancer = applyMiddleware(routerMiddleware(history));
}

// Sync dispatched route actions to the history
const store = createStore(reducers, {}, enhancer);

export default store;
