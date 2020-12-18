import React, { Component } from 'react';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import Tippy from '@tippy.js/react';
import {
    PropertyCellEditor,
    ContributionCell,
    MetaCell,
    MetaMapperSelector,
    MetaMapperSelectorSimple,
    ValueCellValidator,
    PropertyCellInput,
    ContributionCellInput,
    ValueCellInput
} from './styledComponents';
import { validateCellMapping } from 'libs/selfVisModel/ValidateCellMapping.js';
import PropTypes from 'prop-types';

//TODO: ADD a revert button on hover if the value is not original

export default class CellVE extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)

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

        // set data state in constructor
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
                        <PropertyCellEditor
                            className="noselect"
                            onDoubleClick={() => {
                                this.cellValueDoubleClicked();
                            }}
                        >
                            {this.props.data.label}
                        </PropertyCellEditor>
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
                        <ValueCellValidator
                            className="noselect"
                            isValid={this.state.cellValueIsValid}
                            onDoubleClick={() => {
                                this.cellValueDoubleClicked();
                            }}
                        >
                            {this.props.data.label}
                        </ValueCellValidator>
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
