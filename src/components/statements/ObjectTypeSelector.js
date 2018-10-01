import React, {Component} from 'react';
import {guid} from '../../helpers.js';

// TODO: maybe dropdown popup show/hide and item selection can be done automatically by Bootstrap.
export default class ObjectTypeSelector extends Component {

    handleDropdownClick = (event) => {
        event.target.nextSibling.style.display = (event.target.nextSibling.style.display === '') ? 'block' : '';
    }

    handleMenuItemClick = (event) => {
        const menuItems = event.target.parentNode.childNodes;
        menuItems.forEach((menuItem) => menuItem.classList.remove('active'));
        event.target.classList.add('active');
    }

    render() {
        const dropdownId = guid();
        const id = guid();
        return <div id={dropdownId} className="snakView-typeSelector dropdown">
            <button type="button" id={id} className="snakTypeSelector btn btn-primary dropdown-toggle"
                    data-toggle="dropdown" aria-disabled="false" aria-haspopup="true" aria-expanded="false"
                    onClick={this.handleDropdownClick}>
                <span className="fa fa-bars" title="type"></span>
            </button>
            <div className="dropdown-menu" aria-labelledby={id}>
                <button className="dropdown-item active" type="button" onClick={this.handleMenuItemClick}>literal</button>
                <button className="dropdown-item" type="button" onClick={this.handleMenuItemClick}>object</button>
            </div>
        </div>
    }

}