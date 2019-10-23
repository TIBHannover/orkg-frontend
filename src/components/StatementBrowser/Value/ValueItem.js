import React, { Component } from 'react';
import { Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faExternalLinkAlt, faTable } from '@fortawesome/free-solid-svg-icons';
import { StyledValueItem } from '../../AddPaper/Contributions/styled';
import classNames from 'classnames';
import Confirm from 'reactstrap-confirm';
import { connect } from 'react-redux';
import {
    selectResource, fetchStatementsForResource, deleteValue, toggleEditValue,
    updateValueLabel, createValue, createResource, doneSavingValue, isSavingValue, changeValue
} from '../../../actions/statementBrowser';
import PropTypes from 'prop-types';
import StatementBrowserDialog from '../StatementBrowserDialog';
import RDFDataCube from '../../RDFDataCube/RDFDataCube';
import ValuePlugins from '../../ValuePlugins/ValuePlugins';
import { deleteStatementById, updateLiteral, submitGetRequest, resourcesUrl, updateStatement } from '../../../network';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import { toast } from 'react-toastify';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { guid } from '../../../utils';


class ValueItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            modalDataset: false,
            dialogResourceId: null,
            dialogResourceLabel: null,
        }
    }

    handleChangeLiteral = (e) => {
        this.props.updateValueLabel({
            label: e.target.value,
            valueId: this.props.id,
        });
    };

    handleSyncBackendLiteral = () => {
        if (this.props.syncBackend) {
            let resource = this.props.values.byId[this.props.id];
            let existingResourceId = resource ? resource.resourceId : false;
            if (existingResourceId) {
                updateLiteral(existingResourceId, this.props.label);
                toast.success('Literal label updated successfully');
            }
        }
    };

    handleChange = async (selectedOption, a) => {
        let property = this.props.values.byId[this.props.id];
        // Check if the user changed the value
        if (this.props.label !== selectedOption.label || (property.existingPredicateId !== selectedOption.id)) {
            this.props.isSavingValue({ id: this.props.id }); // Show the saving message instead of the property label
            if (a.action === 'select-option') {
                this.changeValue(selectedOption);
            } else if (a.action === 'create-option') {
                let newResource = null;
                if (this.props.syncBackend) {
                    newResource = await createResource(selectedOption.label);
                    this.props.createValue({
                        label: newResource.label,
                        type: this.state.valueType,
                        propertyId: this.props.selectedProperty,
                        existingResourceId: newResource.id,
                        isExistingValue: true,
                    });
                } else {
                    newResource = { id: guid(), label: selectedOption.label }
                    this.props.createValue({
                        valueId: newResource.id,
                        label: newResource.label,
                        type: this.state.valueType,
                        propertyId: this.props.selectedProperty,
                        existingResourceId: null,
                        isExistingValue: true,
                    });
                }
                this.changeValue(newResource);
            }
        }
    };

    changeValue = async (newResource) => {
        if (this.props.syncBackend) {
            await updateStatement(this.props.statementId, { object_id: newResource.id })
            this.props.changeValue({ propertyId: this.props.id, newValue: newResource });
            toast.success('Value updated successfully');
        } else {
            this.props.changeValue({ propertyId: this.props.id, newValue: newResource });
        }
        this.props.doneSavingValue({ id: this.props.id });
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

    IdMatch = async (value, responseJson) => {
        if (value.startsWith('#')) {
            const valueWithoutHashtag = value.substr(1);

            if (valueWithoutHashtag.length > 0) {
                let responseJsonExact;

                try {
                    responseJsonExact = await submitGetRequest(resourcesUrl + encodeURIComponent(valueWithoutHashtag));
                } catch (err) {
                    responseJsonExact = null;
                }

                if (responseJsonExact) {
                    responseJson.unshift(responseJsonExact);
                }
            }
        }

        return responseJson;
    }

    loadOptions = async (value) => {
        try {
            let queryParams = '';

            if (value.startsWith('"') && value.endsWith('"') && value.length > 2) {
                value = value.substring(1, value.length - 1);
                queryParams = '&exact=true';
            }

            let responseJson = await submitGetRequest(resourcesUrl + '?q=' + encodeURIComponent(value) + queryParams);
            responseJson = await this.IdMatch(value, responseJson);

            if (responseJson.length > this.maxResults) {
                responseJson = responseJson.slice(0, this.maxResults);
            }

            let options = [];

            responseJson.map((item) => options.push({
                label: item.label,
                id: item.id
            }));

            return options;
        } catch (err) {
            console.error(err);

            return [];
        }
    }

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

        let customStyles = {
            control: (provided, state) => ({
                ...provided,
                background: 'inherit',
                boxShadow: state.isFocused ? 0 : 0,
                border: 0,
                paddingLeft: 0,
                paddingRight: 0,
                cursor: 'text',
                minHeight: 'initial',
                borderRadius: 'inherit',
                padding: 0,
                '&>div:first-of-type': {
                    padding: 0
                }
            }),
            container: (provided) => ({
                padding: 0,
                height: 'auto',
                background: '#fff',
                display: 'inline-block',
                width: '70%',
                '&>div:first-of-type': {
                    padding: 0
                }
            }),
            menu: (provided) => ({
                ...provided,
                zIndex: 10,
                width: '70%',
                color: '#000'
            }),
            option: (provided) => ({
                ...provided,
                cursor: 'pointer',
                whiteSpace: 'normal',
            }),
            indicatorsContainer: (provided) => ({
                ...provided,
                '&>div:last-child': {
                    padding: '0 8px'
                }
            }),
            input: (provided) => ({
                ...provided,
                margin: '0 4px',
            }),
        }

        return (
            <>
                {!this.props.inline ? (
                    <StyledValueItem>
                        <span className={labelClass} onClick={!this.props.isEditing ? onClick : undefined}>
                            {!this.props.isSaving ?
                                (!this.props.isEditing ?
                                    <ValuePlugins type={this.props.type === 'object' ? 'resource' : 'literal'}>{this.props.label}</ValuePlugins> :
                                    (this.props.type === 'object' ?
                                        <AsyncCreatableSelect
                                            loadOptions={this.loadOptions}
                                            noOptionsMessage={this.noResults}
                                            styles={customStyles}
                                            autoFocus
                                            getOptionLabel={({ label }) => label.charAt(0).toUpperCase() + label.slice(1)}
                                            getOptionValue={({ id }) => id}
                                            defaultOptions={[{
                                                label: this.props.label,
                                                id: this.props.values.byId[this.props.id].resourceId
                                            }]}
                                            defaultValue={{
                                                label: this.props.label,
                                                id: this.props.values.byId[this.props.id].resourceId
                                            }}
                                            cacheOptions
                                            onChange={(selectedOption, a) => { this.handleChange(selectedOption, a); this.props.toggleEditValue({ id: this.props.id }); }}
                                            onBlur={(e) => { this.props.toggleEditValue({ id: this.props.id }) }}
                                        /> : (
                                            <Input
                                                value={this.props.label}
                                                onChange={(e) => this.handleChangeLiteral(e)}
                                                onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                                onBlur={(e) => { this.handleSyncBackendLiteral(); this.props.toggleEditValue({ id: this.props.id }) }}
                                                onFocus={(e) => setTimeout(() => { document.execCommand('selectAll', false, null) }, 0)} // Highlights the entire label when edit
                                            />)
                                    )
                                ) :
                                'Saving ...'
                            }
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
    selectedProperty: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    classes: PropTypes.array.isRequired,
    propertyId: PropTypes.string.isRequired,
    existingStatement: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    isEditing: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    isSavingValue: PropTypes.func.isRequired,
    doneSavingValue: PropTypes.func.isRequired,
    changeValue: PropTypes.func.isRequired,
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
        selectedProperty: state.statementBrowser.selectedProperty,
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
    isSavingValue: (data) => dispatch(isSavingValue(data)),
    doneSavingValue: (data) => dispatch(doneSavingValue(data)),
    changeValue: (data) => dispatch(changeValue(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ValueItem);
