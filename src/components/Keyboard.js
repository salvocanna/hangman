import React from 'react';
import PropTypes from 'prop-types'

class Keyboard  extends React.Component {
    constructor() {
        super();
    };

    static defaultProps = {
        notAvailableKeys: [],
    };

    render() {
        const { notAvailableKeys } = this.props;
        return (
            <div className={'row'}>
                {'abcdefghijklmnopqrstuvwxyz'.split('').map((key) => {
                    const unavailable = notAvailableKeys.indexOf(key) > -1;
                    return <button
                        type="button" className='btn btn-primary btn-lg'
                        disabled={unavailable ? 'disabled' : ''}
                        onClick={unavailable ? null : this.props.onKeyClick.bind(null, key)}>

                        {key.toUpperCase()}

                    </button>;
                })}
            </div>
        );
    }
}


Keyboard.propTypes = {
    onKeyClick: PropTypes.func.isRequired
};

export default Keyboard;