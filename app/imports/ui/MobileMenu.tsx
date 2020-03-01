import * as React from 'react';

import './MobileMenu.less'
import { ITransposeHandler} from './Viewer'

interface MobileMenuProps extends React.HTMLProps<HTMLElement>
{
    toggleMenu: Function
    transposeHandler: {current: ITransposeHandler}
    relTranspose: Number
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
            {this.props.relTranspose != 0 ? <span>{this.props.relTranspose}</span> : ""}
        </div>
    )
    }
}
