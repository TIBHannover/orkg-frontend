import React from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Tippy from '@tippyjs/react';

const DeleteButton = styled(Button)`
    &&& {
        margin: 0 10px 0 0;
        padding: 0;
        color: #f87474;
    }
`;

export const isMounted = ref => {
    if (ref.props.propagateUpdates) {
        if (ref.props.restoreCustomizationState === true) {
            const prevState = ref.selfVisModel.loadCustomizationState();
            if (prevState && prevState.xAxisSelector !== undefined && prevState.yAxisSelector.length !== 0) {
                ref.setState({ ...ref.selfVisModel.loadCustomizationState() });
                ref.props.propagateUpdates({ xAxis: prevState.xAxisSelector, yAxis: prevState.yAxisSelector });
            } else {
                if (ref.cachedXAxisSelector && ref.cachedYAxisSelector) {
                    const newState = { ...ref.cachedXAxisSelector, ...ref.cachedYAxisSelector };
                    if (ref.state.xAxisSelector === undefined || ref.state.yAxisSelector.length === 0) {
                        ref.setState(newState, () => {
                            ref.props.propagateUpdates(getSelectorsState(ref));
                        });
                    }
                }
            }
        } else {
            ref.props.propagateUpdates(getSelectorsState(ref));
        }
    }
};

const removeSelector = (id, ref) => {
    const ySelectors = ref.state.yAxisSelector;
    const yAxisIntervals = ref.state.yAxisInterValSelectors;
    if (yAxisIntervals[id]) {
        yAxisIntervals[id] = [];
    }
    ySelectors.splice(id, 1);
    ref.setState({ ySelectors: ySelectors, yAxisSelectorCount: ref.state.yAxisSelectorCount - 1, yAxisIntervals: yAxisIntervals });
};

export const getSelectorsState = ref => {
    return {
        xAxis: ref.state.xAxisSelector,
        yAxis: ref.state.yAxisSelector,
        yAxisIntervals: ref.state.yAxisInterValSelectors,
        xAxisLabel: ref.state.xAxisLabel,
        yAxisLabel: ref.state.yAxisLabel
    };
};

const addYAxisInterval = (ref, id) => {
    const yAxisIntervals = ref.state.yAxisInterValSelectors;
    if (!yAxisIntervals[id]) {
        // we have now an array of intervals
        yAxisIntervals[id] = [];
    }

    yAxisIntervals[id].push({ isOpen: false, label: 'Select interval' });
    ref.setState({ yAxisIntervals: yAxisIntervals });
};

const removeInterval = (id, intervalId, ref) => {
    const yAxisIntervals = ref.state.yAxisInterValSelectors;
    const subInterval = yAxisIntervals[id];
    subInterval.splice(intervalId, 1);
    yAxisIntervals[id] = subInterval;
    ref.setState({ yAxisInterValSelectors: yAxisIntervals });
};

const createIntervalDropDownSelectors = (ref, id, interval_id, possibleValueCandidates) => {
    const extended = [...possibleValueCandidates];
    extended.unshift({ label: 'Select interval' });

    const itemsArray = extended.map((pvc, pvc_id) => {
        return (
            <DropdownItem
                className="text-truncate mw-100"
                key={'N_XSelectionDropdownItemIndexKey_' + id + '_' + interval_id + '_' + pvc_id}
                onClick={() => {
                    const intervalSelectors = ref.state.yAxisInterValSelectors;
                    intervalSelectors[id][interval_id].label = pvc.label;
                    ref.setState({ yAxisInterValSelectors: intervalSelectors });
                }}
            >
                {/*qnd text length handler */}

                <Tippy content={pvc.label} placement="right" disabled={pvc.label.length < 30}>
                    <span
                        className="d-inline-block"
                        style={{
                            maxWidth: '220px',
                            overflow: 'hidden',
                            lineHeight: '1.5',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {pvc.label}
                    </span>
                </Tippy>
            </DropdownItem>
        );
    });

    const isItemOpen = ref.state.yAxisInterValSelectors[id][interval_id].isOpen;
    return (
        <Dropdown
            size="sm"
            className="mt-1"
            isOpen={isItemOpen}
            toggle={() => {
                const yAxisSelectorOpen = ref.state.yAxisInterValSelectors;

                yAxisSelectorOpen[id][interval_id].isOpen = !yAxisSelectorOpen[id][interval_id].isOpen;
                ref.setState({
                    yAxisInterValSelectors: yAxisSelectorOpen
                });
            }}
        >
            <TippyDropdownToggle caret color="darkblue" className="text-truncate mw-100">
                <Tippy
                    content={ref.state.yAxisInterValSelectors[id][interval_id].label}
                    placement="right"
                    disabled={ref.state.yAxisInterValSelectors[id][interval_id].label.length < 30}
                >
                    <span
                        className="d-inline-block"
                        style={{
                            maxWidth: '150px',
                            overflow: 'hidden',
                            lineHeight: '1.5',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {ref.state.yAxisInterValSelectors[id][interval_id].label}
                    </span>
                </Tippy>
            </TippyDropdownToggle>
            <DropdownMenu>{itemsArray}</DropdownMenu>
        </Dropdown>
    );
};

const createIntervalSelectors = (ref, id, possibleValueCandidates) => {
    const yAxisIntervals = ref.state.yAxisInterValSelectors[id];

    if (yAxisIntervals && yAxisIntervals.length > 0) {
        return yAxisIntervals.map((interval, interval_id) => {
            return (
                <div key={'IntervalKey_' + interval_id} className="ml-4 mt-1">
                    {' '}
                    <DeleteButton
                        color="link"
                        onClick={() => {
                            removeInterval(id, interval_id, ref);
                        }}
                    >
                        <Icon icon={faTrash} />
                    </DeleteButton>
                    Interval {interval_id}
                    {createIntervalDropDownSelectors(ref, id, interval_id, possibleValueCandidates)}
                </div>
            );
        });
    }
};

export const createValueSelectors = ref => {
    const selectedPropertyAnchors = ref.selfVisModel.mrrModel.propertyAnchors.filter(item => item.isSelectedColumn() === true);
    const possibleValueCandidates = selectedPropertyAnchors.filter(item => item.propertyMapperType === 'Number');
    if (possibleValueCandidates.length === 0) {
        ref.setErrorCode(1);
    } else {
        if (ref.yAxisSelectorMaxCount === -1) {
            ref.yAxisSelectorMaxCount = possibleValueCandidates.length;
        }
        const itemsArray = [];
        for (let i = 0; i < ref.state.yAxisSelectorCount; i++) {
            const items = possibleValueCandidates.map((item, id) => {
                return (
                    <DropdownItem
                        key={'XSelectionDropdownItemIndexKey_' + id}
                        onClick={() => {
                            const yAxisSelector = ref.state.yAxisSelector;
                            yAxisSelector[i] = item.label;
                            if (i !== 0) {
                                ref.setState({ yAxisSelector: yAxisSelector });
                            } else {
                                ref.setState({ yAxisSelector: yAxisSelector, yAxisLabel: item.label });
                            }
                        }}
                    >
                        <Tippy content={item.label} placement="right" disabled={item.label.length < 30}>
                            <span
                                className="d-inline-block"
                                style={{
                                    maxWidth: '220px',
                                    overflow: 'hidden',
                                    lineHeight: '1.5',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {item.label}
                            </span>
                        </Tippy>
                    </DropdownItem>
                );
            });
            itemsArray.push(items);
        }
        // initialize yAxisSelectors;
        if (ref.state.yAxisSelector.length === 0) {
            const possibleSelectors = [];
            for (let i = 0; i < ref.state.yAxisSelectorCount; i++) {
                possibleSelectors.push(possibleValueCandidates[0].label);
            }
            ref.cachedYAxisSelector = { yAxisSelector: possibleSelectors };
        }

        return itemsArray.map((selector, id) => {
            return (
                <div className="mt-2 mb-1" key={'ContainerValueItemSelector_' + id}>
                    <div style={{ display: 'flex' }} key={'ValueItemSelector_' + id}>
                        {id > 0 && (
                            <DeleteButton
                                color="link"
                                onClick={() => {
                                    removeSelector(id, ref);
                                }}
                            >
                                <Icon icon={faTrash} />
                            </DeleteButton>
                        )}
                        <Dropdown
                            size="sm"
                            isOpen={ref.state.yAxisSelectorOpen[id]}
                            toggle={() => {
                                const yAxisSelectorOpen = ref.state.yAxisSelectorOpen;
                                yAxisSelectorOpen[id] = !yAxisSelectorOpen[id];
                                ref.setState({
                                    yAxisSelectorOpen: yAxisSelectorOpen
                                });
                            }}
                        >
                            <TippyDropdownToggle caret color="darkblue" className="text-truncate mw-100 ">
                                <Tippy
                                    content={ref.state.yAxisSelector[id] ? ref.state.yAxisSelector[id] : possibleValueCandidates[0].label}
                                    placement="right"
                                    disabled={
                                        ref.state.yAxisSelector[id]
                                            ? ref.state.yAxisSelector[id].length < 30
                                            : possibleValueCandidates[0].label.length < 30
                                    }
                                >
                                    <span
                                        className="d-inline-block"
                                        style={{
                                            maxWidth: '150px',
                                            overflow: 'hidden',
                                            lineHeight: '1.5',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis'
                                        }}
                                    >
                                        {ref.state.yAxisSelector[id] ? ref.state.yAxisSelector[id] : possibleValueCandidates[0].label}
                                    </span>
                                </Tippy>
                            </TippyDropdownToggle>
                            <DropdownMenu>{itemsArray[id]}</DropdownMenu>
                        </Dropdown>
                        {possibleValueCandidates.length > 1 &&
                            (!ref.state.yAxisInterValSelectors[id] ||
                                (ref.state.yAxisInterValSelectors[id] &&
                                    ref.state.yAxisInterValSelectors[id].length < possibleValueCandidates.length)) && (
                                <Tippy content="Add interval">
                                    <span>
                                        <Button
                                            size="sm"
                                            color="primary"
                                            className="px-2 ml-2"
                                            //style={{ marginLeft: '5px', padding: '3px', height: ' 32px', minWidth: '82px' }}
                                            onClick={() => {
                                                addYAxisInterval(ref, id);
                                            }}
                                        >
                                            <Icon icon={faPlus} />
                                        </Button>
                                    </span>
                                </Tippy>
                            )}
                    </div>
                    <div className="mt-2">{createIntervalSelectors(ref, id, possibleValueCandidates)}</div>
                    <hr />
                </div>
            );
        });
    }
};

// export const createValueEditor = ref => {
//     const label = ref.state.yAxisLabel;
//     const chached = ref.state.cachedXAxisSelector;
//
//     return createEditorForAxis(label, cached);
//
//     let initValue = '';
//     if (ref.state.yAxisLabel === null) {
//         if (ref && ref.state.yAxisLabel && ref.state.yAxisLabel.length > 0) {
//             initValue = ref.state.yAxisLabel;
//         }
//         if (initValue.length === 0) {
//             initValue = ref.cachedXAxisSelector.yAxisSelector;
//         }
//     }
//     return (
//         <Input
//             value={ref.state.yAxisLabel ? ref.state.yAxisLabel : initValue}
//             onChange={event => {
//                 ref.setState({
//                     yAxisLabel: event.target.value
//                 });
//             }}
//         />
//     );
// };

export const createLabelEditor = ref => {
    let initValue = '';
    if (ref.state.xAxisLabel === undefined) {
        if (ref.cachedXAxisSelector) {
            initValue = ref.cachedXAxisSelector.xAxisSelector ? ref.cachedXAxisSelector.xAxisSelector : '';
        }
    }
    return (
        <Input
            value={ref.state.xAxisLabel ? ref.state.xAxisLabel : initValue}
            onChange={event => {
                ref.setState({
                    xAxisLabel: event.target.value
                });
            }}
        />
    );
};
//
export const createValueEditor = ref => {
    let initValue = '';
    if (ref.state.yAxisLabel === undefined) {
        if (ref.yAxisSelector) {
            initValue = ref.yAxisSelector[0] ? ref.yAxisSelector[0] : '';
        }
        if (!ref.yAxisSelector) {
            if (ref.cachedYAxisSelector) {
                initValue = ref.cachedYAxisSelector.yAxisSelector[0] ? ref.cachedYAxisSelector.yAxisSelector[0] : '';
            }
        }
    }

    return (
        <Input
            value={ref.state.yAxisLabel ? ref.state.yAxisLabel : initValue}
            onChange={event => {
                ref.setState({
                    yAxisLabel: event.target.value
                });
            }}
        />
    );
};

export const createLabelSelectors = ref => {
    // we get the default selection from the model;
    // find properties that map to strings;
    const selectedPropertyAnchors = ref.selfVisModel.mrrModel.propertyAnchors.filter(item => item.isSelectedColumn() === true);
    const possibleLabelCandidates = selectedPropertyAnchors.filter(
        item => item.propertyMapperType === 'String' || item.propertyMapperType === 'Date'
    );
    possibleLabelCandidates.unshift({ label: 'Contribution' });

    if (possibleLabelCandidates.length === 0) {
        ref.setErrorCode(0);
    } else {
        const items = possibleLabelCandidates.map((item, id) => {
            return (
                <DropdownItem
                    key={'XSelectionDropdownItemIndexKey_' + id}
                    onClick={() => {
                        ref.setState({ xAxisSelector: item.label, xAxisLabel: item.label });
                    }}
                >
                    <Tippy content={item.label} placement="right" disabled={item.label.length < 30}>
                        <span
                            className="d-inline-block"
                            style={{
                                maxWidth: '150px',
                                overflow: 'hidden',
                                lineHeight: '1.5',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {item.label}
                        </span>
                    </Tippy>
                </DropdownItem>
            );
        });

        if (!ref.state.xAxisSelector) {
            ref.cachedXAxisSelector = { xAxisSelector: possibleLabelCandidates[0].label };
        }
        return (
            <Dropdown
                size="sm"
                className="mt-1"
                isOpen={ref.state.xAxisSelectorOpen}
                toggle={() => {
                    ref.setState({
                        xAxisSelectorOpen: !ref.state.xAxisSelectorOpen
                    });
                }}
            >
                <TippyDropdownToggle caret color="darkblue" className="text-truncate mw-100">
                    <Tippy
                        content={ref.state.xAxisSelector ? ref.state.xAxisSelector : possibleLabelCandidates[0].label}
                        placement="right"
                        disabled={ref.state.xAxisSelector ? ref.state.xAxisSelector.length < 30 : possibleLabelCandidates[0].label.length < 30}
                    >
                        <span
                            className="d-inline-block"
                            style={{
                                maxWidth: '150px',
                                overflow: 'hidden',
                                lineHeight: '1.5',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {ref.state.xAxisSelector ? ref.state.xAxisSelector : possibleLabelCandidates[0].label}
                        </span>
                    </Tippy>
                </TippyDropdownToggle>
                <DropdownMenu>{items}</DropdownMenu>
            </Dropdown>
        );
    }
};

// some adjustments for caret position with tippy
const TippyDropdownToggle = styled(DropdownToggle)`
    ::after {
        vertical-align: 0.555em !important;
    }
`;
