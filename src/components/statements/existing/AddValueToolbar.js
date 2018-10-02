import React, {Component} from 'react';

export default class AddValueToolbar extends Component {

    render() {
        return <div className="toolbar toolbar-container addToolbar">
            <span className="toolbar-button toolbar-button-add">
                <a href="#" title="Add a new value" onClick={this.props.onAddValueClick}>
                    <span className="fa fa-plus" aria-hidden="true"/>
                    add value
                </a>
            </span>
        </div>
    }

}