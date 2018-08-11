import { Component } from 'react';
import * as React from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Song } from '../api/collections'


interface ListItemProps {
    song: Song;
    key: string;
}

const ListItem = withRouter<{}> (
    class ListItem extends Component<ListItemProps, {}> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <li>
        <NavLink
          to={`/view/${this.props.song.author_}/${this.props.song.title_}`}
          activeClassName="selected"
          onContextMenu={this.handleContextMenu}
        >
          {this.props.song.title}
        </NavLink>
      </li>
    );
  }
  handleContextMenu = event => {
    let m = this.props.song;
    this.props.history.push("/edit/" + m.author_ + "/" + m.title_);
    event.preventDefault();
  };
});



class ListGroup extends Component<ListGroupProps,{}> {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <li key={this.props.label}>
                <h2>{this.props.label}</h2>
                <ul>
                    {this.props.songs.map((song:Song) => 
                        <ListItem song={song} key={song._id} />
                    )}
                </ul>
            </li>
        )
    }
}
interface ListGroupProps  {
    songs: array<Song>
    label: string
}

export default class List extends Component<ListProps,{}> {
    constructor(props) {
        super(props);
    }

    render() {
        let groups = [];
        for (let key in this.props.tree) {
            groups.push(key);
        }

        return (
            <aside id="list">
                <ul>
                    {groups.map((group) => 
                        <ListGroup label={group} songs={this.props.tree[group]} key={group}/>
                    )}
                    <li>
                        <h2><NavLink to="/new">+ Neues Lied</NavLink></h2>
                    </li>
                </ul>
            </aside>
        )
    }
}
interface ListProps {
    tree: any;
}
