import React, { Component } from 'react';
import { Alert } from 'reactstrap';
// TODO: add mouse area selection from :  import Selection from '@simonwep/selection-js';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import CellVE from './CellVE';
import DropDownMapperSelector from './DropdownMapperSelector';
import PropTypes from 'prop-types';

export default class CellEditor extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)
        this.state = { updateFlipFlop: false };
    }

    validationCallback = () => {
        // this is used to trigger the re-rendering of the cells which will then validate them on update;
        this.setState({ updateFlipFlop: !this.state.updateFlipFlop });
    };

    /** Rendering functions for the frame (headers for rows and cols ) **/
    createTable = () => {
        const filteredProperties = this.selfVisModel.mrrModel.propertyAnchors.filter(item => item.isSelectedColumnForUse === true);
        const renderingDimX = filteredProperties.length + 1;
        const filteredContribs = this.selfVisModel.mrrModel.contributionAnchors.filter(item => item.isSelectedRowForUse === true);
        const renderingDimY = filteredContribs.length + 1;

        const itemsToRender = [];
        for (let i = -1; i < renderingDimY; i++) {
            // renders row;
            const rowArray = [];
            if (i === -1) {
                for (let j = 0; j < renderingDimX; j++) {
                    // renders the cell
                    const keyVal = 'key_cellIdMeta' + i + '_' + j;
                    if (j === 0) {
                        rowArray.push(<CellVE key={keyVal} type="metaNode" data={null} />);
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
                    rowArray.push(<CellVE key={keyVal} type="metaNode" data={null} />);
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
    };

    /** component rendering entrance point **/
    render() {
        return (
            <div className="pt-2">
                <Alert color="info" fade={false}>
                    Optionally edit cells values, valid entries are displayed in green
                </Alert>
                <div style={{ height: this.props.height + 'px', overflow: 'auto' }}>
                    {this.props.isLoading ? <div>Loading...</div> : <div>{this.createTable()} </div>}
                </div>
            </div>
        );
    }
}

CellEditor.propTypes = {
    isLoading: PropTypes.bool,
    height: PropTypes.number
};
