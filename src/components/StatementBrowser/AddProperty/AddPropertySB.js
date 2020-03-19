import React from 'react';
import { predicatesUrl } from 'network';
import { InputGroupAddon, Button } from 'reactstrap';
import { StyledStatementItem, StyledAddProperty } from 'components/AddPaper/Contributions/styled';
import AutoComplete from 'components/StatementBrowser/AutoComplete';
import defaultProperties from './helpers/defaultProperties';
import PropTypes from 'prop-types';

export default function AddPropertySB(props) {
    return (
        <StyledStatementItem
            style={{ transition: '0.3s max-width', borderTop: '0' }}
            //className={`${this.state.showAddProperty ? 'col-12 large' : 'col-3'}`}
        >
            {props.showAddProperty ? (
                <StyledAddProperty style={{ textAlign: 'left' }}>
                    <AutoComplete
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
                        <Button color="light" className={'addPropertyActionButton'} onClick={props.handleHideAddProperty}>
                            Cancel
                        </Button>
                    </InputGroupAddon>
                </StyledAddProperty>
            ) : (
                <span className="btn btn-link p-0 border-0" onClick={props.handleShowAddProperty}>
                    + Add property
                </span>
            )}
        </StyledStatementItem>
    );
}

AddPropertySB.propTypes = {
    showAddProperty: PropTypes.bool.isRequired,
    handlePropertySelect: PropTypes.func.isRequired,
    toggleConfirmNewProperty: PropTypes.func.isRequired,
    handleHideAddProperty: PropTypes.func.isRequired,
    newProperties: PropTypes.array.isRequired,
    handleShowAddProperty: PropTypes.func.isRequired
};
