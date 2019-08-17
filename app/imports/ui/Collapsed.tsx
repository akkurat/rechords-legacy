
import { withRouter, RouteComponentProps } from "react-router-dom";
import * as React from 'react';


interface ICollapsedProps extends RouteComponentProps {
    id: string,
    onClick: React.MouseEventHandler<HTMLElement>
    className: string
}
const Collapsed: React.FunctionComponent<ICollapsedProps> = props =>
    (
        <aside
            className={"collapsed " + props.className}
            id={props.id}
            onClick={props.onClick}
        >
        {props.children}&nbsp;
        </aside>
    )
export default withRouter(Collapsed);