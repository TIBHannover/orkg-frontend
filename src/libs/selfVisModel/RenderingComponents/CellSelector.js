import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
// import Selection from '@simonwep/selection-js';
import SelfVisDataMode from '../SelfVisDataModel';

export default class CellSelector extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
    }

    componentDidUpdate = prevProps => {
        // always make sure that you have the pointer to the data;
        // this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)

        if (this.props.isLoading === false) {
            console.log(this.selfVisModel, '<< should have data >> YOOO ');
        }
    };

    /** Rendering functions for the frame (headers for rows and cols ) **/
    createFrame = () => {};
    createPropertyHeaders = () => {};
    createContributionHeaders = () => {};
    createComparisonDataMatrix = () => {};
    createTable = () => {};

    /** Cell interactions for single entries or rows & cols or full **/
    setSelectionFlagInData = (row, col) => {
        // check the source of origin;
        console.log('TODO', 'access data and set selected Flag in the cell ');
    };

    removeSelectionFlagInData = (row, col) => {
        // check the source of origin;
        console.log('TODO', 'access data and remove selected Flag in the cell ');
    };

    clearSelectionFlagInData = () => {
        // check the source of origin;
        console.log('TODO', 'remove all selection flags');
    };

    setFullColumnSelection = (columnId, value) => {
        // check the source of origin;
        console.log('TODO', 'Set all flags to value for a specific col');
    };

    setFullRowSelection = (rowId, value) => {
        // check the source of origin;
        console.log('TODO', 'Set all flags to value for a specific row');
    };

    /** component rendering entrance point **/
    render() {
        return (
            <div className="tableSelectionAreaRoot">
                Selection Table Root
                <div>{this.props.isLoading ? <div>Loading...</div> : <div>{this.createTable()} </div>}</div>
            </div>
        );
    }
}

CellSelector.propTypes = {
    isLoading: PropTypes.bool
};
