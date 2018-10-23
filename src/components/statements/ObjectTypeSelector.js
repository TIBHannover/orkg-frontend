import React, {Component} from 'react';
import {guid} from '../../utils';

// TODO: maybe dropdown popup show/hide and item selection can be done automatically by Bootstrap.
export default class ObjectTypeSelector extends Component {

    state = {
        dropdownVisible: false,
    };

    handleDropdownClick = (event) => {
        this.setState({dropdownVisible: !this.state.dropdownVisible});
    };

    closeOverlay = () => {
        this.setState({dropdownVisible: false});
    };

    handleMenuItemClick = (event) => {
        const menuItems = event.target.parentNode.childNodes;
        menuItems.forEach((menuItem) => menuItem.classList.remove('active'));
        event.target.classList.add('active');
        this.closeOverlay();
        this.props.onItemSelect(event.target.name);
    };

    render() {
        const id = guid();
        return <div className="snakView-typeSelector dropdown">
            <button type="button" id={id} className="snakTypeSelector btn btn-primary dropdown-toggle"
                    data-toggle="dropdown" aria-disabled="false" aria-haspopup="true" aria-expanded="false"
                    onClick={this.handleDropdownClick}>
                <span className="fa fa-bars" title="type"></span>
            </button>
            {this.state.dropdownVisible && <div className="dropdown-menu" aria-labelledby={id}>
                <button name="literal" className={'dropdown-item' + (this.props.objectType === 'literal' ? ' active' : '')}
                        type="button" onClick={this.handleMenuItemClick}>literal</button>
                <button name="resource" className={'dropdown-item' + (this.props.objectType === 'resource' ? ' active' : '')}
                        type="button" onClick={this.handleMenuItemClick}>object</button>
            </div>}
            {this.state.dropdownVisible && <div className="overlay" onClick={this.closeOverlay}></div>}
        </div>
    }

}