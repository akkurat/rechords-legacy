import { Song } from '../api/collections.js';
import * as React from 'react';
const Parser = require("html-react-parser");


interface Props {
  title: string;
  className?: string;
  songs: Array<Song>;
  replace: Function;
}

export default class MetaContent extends React.Component<Props, {}> {
    content: object;

    constructor(props) {
        super(props);

        let matches : Array<Song> = this.props.songs.filter((song : Song) => {
            return song.author == 'Meta' && song.title == this.props.title;
        })
        if (matches.length == 0) {
            this.content = <span>No match for {this.props.title}!</span>;
        } else {
            let html = matches[0].getHtml();
            this.content = new Parser(html, {replace: this.props.replace});
        }
    }


    render() {
        return (
            <div className={this.props.className}>{this.content}</div>
        );
    }

}