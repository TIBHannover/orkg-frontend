import {Component} from 'react';
import React from 'react';
import {getPredicatesByLabel} from '../../../helpers';


export default class EditableDropdown extends Component {
    state = {
        value: '',
        dropdownMenuJsx: null,
    };

    // TODO: add timer, so that the request is not sent on every keystroke.
    handleChange = (event) => {
        const value = event.target.value;
        this.setState({value: value});

        if (value && value.length >= 0) {
            getPredicatesByLabel(value, (responseJson) => {
                    if (responseJson.length > 0) {
                        const menuItemsJsx = responseJson.map(
                            (predicate) => <a id={predicate.id} className="dropdown-item" href="#"
                                    onClick={this.handleItemClick}>{predicate.label}</a>);
                        this.setState({
                            dropdownMenuJsx: <div className="dropdown-menu">{menuItemsJsx}</div>,
                        });
                    } else {
                        this.setState({dropdownMenuJsx: null});
                    }
                },
                (err) => {
                    console.error(err);
                });
        } else {
            this.setState({dropdownMenuJsx: null});
        }
    };

    handleItemClick = (event) => {
        this.setState({value: event.target.innerText});
    };

    render() {
        const inputStyle = {height: "21.8px", overflow: "hidden", resize: "none"};
        return <div className="dropdown">
            <input placeholder="property" className="dropdown-toggle" style={inputStyle} value={this.state.value}
                   onChange={this.handleChange}/>
            {this.state.dropdownMenuJsx}
        </div>;
    }
}