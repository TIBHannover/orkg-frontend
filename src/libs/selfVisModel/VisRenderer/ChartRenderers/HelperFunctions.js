import React from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

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
        yAxisIntervals: ref.state.yAxisInterValSelectors
    };
};

const addYAxisInterval = (ref, id) => {
    const yAxisIntervals = ref.state.yAxisInterValSelectors;
    if (!yAxisIntervals[id]) {
        // we have now an array of intervals
        yAxisIntervals[id] = [];
    }

    yAxisIntervals[id].push({ isOpen: false, label: 'Select interval property' });
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
    extended.unshift({ label: 'Select interval property' });

    const itemsArray = extended.map((pvc, pvc_id) => {
        return (
            <DropdownItem
                key={'N_XSelectionDropdownItemIndexKey_' + id + '_' + interval_id + '_' + pvc_id}
                onClick={() => {
                    const intervalSelectors = ref.state.yAxisInterValSelectors;
                    intervalSelectors[id][interval_id].label = pvc.label;
                    ref.setState({ yAxisInterValSelectors: intervalSelectors });
                }}
            >
                {pvc.label}
            </DropdownItem>
        );
    });

    const isItemOpen = ref.state.yAxisInterValSelectors[id][interval_id].isOpen;
    return (
        <Dropdown
            color="darkblue"
            size="sm"
            style={{
                marginLeft: '10px',
                marginBottom: '5px',
                flexGrow: '1',
                display: 'flex',
                height: 'min-content',
                paddingTop: '-5px',
                width: '80px'
            }}
            isOpen={isItemOpen}
            toggle={() => {
                const yAxisSelectorOpen = ref.state.yAxisInterValSelectors;

                yAxisSelectorOpen[id][interval_id].isOpen = !yAxisSelectorOpen[id][interval_id].isOpen;
                ref.setState({
                    yAxisInterValSelectors: yAxisSelectorOpen
                });
            }}
        >
            <DropdownToggle caret color="darkblue">
                {ref.state.yAxisInterValSelectors[id][interval_id].label}
            </DropdownToggle>
            <DropdownMenu>{itemsArray}</DropdownMenu>
        </Dropdown>
    );
};

const createIntervalSelectors = (ref, id, possibleValueCandidates) => {
    const yAxisIntervals = ref.state.yAxisInterValSelectors[id];

    if (yAxisIntervals && yAxisIntervals.length > 0) {
        return yAxisIntervals.map((interval, interval_id) => {
            return (
                <div key={'IntervalKey_' + interval_id} className="d-flex" style={{ marginLeft: '35px', paddingBottom: '5px' }}>
                    {' '}
                    <IconWrapper>
                        <DeleteIcon
                            icon={faTrash}
                            onClick={() => {
                                removeInterval(id, interval_id, ref);
                            }}
                        />
                    </IconWrapper>{' '}
                    Interval_{interval_id}
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
                            ref.setState({ yAxisSelector: yAxisSelector });
                        }}
                    >
                        {item.label}
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
                <div key={'ContainerValueItemSelector_' + id}>
                    <div style={{ display: 'flex' }} key={'ValueItemSelector_' + id}>
                        {id > 0 && (
                            <IconWrapper>
                                <DeleteIcon
                                    icon={faTrash}
                                    onClick={() => {
                                        removeSelector(id, ref);
                                    }}
                                />
                            </IconWrapper>
                        )}
                        <Dropdown
                            color="darkblue"
                            size="sm"
                            //    className='mb-4 mt-4'
                            style={{
                                marginLeft: '10px',
                                marginBottom: '5px',
                                flexGrow: '1',
                                display: 'flex',
                                height: 'min-content',
                                paddingTop: '-5px',
                                width: '150px'
                            }}
                            isOpen={ref.state.yAxisSelectorOpen[id]}
                            toggle={() => {
                                const yAxisSelectorOpen = ref.state.yAxisSelectorOpen;
                                yAxisSelectorOpen[id] = !yAxisSelectorOpen[id];
                                ref.setState({
                                    yAxisSelectorOpen: yAxisSelectorOpen
                                });
                            }}
                        >
                            <DropdownToggle caret color="darkblue">
                                {ref.state.yAxisSelector[id] ? ref.state.yAxisSelector[id] : possibleValueCandidates[0].label}
                            </DropdownToggle>
                            <DropdownMenu>{itemsArray[id]}</DropdownMenu>
                        </Dropdown>
                        {possibleValueCandidates.length > 1 &&
                            (!ref.state.yAxisInterValSelectors[id] ||
                                (ref.state.yAxisInterValSelectors[id] &&
                                    ref.state.yAxisInterValSelectors[id].length < possibleValueCandidates.length)) && (
                                <Button
                                    size="sm"
                                    style={{ marginLeft: '5px', padding: '3px', height: ' 32px', minWidth: '82px' }}
                                    onClick={() => {
                                        addYAxisInterval(ref, id);
                                    }}
                                >
                                    Add Interval
                                </Button>
                            )}
                    </div>
                    <div>{createIntervalSelectors(ref, id, possibleValueCandidates)}</div>
                </div>
            );
        });
    }
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
                        ref.setState({ xAxisSelector: item.label });
                    }}
                >
                    {item.label}
                </DropdownItem>
            );
        });

        if (!ref.state.xAxisSelector) {
            ref.cachedXAxisSelector = { xAxisSelector: possibleLabelCandidates[0].label };
        }
        return (
            <Dropdown
                color="darkblue"
                size="sm"
                //    className='mb-4 mt-4'
                style={{
                    marginLeft: '10px',
                    marginBottom: '5px',
                    flexGrow: '1',
                    display: 'flex',
                    height: 'min-content',
                    paddingTop: '-5px',
                    width: '150px'
                }}
                isOpen={ref.state.xAxisSelectorOpen}
                toggle={() => {
                    ref.setState({
                        xAxisSelectorOpen: !ref.state.xAxisSelectorOpen
                    });
                }}
            >
                <DropdownToggle caret color="darkblue">
                    {ref.state.xAxisSelector ? ref.state.xAxisSelector : possibleLabelCandidates[0].label}
                </DropdownToggle>
                <DropdownMenu>{items}</DropdownMenu>
            </Dropdown>
        );
    }
};

const IconWrapper = styled.span`
    cursor: pointer;
    display: inline-block;
    padding: 0 10px;
    margin-left: -32px;
`;

const DeleteIcon = styled(Icon)`
    color: #f87474;
`;
