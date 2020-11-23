/**
  This is a Cell that takes as input the propertyAnchor, and the cellValue
  PropertyAnchor provides us with the mapper
  Cell Value provides an initial label 
  This label can be edited;
    
 **/

import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import SelfVisDataMode from '../SelfVisDataModel';
import styled from 'styled-components';
import Tippy from '@tippy.js/react';
import './selfVisStyles.css';
import { Input } from 'reactstrap';
import { validateCellMapping } from '../ValidateCellMapping.js';

//TODO: ADD a revert button on hover if the value is not original

export default class CellVE extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)

        let cellValue = 'undefined';
        let isValid = false;
        let err = undefined;

        // get the propsData;
        if (props.data && props.type === 'value') {
            // only validate based on the value;
            // get the mapper description of that thing;
            const propertyCell = this.selfVisModel.mrrModel.propertyAnchors[props.data.positionPropertyAnchor];
            const mapper = propertyCell.getPropertyMapperType();

            if (mapper) {
                // call the validator for this cell value;
                isValid = validateCellMapping(mapper, props.data.label);
                if (typeof isValid === 'object') {
                    err = isValid.value.message;
                    isValid = false;
                }
            }
        }

        if (props.data && props.data.label) {
            cellValue = props.data.label;
        }

        // see data;
        this.state = {
            renderingItem: 'text',
            cellLabelValue: cellValue,
            cellValueIsValid: isValid,
            errorMessage: err
        };
        if (props.data) {
            props.data.cellValueIsValid = isValid;
        }
        this.inputRefs = React.createRef();
    }

    componentDidUpdate = (prevProps, prevState) => {
        // always make sure that you have the pointer to the data;
        // this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
        if (this.state.renderingItem === 'input') {
            return;
        } //  block updates if we edit the label
        if (this.props.data && this.props.type === 'value') {
            const propertyCell = this.selfVisModel.mrrModel.propertyAnchors[this.props.data.positionPropertyAnchor];
            const mapper = propertyCell.getPropertyMapperType();
            if (mapper) {
                // call the validator for this cell value;
                let isValid = validateCellMapping(mapper, this.props.data.label);
                let errorMessage = undefined;
                if (typeof isValid === 'object') {
                    errorMessage = isValid.value.message;
                    isValid = false;
                }
                const newValue = isValid;
                const oldValue = prevState.cellValueIsValid;
                if (newValue !== oldValue) {
                    this.props.data.cellValueIsValid = newValue;
                    this.setState({ cellValueIsValid: newValue, errorMessage: errorMessage });
                }
            }
        }
    };

    cellValueDoubleClicked = () => {
        this.setState({ renderingItem: 'input' });
    };
    cellValueChanged = event => {
        this.setState({ cellLabelValue: event.target.value });
    };
    /** Rendering functions **/
    /** render based on propFlag **/
    render() {
        return (
            <>
                {/*PROPERTY LABELS */}
                {this.props.type === 'property' && this.state.renderingItem === 'text' && (
                    <Tippy
                        content={
                            this.props.data.label === this.props.data.originalLabel
                                ? this.props.data.label
                                : this.props.data.originalLabel + '>>' + this.props.data.label
                        }
                    >
                        <PropertyCell
                            className="noselect"
                            onDoubleClick={() => {
                                this.cellValueDoubleClicked();
                            }}
                        >
                            {this.props.data.label}
                        </PropertyCell>
                    </Tippy>
                )}
                {this.props.type === 'property' && this.state.renderingItem === 'input' && (
                    <PropertyCellInput
                        autoFocus={true}
                        value={this.state.cellLabelValue}
                        onChange={this.cellValueChanged}
                        innerRef={this.inputRefs}
                        onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                        onBlur={e => {
                            this.props.data.setLabel(this.state.cellLabelValue);
                            this.setState({ renderingItem: 'text' });
                        }}
                        onFocus={
                            e => {
                                e.target.select();
                            } // Highlights the entire label when edit
                        }
                    />
                )}

                {/*CONTRIBUTION LABELS */}

                {this.props.type === 'contribution' && this.state.renderingItem === 'text' && (
                    <Tippy
                        content={
                            this.props.data.label === this.props.data.originalLabel
                                ? this.props.data.label
                                : this.props.data.originalLabel + '>>' + this.props.data.label
                        }
                    >
                        <ContributionCell
                            className="noselect"
                            onDoubleClick={() => {
                                this.cellValueDoubleClicked();
                            }}
                        >
                            {this.props.data.label}
                        </ContributionCell>
                    </Tippy>
                )}
                {this.props.type === 'contribution' && this.state.renderingItem === 'input' && (
                    <ContributionCellInput
                        autoFocus={true}
                        value={this.state.cellLabelValue}
                        onChange={this.cellValueChanged}
                        innerRef={this.inputRefs}
                        onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                        onBlur={e => {
                            this.props.data.setLabel(this.state.cellLabelValue);
                            this.setState({ renderingItem: 'text' });
                        }}
                        onFocus={
                            e => {
                                e.target.select();
                            } // Highlights the entire label when edit
                        }
                    />
                )}
                {/*CELL VALUE LABELS */}
                {this.props.type === 'value' && this.state.renderingItem === 'text' && (
                    <Tippy
                        content={
                            this.state.cellValueIsValid === true
                                ? this.props.data.label === this.props.data.originalLabel
                                    ? this.props.data.label
                                    : this.props.data.originalLabel + '>>' + this.props.data.label
                                : 'ERROR:' +
                                  this.state.errorMessage +
                                  '  (' +
                                  this.props.data.label +
                                  ') >> orignial label: ' +
                                  this.props.data.originalLabel
                        }
                    >
                        <ValueCell
                            className="noselect"
                            isValid={this.state.cellValueIsValid}
                            onDoubleClick={() => {
                                this.cellValueDoubleClicked();
                            }}
                        >
                            {this.props.data.label}
                        </ValueCell>
                    </Tippy>
                )}

                {this.props.type === 'value' && this.state.renderingItem === 'input' && (
                    <ValueCellInput
                        autoFocus={true}
                        value={this.state.cellLabelValue}
                        onChange={this.cellValueChanged}
                        innerRef={this.inputRefs}
                        onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                        onBlur={e => {
                            this.props.data.setLabel(this.state.cellLabelValue);

                            this.setState({ renderingItem: 'text' });
                        }}
                        onFocus={
                            e => {
                                e.target.select();
                            } // Highlights the entire label when edit
                        }
                    />
                )}

                {this.props.type === 'metaNode' && <MetaCell>{this.props.children}</MetaCell>}
                {this.props.type === 'metaNodeSelector' && <MetaMapperSelector>{this.props.children}</MetaMapperSelector>}
                {this.props.type === 'metaNodeSelectorSimple' && <MetaMapperSelectorSimple>{this.props.children}</MetaMapperSelectorSimple>}
            </>
        );
    }
}

CellVE.propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.object,
    children: PropTypes.any
};

/** adding styled divs for different cell items **/
export const PropertyCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    color: white;
    background: #80869b;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    width: 150px;
    min-width: 150px;
    height: 30px;
    padding: 0 2px;
    margin: 0 1px;
    cursor: pointer;
`;

export const PropertyCellInput = styled(Input)`
    background: #fff;
    color: ${props => props.theme.orkgPrimaryColor};
    outline: 0;
    border: dotted 2px ${props => props.theme.listGroupBorderColor};
    border-radius: 0;
    padding: 0 4px;
    display: block;
    height: 30px !important;
    width: 150px !important;
    min-width: 150px;

    &:focus {
        background: #fff;
        color: ${props => props.theme.orkgPrimaryColor};
        outline: 0;
        border: dotted 2px ${props => props.theme.listGroupBorderColor};
        padding: 0 4px;
        border-radius: 0;
        display: block;
    }
`;

export const ValueCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;

    background: ${props => (props.isValid ? '#4caf50' : '#fda9a9')};
    color: black;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 1px 1px;
`;

export const ValueCellInput = styled(Input)`
    background: #fff;
    color: black
    outline: 0;
    border: dotted 2px ${props => props.theme.listGroupBorderColor};
    border-radius: 0;
    padding: 0 4px;
    display: block;
    height: 30px !important;
    width: 150px !important;
    min-width: 150px;
    margin: 1px 1px;

    &:focus {
        background: #fff;
        color: black
        outline: 0;
        border: dotted 2px ${props => props.theme.listGroupBorderColor};
        padding: 0 4px;
        border-radius: 0;
        display: block;
    }
`;

export const ContributionCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    background: #e86161;
    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 1px 1px;
    cursor: pointer;
`;

export const ContributionCellInput = styled(Input)`
    background: #fff;
    color: black
    outline: 0;
    border: dotted 2px ${props => props.theme.listGroupBorderColor};
    border-radius: 0;
    padding: 0 4px;
    display: block;
    height: 30px !important;
    width: 150px !important;
    min-width: 150px;
    margin: 1px 1px;

    &:focus {
        background: #fff;
        color: black
        outline: 0;
        border: dotted 2px ${props => props.theme.listGroupBorderColor};
        padding: 0 4px;
        border-radius: 0;
        display: block;
    }
`;

export const MetaCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;

    background: white;
    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 1px 1px;
`;

export const MetaMapperSelector = styled.div`
    overflow: visible;
    background: black;
    color: white;
    width: 150px;
    min-width: 150px;
    height: 60px;
    margin: 1px 1px;
`;
export const MetaMapperSelectorSimple = styled.div`
    overflow: visible;
    background: white;

    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 1px 1px;
    padding-left: 27px;
`;
