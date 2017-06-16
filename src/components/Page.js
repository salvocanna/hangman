import React from 'react';
import PropTypes from 'prop-types';

class Page extends React.Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        styles: PropTypes.arrayOf(PropTypes.string.isRequired),
        scripts: PropTypes.arrayOf(PropTypes.string.isRequired),
        app: PropTypes.object,
    };
    static defaultProps = {
        title: '',
        styles: [],
        scripts: [],
        description: 'Hangman game in node and react with real time messaging'
    };
    render() {
        const { title, description, styles, scripts, app, children } = this.props;
        return (
            <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="x-ua-compatible" content="ie=edge" />
                <title>Hangman game</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#000000" />
                {styles.concat(
                    ['https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css']
                ).map(style => <link rel="stylesheet" href={style} key={style} />)}
            </head>
            <body>
                <div id="app" dangerouslySetInnerHTML={{ __html: children }} />
                {scripts.map(script => <script key={script} src={script} />)}
            </body>
            </html>
        );
    }
}

export default Page;
