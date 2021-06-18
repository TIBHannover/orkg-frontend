import { useState } from 'react';
import { Alert, ButtonGroup, Button } from 'reactstrap';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import CellRenderer from './CellRenderer';
import DropDownMapperSelector from './DropdownMapperSelector';
import CheckboxSelector from './CheckBoxSelector';
import Tippy, { useSingleton } from '@tippyjs/react';
import PropTypes from 'prop-types';

const CellSelector = props => {
    const [selfVisModel] = useState(new SelfVisDataModel());
    const [source, target] = useSingleton();

    /** some data handlers **/
    const toggleCheckboxForCol = (id, value) => {
        // this is the correct id for the init from the propertyAnchors
        setFullColumnSelection(id, value);
    };

    /** Rendering functions for the frame (headers for rows and cols ) **/
    const createTable = () => {
        // we have a rootItem which is a split between properties and contributions
        /* [root] [property], [property]
          cId  [ value 0,0] value [1,0]...]
          cId  [ value 0,1] value [1,1]...]      
        */

        const renderingDimX = selfVisModel.mrrModel.propertyAnchors.length + 1;
        const renderingDimY = selfVisModel.mrrModel.contributionAnchors.length + 1;

        const itemsToRender = [];

        for (let i = -1; i < renderingDimY; i++) {
            // renders row;
            const rowArray = [];
            if (i === -1) {
                for (let j = 0; j < renderingDimX; j++) {
                    // renders the cell
                    const keyVal = 'key_cellIdMeta' + i + '_' + j;
                    if (j === 0) {
                        rowArray.push(<CellRenderer key={keyVal} type="metaNodeHeader" data={null} tippyTarget={target} />);
                    } else {
                        rowArray.push(
                            <CellRenderer key={keyVal} type="metaNodeSelector" data={null} tippyTarget={target}>
                                <ButtonGroup
                                    style={{ borderBottomLeftRadius: '0', borderBottomRightRadius: '0' }}
                                    className="p-0 flex-grow-1"
                                    size="sm"
                                >
                                    <Button
                                        className="p-0 m-0"
                                        size="sm"
                                        color="secondary"
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
                                                initializedValue={selfVisModel.mrrModel.propertyAnchors[j - 1]}
                                                handleCheckboxChange={v => toggleCheckboxForCol(j - 1, v)}
                                                cbx_id={'useValue+' + i + '_' + j}
                                                key={'useValue+' + i + '_' + j}
                                            />
                                        </div>
                                    </Button>
                                    <DropDownMapperSelector key={keyVal + 'dropdown'} data={selfVisModel.mrrModel.propertyAnchors[j - 1]} />
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
                    rowArray.push(<CellRenderer key={keyVal} type="metaNode" data={null} tippyTarget={target} />);
                }
                if (i === 0 && j !== 0) {
                    rowArray.push(
                        <CellRenderer key={keyVal} type="property" data={selfVisModel.mrrModel.propertyAnchors[j - 1]} tippyTarget={target} />
                    );
                }
                if (i > 0 && j === 0) {
                    rowArray.push(
                        <CellRenderer key={keyVal} type="contribution" data={selfVisModel.mrrModel.contributionAnchors[i - 1]} tippyTarget={target} />
                    );
                }
                if (i > 0 && j !== 0) {
                    rowArray.push(
                        <CellRenderer key={keyVal} type="value" data={selfVisModel.modelAccess.getItem(i - 1, j - 1)} tippyTarget={target} />
                    );
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

    /** Preparations for mouse are selection:  Cell interactions for single entries or rows & cols or full 
    const setSelectionFlagInData = (row, col) => {
        // check the source of origin;
        console.log('TODO', 'access data and set selected Flag in the cell ');
    };

    const removeSelectionFlagInData = (row, col) => {
        // check the source of origin;
        console.log('TODO', 'access data and remove selected Flag in the cell ');
    };

    const clearSelectionFlagInData = () => {
        // check the source of origin;
        console.log('TODO', 'remove all selection flags');
    };

    const setFullRowSelection = (rowId, value) => {
        // check the source of origin;
        console.log('TODO', 'Set all flags to value for a specific row');
    };
    **/

    const setFullColumnSelection = (columnId, value) => {
        selfVisModel.mrrModel.propertyAnchors[columnId].setSelectedColumn(value);
        selfVisModel.applySelectionToCustomizationState(selfVisModel.mrrModel.propertyAnchors[columnId], value);
        // const colItems = selfVisModel.modelAccess.getCol(columnId);

        // this is currently not needed
        // for (let i = 0; i < selfVisModel.mrrModel.contributionAnchors.length; i++) {
        //     selfVisModel.mrrModel.contributionAnchors[i].setSelectedRow(true);
        //     colItems[i].setItemSelected(value);
        // }
    };

    return (
        <div className="pt-2">
            <Alert color="info" fade={false}>
                Select cells for the visualization and map them to types
            </Alert>
            {/* This is the tippy that gets used as the tippyTarget */}
            <Tippy singleton={source} delay={300} offset={[0, 0]} moveTransition="transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)" />
            {props.isLoading ? <div>Loading...</div> : <div style={{ height: props.height + 'px', overflow: 'auto' }}>{createTable()} </div>}
        </div>
    );
};

CellSelector.propTypes = {
    isLoading: PropTypes.bool,
    height: PropTypes.number
};

export default CellSelector;
