import React, {Component} from 'react';

export default class AddStatementLink extends Component {

    render() {
        return <div className="addToolbar toolbar addToolbar-container toolbar-container">
            <span className="toolbar-button toolbar-button-add">
                <a href="#" title="Add a new statement">
                    <span className="fa fa-plus"/>add statement
                </a>
            </span>
        </div>
    }

}