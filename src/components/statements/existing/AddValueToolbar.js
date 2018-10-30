import React, {Component} from 'react';
import {Button} from 'reactstrap';

export default class AddValueToolbar extends Component {

    render() {
        return <div className="toolbar toolbar-container addToolbar">
            <span className="toolbar-button toolbar-button-add">
                <Button onClick={this.props.onAddValueClick}>
                    <span className="fa fa-plus" aria-hidden="true"/>
                    add value
                </Button>
            </span>
        </div>
    }

}
