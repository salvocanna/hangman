import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

// I leave the impl for multiple reducer, even if unlikely
import main from './main';

const rootReducer = combineReducers({
    main,
    routing: routerReducer
});

export default rootReducer;
