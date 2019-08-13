import { Song } from '../api/collections.js';
import * as React from 'react';
// TODO:
import Parser, { Transform } from 'react-html-parser'

interface IMetaContentProps {
  title: string;
  className?: string;
  songs: Song[];
  replace: Transform
}

export default class MetaContent extends React.Component<IMetaContentProps, {}> {
    content: object;

    constructor(props) {
        super(props);

        let matches : Song[] = this.props.songs.filter((song: Song) => {
            return song.author == 'Meta' && song.title == this.props.title;
        })
        if (matches.length == 0) {
            this.content = <span>No match for {this.props.title}!</span>;
        } else {
            let html = matches[0].getHtml();
            this.content = Parser(html, {transform: this.props.replace});
        }
    }


    render() {
        return (
            <div className={this.props.className}>{this.content}</div>
        );
    }

}