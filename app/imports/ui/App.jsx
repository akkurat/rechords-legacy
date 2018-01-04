import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withTracker } from 'meteor/react-meteor-data';
import { CSSTransitionGroup } from 'react-transition-group'

import Songs from '../api/collections.js';

import List from './List.jsx';
import Viewer from './Viewer.jsx';
import Editor from './Editor.jsx';
import Collapsed from './Collapsed.jsx';

import { BrowserRouter, Route, Switch } from 'react-router-dom';

const empty_song = {
    title: "New Song",
    text: "Titel\nInterpret\n========\n\n#Schlagwort\n\nText ohne vorangehenden Titel mit Doppelpunkt ist einfach Kommentar.\n\n1:\nDas ist die [A]erste Strophe\nHat zum Teil auch [em]Akkorde\n\nref:\nTra la lalala\nla la lala la la\n\n2:\nUnd noch eine weil's so schön ist",
    author: "Unknown"
};


// App component - represents the whole app
class App extends Component {

    constructor(props) {
        super(props);
    }

    getSongTree() {
        let filter = {};
        let out = {};

        this.props.songs.forEach((song) => {
            if (out[song.author] === undefined) {
                out[song.author] = [];
            }
            out[song.author].push(song);
        });
        return out;
    }

    render() {
        let list = (<p>laden...</p>);
        if (!this.props.dataLoading) {
            list = (<List tree={this.getSongTree()} />);
        }

        const getSong = (params) => {
            return song = Songs.findOne({
                author_: params.author,
                title_: params.title
            });

        }

        return (
            <BrowserRouter>
                <Switch>
                    <Route exact path='/' render={(props) => (
                            <div className="container">
                                {list}
                                <div className="content">
                                <h1>Probieren wirs einmal!</h1>
                                </div>
                            </div>
                    )} />


                    <Route path='/view/:author/:title' render={(match) => {
                        let song = getSong(match.match.params);

                        if (song === undefined) {
                            return (
                                <div className="container">
                                    <aside id="list">&nbsp;</aside>
                                    <div className="content">
                                        <h1>404</h1>
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <div className="container">
                                {list}
                                <Viewer song={song} />
                            </div>
                        )
                    }} />

                    <Route path='/edit/:author/:title' render={(match) => {
                        let song = getSong(match.match.params);

                        if (song === undefined) {
                            return (<h2>404. {match.match.params.title}</h2>)
                        }

                        song = Songs._transform(song);

                        return (
                            <Editor song={song} />
                        )
                    }} />

                    <Route path="/new" render={() => {
                        song = Songs._transform(empty_song);
                        return <Editor song={song} />
                    }} />

                    <Route component={NoMatch} />
                </Switch>
            </BrowserRouter>
        );
    }
}

const NoMatch = ({ location }) => (
    <div>
        <h3>No match for <code>{location.pathname}</code></h3>
    </div>
)

App.propTypes = {
    dataLoading: PropTypes.bool.isRequired,
    songs: PropTypes.array.isRequired,
};

export default withTracker(props => {
    const handle = Meteor.subscribe('songs');

    return {
        //currentUser: Meteor.user(),
        dataLoading: !handle.ready(),
        songs: Songs.find({}, { sort: { title: 1 } }).fetch(),
    };
})(App);