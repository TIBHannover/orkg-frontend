import React, {Component} from 'react';

export default class AddStatementLink extends Component {

    render() {
        return <div className="addToolbar toolbar addToolbar-container toolbar-container">
            <span className="toolbar-button toolbar-button-add">
                <a href="javascript:void(0)" title="Add a new statement" onClick={this.props.onClick}>
                    <span className="fa fa-plus"/>add statement
                </a>
            </span>
        </div>
    }

}