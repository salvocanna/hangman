import React from 'react';
import moment from 'moment';
import { dispatcher } from '../utils/connectionClient';

class GameTable extends React.Component {
    resumeGame(game) {
        dispatcher({
            type: 'RESUME_GAME_REQUEST',
            gameId: game.gameId,
        });
    }
    deleteGame(game, e) {
        // Prevent from messing with the scrolling
        e.preventDefault();
        e.stopPropagation();

        dispatcher({
            type: 'DELETE_GAME_REQUEST',
            gameId: game.gameId,
        });
    }
    render() {
        const { games = [], title = "Games list" } = this.props;
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
                                    <th>Status</th>
                                    <th>Word</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedGames.map(game => (
                                    <TableRow game={game} resumeGame={this.resumeGame} deleteGame={this.deleteGame} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}

const TableRow = ({game, resumeGame, deleteGame}) => (
    <tr>
        <td>{moment.unix(game.timeBegin).format("MMMM Do, h:mm:ss a")}</td>
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
                   onClick={resumeGame.bind(null, game)}>
                    play
                </a>}

                <a href="#" className="btn btn-info btn-sm btn-danger"
                   onClick={deleteGame.bind(null, game)}>
                    delete
                </a>
            </div>
        </td>
    </tr>
);

export default GameTable;
