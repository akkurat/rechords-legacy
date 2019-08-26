import * as React from 'react';
import { NavLink, withRouter, RouteComponentProps } from 'react-router-dom';
import MetaContent from './MetaContent';
import { Song, ISongReference } from '../api/collections';
import { History } from 'history'
import { convertNodeToElement } from 'react-html-parser';


interface ListItemProps extends RouteComponentProps {
    song: Song;
    key: string;
    // injected by withRouter
    history: History;
}

const ListItem = withRouter<{}>(
    class ListItem_ extends React.Component<ListItemProps, {}> {
        constructor(props) {
            super(props);
            // Trying out this approach instead of arrowfunction (for improving my javascript understanding)
            this.handleContextMenu = this.handleContextMenu.bind(this)
        }

        render() {
            const song = this.props.song
            return (
                <li>
                    <LinkSong songRef={song} activeClassName="selected"
                        onContextMenu={this.handleContextMenu}>
                        <span className="title">{this.props.song.title}</span>
                        <span className="author">{this.props.song.author}</span>
                    </LinkSong></li>
            );
        }

        private handleContextMenu(event) {
            const m = this.props.song;
            this.props.history.push("/edit/" + m.author_ + "/" + m.title_);
            event.preventDefault();
        };

    })



interface ListGroupProps {
    songs: Song[];
    label: string;
}
class ListGroup extends React.Component<ListGroupProps, {}> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <li key={this.props.label}>
                <h2 className="huge">{this.props.label}</h2>
                <ul>
                    {this.props.songs.map(song =>
                        <ListItem song={song} key={song._id} />
                    )}
                </ul>
            </li>
        )
    }
}

interface ListProps {
    songs: Song[];
    filter: string;
    className?: string;
}
interface ListState {
    filter: string;
    active: boolean;
}
export default class List extends React.Component<ListProps, ListState> {
    constructor(props) {
        super(props);
        this.state = {
            filter: props.filter || '',
            active: false
        }
    }



    shiftScreen: (event) => void = ev => {
        // The clean way would be: event bus
        // and on app.jsx listen for it and do the actual styling
        const mql = window.matchMedia('(min-width: 700px) and (max-width: 1200px)');

        const body = document.getElementById('body')

        // const width = ev.target.clientWidth
        if (mql.matches) {
            body.style.left = '200px';
        }

    };
    resetScreen = (ev) => {
        // The clean way would be: event bus
        // and on app.jsx listen for it and do the actual styling
        const body = document.getElementById('body')
        if(ev.target.id !== 'list') {

        body.style.left = ''
        }

    };

    keyHandler = e => {
        if (e.key === 'Escape') {
            this.setState({
                filter: '',
            });
            this.refs.filter.blur();
            e.preventDefault();
        } else {
            this.refs.filter.focus();
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", this.keyHandler);
        document.addEventListener('click', this.resetScreen)
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyHandler);
        document.removeEventListener('click', this.resetScreen)
    }

    onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            filter: event.currentTarget.value
        });
        event.preventDefault();
    };

    onFocus = () => {
        this.setState({
            active: true
        });
    }

    onBlur = () => {
        this.setState({
            active: false
        });
    }

    onTagClick = (event: React.MouseEvent) => {
        const tag = '#' + event.currentTarget.childNodes[0].textContent.toLowerCase();

        this.setState((state, props) => {
            let newFilter;
            if (state.filter.includes(tag)) {
                newFilter = state.filter.replace(tag, '');
            } else {
                newFilter = state.filter + tag + ' '
            }
            return {
                filter: newFilter.replace('  ', ' ').trim()
            }
        });
        event.preventDefault();
    }


    render() {
        let tree = {};
        let groups = [];

        let filters = this.state.filter.split(' ');

        this.props.songs.forEach((song) => {
            for (let filter of filters) {
                filter = filter.toLowerCase();

                if (!song.title.toLowerCase().includes(filter) &&
                    !song.text.toLowerCase().includes(filter) &&
                    !song.author_.toLowerCase().includes(filter)) {
                    return;
                }
            }

            // Hack to hide all songs containing an 'archiv'-tag
            if (!this.state.filter.includes('#privat')) {
                const tags = song.getTags()
                if ( tags.get('privat')) { return }
            }


            let categories = [song.title[0]];

            for (let cat of categories) {
                if (tree[cat] === undefined) {
                    tree[cat] = [];
                    groups.push(cat);
                }

                tree[cat].push(song);
            }

        });

        let active = this.state.active ? '' : 'hidden';
        let filled = this.state.filter == '' ? '' : 'filled';

        const process = (node, idx) => {
            if (node.name == 'li') {
                const b = node.children.length > 1 ? <b>…</b> : null;
                return <li onMouseDown={this.onTagClick}>{node.children[0].data}{b}</li>
            }
            return convertNodeToElement(node, idx, process);
        }

        return (
            <aside id="list" className={this.props.className} 
            onPointerEnter={this.shiftScreen}  onPointerLeave={this.resetScreen}>
                <div className="filter">
                    <input type="text"
                        placeholder="Filtern…"
                        value={this.state.filter}
                        ref="filter"
                        onKeyDown={this.onKeyDown}
                        onChange={this.onChange}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                    />
                    <span className={'reset ' + filled} onClick={(e) => { this.setState({ filter: '' }) }}>&times;</span>
                </div>

                <MetaContent
                    replace={process}
                    className={'filterMenu ' + active}
                    title="Schlagwortverzeichnis"
                    songs={this.props.songs}
                />
                <ul>
                    {groups.map((group) =>
                        <ListGroup label={group} songs={tree[group]} key={group} />
                    )}
                    <li>
                        <h2><NavLink to="/new">+ Neues Lied</NavLink></h2>
                    </li>
                </ul>
            </aside>
        )
    }
}

export const LinkTag: React.FunctionComponent<{ tag: string }> = props => {
    const tag = props.tag
    return (<a href={'/%23' + tag}>
        {props.children}
    </a> // %23 is #
    )
}

export interface SongLinkProps {
    songRef: ISongReference
    activeClassName?: string
    onContextMenu?: React.MouseEventHandler<HTMLAnchorElement>
}

export const LinkSong: React.FunctionComponent<SongLinkProps> = props => {
    let href: History.LocationDescriptor<any>
    const songRef = props.songRef
    if (songRef.title) {
        href = `/view/${songRef.author_}/${songRef.title_}`
    } else {
        href = `/view/${songRef.author_}/`
    }

    function joinedInfo() {
        let out = ''
        if (props.songRef.title) {
            out += props.songRef.title + ' - '
        }
        out += props.songRef.author
        return out
    }

    const innerValue = props.children || joinedInfo()

    return (
        <NavLink {...props} to={href}>
            {innerValue}
        </NavLink>
    )
}