import React, {Component} from 'react';

export default class EditToolbar extends Component {

    render() {
        let content = null;
        switch (this.props.editorState) {
            case 'view': {
                    content = <span className="toolbar-button">
                    <a href="javascript:void(0)" onClick={this.props.onEditClick}>
                        <span className="fa fa-pencil" aria-hidden="true"></span>
                        edit
                    </a>
                </span>;
                break;
            }
            case 'edit': {
                content = <span className="toolbar toolbar-container">
                    <span className="toolbar-container toolbar-button">
                        <a href="javascript:void(0)" title="" onClick={this.props.onPublishClick}>
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
                </span>;
                break;
            }
            case 'loading': {
                content = <span className="fa fa-spinner"></span>;
                break;
            }
        }

        return <span className="toolbar toolbar-container" aria-disabled={false}>
            {content}
        </span>
    }

}