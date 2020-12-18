import React, { Component } from 'react';
import { Alert, ButtonGroup, Button } from 'reactstrap';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import CellRenderer from './CellRenderer';
import DropDownMapperSelector from './DropdownMapperSelector';
import CheckboxSelector from './CheckBoxSelector';
import PropTypes from 'prop-types';

export default class CellSelector extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)
    }

    /** some data handlers **/
    toggleCheckboxForCol = (id, value) => {
        // this is the correct id for the init from the propertyAnchors
        this.setFullColumnSelection(id, value);
    };

    /** Rendering functions for the frame (headers for rows and cols ) **/
    createTable = () => {
        // we have a rootItem which is a split between properties and contributions
        /* [root] [property], [property]
          cId  [ value 0,0] value [1,0]...]
          cId  [ value 0,1] value [1,1]...]      
        */

        const renderingDimX = this.selfVisModel.mrrModel.propertyAnchors.length + 1;
        const renderingDimY = this.selfVisModel.mrrModel.contributionAnchors.length + 1;

        const itemsToRender = [];

        for (let i = -1; i < renderingDimY; i++) {
            // renders row;
            const rowArray = [];
            if (i === -1) {
                for (let j = 0; j < renderingDimX; j++) {
                    // renders the cell
                    const keyVal = 'key_cellIdMeta' + i + '_' + j;
                    if (j === 0) {
                        rowArray.push(<CellRenderer key={keyVal} type="metaNodeHeader" data={null} />);
                    } else {
                        rowArray.push(
                            <CellRenderer key={keyVal} type="metaNodeSelector" data={null}>
                                <ButtonGroup
                                    style={{ borderBottomLeftRadius: '0', borderBottomRightRadius: '0' }}
                                    className="p-0 flex-grow-1"
                                    size="sm"
                                >
                                    <Button
                                        className="p-0 m-0"
                                        size="sm"
                                        color="darkblue"
                                        style={{
                                            borderBottomLeftRadius: '0',
                                            borderBottomRightRadius: '0'
                                        }}
                                    >
                                        <div
                                            style={{
                                                marginLeft: '4px',
                                                marginRight: '-4px'
                                            }}
                                        >
                                            <CheckboxSelector
                                                label=""
                                                initializedValue={this.selfVisModel.mrrModel.propertyAnchors[j - 1]}
                                                handleCheckboxChange={v => this.toggleCheckboxForCol(j - 1, v)}
                                                cbx_id={'useValue+' + i + '_' + j}
                                                key={'useValue+' + i + '_' + j}
                                            />
                                        </div>
                                    </Button>
                                    <DropDownMapperSelector key={keyVal + 'dropdown'} data={this.selfVisModel.mrrModel.propertyAnchors[j - 1]} />
                                </ButtonGroup>
                            </CellRenderer>
                        );
                    }
                }
            }

            for (let j = 0; j < renderingDimX; j++) {
                // renders the cell
                const keyVal = 'key_cellId' + i + '_' + j;

                if (i === 0 && j === 0) {
                    rowArray.push(<CellRenderer key={keyVal} type="metaNode" data={null} />);
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

    /** Preparations for mouse are selection:  Cell interactions for single entries or rows & cols or full **/
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

    setFullRowSelection = (rowId, value) => {
        // check the source of origin;
        console.log('TODO', 'Set all flags to value for a specific row');
    };

    setFullColumnSelection = (columnId, value) => {
        const colItems = this.selfVisModel.modelAccess.getCol(columnId);
        this.selfVisModel.mrrModel.propertyAnchors[columnId].setSelectedColumn(value);

        for (let i = 0; i < this.selfVisModel.mrrModel.contributionAnchors.length; i++) {
            this.selfVisModel.mrrModel.contributionAnchors[i].setSelectedRow(true);
            colItems[i].setItemSelected(value);
        }
    };

    /** component rendering entrance point **/
    render() {
        return (
            <div className="pt-2">
                <Alert color="info">Select cells for visualization and map to types.</Alert>

                {this.props.isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <div style={{ height: this.props.height + 'px', overflow: 'auto' }}>{this.createTable()} </div>
                )}
            </div>
        );
    }
}

CellSelector.propTypes = {
    isLoading: PropTypes.bool,
    height: PropTypes.number
};
