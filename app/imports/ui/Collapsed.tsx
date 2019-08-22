
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as React from 'react';

interface ICollapsedProps extends RouteComponentProps {
    id: string,
    onClick: React.MouseEventHandler<HTMLElement>
    className: string,
    edge: string
}
class Collapsed extends React.Component<ICollapsedProps> {
    ref: React.RefObject<HTMLElement>
    constructor(props) {
        super(props)
        this.ref = React.createRef()
    }

    click: React.MouseEventHandler<HTMLElement> = ev => {
        function isHover(e) {
            return (e.parentElement.querySelector(':hover') === e);
        }
        if (isHover(this.ref.current)) {
            this.props.onClick(ev)
        }
    }
    render() {
        return (
            <aside
                className={"collapsed " + this.props.className}
                id={this.props.id}
                onClick={this.click}
                ref={this.ref}
            >
                <div className={this.props.className + ' ' + this.props.edge}>
                    {this.props.children}&nbsp;
            </div>
            </aside>
        )
    }
}
export default withRouter(Collapsed);