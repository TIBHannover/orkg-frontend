import React, { Component } from 'react';
import { ListGroup, Collapse } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronCircleDown, faChevronCircleUp } from '@fortawesome/free-solid-svg-icons';
import { StyledStatementItem, StyledListGroupOpen } from '../AddPaper/Contributions/styled';
import { getResource, predicatesUrl, submitGetRequest, updateStatement, createPredicate } from '../../network';
import classNames from 'classnames';
import ValueItem from './Value/ValueItem';
import AddValue from './Value/AddValue';
import StatementOptions from './StatementOptions';
import { connect } from 'react-redux';
import {
    togglePropertyCollapse, toggleEditPropertyLabel, updatePropertyLabel,
    changeProperty, isSavingProperty, doneSavingProperty, createProperty
} from '../../actions/statementBrowser';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import AsyncCreatableSelect from 'react-select/async-creatable';
import { guid } from '../../utils';

class StatementItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            deleteContributionModal: false,
            predicateLabel: null
        };
    }


    componentDidMount() {
        this.getPredicateLabel();
    }

    componentDidUpdate(prevProps) {
        if (this.props.predicateLabel !== prevProps.predicateLabel) {
            this.getPredicateLabel();
        }
    }

    handleChange = async (selectedOption, a) => {
        let property = this.props.properties.byId[this.props.id];
        // Check if the user changed the property
        if (this.props.predicateLabel !== selectedOption.label || (property.existingPredicateId !== selectedOption.id)) {
            this.props.isSavingProperty({ id: this.props.id }); // Show the saving message instead of the property label
            if (a.action === 'select-option') {
                this.changePredicate(selectedOption);
            } else if (a.action === 'create-option') {
                let newPredicate = null;
                if (this.props.syncBackend) {
                    newPredicate = await createPredicate(selectedOption.label);
                } else {
                    newPredicate = { id: guid(), label: selectedOption.label }
                    this.props.createProperty({
                        propertyId: newPredicate.id,
                        resourceId: this.props.selectedResource,
                        label: newPredicate.label,
                    });
                }
                this.changePredicate(newPredicate);
            }
        }
    };

    changePredicate = async (newProperty) => {
        if (this.props.syncBackend) {
            let predicate = this.props.properties.byId[this.props.id];
            let existingPredicateId = predicate ? predicate.existingPredicateId : false;
            if (existingPredicateId) {
                let values = predicate.valueIds;
                for (let value of values) {
                    await updateStatement(this.props.values.byId[value].statementId, { predicate_id: newProperty.id })
                }
                this.props.changeProperty({ propertyId: this.props.id, newProperty: newProperty });
                toast.success('Property updated successfully');
            }
        } else {
            this.props.changeProperty({ propertyId: this.props.id, newProperty: newProperty });
        }
        this.props.doneSavingProperty({ id: this.props.id });
    };

    getPredicateLabel = () => {
        if (this.props.predicateLabel.match(new RegExp('^R[0-9]*$'))) {
            getResource(this.props.predicateLabel)
                .catch((e) => {
                    console.log(e);
                    this.setState({ predicateLabel: this.props.predicateLabel.charAt(0).toUpperCase() + this.props.predicateLabel.slice(1) })
                }).then((r) => {
                    this.setState({ predicateLabel: `${r.label.charAt(0).toUpperCase() + r.label.slice(1)} (${this.props.predicateLabel})` })
                })
        } else {
            this.setState({ predicateLabel: this.props.predicateLabel.charAt(0).toUpperCase() + this.props.predicateLabel.slice(1) })
        }
    }

    toggleDeleteContribution = () => {
        this.setState((prevState) => ({
            deleteContributionModal: !prevState.deleteContributionModal,
        }));
    };

    IdMatch = async (value, responseJson) => {
        if (value.startsWith('#')) {
            const valueWithoutHashtag = value.substr(1);

            if (valueWithoutHashtag.length > 0) {
                let responseJsonExact;

                try {
                    responseJsonExact = await submitGetRequest(predicatesUrl + encodeURIComponent(valueWithoutHashtag));
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

            let responseJson = await submitGetRequest(predicatesUrl + '?q=' + encodeURIComponent(value) + queryParams);
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
        const isCollapsed = this.props.selectedProperty === this.props.id;

        const listGroupClass = classNames({
            statementActive: isCollapsed,
            statementItem: true,
            selectable: true,
            'rounded-bottom': this.props.isLastItem && !isCollapsed && !this.props.enableEdit,
        });

        const chevronClass = classNames({
            statementItemIcon: true,
            open: isCollapsed,
            'float-right': true,
        });

        const openBoxClass = classNames({
            listGroupOpenBorderBottom: this.props.isLastItem && !this.props.enableEdit,
            'rounded-bottom': this.props.isLastItem && !this.props.enableEdit,
        });

        let valueIds = Object.keys(this.props.properties.byId).length !== 0 ? this.props.properties.byId[this.props.id].valueIds : [];

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
                <StyledStatementItem active={isCollapsed} onClick={() => !this.props.isEditing ? this.props.togglePropertyCollapse(this.props.id) : undefined} className={listGroupClass}>
                    {!this.props.isSaving ?
                        (!this.props.isEditing ?
                            this.state.predicateLabel :
                            <AsyncCreatableSelect
                                loadOptions={this.loadOptions}
                                noOptionsMessage={this.noResults}
                                styles={customStyles}
                                autoFocus
                                getOptionLabel={({ label }) => label.charAt(0).toUpperCase() + label.slice(1)}
                                getOptionValue={({ id }) => id}
                                defaultOptions={[{
                                    label: this.props.predicateLabel,
                                    id: this.props.properties.byId[this.props.id].existingPredicateId
                                }]}
                                defaultValue={{
                                    label: this.props.predicateLabel,
                                    id: this.props.properties.byId[this.props.id].existingPredicateId
                                }}
                                cacheOptions
                                onChange={(selectedOption, a) => { this.handleChange(selectedOption, a); this.props.toggleEditPropertyLabel({ id: this.props.id }); }}
                                onBlur={(e) => { this.props.toggleEditPropertyLabel({ id: this.props.id }) }}
                            />
                        ) :
                        'Saving ...'
                    }

                    {valueIds.length === 1 && !isCollapsed ? (
                        <>
                            :{' '}
                            <em className="text-muted">
                                <ValueItem
                                    label={this.props.values.byId[valueIds[0]].label}
                                    id={valueIds[0]}
                                    type={this.props.values.byId[valueIds[0]].type}
                                    classes={this.props.values.byId[valueIds[0]].classes}
                                    resourceId={this.props.values.byId[valueIds[0]].resourceId}
                                    propertyId={this.props.id}
                                    existingStatement={this.props.values.byId[valueIds[0]].existingStatement}
                                    inline
                                    isExistingValue={this.props.values.byId[valueIds[0]].isExistingValue}
                                    isEditing={false}
                                    enableEdit={false}
                                    syncBackend={false}
                                />
                            </em>
                        </>
                    ) : valueIds.length > 1 && !isCollapsed ? (
                        <>
                            : <em className="text-muted">{valueIds.length} values</em>
                        </>
                    ) : (
                                ''
                            )}
                    <Icon icon={isCollapsed ? faChevronCircleUp : faChevronCircleDown} className={chevronClass} />

                    {this.props.enableEdit ? (
                        <StatementOptions
                            id={this.props.id}
                            syncBackend={this.props.syncBackend}
                            isEditing={this.props.isEditing}
                        />) : ''}
                </StyledStatementItem>

                <Collapse isOpen={isCollapsed}>
                    <StyledListGroupOpen className={openBoxClass}>
                        <ListGroup flush>
                            {valueIds.map((valueId, index) => {
                                let value = this.props.values.byId[valueId];

                                return (
                                    <ValueItem
                                        key={index}
                                        label={value.label}
                                        id={valueId}
                                        type={value.type}
                                        classes={value.classes}
                                        enableEdit={this.props.enableEdit}
                                        syncBackend={this.props.syncBackend}
                                        resourceId={value.resourceId}
                                        propertyId={this.props.id}
                                        existingStatement={value.existingStatement}
                                        openExistingResourcesInDialog={this.props.openExistingResourcesInDialog}
                                        isExistingValue={value.isExistingValue}
                                        isEditing={value.isEditing}
                                        statementId={value.statementId}
                                    />
                                );
                            })}

                            {this.props.enableEdit ? <AddValue syncBackend={this.props.syncBackend} /> : ''}
                        </ListGroup>
                    </StyledListGroupOpen>
                </Collapse>
            </>
        );
    }
}

StatementItem.propTypes = {
    id: PropTypes.string.isRequired,
    predicateLabel: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    isExistingProperty: PropTypes.bool.isRequired,
    enableEdit: PropTypes.bool.isRequired,
    syncBackend: PropTypes.bool.isRequired,
    isLastItem: PropTypes.bool.isRequired,
    togglePropertyCollapse: PropTypes.func.isRequired,
    selectedProperty: PropTypes.string.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    openExistingResourcesInDialog: PropTypes.bool,
    isEditing: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    toggleEditPropertyLabel: PropTypes.func.isRequired,
    updatePropertyLabel: PropTypes.func.isRequired,
    changeProperty: PropTypes.func.isRequired,
    isSavingProperty: PropTypes.func.isRequired,
    doneSavingProperty: PropTypes.func.isRequired,
    selectedResource: PropTypes.string.isRequired,
    createProperty: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
    return {
        selectedProperty: state.statementBrowser.selectedProperty,
        selectedResource: state.statementBrowser.selectedResource,
        properties: state.statementBrowser.properties,
        values: state.statementBrowser.values,
    };
};

const mapDispatchToProps = (dispatch) => ({
    togglePropertyCollapse: (id) => dispatch(togglePropertyCollapse(id)),
    toggleEditPropertyLabel: (data) => dispatch(toggleEditPropertyLabel(data)),
    updatePropertyLabel: (data) => dispatch(updatePropertyLabel(data)),
    changeProperty: (data) => dispatch(changeProperty(data)),
    isSavingProperty: (data) => dispatch(isSavingProperty(data)),
    doneSavingProperty: (data) => dispatch(doneSavingProperty(data)),
    createProperty: (data) => dispatch(createProperty(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(StatementItem);
