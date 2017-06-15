import React from 'react';
import { connect } from 'react-redux'
import { dispatcher } from "../utils/connectionClient"
import GameTable from "./GameTable";
import Layout from './Layout'

class ManageGames extends React.Component {
    constructor(props) {
        super(props);

        //make sure to reload all games every time you open this page.
        //Not ideal. i/o intensive, but hey!
        dispatcher({ type: 'LOAD_ALL_GAMES' });
    }
    render() {
        const { allGames = null } = this.props.main;
        return (
            <Layout>
                <div>
                    <h3>ManageGames</h3> (of every player)<br /><br />
                    <p>There's a token associated with your session, so the server will always know who you are.</p>
                    <p>To notice any difference, try playing a new game from an incognito window</p>

                    {allGames && allGames.length && <div>
                        Found {allGames.length} games!<br />
                        <GameTable games={allGames} title="All played games" />
                    </div>}
                </div>
            </Layout>
        );
    }
}

export default connect(state => state)(ManageGames);
