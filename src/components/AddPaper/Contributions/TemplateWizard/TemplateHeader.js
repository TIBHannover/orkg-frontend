import React, { Component } from 'react';
import { Input } from 'reactstrap';
import { faTrash, faPen, faQuestion } from '@fortawesome/free-solid-svg-icons';
import TemplateOptionButton from 'components/AddPaper/Contributions/TemplateWizard/TemplateOptionButton';
import { TemplateHeaderStyle } from 'components/AddPaper/Contributions/styled';
import Confirm from 'reactstrap-confirm';
import { deleteStatementById, updateResource } from 'network';
import { connect } from 'react-redux';
import { deleteValue, toggleEditValue, updateValueLabel, isSavingValue, doneSavingValue, deleteProperty } from 'actions/statementBrowser';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

class TemplateHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            draftLabel: this.props.label
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.label !== prevProps.label) {
            this.setState({ draftLabel: this.props.label });
        }
    }

    commitChangeLabel = async () => {
        // Check if the user changed the label
        if (this.state.draftLabel !== this.props.label) {
            this.props.updateValueLabel({
                label: this.state.draftLabel,
                valueId: this.props.id
            });
            if (this.props.syncBackend) {
                this.props.isSavingValue({ id: this.props.id }); // To show the saving message instead of the value label
                if (this.props.resourceId) {
                    await updateResource(this.props.resourceId, this.props.label);
                    toast.success('Resource label updated successfully');
                }
                this.props.doneSavingValue({ id: this.props.id });
            }
        }
    };

    handleChangeLabel = event => {
        this.setState({ draftLabel: event.target.value });
    };

    toggleDeleteTemplate = async () => {
        const result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this template with its statements?',
            cancelColor: 'light'
        });

        if (result) {
            if (this.props.syncBackend) {
                await deleteStatementById(this.props.statementId);
                toast.success('Statement deleted successfully');
            }
            this.props.deleteValue({
                id: this.props.id,
                propertyId: this.props.propertyId
            });
            this.props.deleteProperty({
                id: this.props.propertyId,
                resourceId: this.props.resourceId
            });
        }
    };

    render() {
        return (
            <div>
                <TemplateHeaderStyle className={'d-flex'}>
                    <div className="flex-grow-1 mr-4">
                        {!this.props.isEditing ? (
                            <>
                                {this.props.label}{' '}
                                <div className={'headerOptions'}>
                                    <TemplateOptionButton
                                        title={'Edit label'}
                                        icon={faPen}
                                        action={() => this.props.toggleEditValue({ id: this.props.id })}
                                    />
                                    <TemplateOptionButton
                                        title={'Delete the template with its statements'}
                                        icon={faTrash}
                                        action={this.toggleDeleteTemplate}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <Input
                                    value={this.state.draftLabel}
                                    onChange={this.handleChangeLabel}
                                    onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()} // stop editing on enter and escape
                                    onBlur={e => {
                                        this.commitChangeLabel();
                                        this.props.toggleEditValue({ id: this.props.id });
                                    }}
                                    autoFocus
                                />
                            </>
                        )}
                    </div>
                    <div className={'type'}>
                        Template{' '}
                        <TemplateOptionButton
                            title={
                                'A template is a defined structure of a contribution, this stucture is mostly shared between papers in the same research field.'
                            }
                            icon={faQuestion}
                            iconWrapperSize={'20px'}
                            iconSize={'10px'}
                            action={() => null}
                        />
                    </div>
                </TemplateHeaderStyle>
            </div>
        );
    }
}

TemplateHeader.propTypes = {
    deleteValue: PropTypes.func.isRequired,
    deleteProperty: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    resourceId: PropTypes.string.isRequired,
    propertyId: PropTypes.string.isRequired,
    statementId: PropTypes.string,
    syncBackend: PropTypes.bool.isRequired,
    toggleEditValue: PropTypes.func.isRequired,
    isSaving: PropTypes.bool,
    isEditing: PropTypes.bool,
    isSavingValue: PropTypes.func.isRequired,
    doneSavingValue: PropTypes.func.isRequired,
    updateValueLabel: PropTypes.func.isRequired
};

const mapDispatchToProps = dispatch => ({
    toggleEditValue: data => dispatch(toggleEditValue(data)),
    deleteValue: data => dispatch(deleteValue(data)),
    deleteProperty: data => dispatch(deleteProperty(data)),
    updateValueLabel: data => dispatch(updateValueLabel(data)),
    isSavingValue: data => dispatch(isSavingValue(data)),
    doneSavingValue: data => dispatch(doneSavingValue(data))
});

export default connect(
    null,
    mapDispatchToProps
)(TemplateHeader);
