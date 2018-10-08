import {Component} from 'react';
import React from 'react';


export default class EditableDropdown extends Component {
    state = {
        value: '',
    };

    handleChange = (event) => {
        this.setState({value: event.target.value});
    };

    handleItemClick = (event) => {
        this.setState({value: event.target.innerText});
    };

    render() {
        const inputStyle = {height: "21.8px", overflow: "hidden", resize: "none"};
        return <div className="dropdown">
            <input placeholder="property" className="dropdown-toggle" style={inputStyle} value={this.state.value}
                   onChange={this.handleChange}/>
            <div className="dropdown-menu">
                <a className="dropdown-item" href="#" onClick={this.handleItemClick}>Link 1</a>
                <a className="dropdown-item" href="#" onClick={this.handleItemClick}>Link 2</a>
                <a className="dropdown-item" href="#" onClick={this.handleItemClick}>Link 3</a>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="#" onClick={this.handleItemClick}>Another link</a>
            </div>
        </div>;
    }
}