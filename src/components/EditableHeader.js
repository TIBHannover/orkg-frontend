import React, { Component } from 'react';
import { Input, Button } from 'reactstrap';
import { updateResource } from '../network';
import { toast } from 'react-toastify';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

class EditableHeader extends Component {
    constructor(props) {
        super(props);

        this.state = {
            /* Possible values: 'view', 'edit', 'loading'. */
            editorState: 'view',
            value: this.props.value
        };
    }

    handleEditClick = () => {
        this.setState({ editorState: 'edit' });
    };

    handleSubmitClick = async event => {
        this.setState({ editorState: 'loading' });

        try {
            await updateResource(this.props.id, this.state.value);
            event.value = this.state.value;
            toast.success('Resource name updated successfully');
            this.props.onChange(event);
            this.setState({ editorState: 'view' });
        } catch (error) {
            console.error(error);
            toast.error(`Error updating resource : ${error.message}`);
            this.setState({ editorState: 'view' });
        }
    };

    handleCancelClick = () => {
        this.setState({ editorState: 'view' });
    };

    handleChange = event => {
        this.setState({ value: event.target.value });
    };

    render() {
        return (
            <div className=" pb-2 mb-3">
                {this.state.editorState === 'view' && (
                    <div>
                        <h3>
                            {this.state.value}
                            <Button className="float-right" color="link" onClick={this.handleEditClick}>
                                <Icon icon={faPen} /> edit
                            </Button>
                        </h3>
                    </div>
                )}
                {this.state.editorState === 'edit' && (
                    <div className="clearfix">
                        <Input value={this.state.value} onChange={this.handleChange} />
                        <div className="float-right">
                            <Button color="link" onClick={this.handleSubmitClick}>
                                <Icon icon={faCheck} /> publish
                            </Button>
                            <Button color="link" onClick={this.handleCancelClick}>
                                <Icon icon={faTimes} /> cancel
                            </Button>
                        </div>
                    </div>
                )}
                {this.state.editorState === 'loading' && (
                    <div>
                        <span className="fa fa-spinner fa-spin" />
                    </div>
                )}
            </div>
        );
    }
}

EditableHeader.propTypes = {
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};

export default EditableHeader;
