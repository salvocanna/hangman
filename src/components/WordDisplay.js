import React from 'react';
import PropTypes from 'prop-types';

const WordDisplay = ({ word }) => (
    <div className={'row'}>
        <div className="col-xs-6 col-xs-offset-3" style={{ textAlign: 'center' }}>
            <pre>{word}</pre>
        </div>
    </div>
);

WordDisplay.propTypes = {
    word: PropTypes.string.isRequired,
};

export default WordDisplay;
