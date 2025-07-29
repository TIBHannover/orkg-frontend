import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { usePrevious } from 'react-use';

import Tooltip from '@/components/FloatingUI/Tooltip';
import Button from '@/components/Ui/Button/Button';
import {
    ContributionCell,
    ContributionCellInput,
    MetaCell,
    MetaMapperSelector,
    MetaMapperSelectorSimple,
    PropertyCellEditor,
    PropertyCellInput,
    TippyContainer,
    ValueCellInput,
    ValueCellValidator,
} from '@/libs/selfVisModel/RenderingComponents/styledComponents';
import SelfVisDataModel from '@/libs/selfVisModel/SelfVisDataModel';
import { validateCellMapping } from '@/libs/selfVisModel/validateCellMapping';

const CellVE = (props) => {
    const [selfVisModel] = useState(new SelfVisDataModel());
    const [renderingItem, setRenderingItem] = useState('text');
    const [cellLabelValue, setCellLabelValue] = useState(props.data && props.data.label ? props.data.label : '');
    const [cellValueIsValid, setCellValueIsValid] = useState(!!(props.data && props.data.cellValueIsValid));
    const [errorMessage, setErrorMessage] = useState(null);
    const prevCellValueIsValid = usePrevious(cellValueIsValid);
    const inputRefs = useRef(null);

    const propertyCell = selfVisModel.mrrModel.propertyAnchors[props.data?.positionPropertyAnchor];
    const mapper = propertyCell?.getPropertyMapperType();
    const disableCellValueEdit = false; // this flag is used to disable the editing of the cell values, headers still editable

    const cellValueDoubleClicked = () => {
        // disable cell value edit **This is a draft**
        if (disableCellValueEdit && props.type === 'value') {
            return;
        }
        setRenderingItem('input');
    };
    const cellValueChanged = (event) => {
        setCellLabelValue(event.target.value);
    };

    const cellUndoChange = () => {
        setCellLabelValue(props.data.originalLabel);
        props.data.setLabel(props.data.originalLabel);
    };

    useEffect(() => {
        // get the propsData;
        if (props.data && props.type === 'value') {
            // only validate based on the value;
            // get the mapper description of that thing;
            let isValid = false;
            let err;
            if (mapper) {
                // add handler for default mapper selector (if no mapper is selected remove col from gdc model and set validationFlag to false)
                if (mapper === 'Select Mapper') {
                    props.data.cellValueIsValid = false;
                    setCellValueIsValid(false);
                } else {
                    const { error } = validateCellMapping(mapper, props.data.label);
                    let errorMessage;
                    if (error) {
                        errorMessage = error.message;
                        isValid = false;
                    } else {
                        isValid = true;
                    }
                    const newValue = isValid;
                    const oldValue = prevCellValueIsValid;
                    if (newValue !== oldValue) {
                        props.data.cellValueIsValid = newValue;
                        setCellValueIsValid(newValue);
                        setErrorMessage(errorMessage);
                    }
                }
            } else {
                err = props.data.label ? 'No mapper selected' : 'Empty cell value';

                setErrorMessage(err);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(props.data?.label), props.type, mapper]);

    const tippyContent = props.data ? (
        props.type === 'value' && renderingItem === 'text' ? (
            <>
                {cellValueIsValid === true
                    ? props.data.label === props.data.originalLabel
                        ? props.data.label ?? 'Empty'
                        : `${props.data.originalLabel ?? 'Empty'} >> ${props.data.label ?? 'Empty'}`
                    : `ERROR:${errorMessage}  (${props.data.label ?? 'Empty'}) >> original label: ${props.data.originalLabel ?? 'Empty'}`}
                {props.data.label !== props.data.originalLabel && (
                    <div className="text-center">
                        <Button size="sm" onClick={cellUndoChange} style={{ padding: '4px 8px' }}>
                            <FontAwesomeIcon size="sm" icon={faUndo} /> Undo
                        </Button>
                    </div>
                )}
            </>
        ) : (
            <>
                {props.data.label === props.data.originalLabel ? props.data.label : `${props.data.originalLabel} >> ${props.data.label}`}
                {props.data.label !== props.data.originalLabel && (
                    <div className="text-center">
                        <Button size="sm" onClick={cellUndoChange} style={{ padding: '4px 8px' }}>
                            <FontAwesomeIcon size="sm" icon={faUndo} /> Undo
                        </Button>
                    </div>
                )}
            </>
        )
    ) : null;

    return (
        <>
            {(props.type === 'value' || props.type === 'property' || props.type === 'contribution') && (
                <Tooltip content={tippyContent} contentStyle={{ maxWidth: '300px' }}>
                    <TippyContainer>
                        {/* PROPERTY LABELS */}
                        {props.type === 'property' && renderingItem === 'text' && (
                            <PropertyCellEditor
                                className="noselect"
                                onDoubleClick={() => {
                                    cellValueDoubleClicked();
                                }}
                            >
                                {props.data.label !== props.data.originalLabel ? <b>{props.data.label}</b> : props.data.label}
                            </PropertyCellEditor>
                        )}
                        {props.type === 'property' && renderingItem === 'input' && (
                            <PropertyCellInput
                                autoFocus
                                value={cellLabelValue}
                                onChange={cellValueChanged}
                                innerRef={inputRefs}
                                onKeyDown={(e) => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                onBlur={(e) => {
                                    props.data.setLabel(cellLabelValue);

                                    setRenderingItem('text');
                                }}
                                onFocus={
                                    (e) => {
                                        e.target.select();
                                    } // Highlights the entire label when edit
                                }
                            />
                        )}
                        {/* CONTRIBUTION LABELS */}
                        {props.type === 'contribution' && renderingItem === 'text' && (
                            <ContributionCell
                                className="noselect"
                                onDoubleClick={() => {
                                    cellValueDoubleClicked();
                                }}
                            >
                                {props.data.label !== props.data.originalLabel ? <b>{props.data.label}</b> : props.data.label}
                            </ContributionCell>
                        )}
                        {props.type === 'contribution' && renderingItem === 'input' && (
                            <ContributionCellInput
                                autoFocus
                                value={cellLabelValue}
                                onChange={cellValueChanged}
                                innerRef={inputRefs}
                                onKeyDown={(e) => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                onBlur={(e) => {
                                    props.data.setLabel(cellLabelValue);

                                    setRenderingItem('text');
                                }}
                                onFocus={
                                    (e) => {
                                        e.target.select();
                                    } // Highlights the entire label when edit
                                }
                            />
                        )}
                        {/* CELL VALUE LABELS */}
                        {props.type === 'value' && renderingItem === 'text' && (
                            <ValueCellValidator
                                className="noselect"
                                isValid={cellValueIsValid}
                                onDoubleClick={() => {
                                    cellValueDoubleClicked();
                                }}
                            >
                                {props.data.label !== props.data.originalLabel ? <b>{props.data.label}</b> : props.data.label}
                            </ValueCellValidator>
                        )}
                        {props.type === 'value' && renderingItem === 'input' && (
                            <ValueCellInput
                                autoFocus
                                value={cellLabelValue}
                                onChange={cellValueChanged}
                                innerRef={inputRefs}
                                onKeyDown={(e) => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                onBlur={(e) => {
                                    props.data.setLabel(cellLabelValue);

                                    setRenderingItem('text');
                                }}
                                onFocus={
                                    (e) => {
                                        e.target.select();
                                    } // Highlights the entire label when edit
                                }
                            />
                        )}
                    </TippyContainer>
                </Tooltip>
            )}
            {props.type === 'metaNode' && <MetaCell>{props.children}</MetaCell>}
            {props.type === 'metaNodeSelector' && <MetaMapperSelector>{props.children}</MetaMapperSelector>}
            {props.type === 'metaNodeSelectorSimple' && <MetaMapperSelectorSimple>{props.children}</MetaMapperSelectorSimple>}
        </>
    );
};

CellVE.propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.object,
    children: PropTypes.any,
};

export default CellVE;
