import React, {Component, Fragment} from 'react';
import {submitGetRequest} from '../../../network';

export default class EditableDropdown extends Component {
    state = {
        selectedItemId: null,
        dropdownMenuJsx: null,
    };

    constructor(props) {
        super(props);

        this.state.value = this.props.value || '';
    }

    // TODO: add timer, so that the request is not sent on every keystroke.
    handleChange = async (event) => {
        const maxValues = 10;
        const value = event.target.value;

        if (this.state.selectedItemId) {
            this.props.onItemSelected(null);
        }
        this.setState({
            value: value,
            selectedItemId: null,
        });

        this.props.onInput && this.props.onInput(event);

        if (value && value.length >= 0) {
            try {
                const responseJson = await submitGetRequest(this.props.requestUrl + '?q=' + encodeURIComponent(value));

                const menuItemsJsx = responseJson.map(
                    (item) => <button id={item.id} key={item.id} className="dropdown-item"
                        onClick={this.handleItemClick}>{item.label}</button>).slice(0, maxValues);

                    const firstItem = this.props.onNewItemSelected && <Fragment>
                        <button id="-" key="-" className="dropdown-item"
                                onClick={this.getNewItemClickHandler(value.trim())}>
                            <strong>New: {value.trim()}</strong>
                        </button>
                        {menuItemsJsx.length > 0 && <hr/>}
                    </Fragment>;

                const completeMenuItemsJsx = firstItem ? [firstItem, ...menuItemsJsx] : menuItemsJsx;
                if (completeMenuItemsJsx.length > 0) {
                    this.setState({
                        dropdownMenuJsx: <div className="dropdown-menu">{completeMenuItemsJsx}</div>,
                    });
                } else {
                    this.hideDropdownMenu();
                }
            } catch(err) {
                console.error(err);
            }
        } else {
            this.hideDropdownMenu();
        }
    };

    getNewItemClickHandler = (value) => {
        return () => {
            this.hideDropdownMenu();
            this.props.onNewItemSelected && this.props.onNewItemSelected(value);
            return false;
        }
    };

    handleItemClick = (event) => {
        this.setState({
            value: event.target.innerText,
            selectedItemId: event.target.id,
        });
        this.hideDropdownMenu();
        this.props.onItemSelected(event.target.id);
        return false;
    };

    hideDropdownMenu = () => {
        this.setState({dropdownMenuJsx: null});
    };

    render() {
        const inputStyle = {height: "21.8px", overflow: "hidden", resize: "none"};
        return <div className="dropdown valueView">
            <input autoFocus={true} placeholder={this.props.placeholder} className="dropdown-toggle valueView-input"
                    style={inputStyle}
                    value={this.state.value} onChange={this.handleChange} onKeyUp={this.props.onKeyUp}/>
            {this.state.dropdownMenuJsx}
        </div>;
    }
}
