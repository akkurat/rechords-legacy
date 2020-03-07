import * as React from 'react'
import { increaseHeaderSpan, expandColumns } from '../api/expandColumns';

import './Test.less'

export class Test extends React.Component<any> {
    render() {
        return <div>Gagi</div>
    }
} 



export class ColumnExpander extends React.Component<{ header: React.ReactNode, scope?: string },{}>
{
    public static defaultProps = {
      scope: "Expander"
    }
    constructor(props) {
        super(props);
    }
    colRef: React.RefObject<HTMLDivElement> = React.createRef()
    headerRef: React.RefObject<HTMLDivElement> = React.createRef()

    private effect() {

        if (this.colRef.current) {
            const span = increaseHeaderSpan(this.headerRef.current)
            expandColumns(this.colRef.current, 10, idx => idx > span ? 'fullColumn' : 'halfColumn')
        }
    }

    componentDidMount = this.effect
    componentDidUpdate = this.effect

    // TODO: read column width from 

    render() {
        const style = {
            "--columnWidth": "400px",
        }
        const className = `${this.props.scope}grid-header`
        return (
            <div style={style}>
                <div className={className} ref={this.headerRef}  >
                    {this.props.header}
                </div>
                <div ref={this.colRef}>
                    {this.props.children}
                </div>
            </div>
        );
    }
}