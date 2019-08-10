import * as React from 'react';
import { Song } from '../api/collections';

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
                            <td>{s.title}</td>
                            <td>{s.author}</td>
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
            <li className="tag">{t}</li>
        )
        }
        </ul>

    }
}