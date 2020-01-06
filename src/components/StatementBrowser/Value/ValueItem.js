import React, { Component } from 'react';
import { Input, InputGroup, InputGroupAddon, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash, faPen, faExternalLinkAlt, faTable } from '@fortawesome/free-solid-svg-icons';
import TemplateOptionButton from 'components/AddPaper/Contributions/TemplateWizard/TemplateOptionButton';
import { StyledValueItem, StyledButton, ValueItemStyle } from '../../AddPaper/Contributions/styled';
import classNames from 'classnames';
import Confirm from 'reactstrap-confirm';
import { connect } from 'react-redux';
import {
    selectResource,
    fetchStatementsForResource,
    deleteValue,
    toggleEditValue,
    updateValueLabel,
    createValue,
    createResource,
    doneSavingValue,
    isSavingValue,
    changeValue
} from '../../../actions/statementBrowser';
import PropTypes from 'prop-types';
import StatementBrowserDialog from '../StatementBrowserDialog';
import RDFDataCube from '../../RDFDataCube/RDFDataCube';
import ValuePlugins from '../../ValuePlugins/ValuePlugins';
import {
    deleteStatementById,
    updateLiteral,
    submitGetRequest,
    resourcesUrl,
    updateStatement,
    createResource as createResourceAPICall,
    updateResource
} from '../../../network';
import Tippy from '@tippy.js/react';
import 'tippy.js/dist/tippy.css';
import { toast } from 'react-toastify';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { StyledAutoCompleteInputFormControl } from '../AutoComplete';
import styled from 'styled-components';
import { guid } from '../../../utils';

const StyledInput = styled(Input)`
    &:focus {
        outline: 0 none;
        box-shadow: none !important;
    }
`;

class ValueItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            modalDataset: false,
            dialogResourceId: null,
            dialogResourceLabel: null,
            draftLabel: this.props.label
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.label !== prevProps.label) {
            this.setState({ draftLabel: this.props.label });
        }
    }

    commitChangeLiteral = async () => {
        // Check if the user changed the label
        if (this.state.draftLabel !== this.props.label) {
            this.props.updateValueLabel({
                label: this.state.draftLabel,
                valueId: this.props.id
            });
            if (this.props.syncBackend) {
                this.props.isSavingValue({ id: this.props.id }); // To show the saving message instead of the value label
                if (this.props.resourceId) {
                    await updateLiteral(this.props.resourceId, this.state.draftLabel);
                    toast.success('Literal label updated successfully');
                }
                this.props.doneSavingValue({ id: this.props.id });
            }
        }
    };

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
                    await updateResource(this.props.resourceId, this.state.draftLabel);
                    toast.success('Resource label updated successfully');
                }
                this.props.doneSavingValue({ id: this.props.id });
            }
        }
    };

    handleChangeLabel = event => {
        this.setState({ draftLabel: event.target.value });
    };

    handleChangeResource = async (selectedOption, a) => {
        // Check if the user changed the value
        if (this.props.label !== selectedOption.label || this.props.resourceId !== selectedOption.id) {
            this.props.isSavingValue({ id: this.props.id }); // To show the saving message instead of the value label
            if (a.action === 'select-option') {
                this.changeValueinStatementBrowser({ ...selectedOption, isExistingValue: true });
            } else if (a.action === 'create-option') {
                let newResource = null;
                if (this.props.syncBackend) {
                    newResource = await createResourceAPICall(selectedOption.label);
                    newResource['isExistingValue'] = true;
                } else {
                    newResource = { id: guid(), isExistingValue: false, label: selectedOption.label, type: 'object', classes: [], shared: 1 };
                }
                await this.changeValueinStatementBrowser(newResource);
            }
            this.props.doneSavingValue({ id: this.props.id });
        }
    };

    changeValueinStatementBrowser = async newResource => {
        if (this.props.syncBackend && this.props.statementId) {
            await updateStatement(this.props.statementId, { object_id: newResource.id });
            this.props.changeValue({
                valueId: this.props.id,
                ...{
                    classes: newResource.classes,
                    label: newResource.label,
                    resourceId: newResource.id,
                    existingResourceId: newResource.id,
                    isExistingValue: newResource.isExistingValue,
                    existingStatement: true,
                    statementId: this.props.statementId,
                    shared: newResource.shared
                }
            });
            toast.success('Value updated successfully');
        } else {
            this.props.changeValue({
                valueId: this.props.id,
                ...{
                    classes: newResource.classes,
                    label: newResource.label,
                    resourceId: newResource.id,
                    existingResourceId: newResource.isExistingValue ? newResource.id : null,
                    isExistingValue: newResource.isExistingValue,
                    existingStatement: false,
                    statementId: null,
                    shared: newResource.shared
                }
            });
        }
    };

    toggleDeleteValue = async () => {
        let result = await Confirm({
            title: 'Are you sure?',
            message: 'Are you sure you want to delete this value?',
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
        }
    };

    handleResourceClick = e => {
        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource.existingResourceId;

        if (existingResourceId && !resource.isFechted) {
            this.props.fetchStatementsForResource({
                resourceId: this.props.resourceId,
                existingResourceId
            });
        }

        this.props.selectResource({
            increaseLevel: true,
            resourceId: this.props.resourceId,
            label: this.props.label
        });
    };

    handleDatasetResourceClick = ressource => {
        this.props.createResource({
            label: ressource.rlabel ? ressource.rlabel : ressource.label,
            existingResourceId: ressource.id,
            resourceId: ressource.id
        });

        this.props.selectResource({
            increaseLevel: true,
            resourceId: ressource.id,
            label: ressource.rlabel ? ressource.rlabel : ressource.label
        });

        this.props.fetchStatementsForResource({
            resourceId: ressource.id,
            existingResourceId: ressource.id
        });
    };

    handleExistingResourceClick = () => {
        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource.existingResourceId ? resource.existingResourceId : this.props.resourceId;
        console.log(existingResourceId);
        this.setState({
            modal: true,
            dialogResourceId: existingResourceId,
            dialogResourceLabel: resource.label
        });
    };

    handleDatasetClick = () => {
        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource.existingResourceId;
        this.setState({
            modalDataset: true,
            dialogResourceId: existingResourceId,
            dialogResourceLabel: resource.label
        });
    };

    toggleModal = () => {
        this.setState(prevState => ({
            modal: !prevState.modal
        }));
    };

    toggleModalDataset = () => {
        this.setState(prevState => ({
            modalDataset: !prevState.modalDataset
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
    };

    loadOptions = async value => {
        try {
            let queryParams = '';

            if (value.startsWith('"') && value.endsWith('"') && value.length > 2) {
                value = value.substring(1, value.length - 1);
                queryParams = '&exact=true';
            }

            let responseJson = await submitGetRequest(
                resourcesUrl +
                    '?q=' +
                    encodeURIComponent(value) +
                    queryParams +
                    `&exclude=${encodeURIComponent(process.env.REACT_APP_CLASSES_CONTRIBUTION + ',' + process.env.REACT_APP_CLASSES_PROBLEM)}`
            );
            responseJson = await this.IdMatch(value, responseJson);

            if (responseJson.length > this.maxResults) {
                responseJson = responseJson.slice(0, this.maxResults);
            }

            let options = [];

            responseJson.map(item =>
                options.push({
                    label: item.label,
                    id: item.id,
                    classes: item.classes,
                    shared: item.shared,
                    type: 'object'
                })
            );

            return options;
        } catch (err) {
            console.error(err);

            return [];
        }
    };

    render() {
        const isProperty = [process.env.REACT_APP_TEMPLATE_PROPERTY, process.env.REACT_APP_TEMPLATE_OF_PREDICATE].includes(
            this.props.properties.byId[this.props.propertyId].existingPredicateId
        );

        const labelClass = classNames({
            objectLink: this.props.type === 'object' && !this.props.isEditing && !isProperty
        });

        let resource = this.props.resources.byId[this.props.resourceId];
        let existingResourceId = resource ? resource.existingResourceId : false;
        let onClick = null;

        if (
            this.props.type === 'object' &&
            (existingResourceId || this.props.contextStyle !== 'StatementBrowser') &&
            this.props.openExistingResourcesInDialog
        ) {
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
            container: provided => ({
                padding: 0,
                height: 'auto',
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                background: '#fff',
                '&>div:first-of-type': {
                    padding: 0
                }
            }),
            menu: provided => ({
                ...provided,
                zIndex: 10,
                color: '#000'
            }),
            option: provided => ({
                ...provided,
                cursor: 'pointer',
                whiteSpace: 'normal'
            }),
            indicatorsContainer: provided => ({
                ...provided,
                '&>div:last-child': {
                    padding: '0 8px'
                }
            }),
            input: provided => ({
                ...provided,
                margin: '0 4px'
            })
        };

        return (
            <>
                {this.props.contextStyle === 'StatementBrowser' ? (
                    <>
                        {!this.props.inline ? (
                            <StyledValueItem>
                                <span className={labelClass} onClick={!this.props.isEditing && !isProperty ? onClick : undefined}>
                                    {!this.props.isSaving ? (
                                        !this.props.isEditing ? (
                                            <ValuePlugins type={this.props.type === 'object' ? 'resource' : 'literal'}>
                                                {this.props.label}
                                            </ValuePlugins>
                                        ) : this.props.type === 'object' ? (
                                            existingResourceId && this.props.shared > 1 ? (
                                                <StyledAutoCompleteInputFormControl className="form-control" style={{ borderRadius: 0 }}>
                                                    <AsyncCreatableSelect
                                                        loadOptions={this.loadOptions}
                                                        noOptionsMessage={this.noResults}
                                                        styles={customStyles}
                                                        autoFocus
                                                        getOptionLabel={({ label }) => label.charAt(0).toUpperCase() + label.slice(1)}
                                                        getOptionValue={({ id }) => id}
                                                        defaultOptions={[
                                                            {
                                                                label: this.props.label,
                                                                id: this.props.values.byId[this.props.id].resourceId
                                                            }
                                                        ]}
                                                        defaultValue={{
                                                            label: this.props.label,
                                                            id: this.props.values.byId[this.props.id].resourceId
                                                        }}
                                                        cacheOptions
                                                        onChange={(selectedOption, a) => {
                                                            this.handleChangeResource(selectedOption, a);
                                                            this.props.toggleEditValue({ id: this.props.id });
                                                        }}
                                                        onBlur={e => {
                                                            this.props.toggleEditValue({ id: this.props.id });
                                                        }}
                                                        isValidNewOption={inputValue => inputValue.length !== 0 && inputValue.trim().length !== 0}
                                                        createOptionPosition={'first'}
                                                    />
                                                </StyledAutoCompleteInputFormControl>
                                            ) : (
                                                <InputGroup>
                                                    <StyledInput
                                                        value={this.state.draftLabel}
                                                        onChange={this.handleChangeLabel}
                                                        onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()} // stop editing on enter and escape
                                                        onBlur={e => {
                                                            this.commitChangeLabel();
                                                            this.props.toggleEditValue({ id: this.props.id });
                                                        }}
                                                        autoFocus
                                                        bsSize="sm"
                                                    />
                                                    <InputGroupAddon addonType="append">
                                                        <Button
                                                            outline
                                                            color="primary"
                                                            size="sm"
                                                            onClick={e => {
                                                                this.commitChangeLabel();
                                                                this.props.toggleEditValue({ id: this.props.id });
                                                            }}
                                                        >
                                                            Save
                                                        </Button>
                                                    </InputGroupAddon>
                                                </InputGroup>
                                            )
                                        ) : (
                                            <InputGroup>
                                                <StyledInput
                                                    value={this.state.draftLabel}
                                                    onChange={this.handleChangeLabel}
                                                    onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()}
                                                    onBlur={e => {
                                                        this.commitChangeLiteral();
                                                        this.props.toggleEditValue({ id: this.props.id });
                                                    }}
                                                    autoFocus
                                                    bsSize="sm"
                                                />
                                                <InputGroupAddon addonType="append">
                                                    <Button
                                                        outline
                                                        color="primary"
                                                        size="sm"
                                                        onClick={e => {
                                                            this.commitChangeLiteral();
                                                            this.props.toggleEditValue({ id: this.props.id });
                                                        }}
                                                    >
                                                        Save
                                                    </Button>
                                                </InputGroupAddon>
                                            </InputGroup>
                                        )
                                    ) : (
                                        'Saving ...'
                                    )}
                                    {!this.props.isEditing && existingResourceId && this.props.openExistingResourcesInDialog ? (
                                        <span>
                                            {' '}
                                            <Icon icon={faExternalLinkAlt} />
                                        </span>
                                    ) : (
                                        ''
                                    )}
                                </span>
                                {!this.props.isEditing && this.props.classes && this.props.classes.includes(process.env.REACT_APP_QB_DATASET_CLASS) && (
                                    <Tippy content="Visualize data in tabular form">
                                        <span style={{ cursor: 'pointer' }} onClick={this.handleDatasetClick}>
                                            {' '}
                                            <Icon icon={faTable} />
                                        </span>
                                    </Tippy>
                                )}
                                {!this.props.isEditing && this.props.enableEdit ? (
                                    <>
                                        <span className={'deleteValue float-right'} onClick={this.toggleDeleteValue}>
                                            <Tippy content="Delete value">
                                                <span>
                                                    <Icon icon={faTrash} /> Delete
                                                </span>
                                            </Tippy>
                                        </span>
                                        {(!existingResourceId || this.props.shared <= 1) && !isProperty && (
                                            <span
                                                className={'mr-3 deleteValue float-right'}
                                                onClick={() => {
                                                    this.props.toggleEditValue({ id: this.props.id });
                                                }}
                                            >
                                                <Tippy content="Edit label">
                                                    <span>
                                                        <Icon icon={faPen} /> Edit
                                                    </span>
                                                </Tippy>
                                            </span>
                                        )}

                                        {existingResourceId && this.props.shared > 1 && (
                                            <span className={'mr-3 deleteValue float-right disabled'}>
                                                <Tippy content="A shared resource cannot be edited directly">
                                                    <span>
                                                        <Icon icon={faPen} /> Edit
                                                    </span>
                                                </Tippy>
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    ''
                                )}
                            </StyledValueItem>
                        ) : (
                            this.props.label
                        )}
                    </>
                ) : (
                    <ValueItemStyle className={this.state.editValueLabel ? 'editingLabel' : ''}>
                        {!this.props.isEditing ? (
                            <div>
                                <div className={`${this.props.type === 'literal' ? 'literalLabel' : 'objectLabel'}`} onClick={onClick}>
                                    <ValuePlugins type={this.props.type === 'object' ? 'resource' : 'literal'}>{this.props.label}</ValuePlugins>
                                    {existingResourceId && this.props.openExistingResourcesInDialog ? (
                                        <span>
                                            {' '}
                                            <Icon icon={faExternalLinkAlt} />
                                        </span>
                                    ) : (
                                        ''
                                    )}
                                </div>
                                <div className={'valueOptions'}>
                                    {!this.props.isEditing &&
                                        this.props.classes &&
                                        this.props.classes.includes(process.env.REACT_APP_QB_DATASET_CLASS) && (
                                            <TemplateOptionButton
                                                title={'Visualize data in tabular form'}
                                                icon={faTable}
                                                action={this.handleDatasetClick}
                                            />
                                        )}
                                    {(!existingResourceId || this.props.shared <= 1) && (
                                        <TemplateOptionButton
                                            title={'Edit value'}
                                            icon={faPen}
                                            action={() => this.props.toggleEditValue({ id: this.props.id })}
                                        />
                                    )}

                                    {existingResourceId && this.props.shared > 1 && (
                                        <TemplateOptionButton
                                            title={'A shared resource cannot be edited directly'}
                                            icon={faPen}
                                            action={() => null}
                                        />
                                    )}

                                    <TemplateOptionButton title={'Delete value'} icon={faTrash} action={this.toggleDeleteValue} />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <InputGroup size="sm">
                                    <Input
                                        bsSize="sm"
                                        value={this.state.draftLabel}
                                        onChange={this.handleChangeLabel}
                                        onKeyDown={e => (e.keyCode === 13 || e.keyCode === 27) && e.target.blur()} // stop editing on enter and escape
                                        onBlur={e => {
                                            this.commitChangeLabel();
                                            this.props.toggleEditValue({ id: this.props.id });
                                        }}
                                        autoFocus
                                    />
                                    <InputGroupAddon addonType="append">
                                        <StyledButton
                                            outline
                                            onClick={e => {
                                                this.commitChangeLabel();
                                                this.props.toggleEditValue({ id: this.props.id });
                                            }}
                                        >
                                            Done
                                        </StyledButton>
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>
                        )}
                    </ValueItemStyle>
                )}
                {this.state.modal ? (
                    <StatementBrowserDialog
                        show={this.state.modal}
                        toggleModal={this.toggleModal}
                        resourceId={this.state.dialogResourceId}
                        resourceLabel={this.state.dialogResourceLabel}
                        newStore={Boolean(this.props.contextStyle === 'StatementBrowser' || existingResourceId)}
                        enableEdit={this.props.enableEdit && this.props.contextStyle !== 'StatementBrowser' && !existingResourceId}
                    />
                ) : (
                    ''
                )}

                {this.state.modalDataset && (
                    <RDFDataCube
                        show={this.state.modalDataset}
                        handleResourceClick={this.handleDatasetResourceClick}
                        toggleModal={this.toggleModalDataset}
                        resourceId={this.state.dialogResourceId}
                        resourceLabel={this.state.dialogResourceLabel}
                    />
                )}
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
    properties: PropTypes.object.isRequired,
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    classes: PropTypes.array.isRequired,
    shared: PropTypes.number.isRequired,
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
    contextStyle: PropTypes.string.isRequired
};

ValueItem.defaultProps = {
    inline: false,
    resourceId: null,
    contextStyle: 'StatementBrowser'
};

const mapStateToProps = state => {
    return {
        resources: state.statementBrowser.resources,
        values: state.statementBrowser.values,
        properties: state.statementBrowser.properties,
        selectedProperty: state.statementBrowser.selectedProperty
    };
};

const mapDispatchToProps = dispatch => ({
    createValue: data => dispatch(createValue(data)),
    createResource: data => dispatch(createResource(data)),
    selectResource: data => dispatch(selectResource(data)),
    fetchStatementsForResource: data => dispatch(fetchStatementsForResource(data)),
    deleteValue: data => dispatch(deleteValue(data)),
    toggleEditValue: data => dispatch(toggleEditValue(data)),
    updateValueLabel: data => dispatch(updateValueLabel(data)),
    isSavingValue: data => dispatch(isSavingValue(data)),
    doneSavingValue: data => dispatch(doneSavingValue(data)),
    changeValue: data => dispatch(changeValue(data))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ValueItem);
