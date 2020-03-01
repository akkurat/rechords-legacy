import * as React from 'react';

import './MobileMenu.less'
import { ITransposeHandler, ITransposeState} from './Viewer'

interface MobileMenuProps extends React.HTMLProps<HTMLElement>
{
    toggleMenu: Function
    transposeHandler: {current: ITransposeHandler}
    transposeInfo: {relTranspose: Number, scale: string}
}


export class MobileMenu extends React.Component<MobileMenuProps>  {

    constructor(props) {
        super(props);
    }

    increaseTranspose = () => {
          this.props.transposeHandler.current?.increaseTranspose();
    };
  
    decreaseTranspose = () => {
          this.props.transposeHandler.current?.increaseTranspose();
    };

    render() {
    return (
        <div className="show-s" id="mobilemenu">
            <span onClick={ev => this.props.toggleMenu()} id="menu">Menu</span>
            <span onClick={ev => this.increaseTranspose()} id="plus">+</span>
            <span onClick={ev => this.decreaseTranspose()} id="minus">-</span>
            {this.props.transposeInfo ? <span>{this.props.transposeInfo.relTranspose}</span> : ""}
        </div>
    )
    }
}
