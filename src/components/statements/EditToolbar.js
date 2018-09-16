import React, {Component} from 'react';

export default class EditToolbar extends Component {

    render() {
        let content = null;
        if (!this.props.editing) {
            content = <span className="toolbar-button">
                <a href="javascript:void(0)" onClick={this.props.onEditClick}>
                    <span className="fa fa-pencil" aria-hidden="true"></span>
                    edit
                </a>
            </span>
        } else {
            content = <span className="toolbar toolbar-container">
                <span className="toolbar-container toolbar-button">
                    <a href="javascript:void(0)" title="">
                        <span className="fa fa-check"></span>
                        publish
                    </a>
                </span>
                <span className="toolbar-container toolbar-button">
                    <a href="javascript:void(0)" title="">
                        <span className="fa fa-trash"></span>
                        remove
                    </a>
                </span>
                <span className="toolbar-container toolbar-button">
                    <a href="javascript:void(0)" title="" onClick={this.props.onCancelClick}>
                        <span className="fa fa-close"></span>
                        cancel
                    </a>
                </span>
            </span>
        }

        return <span className="toolbar toolbar-container" aria-disabled={false}>
            {content}
        </span>
    }

}