import * as React from 'react';
import { Song, ISongReference } from '../api/collections';
import { LinkSong, LinkTag } from './List';
import './sorter.less'
import './overview.less'

// Basically the field could also be the comparator function
// field: string | Function
interface ISortorder { field: string, reversed: boolean }
export class Overview extends React.Component<{ songs: Song[] }, { sortorder: ISortorder }> {
    handleSortorder = (sortorder: ISortorder) => (
        this.setState({ sortorder })
    )
    constructor(props) {
        super(props)
        this.state = { sortorder: undefined }
    }


    SorterUi: React.FunctionComponent<{ field: string, value: ISortorder, onChange: ((p: ISortorder) => void) }> = props => {

        const handler = ev => {
            ev.preventDefault()
            let reverse
            if (props.value && props.value.field == props.field) {
                reverse = !props.value.reversed
            } else {
                reverse = false
            }

            const sorter: ISortorder = { field: props.field, reversed: reverse }
            props.onChange(sorter)
        }

        const getArrowClass = () => {
            if (props.value && props.value.field == props.field) {
                if (props.value.reversed)
                    return 'sort--active-rev'
                else
                    return 'sort--active'
            }
            return ''
        }

        return (<>
            <a className={'sorter ' + getArrowClass()} href="#" onClick={handler}>
                {props.children}
            </a>
        </>
        )
    }

    render() {

        const songs = this.getOrderedSongs()

        const sortProps = { value: this.state.sortorder, onChange: this.handleSortorder }

        return <div className="content chordsheet">
            <table className="songTable">
                <thead>
                    <tr>
                        <th><this.SorterUi {...sortProps} field="title">Title</this.SorterUi></th>
                        <th><this.SorterUi {...sortProps} field="author">Author</this.SorterUi></th>
                        <th>Tags</th>
                        <th>Last Edit</th>
                    </tr>
                </thead>

                <tbody>
                    {songs.map((s: Song) => {
                        const artistRef = { author: s.author, author_: s.author_ }
                        return (
                        <tr key={s._id}>
                            <td><LinkSong songRef={s}>{s.title}</LinkSong></td>
                            <td><LinkSong songRef={artistRef} /></td>
                            <td>{this.concatTags(s.getTags())}</td>
                            <td></td>
                        </tr>
                        )}
                    )}
                </tbody>
            </table>
        </div>
    }

    private sort = (fieldname: string) => {
        return ev => {
            this.setState({ sortorder: { field: fieldname, reversed: false } })
        }
    }

    private concatTags(tags: Map<string, string>) {
        let out: React.ReactNode[] = []
        for (let t of tags.entries()) {
            out.push(<li className="tag"><LinkTag tag={t[0]} >{t[0]}{t[1]}</LinkTag></li>)
        }
        return (
        <ul className="tags">
            {out}
        </ul>
        )
    }

    private getOrderedSongs(): Song[] {
        const sortorder = this.state.sortorder
        if (sortorder) {

            const fn = (s1: Song, s2: Song) => {
                const st1: string = s1[sortorder.field]
                const st2: string = s2[sortorder.field]
                if(sortorder.reversed)
                    return st2.localeCompare(st1)
                else
                    return st1.localeCompare(st2)
            }
            return this.props.songs.sort(fn)
        }
        return this.props.songs
    }


}

