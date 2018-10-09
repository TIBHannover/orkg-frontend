import React, {Component} from 'react';
import LinkButton from '../LinkButton';

export default class EditToolbar extends Component {

    render() {
        let content = null;
        switch (this.props.editorState) {
            case 'view': {
                content = <span className="toolbar-button">
                    <LinkButton value="edit" onClick={this.props.onEditClick} spanClassName="fa fa-pencil"/>
                </span>;
                break;
            }
            case 'edit': {
                content = <span className="toolbar toolbar-container">
                    <span className="toolbar-container toolbar-button">
                        <LinkButton value="publish" onClick={this.props.onPublishClick} spanClassName="fa fa-check"/>
                    </span>
                    {this.props.showRemoveButton ? <span className="toolbar-container toolbar-button">
                        <LinkButton value="remove" spanClassName="fa fa-trash"/>
                    </span> : null}
                    <span className="toolbar-container toolbar-button">
                        <LinkButton value="cancel" onClick={this.props.onCancelClick} spanClassName="fa fa-close"/>
                    </span>
                </span>;
                break;
            }
            case 'loading': {
                content = <span className="fa fa-spinner fa-spin"/>;
                break;
            }
            default: {
                throw `Unknown state '{this.props.editorState}'`;
            }
        }

        return <span className="toolbar toolbar-container" aria-disabled={false}>
            {content}
        </span>
    }

}