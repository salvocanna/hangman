import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Layout extends React.Component {
    render() {
        const { duplicateClientPaused = false, connectionLost = false } = this.props.main;

        if (duplicateClientPaused) {
            return <div className="container">
                There seems to be a duplicate client somewhere.<br />
                Close all other sessions to start the game again.
            </div>;
        }

        if (connectionLost) {
            return <div className="container">
                Connection with the server lost.
            </div>;
        }

        return (
            <div className="container">
                <div>
                    <div className="page-header">
                        <h1><Link to="/">Hangman!</Link> <small>node, websocket & fun</small></h1>
                    </div>
                    <div>
                        { this.props.children }
                    </div>
                    <div><hr /></div>
                </div>
            </div>
        );
    }
}

export default connect(state => state)(Layout);
