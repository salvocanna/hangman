import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Layout from './Layout';
import { dispatcher } from '../utils/connectionClient';
import GameTable from './GameTable';

class Main extends React.Component {
    onNewGameClick(e) {
        e.preventDefault();
        e.stopPropagation();

        dispatcher({ type: 'NEW_GAME_REQUEST' });
    }

    onAllGamesClick(e) {
        e.preventDefault();
        e.stopPropagation();

        dispatcher({ type: 'GO_MANAGEMENT' });
    }

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

        const { previousGames } = this.props.main;

        return (
            <Layout>
                <div className="testtest">
                    <div style={{padding: '45px 15px 15px'}}>
                        <div className="row">
                            <div className="col-xs-3">
                                <button type="button"
                                        onClick={this.onNewGameClick}
                                        className="btn btn-primary">
                                    New game!
                                </button>
                            </div>
                            <div className="col-xs-3">
                                <button type="button"
                                        onClick={this.onAllGamesClick}
                                        className="btn btn-primary">
                                    See all games
                                </button>
                            </div>
                        </div>
                    </div>


                    {previousGames !== null && previousGames.length > 0 && <div>
                        <GameTable games={previousGames} title="Your previously played games" />
                    </div>}

                    {previousGames !== null && previousGames.length === 0 && <div>
                        You haven't played any game! Go on and start a new one!
                    </div>}

                </div>
            </Layout>
        );
    }
}

Main.contextTypes = {
    router: PropTypes.object,
};

export default connect(state => state)(Main);
