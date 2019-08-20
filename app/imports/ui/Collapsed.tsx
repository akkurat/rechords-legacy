
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as React from 'react';


interface ICollapsedProps extends RouteComponentProps {
    id: string,
    onClick: React.MouseEventHandler<HTMLElement>
    className: string,
    edge: string
}
const Collapsed: React.FunctionComponent<ICollapsedProps> = props =>
    (
        <aside
            className={"collapsed " + props.className}
            id={props.id}
            onClick={props.onClick}
        >
            <div className={props.className + ' ' + props.edge}>
                {props.children}&nbsp;
            </div>
        </aside>
    )
export default withRouter(Collapsed);