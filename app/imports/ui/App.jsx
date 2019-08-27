import React, { Component, createContext } from 'react';
import PropTypes from 'prop-types';

import { withTracker } from 'meteor/react-meteor-data';

import Songs, {Song} from '../api/collections.js';

import List from './List.tsx';
import Viewer from './Viewer.tsx';
import Editor from './Editor.jsx';

import { BrowserRouter, Route, Switch } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import { Overview } from './Overview';
// import './collapsed.less'
import { MobileHeader, MobileMenuButton } from './MobileMenu';

const empty_song = {
    title: "Neues Lied",
    text: "Titel\nInterpret\n========\n\n#Schlagwort\n\n1:\nDas ist die [A]erste Strophe\nHat zum Teil auch [em]Akkorde\n\n\nNach zwei leeren Zeilen gilt jeglicher Text als Kommentar.\n\nRefrain:\nTra la lalala\nla la lala la la\n\n2:\nUnd noch eine weil's so schön ist",
    author: "Unknown"
};


// TODO: make special classs for loading and 404
// There is no benefit of using the normal content class here
const NA404 = ({songs}) => (
    <>
        <MobileHeader>
          <MobileMenuButton />
        </MobileHeader>
        <DocumentTitle title="Hölibu | 404" />
        <List songs={songs} />
        <div className="content chordsheet">
            <span id="logo">
                <h1>404</h1>
                <h2>n/A</h2>
            </span>
        </div>
    </>
)

const Logo = ({}) => (
    <div className="content chordsheet">
        <span id="logo">
            <h2>Hölibu</h2>
            <h1>3000</h1>
        </span>
    </div>
)

const NoMatch = ({ location }) => (
    <div>
        <h3>No match for <code>{location.pathname}</code></h3>
    </div>
)

export const GlobalSwipe = createContext(null)
// App component - represents the whole app
class App extends Component {

    constructor(props) {
        super(props);
        console.log(props)
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

    shift = (direction) => {
        console.log(direction) 
    }

    render() {
        if (this.props.dataLoading) {
            return (
                <>
                    <DocumentTitle title="Hölibu" />
                    <aside id="list" />
                    <Logo />
                </>
            )
        }

        const FilledList = (props) => (<List {...props} songs={this.props.songs}/>);
        let debugBar;
        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
            debugBar = (
            <div id="hoeliDebug">
                pixelRatio: {window.devicePixelRatio}<br />
                width: {window.innerWidth}<br />
                height: {window.innerHeight}<br />
            </div>
            )
        } else {
            debugBar = undefined
        }

        const initialState = {isShifted: 'hallo', shift: this.shift}


        return (
            <GlobalSwipe.Provider value={initialState}>
            <BrowserRouter>
                <Switch>

                    <Route exact path='/' render={({location}) => { 
                        const search = new URLSearchParams(location.search)
                        const f = search.get('f')

                        return (
                            <>
                                <DocumentTitle title="Hölibu" />
                                <FilledList filter={f} />
                                <Logo />
                            </>
                    )}
                    } />


                    <Route path='/view/:author/:title' render={(match) => {
                        let song = this.getSong(match.match.params);

                        if (song === undefined) {
                            return <NA404 {...this.props}/>; 
                        }

                        return (
                            <>
                                <DocumentTitle title={"Hölibu | " + song.author + ": " + song.title}/>
                                <FilledList />
                                <Viewer song={song} />
                            </>
                        )
                    }} />

                    <Route path='/view/:author/' render={(match) => {
                        const songs = this.getSongs(match.match.params);

                        if (songs === undefined) {
                            return <NA404 {...this.props}/>; 
                        }

                        return (
                            <>
                                <DocumentTitle title={"Hölibu | Alle Lieder von " + match.author }/>
                                <FilledList />
                                <Overview songs={songs} />
                                
                            </>
                        )
                    }} />

                    <Route path='/edit/:author/:title' render={(match) => {
                        let song = this.getSong(match.match.params);

                        if (song === undefined) {
                            return <NA404 {...this.props}/>;
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
                                <DocumentTitle title="Hölibu" />
                                <FilledList />
                                <Overview songs={this.props.songs} />
                            </>
                        )
                    }} />

                    <Route component={NoMatch} />
                </Switch>
            </ BrowserRouter>
            {debugBar}
            </GlobalSwipe.Provider>
        );
    }
}

App.propTypes = {
    dataLoading: PropTypes.bool.isRequired,
    songs: PropTypes.array.isRequired
};

export default withTracker(props => {
    const songHandle = Meteor.subscribe('songs');
    const revHandle = Meteor.subscribe('revisions');

    return {
        dataLoading: !songHandle.ready() && !revHandle.ready(),
        songs: Songs.find({}, { sort: { title: 1 } }).fetch(),
    };
})(App);