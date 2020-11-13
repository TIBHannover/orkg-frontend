import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
// import Selection from '@simonwep/selection-js';
import SelfVisDataMode from '../SelfVisDataModel';
import CellRenderer from './CellRenderer';
import DropDownMapperSelector from './DropdownMapperSelector';
import CheckboxSelector from './CheckBoxSelector';

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

    /** some data handlers **/
    toggleCheckboxForCol = (id, value) => {
        // this is the correct id for the init from the propertyAnchros
        console.log('ID:', id, 'Value:', value);
        this.setFullColumnSelection(id, value);
    };

    /** Rendering functions for the frame (headers for rows and cols ) **/
    createFrame = () => {};
    createPropertyHeaders = () => {};
    createContributionHeaders = () => {};
    createComparisonDataMatrix = () => {};
    createTable = () => {
        console.log('TODO:', 'Create the table , 1 frame then data matrix ');
        // we have a rootItem which is a split between properties and contributions

        /* [root] [property], [property]
          cId  [ value 0,0] value [1,0]...]
          cId  [ value 0,1] value [1,1]...] 
      
       */

        // we need some meta information to create the frame
        // basic Idea create a matrix which has +1 entries from the data dimensions (in x and in y direct)

        // this rendering matrix will be then populated by the corresponding items;

        const renderingDimX = this.selfVisModel.mrrModel.propertyAnchors.length + 1;
        const renderingDimY = this.selfVisModel.mrrModel.contributionAnchors.length + 1;
        console.log('Rendering Matrix dimensions ', renderingDimX, renderingDimY);

        // we do render it as a row and cells
        const itemsToRender = [];
        // why do we dont want to use a tr/ td/ th table renderer? >> some idea about table interactions
        // draggable cols and row

        // test
        for (let i = -1; i < renderingDimY; i++) {
            // renders row;
            const rowArray = [];

            if (i === -1) {
                for (let j = 0; j < renderingDimX; j++) {
                    // renders the cell
                    const keyVal = 'key_cellIdMeta' + i + '_' + j;
                    if (j === 0) {
                        rowArray.push(
                            <CellRenderer key={keyVal} type="metaNodeHeader" data={null}>
                                MapperHeader
                            </CellRenderer>
                        );
                    } else {
                        rowArray.push(
                            <CellRenderer key={keyVal} type="metaNodeSelector" data={null}>
                                <DropDownMapperSelector key={keyVal + 'dropdown'} data={this.selfVisModel.mrrModel.propertyAnchors[j - 1]} />
                                <CheckboxSelector
                                    label="Use"
                                    initializedValue={this.selfVisModel.mrrModel.propertyAnchors[j - 1]}
                                    handleCheckboxChange={v => this.toggleCheckboxForCol(j - 1, v)}
                                    key={'useValue+' + i + '_' + j}
                                />
                            </CellRenderer>
                        );
                    }
                }
            }

            for (let j = 0; j < renderingDimX; j++) {
                // renders the cell
                const keyVal = 'key_cellId' + i + '_' + j;

                if (i === 0 && j === 0) {
                    rowArray.push(
                        <CellRenderer key={keyVal} type="metaNode" data={null}>
                            MetaNode
                        </CellRenderer>
                    );
                }
                if (i === 0 && j !== 0) {
                    rowArray.push(<CellRenderer key={keyVal} type="property" data={this.selfVisModel.mrrModel.propertyAnchors[j - 1]} />);
                }
                if (i > 0 && j === 0) {
                    rowArray.push(<CellRenderer key={keyVal} type="contribution" data={this.selfVisModel.mrrModel.contributionAnchors[i - 1]} />);
                }
                if (i > 0 && j !== 0) {
                    rowArray.push(<CellRenderer key={keyVal} type="value" data={this.selfVisModel.modelAccess.getItem(i - 1, j - 1)} />);
                }
            }

            itemsToRender.push(
                <div key={i + '_row'} style={{ display: 'flex' }}>
                    {rowArray}
                </div>
            );
        }

        return itemsToRender;
        // we will use a similar styles as done in the table renderer of the comparison.
    };

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
        const colItems = this.selfVisModel.modelAccess.getCol(columnId);
        this.selfVisModel.mrrModel.propertyAnchors[columnId].setSelectedColumn(value);

        for (let i = 0; i < this.selfVisModel.mrrModel.contributionAnchors.length; i++) {
            this.selfVisModel.mrrModel.contributionAnchors[i].setSelectedRow(value);
            colItems[i].setItemSelected(value);
        }
    };

    setFullRowSelection = (rowId, value) => {
        // check the source of origin;
        console.log('TODO', 'Set all flags to value for a specific row');
    };

    /** component rendering entrance point **/
    render() {
        console.log(this.selfVisModel.mrrModel);
        return (
            <div className="tableSelectionAreaRoot" style={{ height: this.props.height + 'px', overflow: 'auto' }}>
                Select cells for visualization and map to types.
                <div>{this.props.isLoading ? <div>Loading...</div> : <div>{this.createTable()} </div>}</div>
            </div>
        );
    }
}

CellSelector.propTypes = {
    isLoading: PropTypes.bool,
    height: PropTypes.number
};
