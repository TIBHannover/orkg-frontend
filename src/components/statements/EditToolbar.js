import React, {Component} from 'react';
import LinkButton from '../LinkButton';

export default class EditToolbar extends Component {

    render() {
        let content = null;
        switch (this.props.editorState) {
            case 'view': {
                content = <LinkButton value="edit" onClick={this.props.onEditClick} className="toolbar-button"
                        spanClassName="fa fa-pencil"/>;
                break;
            }
            case 'edit': {
                const className = 'toolbar-container toolbar-button' + (this.props.editEnabled ? ''
                        : ' toolbarButton-disabled');
                const onPublishClickHandler = this.props.editEnabled ? this.props.onPublishClick
                        : (event) => {};
                content = <span className="toolbar toolbar-container">
                    <LinkButton value="publish" onClick={onPublishClickHandler}
                            className={className} spanClassName="fa fa-check"/>
                    {this.props.showRemoveButton ? <LinkButton value="remove"
                            className="toolbar-container toolbar-button" spanClassName="fa fa-trash"/> : null}
                    <LinkButton value="cancel" onClick={this.props.onCancelClick}
                            className="toolbar-container toolbar-button" spanClassName="fa fa-close"/>
                </span>;
                break;
            }
            case 'loading': {
                content = <span className="fa fa-spinner fa-spin"/>;
                break;
            }
            default: {
                throw new Error(`Unknown state '${this.props.editorState}'`);
            }
        }

        return <span className="toolbar toolbar-container" aria-disabled={false}>
            {content}
        </span>
    }

}