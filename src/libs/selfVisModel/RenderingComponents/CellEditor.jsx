import PropTypes from 'prop-types';
import { useState } from 'react';
import { Alert } from 'reactstrap';

import CellVE from '@/libs/selfVisModel/RenderingComponents/CellVE';
import DropDownMapperSelector from '@/libs/selfVisModel/RenderingComponents/DropdownMapperSelector';
// TODO: add mouse area selection from :  import Selection from '@simonwep/selection-js';
import SelfVisDataModel from '@/libs/selfVisModel/SelfVisDataModel';

const CellEditor = (props) => {
    const [selfVisModel] = useState(new SelfVisDataModel());
    const [, setUpdateFlipFlop] = useState(false);

    const validationCallback = () => {
        // this is used to trigger the re-rendering of the cells which will then validate them on update;
        setUpdateFlipFlop((prevUpdateFlipFlop) => !prevUpdateFlipFlop);
    };

    /** Rendering functions for the frame (headers for rows and cols ) * */
    const createTable = () => {
        const filteredProperties = selfVisModel.mrrModel.propertyAnchors.filter((item) => item.isSelectedColumnForUse === true);
        const renderingDimX = filteredProperties.length + 1;
        // we use the whole column for now;
        const filteredContribs = selfVisModel.mrrModel.contributionAnchors;
        const renderingDimY = filteredContribs.length + 1; // using the whole column

        const itemsToRender = [];
        for (let i = -1; i < renderingDimY; i++) {
            // renders row;
            const rowArray = [];
            if (i === -1) {
                for (let j = 0; j < renderingDimX; j++) {
                    // renders the cell
                    const keyVal = `key_cellIdMeta${i}_${j}`;
                    if (j === 0) {
                        rowArray.push(<CellVE key={keyVal} type="metaNode" data={null} />);
                    } else {
                        const propertyItem = filteredProperties[j - 1];
                        rowArray.push(
                            <CellVE key={keyVal} type="metaNodeSelectorSimple" data={null}>
                                <DropDownMapperSelector
                                    key={`${keyVal}dropdown${propertyItem.positionPropertyAnchor}`}
                                    data={propertyItem}
                                    callBack={validationCallback}
                                />
                            </CellVE>,
                        );
                    }
                }
            }

            for (let j = 0; j < renderingDimX; j++) {
                // renders the cell
                const keyVal = `key_cellId${i}_${j}`;

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
                    rowArray.push(
                        <CellVE key={`${keyVal}_${rowIndex}_${colIndex}`} type="value" data={selfVisModel.modelAccess.getItem(rowIndex, colIndex)} />,
                    );
                }
            }

            itemsToRender.push(
                <div key={`${i}_row`} style={{ display: 'flex' }}>
                    {rowArray}
                </div>,
            );
        }

        return itemsToRender;
    };

    return (
        <div className="pt-2">
            <Alert color="info" fade={false}>
                Optionally edit header labels. Valid cell entries corresponding to selected mapper are displayed in green.
            </Alert>
            <div style={{ height: `${props.height}px`, overflow: 'auto' }}>
                {props.isLoading ? <div>Loading...</div> : <div>{createTable()} </div>}
            </div>
        </div>
    );
};

CellEditor.propTypes = {
    isLoading: PropTypes.bool,
    height: PropTypes.number,
};

export default CellEditor;
