import React from 'react';
import { predicatesUrl } from 'network';
import { InputGroupAddon, Button, InputGroup } from 'reactstrap';
import { AddPropertyStyle, AddPropertyContentStyle, AddPropertyFormStyle, StyledButton } from 'components/AddPaper/Contributions/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AutoComplete from 'components/StatementBrowser/AutoComplete';
import defaultProperties from './helpers/defaultProperties';
import PropTypes from 'prop-types';

export default function AddPropertyTemplate(props) {
    return (
        <AddPropertyStyle className={props.inTemplate ? 'inTemplate' : 'mt-3'}>
            <AddPropertyContentStyle
                onClick={() => (props.inTemplate && !props.showAddProperty ? props.handleShowAddProperty() : undefined)}
                className={`${props.inTemplate ? 'inTemplate' : 'noTemplate'} ${props.showAddProperty ? 'col-12 large' : ''}`}
            >
                {!props.showAddProperty ? (
                    <Button
                        //className={this.props.inTemplate ? 'p-0' : ''}
                        color={props.inTemplate ? 'light' : 'darkblue'}
                        onClick={() => (!props.inTemplate ? props.handleShowAddProperty() : undefined)}
                        //style={this.props.inTemplate ? { color: 'inherit' } : undefined}
                        size="sm"
                    >
                        <Icon className={'icon'} size="sm" icon={faPlus} /> Add property
                    </Button>
                ) : (
                    <AddPropertyFormStyle>
                        <InputGroup size="sm">
                            <InputGroupAddon addonType="prepend">
                                <Icon className={'icon'} icon={faPlus} />
                            </InputGroupAddon>
                            <AutoComplete
                                cssClasses={'form-control-sm'}
                                requestUrl={predicatesUrl}
                                placeholder="Select or type to enter a property"
                                onItemSelected={props.handlePropertySelect}
                                onNewItemSelected={props.toggleConfirmNewProperty}
                                onKeyDown={e => {
                                    if (e.keyCode === 27) {
                                        // escape
                                        props.handleHideAddProperty();
                                    }
                                }}
                                additionalData={props.newProperties}
                                disableBorderRadiusRight
                                allowCreate
                                defaultOptions={defaultProperties}
                                onBlur={() => {
                                    props.handleHideAddProperty();
                                }}
                            />
                            <InputGroupAddon addonType="append">
                                <StyledButton outline onClick={() => props.handleHideAddProperty()}>
                                    Cancel
                                </StyledButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </AddPropertyFormStyle>
                )}
            </AddPropertyContentStyle>
        </AddPropertyStyle>
    );
}

AddPropertyTemplate.propTypes = {
    inTemplate: PropTypes.bool.isRequired,
    showAddProperty: PropTypes.bool.isRequired,
    handlePropertySelect: PropTypes.func.isRequired,
    toggleConfirmNewProperty: PropTypes.func.isRequired,
    handleHideAddProperty: PropTypes.func.isRequired,
    newProperties: PropTypes.array.isRequired,
    handleShowAddProperty: PropTypes.func.isRequired
};
