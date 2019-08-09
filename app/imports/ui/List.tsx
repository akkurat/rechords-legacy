import * as React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router-dom';
import MetaContent from './MetaContent';
import {Song} from '../api/collections';
import { History } from 'history'


interface ListItemProps extends RouteComponentProps {
    song: Song;
    key: string;
    // injected by withRouter
    history: History;
}

const ListItem = withRouter<{}>( 
    class ListItem extends React.Component<ListItemProps, {}> {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <li><NavLink to={`/view/${this.props.song.author_}/${this.props.song.title_}`}
                activeClassName="selected"
                onContextMenu={this.handleContextMenu}>
                <span className="title">{this.props.song.title}</span>
                <span className="author">{this.props.song.author}</span>
                </NavLink></li>
        );
    }

    handleContextMenu = event => {
        let m = this.props.song;
        this.props.history.push("/edit/" + m.author_ + "/" + m.title_);
        event.preventDefault();
      };

})



interface ListGroupProps {
  songs: Array<Song>;
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
                    {this.props.songs.map((song) => 
                        <ListItem song={song} key={song._id} />
                    )}
                </ul>
            </li>
        )
    }
}


interface ListProps {
  songs: Array<Song>;
  filter: String;
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


    keyHandler = (e) => {
        if (e.key == 'Escape') {
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
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.keyHandler);
    }

    onChange = (event : React.ChangeEvent<HTMLInputElement>) => {
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

    onTagClick = (event : React.MouseEvent) => {
        let tag = '#' + event.currentTarget.childNodes[0].textContent.toLowerCase();

        this.setState( (state, props) => {
            let newFilter;
            if (state.filter.includes(tag)) {
                newFilter = state.filter.replace(tag, '');
            } else {
                newFilter = state.filter + tag + ' '
            }
            return {
                filter: newFilter.replace('  ', ' ')
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
                for (let tag of song.getTags()) {
                    if (tag.startsWith('privat')) return;
                }
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

        const process = (node) => {
            if (node.name == 'li') {
                let b = node.children.length > 1 ? <b>…</b> : null;
                return <li onMouseDown={this.onTagClick.bind(this)}>{node.children[0].data}{b}</li>
            }

            return node;
        }

        return (
            <aside id="list">
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
                    <span className={'reset ' + filled} onClick={(e)=>{this.setState({filter: ''})}}>&times;</span>
                </div>

                <MetaContent 
                    replace={process}
                    className={'filterMenu ' + active} 
                    title="Schlagwortverzeichnis" 
                    songs={this.props.songs}
                    />
                <ul>
                    {groups.map((group) => 
                        <ListGroup label={group} songs={tree[group]} key={group}/>
                    )}
                    <li>
                        <h2><NavLink to="/new">+ Neues Lied</NavLink></h2>
                    </li>
                </ul>
            </aside>
        )
    }
}