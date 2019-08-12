import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { withTracker } from 'meteor/react-meteor-data';

import Songs, {Song} from '../api/collections.js';

import List from './List.tsx';
import Viewer from './Viewer.jsx';
import Editor from './Editor.jsx';

import { BrowserRouter, Route, Switch} from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import { Overview } from './Overview';

const empty_song = {
    title: "Neues Lied",
    text: "Titel\nInterpret\n========\n\n#Schlagwort\n\n1:\nDas ist die [A]erste Strophe\nHat zum Teil auch [em]Akkorde\n\n\nNach zwei leeren Zeilen gilt jeglicher Text als Kommentar.\n\nRefrain:\nTra la lalala\nla la lala la la\n\n2:\nUnd noch eine weil's so schön ist",
    author: "Unknown"
};

const nA404 = (
    <div className="container">
        <DocumentTitle title="Hölibu | 404" />
        <aside id="list">&nbsp;</aside>
        <div className="content chordsheet">
            <span id="logo">
                <h1>404</h1>
                <h2>n/A</h2>
            </span>
        </div>
    </div>
)

const logo = (
    <div className="content chordsheet">
        <span id="logo">
            <h2>Hölibu</h2>
            <h1>3000</h1>
        </span>
    </div>
)


// App component - represents the whole app
class App extends Component {

    constructor(props) {
        super(props);
    }

    getSong(params) {
        return Songs.findOne({
            author_: params.author,
            title_: params.title
        });

    }

    getSongs(params) {
        return Songs.find({
            author_: params.author
        });

    }

    render() {
        if (this.props.dataLoading) {
            return (
                <div className="container">
                    <DocumentTitle title="Hölibu" />
                    <aside id="list" />
                    {logo}
                </div>
            )
        }

        const list = (<List songs={this.props.songs}/>);


        return (
            <BrowserRouter>
                <Switch>

                    <Route exact path='/' render={() => (
                            <div className="container">
                                <DocumentTitle title="Hölibu" />
                                {list}
                                {logo}
                            </div>
                    )} />


                    <Route path='/view/:author/:title' render={(match) => {
                        let song = this.getSong(match.match.params);

                        if (song === undefined) {
                            return nA404; 
                        }

                        return (
                            <div className="container">
                                <DocumentTitle title={"Hölibu | " + song.author + ": " + song.title}/>
                                {list}
                                <Viewer song={song} />
                            </div>
                        )
                    }} />

                    <Route path='/view/:author/' render={(match) => {
                        const songs = this.getSongs(match.match.params);

                        if (songs === undefined) {
                            return nA404; 
                        }

                        return (
                            <div className="container">
                                <DocumentTitle title={"Hölibu | All Lieder von " + match.author }/>
                                {list}
                                <Overview songs={songs} />
                                
                            </div>
                        )
                    }} />

                    <Route path='/edit/:author/:title' render={(match) => {
                        let song = this.getSong(match.match.params);

                        if (song === undefined) {
                            return na404;
                        }

                        return (
                            <>
                                <DocumentTitle title={"Hölibu | " + song.author + ": " + song.title + " (bearbeiten)"}/>
                                <Editor song={song} />
                            </>
                        )
                    }} />

                    <Route path="/new" render={() => {
                        var song = new Song(empty_song);

                        return (
                            <>
                                <DocumentTitle title="Hölibu | Neues Lied" />
                                <Editor song={song} />
                            </>
                        )
                    }} />

                    <Route path="/view"  render={() => {
                        return (
                            <>
                            <div className="container">
                                <DocumentTitle title="Hölibu" />
                                {list}
                                <Overview songs={this.props.songs} />
                                </div>
                            </>
                        )
                    }} />

                    <Route path="/:filter" render={(match) => {
                        const filter = match.match.params.filter
                        return (
                            <>
                                <DocumentTitle title="Hölibu" />
                                <List songs={this.props.songs} filter={filter} />
                                {logo}
                            </>
                        )
                    }} />

                    {/* Unnecessary, everything goes to filter */}
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
    const songHandle = Meteor.subscribe('songs');
    const revHandle = Meteor.subscribe('revisions');

    return {
        dataLoading: !songHandle.ready() && !revHandle.ready(),
        songs: Songs.find({}, { sort: { title: 1 } }).fetch(),
    };
})(App);