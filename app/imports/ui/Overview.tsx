import * as React from 'react';
import { Song } from '../api/collections';
import { LinkSong, LinkTag } from './List';

export class Overview extends React.Component<{ songs: Song[] }, {}> {
    render() {


        return <div className="content chordsheet">
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Tags</th>
                        <th>Last Edit</th>
                    </tr>
                </thead>

                <tbody>
                    {this.props.songs.map((s: Song) =>
                        <tr key={s._id}>
                            <td><LinkSong author={s.author_} title={s.title_}>{s.title_}</LinkSong></td>
                            <td><LinkSong author={s.author_}>{s.author_}</LinkSong></td>
                            <td>{this.concatTags(s.tags)}</td>
                            <td></td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    }


    concatTags(tags: string[]) {
        return <ul className="tags">
        {tags.map(t =>
            <li className="tag"><LinkTag tag={t} >{t}</LinkTag></li>
        )
        }
        </ul>

    }
}