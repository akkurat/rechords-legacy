import { withRouter } from "react-router-dom";
import  { Component } from "react";
import * as React from 'react';



interface CollapsedProps {
    className: any;
    onClick: any;
    id?: any;

}
const Collapsed: React.SFC<CollapsedProps> = (props) => 
{
    return(
        <aside
            className={"collapsed " + props.className}
            id={props.id}
            onClick={props.onClick}
        >{props.children}&nbsp;</aside>
    );
}
// export default Collapsed;
export default withRouter(Collapsed);