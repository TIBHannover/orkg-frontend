import React, {Component} from 'react';
import {Link} from "react-router-dom";

export default class AddStatementLink extends Component {

    render() {
        return <div className="addToolbar toolbar addToolbar-container toolbar-container">
            <span className="toolbar-button toolbar-button-add">
                <Link to="#" onClick={this.props.onClick}>
                    <span className="fa fa-plus"/>add statement
                </Link>
            </span>
        </div>
    }

}