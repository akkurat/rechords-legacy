import * as React from 'react';
import { withRouter } from 'react-router-dom';

export const MobileHeader: React.FunctionComponent = props => {
    return (
        <header className="show-s" id="mobileheader">
            {props.children}
        </header>
    )
}

export const MobileMenuButton: React.FunctionComponent = withRouter(props => {

    const handleMobileMenu = (action?: string) => {
        const menu = document.getElementById('list')
        if (action === 'close' || menu.classList.contains('collapsed-open')) {
            menu.classList.remove('collapsed-open')
        } else if (action === 'open'|| !menu.classList.contains('collapsed-open')) {
            menu.classList.add('collapsed-open')
        }
    }
    const handleClick = ev => { ev.preventDefault(); handleMobileMenu() }
    props.history.listen((location, action) => handleMobileMenu('close'))

    return (
        <div className="mobileheader--menu">
            <a href="#" onClick={handleClick} className="icn-menu">
                <svg className="icon">
                    <use href="/icons/005-menu-button.svg#Capa_1" width="100%" height="100%"/>
                </svg>
            </a>
        </div>
    )
})