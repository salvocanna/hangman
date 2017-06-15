import React from 'react'
import Keyboard from './Keyboard'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { dispatcher } from '../utils/connectionClient'
import WordDisplay from "./WordDisplay";
import { push } from 'react-router-redux'
import store from '../store'


class Game extends React.Component {
    constructor(props) {
        super(props);

        dispatcher({
            type: 'LOAD_GAME',
            gameId: props.match.params.gameId
        });

    };
    componentWillMount() {
        // // this runs right before the <App> is rendered
        // this.ref = base.syncState(`${this.props.params.storeId}/fishes`, {
        //     context: this,
        //     state: 'fishes'
        // });
        //
        // // check if there is any order in localStorage
        // const localStorageRef = localStorage.getItem(`order-${this.props.params.storeId}`);
        //
        // if(localStorageRef) {
        //     // update our App component's order state
        //     this.setState({
        //         order: JSON.parse(localStorageRef)
        //     });
        // }

        console.log("componentWillMount");

    }

    componentWillUnmount() {
        // base.removeBinding(this.ref);
        console.log("componentWillUnmount");
    }

    componentWillUpdate(nextProps, nextState) {
        // localStorage.setItem(`order-${this.props.params.storeId}`, JSON.stringify(nextState.order));
        console.log("componentWillUpdate");
    }
    onKeyClick(key) {
        console.log('you clicked a key!', key);

        dispatcher({ type: 'PICK_CHAR', char: key});
    }

    render() {
        const { gameId, playing, result, word, realWord, lostMoves, lifeLeft = null, points, moves, level, timeBegin } = this.props.main;

        if (gameId === null) {
            return (
                <div>Loading ...</div>
            );
        } else if (result === 'win' || result === 'lost') {
            return gameOver({win: result === 'win', realWord});
        }

        return (
            <div className="container">
                <div className="row">
                    <div className="col-xs-12" style={{textAlign: 'center', padding: '30px'}}>
                        <div className="row">
                            <div className="col-xs-12"  style={{padding: '30px'}}>
                                <WordDisplay word={word} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-6">
                                {lifeLeft !== null &&
                                    <img src={`/public/${lifeLeft}.jpg`} style={{width: '100%', maxWidth: '300px'}} />}
                            </div>
                            <div className="col-xs-6" style={{textAlign: 'center'}}>
                                You're playing game {gameId}

                                <Keyboard onKeyClick={this.onKeyClick} notAvailableKeys={moves} />
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}


const gameOver = ({win, realWord}) => {
    return <div className="container">
        <div className="col-xs-12" style={{textAlign: 'center'}}>
            {win ? <h4>YOU WON! 🎉 🎉 🎉</h4> : <div>
                <h4>Oh no! 🙄 You lost</h4>
                <p>The word was: {realWord}</p>
            </div>}
            <p>Fancy trying again?</p>
            <div>
                <div style={{padding: '45px 15px 15px'}}>
                    <button type="button"
                            onClick={() => { dispatcher({ type: 'NEW_GAME_REQUEST' }) }}
                            className="btn btn-primary">
                        Yay! Give me a new game
                    </button>

                    <button type="button"
                            onClick={() => { store.dispatch(push(`/`)) }}
                            className="btn btn-primary">
                        Nah!
                    </button>
                </div>
            </div>
        </div>
    </div>;
};

Game.propTypes = {
    gameId: PropTypes.string.isRequired
};

export default connect(state => state)(Game);