import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
// import Selection from '@simonwep/selection-js';
import SelfVisDataMode from '../SelfVisDataModel';
import CellVE from './CellVE';
import DropDownMapperSelector from './DropdownMapperSelector';

export default class CellEditor extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
        this.state = { updateFlipFlop: false };
    }

    componentDidUpdate = prevProps => {
        // always make sure that you have the pointer to the data;
        // this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)

        if (this.props.isLoading === false) {
            console.log(this.selfVisModel, '<< should have data >> YOOO ');
        }
    };

    validationCallback = () => {
        // this is used to trigger the re-rendering of the cells which will then validate them on update;
        this.setState({ updateFlipFlop: !this.state.updateFlipFlop });
    };

    /** Rendering functions for the frame (headers for rows and cols ) **/
    createTable = () => {
        // filter the propertyAnchors by selectionFlag;

        const filteredProperties = this.selfVisModel.mrrModel.propertyAnchors.filter(item => item.isSelectedColumnForUse === true);
        console.log(filteredProperties);
        const renderingDimX = filteredProperties.length + 1;
        // now figure out how many rows we do have;
        const filteredContribs = this.selfVisModel.mrrModel.contributionAnchors.filter(item => item.isSelectedRowForUse === true);
        console.log(filteredContribs);
        const renderingDimY = filteredContribs.length + 1;
        // now we know the dimensions of the matrix to render;

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
                            <CellVE key={keyVal} type="metaNode" data={null}>
                                MapperHeader
                            </CellVE>
                        );
                    } else {
                        const propertyItem = filteredProperties[j - 1];
                        rowArray.push(
                            <CellVE key={keyVal} type="metaNodeSelectorSimple" data={null}>
                                <DropDownMapperSelector key={keyVal + 'dropdown'} data={propertyItem} callBack={this.validationCallback} />
                            </CellVE>
                        );
                    }
                }
            }

            for (let j = 0; j < renderingDimX; j++) {
                // renders the cell
                const keyVal = 'key_cellId' + i + '_' + j;

                if (i === 0 && j === 0) {
                    rowArray.push(
                        <CellVE key={keyVal} type="metaNode" data={null}>
                            MetaNode
                        </CellVE>
                    );
                }
                if (i === 0 && j !== 0) {
                    const propertyItem = filteredProperties[j - 1];
                    rowArray.push(<CellVE key={keyVal} type="property" data={propertyItem} />);
                }
                if (i > 0 && j === 0) {
                    const contribItem = filteredContribs[i - 1];
                    rowArray.push(<CellVE key={keyVal} type="contribution" data={contribItem} />);
                }
                if (i > 0 && j !== 0) {
                    const propertyItem = filteredProperties[j - 1];
                    const contribItem = filteredContribs[i - 1];
                    const rowIndex = contribItem.positionContribAnchor;
                    const colIndex = propertyItem.positionPropertyAnchor;
                    rowArray.push(<CellVE key={keyVal} type="value" data={this.selfVisModel.modelAccess.getItem(rowIndex, colIndex)} />);
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

    /** component rendering entrance point **/
    render() {
        return (
            <div style={{ height: this.props.height + 'px', overflow: 'auto' }}>
                Optionally edit cells values, valid entries are rendered in green
                <div>{this.props.isLoading ? <div>Loading...</div> : <div>{this.createTable()} </div>}</div>
            </div>
        );
    }
}

CellEditor.propTypes = {
    isLoading: PropTypes.bool,
    height: PropTypes.number
};
