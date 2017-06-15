import React from 'react';
import PropTypes from 'prop-types'

// class WordDisplay  extends React.Component {
//     render() {
//         const { word } = this.props;
//         return (
//             <div className={'row'}>
//                 <div className="col-xs-6 col-xs-offset-3" style={{textAlign: 'center'}}>
//                     <pre>{word}</pre>
//                 </div>
//             </div>
//         );
//     }
// }

const WordDisplay = ({word}) => {
    return (
        <div className={'row'}>
            <div className="col-xs-6 col-xs-offset-3" style={{textAlign: 'center'}}>
                <pre>{word}</pre>
            </div>
        </div>
    );
};


WordDisplay.propTypes = {
    word: PropTypes.string.isRequired
};

export default WordDisplay;