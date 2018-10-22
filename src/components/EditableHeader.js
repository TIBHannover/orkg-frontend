import React, {Component} from 'react';
import LinkButton from './LinkButton';
import {Input} from 'reactstrap';
import {updateResource} from '../helpers';
import {NotificationManager} from 'react-notifications';

export default class EditableHeader extends Component {

    state = {
        /* Possible values: 'view', 'edit', 'loading'. */
        editorState: 'view',
    };

    constructor(props) {
        super(props);

        this.state.value = this.props.value;
    }

    handleEditClick = () => {
        this.setState({editorState: 'edit'});
    };

    handleSubmitClick = (event) => {
        updateResource(this.props.id, this.state.value,
                (responseJson) => {
                    event.value = this.state.value;
                    NotificationManager.success('Resource name updated successfully', 'Success', 5000);
                    this.props.onChange(event);
                    this.setState({editorState: 'view'});
                },
                (error) => {
                    console.error(error);
                    NotificationManager.error(error.message, 'Error updating resource', 5000);
                    this.setState({editorState: 'view'});
                });
        this.setState({editorState: 'loading'});
    };

    handleCancelClick = () => {
        this.setState({editorState: 'view'});
    };

    handleChange = (event) => {
        this.setState({value: event.target.value});
    };

    render() {
        let content = null;
        switch (this.state.editorState) {
            case 'view': {
                content = [
                    <h1 className="h2">{this.state.value}</h1>,
                    <span className="toolbar toolbar-container toolbar-container-header">
                        <LinkButton value="edit" className="toolbar-button" spanClassName="fa fa-pencil"
                                onClick={this.handleEditClick}/>
                    </span>,
                ];
                break;
            }
            case 'edit': {
                content = <div className="snakView-header">
                    <div className="snakView-value snakView-variation-valueSnak">
                        <div className="valueView valueView-inEditMode">
                            <div className="valueView-value">
                                <Input className="valueView-input-header valueView-input" value={this.state.value}
                                        onChange={this.handleChange}/>
                            </div>
                        </div>
                    </div>
                    <span className="toolbar toolbar-container toolbar-container-header">
                        <LinkButton value="publish" className="toolbar-container toolbar-button"
                                spanClassName="fa fa-check" onClick={this.handleSubmitClick}/>
                        <LinkButton value="cancel" className="toolbar-container toolbar-button"
                                spanClassName="fa fa-close" onClick={this.handleCancelClick}/>
                    </span>
                </div>;
                break;
            }
            case 'loading': {
                content = <span className="fa fa-spinner fa-spin"/>;
                break;
            }
            default: {
                throw new Error(`Unknown state '${this.state.editorState}'`);
            }
        }

        return <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center
                        pb-2 mb-3 border-bottom">
            {content}
        </div>
    }

}