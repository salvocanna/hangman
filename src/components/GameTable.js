import React from 'react'
import Layout from './Layout'
import { Redirect } from 'react-router-dom'
//import { createNewGame, getPreviousPlayedIncompleteGames } from '../utils/gameHelper'
import store from '../store'
import { push } from 'react-router-redux'
import PropTypes from 'prop-types'
import { dispatcher } from '../utils/connectionClient'
import moment from 'moment'

class GameTable extends React.Component {
    resumeGame(game) {
        dispatcher({
            type: 'RESUME_GAME_REQUEST',
            gameId: game.gameId,
        });
    }
    deleteGame(game) {
        dispatcher({
            type: 'DELETE_GAME_REQUEST',
            gameId: game.gameId,
        });
    }
    render() {
        const {games = [], title = "Games list", displayUser = false} = this.props;
        const sortedGames = games.sort((a, b) => a.timeBegin > b.timeBegin ? -1 : 1);
        return (
            <div className="row">
                <div className="col-xs-12">
                    <div className="panel panel-default">
                        <div className="panel-heading">{title}</div>
                        <table className="table table-striped table-condensed">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    {displayUser ? <th>User</th> : null}
                                    <th>Status</th>
                                    <th>Word</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedGames.map(game => (
                                    <tr>
                                        <td>{moment.unix(game.timeBegin).format("MMMM Do, h:mm:ss a")}</td>
                                        {displayUser ? <td>{game.clientName}</td> : null}
                                        <td>
                                            {game.result === 'win' &&
                                            <span className="label label-success">Won</span>}
                                            {game.result === 'lost' &&
                                            <span className="label label-warning">Lost</span>}
                                            {game.result === null &&
                                            <span className="label label-default">Incomplete</span>}
                                        </td>
                                        <td><pre style={{display: 'inline-block'}}>{game.word}</pre></td>
                                        <td>
                                            <div className="btn-group btn-group-xs">
                                                {game.result === null &&
                                                <a href="#" className="btn btn-info btn-sm btn-success"
                                                    onClick={this.resumeGame.bind(null, game)}>
                                                    play
                                                </a>}

                                                <a href="#" className="btn btn-info btn-sm btn-danger"
                                                   onClick={this.deleteGame.bind(null, game)}>
                                                    delete
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

export default GameTable;