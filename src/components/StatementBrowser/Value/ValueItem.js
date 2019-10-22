import React, { Component } from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faExternalLinkAlt, faTable } from '@fortawesome/free-solid-svg-icons';
import { StyledValueItem } from '../../AddPaper/Contributions/styled';
import classNames from 'classnames';
import Confirm from 'reactstrap-confirm';
import { connect } from 'react-redux';
import { selectResource, fetchStatementsForResource, deleteValue, toggleEditValue, updateValueLabel, createValue, createResource } from '../../../actions/statementBrowser';
import PropTypes from 'prop-types';
import StatementBrowserDialog from '../StatementBrowserDialog';
import RDFDataCube from '../../RDFDataCube/RDFDataCube';
import ValuePlugins from '../../ValuePlugins/ValuePlugins';
import { updateResource, deleteStatementById, updateLiteral } from '../../../network';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import { toast } from 'react-toastify';
import ContentEditable from 'react-contenteditable';
import styled from 'styled-components';

export const StyledContentEditable = styled(ContentEditable)`
    &[contenteditable="true"] {
        background: #F8F9FB;
        color: ${props => props.theme.orkgPrimaryColor};
        outline: 0;
        padding: 0 4px;
        display:block;
        border: dotted 2px ${props => props.theme.listGroupBorderColor};
    }
`;

class ValueItem extends Component {
    constructor(props) {
        super(props);

        this.contentEditable = React.createRef();

        this.state = {
            modal: false,
            modalDataset: false,
            dialogResourceId: null,
            dialogResourceLabel: null,
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isEditing && this.props.isEditing) {
            this.contentEditable.current.focus()
        }
    }

    handleChange = (valueId, e) => {
        this.props.updateValueLabel({
            label: e.target.value,
            valueId: valueId,
        });
    };

    handleSyncBackend = () => {
        if (this.props.syncBackend) {
            let resource = this.props.values.byId[this.props.id];
            let existingResourceId = resource ? resource.resourceId : false;
            if (existingResourceId) {
                if (resource.type === 'literal') {
                    updateLiteral(existingResourceId, this.props.label);
                    toast.success('Literal label updated successfully');
                } else {
                    updateResource(existingResourceId, this.props.label);
                    toast.success('Resource label updated successfully');
                }

            }
        }
    };

    toggleDeleteContribution = async () => {
        let result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this value?',
            cancelColor: 'light',
        });

        if (result) {
            if (this.props.syncBackend) {
                deleteStatementById(this.props.statementId);
                toast.success('Statement deleted successfully');
            }
            this.props.deleteValue({
                id: this.props.id,
                propertyId: this.props.propertyId,
            });
        }
    };

    handleResourceClick = (e) => {
        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource.existingResourceId;

        if (existingResourceId && !resource.isFechted) {
            this.props.fetchStatementsForResource({
                resourceId: this.props.resourceId,
                existingResourceId,
            });
        }

        this.props.selectResource({
            increaseLevel: true,
            resourceId: this.props.resourceId,
            label: this.props.label,
        });
    };

    handleDatasetResourceClick = (ressource) => {

        this.props.createResource({
            label: ressource.rlabel ? ressource.rlabel : ressource.label,
            existingResourceId: ressource.id,
            resourceId: ressource.id,
        });

        this.props.selectResource({
            increaseLevel: true,
            resourceId: ressource.id,
            label: ressource.rlabel ? ressource.rlabel : ressource.label,
        });

        this.props.fetchStatementsForResource({
            resourceId: ressource.id,
            existingResourceId: ressource.id,
        });


    };

    handleExistingResourceClick = () => {
        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource.existingResourceId;
        this.setState({
            modal: true,
            dialogResourceId: existingResourceId,
            dialogResourceLabel: resource.label,
        });
    };

    handleDatasetClick = () => {
        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource.existingResourceId;
        this.setState({
            modalDataset: true,
            dialogResourceId: existingResourceId,
            dialogResourceLabel: resource.label,
        });
    };

    toggleModal = () => {
        this.setState((prevState) => ({
            modal: !prevState.modal,
        }));
    };

    toggleModalDataset = () => {
        this.setState((prevState) => ({
            modalDataset: !prevState.modalDataset,
        }));
    };

    render() {
        const labelClass = classNames({
            objectLink: this.props.type === 'object',
        });

        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource ? resource.existingResourceId : false;
        let onClick = null;

        if (this.props.type === 'object' && existingResourceId && this.props.openExistingResourcesInDialog) {
            onClick = this.handleExistingResourceClick;
        } else if (this.props.type === 'object') {
            onClick = this.handleResourceClick;
        }

        return (
            <>
                {!this.props.inline ? (
                    <StyledValueItem>
                        <span className={labelClass} onClick={!this.props.isEditing ? onClick : undefined}>
                            {!this.props.isEditing ?
                                <ValuePlugins type={this.props.type === 'object' ? 'resource' : 'literal'}>{this.props.label}</ValuePlugins> :
                                <StyledContentEditable
                                    innerRef={this.contentEditable}
                                    html={this.props.label}
                                    disabled={!this.props.isEditing}
                                    tagName={'span'}
                                    onChange={(e) => this.handleChange(this.props.id, e)}
                                    onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                    onBlur={(e) => { this.handleSyncBackend(); this.props.toggleEditValue({ id: this.props.id }) }}
                                    onFocus={(e) => setTimeout(() => { document.execCommand('selectAll', false, null) }, 0)} // Highlights the entire label when edit
                                />}
                            {existingResourceId && this.props.openExistingResourcesInDialog ? (
                                <span>
                                    {' '}
                                    <Icon icon={faExternalLinkAlt} />
                                </span>
                            ) : (
                                    ''
                                )}
                        </span>
                        {this.props.classes && this.props.classes.includes(process.env.REACT_APP_QB_DATASET_CLASS) && (
                            <Tippy content="Visualize data in tabular form">
                                <span style={{ cursor: 'pointer' }} onClick={this.handleDatasetClick}>
                                    {' '}
                                    <Icon icon={faTable} />
                                </span>

                            </Tippy>
                        )}
                        {(!this.props.isEditing && this.props.enableEdit) ? (
                            <>
                                <span className={'deleteValue float-right'} onClick={this.toggleDeleteContribution}>
                                    <Tippy content="Delete value">
                                        <span>
                                            <Icon icon={faTrash} /> Delete
                                        </span>
                                    </Tippy>
                                </span>
                                <span className={'mr-2 deleteValue float-right'} onClick={() => { this.props.toggleEditValue({ id: this.props.id }); }}>
                                    <Tippy content="Edit label">
                                        <span>
                                            <Icon icon={faPen} /> Edit
                                        </span>
                                    </Tippy>
                                </span>
                            </>
                        ) : (
                                ''
                            )}
                    </StyledValueItem>
                ) : this.props.label
                }

                {
                    this.state.modal ? (
                        <StatementBrowserDialog show={this.state.modal} toggleModal={this.toggleModal} resourceId={this.state.dialogResourceId} resourceLabel={this.state.dialogResourceLabel} />
                    ) : (
                            ''
                        )
                }

                {
                    this.state.modalDataset && (
                        <RDFDataCube
                            show={this.state.modalDataset}
                            handleResourceClick={this.handleDatasetResourceClick}
                            toggleModal={this.toggleModalDataset}
                            resourceId={this.state.dialogResourceId}
                            resourceLabel={this.state.dialogResourceLabel}
                        />
                    )
                }
            </>
        );
    }
}

ValueItem.propTypes = {
    deleteValue: PropTypes.func.isRequired,
    toggleEditValue: PropTypes.func.isRequired,
    updateValueLabel: PropTypes.func.isRequired,
    selectResource: PropTypes.func.isRequired,
    createValue: PropTypes.func.isRequired,
    createResource: PropTypes.func.isRequired,
    fetchStatementsForResource: PropTypes.func.isRequired,
    resources: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    classes: PropTypes.array.isRequired,
    propertyId: PropTypes.string.isRequired,
    existingStatement: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isExistingValue: PropTypes.bool.isRequired,
    resourceId: PropTypes.string,
    statementId: PropTypes.string,
    inline: PropTypes.bool,
    openExistingResourcesInDialog: PropTypes.bool,
};

ValueItem.defaultProps = {
    inline: false,
    resourceId: null,
};

const mapStateToProps = (state) => {
    return {
        resources: state.statementBrowser.resources,
        values: state.statementBrowser.values,
    };
};

const mapDispatchToProps = (dispatch) => ({
    createValue: (data) => dispatch(createValue(data)),
    createResource: (data) => dispatch(createResource(data)),
    selectResource: (data) => dispatch(selectResource(data)),
    fetchStatementsForResource: (data) => dispatch(fetchStatementsForResource(data)),
    deleteValue: (data) => dispatch(deleteValue(data)),
    toggleEditValue: (data) => dispatch(toggleEditValue(data)),
    updateValueLabel: (data) => dispatch(updateValueLabel(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ValueItem);
