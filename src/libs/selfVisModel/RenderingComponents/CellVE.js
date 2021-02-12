import { useState, useRef, useEffect } from 'react';
import { Button } from 'reactstrap';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import { validateCellMapping } from 'libs/selfVisModel/ValidateCellMapping.js';
import {
    PropertyCellEditor,
    ContributionCell,
    MetaCell,
    MetaMapperSelector,
    MetaMapperSelectorSimple,
    ValueCellValidator,
    PropertyCellInput,
    ContributionCellInput,
    ValueCellInput,
    TippyContainer
} from './styledComponents';
import { usePrevious } from 'react-use';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';

const CellVE = props => {
    const [selfVisModel] = useState(new SelfVisDataModel());
    const [renderingItem, setRenderingItem] = useState('text');
    const [cellLabelValue, setCellLabelValue] = useState(props.data && props.data.label ? props.data.label : '');
    const [cellValueIsValid, setCellValueIsValid] = useState(props.data && props.data.cellValueIsValid ? true : false);
    const [errorMessage, setErrorMessage] = useState(null);
    const prevCellValueIsValid = usePrevious(cellValueIsValid);
    const inputRefs = useRef(null);

    const propertyCell = selfVisModel.mrrModel.propertyAnchors[(props.data?.positionPropertyAnchor)];
    const mapper = propertyCell?.getPropertyMapperType();

    const cellValueDoubleClicked = () => {
        props.tippySource.data.instance.disable();
        // disable cell value edit **This is a draft**

        setRenderingItem('input');
    };
    const cellValueChanged = event => {
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
            let err = undefined;
            if (mapper) {
                // call the validator for this cell value;
                const { error } = validateCellMapping(mapper, props.data.label);
                let errorMessage = undefined;
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
                        : (props.data.originalLabel ?? 'Empty') + ' >> ' + (props.data.label ?? 'Empty')
                    : 'ERROR:' +
                      errorMessage +
                      '  (' +
                      (props.data.label ?? 'Empty') +
                      ') >> original label: ' +
                      (props.data.originalLabel ?? 'Empty')}
                {props.data.label !== props.data.originalLabel && (
                    <div className="text-center">
                        <Button size="sm" onClick={cellUndoChange} style={{ padding: '4px 8px' }}>
                            <Icon size="sm" icon={faUndo} /> Undo
                        </Button>
                    </div>
                )}
            </>
        ) : (
            <>
                {props.data.label === props.data.originalLabel ? props.data.label : props.data.originalLabel + ' >> ' + props.data.label}
                {props.data.label !== props.data.originalLabel && (
                    <div className="text-center">
                        <Button size="sm" onClick={cellUndoChange} style={{ padding: '4px 8px' }}>
                            <Icon size="sm" icon={faUndo} /> Undo
                        </Button>
                    </div>
                )}
            </>
        )
    ) : null;

    return (
        <>
            {(props.type === 'value' || props.type === 'property' || props.type === 'contribution') && (
                <Tippy singleton={props.tippyTarget} content={tippyContent}>
                    <TippyContainer>
                        {/*PROPERTY LABELS */}
                        {props.type === 'property' && renderingItem === 'text' && (
                            <PropertyCellEditor
                                className="noselect"
                                onDoubleClick={() => {
                                    cellValueDoubleClicked();
                                }}
                            >
                                {props.data.label}
                            </PropertyCellEditor>
                        )}
                        {props.type === 'property' && renderingItem === 'input' && (
                            <PropertyCellInput
                                autoFocus={true}
                                value={cellLabelValue}
                                onChange={cellValueChanged}
                                innerRef={inputRefs}
                                onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                onBlur={e => {
                                    props.data.setLabel(cellLabelValue);
                                    props.tippySource.data.instance.enable();
                                    setRenderingItem('text');
                                }}
                                onFocus={
                                    e => {
                                        e.target.select();
                                    } // Highlights the entire label when edit
                                }
                            />
                        )}
                        {/*CONTRIBUTION LABELS */}
                        {props.type === 'contribution' && renderingItem === 'text' && (
                            <ContributionCell
                                className="noselect"
                                onDoubleClick={() => {
                                    cellValueDoubleClicked();
                                }}
                            >
                                {props.data.label}
                            </ContributionCell>
                        )}
                        {props.type === 'contribution' && renderingItem === 'input' && (
                            <ContributionCellInput
                                autoFocus={true}
                                value={cellLabelValue}
                                onChange={cellValueChanged}
                                innerRef={inputRefs}
                                onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                onBlur={e => {
                                    props.data.setLabel(cellLabelValue);
                                    props.tippySource.data.instance.enable();
                                    setRenderingItem('text');
                                }}
                                onFocus={
                                    e => {
                                        e.target.select();
                                    } // Highlights the entire label when edit
                                }
                            />
                        )}
                        {/*CELL VALUE LABELS */}
                        {props.type === 'value' && renderingItem === 'text' && (
                            <ValueCellValidator
                                className="noselect"
                                isValid={cellValueIsValid}
                                onDoubleClick={() => {
                                    cellValueDoubleClicked();
                                }}
                            >
                                {props.data.label}
                            </ValueCellValidator>
                        )}
                        {props.type === 'value' && renderingItem === 'input' && (
                            <ValueCellInput
                                autoFocus={true}
                                value={cellLabelValue}
                                onChange={cellValueChanged}
                                innerRef={inputRefs}
                                onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                onBlur={e => {
                                    props.data.setLabel(cellLabelValue);
                                    props.tippySource.data.instance.enable();
                                    setRenderingItem('text');
                                }}
                                onFocus={
                                    e => {
                                        e.target.select();
                                    } // Highlights the entire label when edit
                                }
                            />
                        )}
                    </TippyContainer>
                </Tippy>
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
    tippyTarget: PropTypes.object,
    tippySource: PropTypes.object
};

export default CellVE;
