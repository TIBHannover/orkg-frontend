import React, {Component} from 'react';
import {Button} from 'reactstrap';

export default class AddStatementLink extends Component {

    render() {
        return <div className="addToolbar toolbar addToolbar-container toolbar-container">
            <span className="toolbar-button toolbar-button-add">
                <Button onClick={this.props.onClick}>
                    <span className="fa fa-plus"/>add statement
                </Button>
            </span>
        </div>
    }

}
