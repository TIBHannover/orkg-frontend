import { Component } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCrosshairs, faEye, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './locateNodeIcon.css';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Input } from 'reactstrap';

class SearchAutoComplete extends Component {
    constructor(props) {
        super(props);
        this.state.value = '';
        this.maxResults = 100;
        this.maxNumberOfResults = 5; // show only the best matching items;
        this.dictionary = ['exampleA', 'exampleB', 'test', 'test123'];
        this.placeHolder = props.placeHolder;
        this.locateTitleActive = 'Locate node in graph';
        this.locateTitleDisabled = 'There is no node in graph matching the search string';
        this.cursor = -1;
        this.searchEntries = [];
        this.ignoreToggle = false;
        this.searchResultIsEmpty = true;
        this.lookupTable = [];
        this.lookupIDTable = [];
        this.props.graphVis.clearSearchEntryValue = this.clearSearchEntryValue; // binding to the graph (node clicked)
        this.updateDictionary();
    }
    state = {
        selectedItemId: null,
        inputValue: '',
        dropdownMenuOpen: false,
        textFocused: false,
        activeTargetButton: false,
        loadingIndicatorForBlackOps: false,
        updateFlip: false,
        locateClass: 'mr-1 align-self-center locateDisabled',
        locateTitle: 'Nothing to locate'
    };

    componentDidUpdate = (prevProps, prevState) => {
        if (prevState.activeTargetButton !== this.state.activeTargetButton) {
            this.setState({
                locateClass: this.state.activeTargetButton ? 'mr-1 align-self-center locateActive' : 'mr-1 align-self-center locateDisabled',
                locateTitle: this.state.activeTargetButton ? this.locateTitleActive : this.locateTitleDisabled
            });
        }

        // handling on focus dropdown menu (does not like to show when we dont look for the textFocus Flag)
        if (this.state.textFocused && !this.state.dropdownMenuOpen) {
            this.setState({ dropdownMenuOpen: true, textFocused: false });
        }
    };

    handleKeyDown = async event => {
        // reset the cursor when user types
        if (event.keyCode !== 38 && event.keyCode !== 40 && event.keyCode !== 13) {
            this.cursor = -1;
            return;
        }
        // update maxValue
        let maxValue = this.searchEntries.length - 2;
        if (this.searchResultIsEmpty) {
            maxValue = 0;
        }
        if (this.props.graphVis.graphFullyExplored) {
            maxValue = this.searchEntries.length - 1;
        }

        // handle arrowKey UP and DOWN
        if (event.keyCode === 38 && this.cursor > 0) {
            this.cursor -= 1; // decrease
            this.lookupValue(this.state.value); // redraw entries with correct styles
        } else if (event.keyCode === 40 && this.cursor < maxValue) {
            this.cursor += 1; // increase
            this.lookupValue(this.state.value); // redraw entries with correct styles
        }
        // handle Enter key
        if (event.keyCode === 13) {
            // loading full graph
            if (typeof this.onEnterPressedIds === 'string') {
                this.ignoreToggle = true;
                // make the loading icon visible again
                document.getElementById('fullExploreSpinIcon').classList.remove('hidden');
                this.setState({ dropdownMenuOpen: true, loadingIndicatorForBlackOps: true });
                this.props.graphVis.blackOpsSearch().then(() => {
                    this.lookupValue(this.state.value);
                    this.ignoreToggle = false;
                });
            } else {
                if (this.onEnterPressedIds) {
                    // handle on enter key when selecting a searchEntry
                    if (this.onEnterPressedIds.visible === 0) {
                        // none visible, expand them!
                        await this.props.graphVis.expandNodesForHaloVis(this.onEnterPressedIds.nodeId);
                        this.props.graphVis.layout.pauseForceLayoutAnimation(false);
                    }

                    // update State and run haloVis
                    this.setState({
                        activeTargetButton: true,
                        value: this.onEnterPressedIds.label,
                        updateFlip: !this.state.updateFlip,
                        dropdownMenuOpen: !this.state.dropdownMenuOpen
                    });
                    this.props.graphVis.haloVisForNodes(this.onEnterPressedIds.nodeId);
                }
            }
        }
    };

    handleChange = event => {
        this.setState({ value: event.target.value, updateFlip: !this.state.updateFlip });
        // look up in dictionary
        if (event.target.value.length === 0) {
            this.props.graphVis.removeHalos();
        }
        this.lookupValue(event.target.value);
    };

    mouseEntered = event => {
        if (this.state.value.length > 0) {
            this.lookupValue(event.target.value);
            this.setState({ dropdownMenuOpen: true, textFocused: true });
        }
    };

    updateDictionary = () => {
        this.dictionary = this.props.graphVis.getDictionary();
        this.lookupTable = [];
        this.lookupIDTable = [];
        this.dictionary.forEach(item => {
            if (item.text.length > 0) {
                let someId = this.lookupTable.indexOf(item.text);
                if (someId === -1) {
                    this.lookupTable.push(item.text);
                }
                someId = this.lookupTable.indexOf(item.text);
                if (!this.lookupIDTable[someId]) {
                    this.lookupIDTable[someId] = [];
                }
                this.lookupIDTable[someId].push(item.nodeId);
            }
        });
    };

    clearSearchEntryValue = () => {
        this.setState({ value: '' });
        this.lookupValue('');
    };

    lookupValue = searchString => {
        this.searchEntries = [];

        if (searchString.length === 0) {
            this.setState({ dropdownMenuOpen: false, activeTargetButton: false });
            return;
        }

        const lc_text = searchString.toLowerCase();
        const copyResults = [...this.lookupTable];
        const newResults = [];
        const newResultsIds = [];
        const visibleResultsId = [];

        // restrict the number for the selection (best 5)
        let numEntries = copyResults.length;
        if (numEntries > this.maxNumberOfResults) {
            numEntries = this.maxNumberOfResults;
        }
        for (let i = 0; i < numEntries; i++) {
            newResultsIds.push([]);
            visibleResultsId.push([]);
        }

        for (let i = 0; i < numEntries; i++) {
            let indexElement = 1000000;
            let lengthElement = 1000000;
            let bestElement = -1;
            for (let j = 0; j < copyResults.length; j++) {
                const token = copyResults[j].toLowerCase();
                const tIe = token.indexOf(lc_text);
                const tLe = token.length;
                if (tIe > -1 && tIe <= indexElement && tLe <= lengthElement) {
                    bestElement = j;
                    indexElement = tIe;
                    lengthElement = tLe;
                }
            }
            newResults.push(copyResults[bestElement]);
            newResultsIds[newResults.indexOf(copyResults[bestElement])] = this.lookupIDTable[bestElement];
            visibleResultsId[newResults.indexOf(copyResults[bestElement])] = this.props.graphVis.countVisibleProps(this.lookupIDTable[bestElement]);
            copyResults[bestElement] = '';
        }

        // count the number of real found values;
        const foundElements = [];
        for (let it = 0; it < newResults.length; it++) {
            const val = newResults[it];
            if (!val || val.length === 0) {
                continue;
            }
            foundElements.push({ label: newResults[it], nodeId: newResultsIds[it], visible: visibleResultsId[it] });
        }

        if (foundElements.length > 0) {
            this.searchResultIsEmpty = false;
            // create search items
            this.searchEntries = [
                <DropdownItem key={'searchDropdownItem' + searchString} header className="d-flex">
                    <div className="flex-shrink-0">Result</div>
                    <div className="flex-shrink-0" style={{ marginLeft: 'auto', fontSize: 'small' }}>
                        Visible/Total
                    </div>
                </DropdownItem>,
                ...foundElements.map((item, i) => {
                    let croppedText = '';
                    if (item.label.length > 20) {
                        croppedText = '...';
                    }
                    const finalItemLabel = item.label.substring(0, 20) + croppedText;
                    let expandIconClassNames = 'mr-1 align-self-center inSearchExpandIcon';
                    const expandIconDisabled = item.visible === item.nodeId.length;
                    if (expandIconDisabled) {
                        expandIconClassNames = 'mr-1 align-self-center inSearchExpandIconDisabled';
                    }

                    // helper function
                    function callHaloVis(param, parent) {
                        parent.setState({ activeTargetButton: true });
                        parent.setState({ value: item.label });
                        parent.setState({ updateFlip: !parent.state.updateFlip });
                        parent.props.graphVis.haloVisForNodes(item.nodeId);
                    }
                    async function callExpandHaloVis(param, parent) {
                        await parent.props.graphVis.expandNodesForHaloVis(item.nodeId);
                        // >> tell the graph to do the halo stuff;
                        parent.setState({ activeTargetButton: true });
                        parent.setState({ value: item.label });
                        parent.setState({ updateFlip: !parent.state.updateFlip });
                        parent.props.graphVis.haloVisForNodes(item.nodeId);
                    }

                    if (this.cursor === i) {
                        // select the item that will be triggered on enter key
                        this.onEnterPressedIds = item;
                    }
                    return (
                        <DropdownItem
                            onClick={event => {
                                this.handleDropdownItemClick(false, event, expandIconDisabled, item.visible, callHaloVis, callExpandHaloVis, this);
                            }}
                            key={'selectionX' + item.nodeId}
                            value={item.label}
                            nodelabel={item.label}
                            nodeid={item.nodeId}
                            className="dropdownDefault"
                            style={{ backgroundColor: this.cursor === i ? '#e9e9e9' : '#ffffff' }}
                        >
                            <div style={{ display: 'flex' }}>
                                <Icon
                                    title="View node in graph"
                                    disabled={item.visible === item.nodeId.length}
                                    className={expandIconClassNames}
                                    icon={faEye}
                                    onClick={event => {
                                        this.handleDropdownItemClick(
                                            true,
                                            event,
                                            expandIconDisabled,
                                            item.visible,
                                            callHaloVis,
                                            callExpandHaloVis,
                                            this
                                        );
                                    }}
                                />
                                <div
                                    onClick={event => {
                                        this.handleDropdownItemClick(
                                            false,
                                            event,
                                            expandIconDisabled,
                                            item.visible,
                                            callHaloVis,
                                            callExpandHaloVis,
                                            this
                                        );
                                    }}
                                    onKeyDown={e =>
                                        e.keyCode === 13
                                            ? this.handleDropdownItemClick(
                                                  false,
                                                  e,
                                                  expandIconDisabled,
                                                  item.visible,
                                                  callHaloVis,
                                                  callExpandHaloVis,
                                                  this
                                              )
                                            : undefined
                                    }
                                    role="button"
                                    tabIndex={0}
                                >
                                    {finalItemLabel}
                                </div>
                                <div className="flex-shrink-0" style={{ marginLeft: 'auto', fontSize: 'small' }}>
                                    {`(${item.visible}/${item.nodeId.length})`}
                                </div>
                            </div>
                        </DropdownItem>
                    );
                })
            ];

            // if graph is not fully explored add the explore button
            if (!this.props.graphVis.graphFullyExplored) {
                if (this.cursor === this.searchEntries.length) {
                    this.onEnterPressedIds = 'blackOpsSearch';
                }
                // add divider and the full search entry
                this.searchEntries.push(<DropdownItem key="notFoundResultDivider" divider={true} />);
                this.searchEntries.push(this.createFullSearchDropdownItem(searchString));
            }
        } else {
            //create a dropdown entry to tell that there is no result (check if expanded, then provide user with option
            // to expand and until entry is found.
            this.searchResultIsEmpty = true;
            this.onEnterPressedIds = null;

            this.searchEntries.push(this.createNoResultFoundItem());
            // add the expand all and retry button;
            if (!this.props.graphVis.graphFullyExplored) {
                this.searchEntries.push(<DropdownItem key="notFoundResultDivider" divider={true} />);
                // add load full graph data an try again
                if (this.cursor === this.searchEntries.length - 2) {
                    this.onEnterPressedIds = 'blackOpsSearch';
                }
                this.searchEntries.push(this.createFullSearchDropdownItem(searchString, true));
            }
        }
        this.setState({ dropdownMenuOpen: true });
    };

    handleDropdownItemClick = (clickedOnIcon, event, iconDisabled, visibleItems, _haloVis, _expandHaloVis, parent) => {
        event.preventDefault();
        if (clickedOnIcon) {
            if (iconDisabled) {
                _haloVis(event, parent);
            } else {
                _expandHaloVis(event, parent).then(() => {
                    this.props.graphVis.layout.pauseForceLayoutAnimation(false);
                });
            }
        } else {
            if (visibleItems === 0) {
                // do the explorer thing;
                _expandHaloVis(event, parent).then(() => {
                    this.props.graphVis.layout.pauseForceLayoutAnimation(false);
                });
            } else {
                _haloVis(event, parent);
            }
        }
    };

    createNoResultFoundItem = () => {
        const textForNoResult = 'No result found';
        return (
            <DropdownItem key="noResultFoundItem" disabled={true} value={textForNoResult}>
                <div style={{ display: 'flex' }}>{textForNoResult}</div>
            </DropdownItem>
        );
    };

    createFullSearchDropdownItem = (searchString, noResult) => {
        // adjust index for the counter!
        let offset = -1;
        if (noResult) {
            offset = -2;
        }
        const itemId = this.searchEntries.length + offset;
        return (
            <DropdownItem
                className="dropdownDefault"
                style={{ backgroundColor: this.cursor === itemId ? '#e9e9e9' : '#FFFFFF' }}
                onClick={event => {
                    event.preventDefault();
                    event.target.disabled = true;
                    this.ignoreToggle = true;
                    // make the loading icon visible again
                    document.getElementById('fullExploreSpinIcon').classList.remove('hidden');
                    this.setState({ dropdownMenuOpen: true, loadingIndicatorForBlackOps: true });
                    this.props.graphVis.blackOpsSearch().then(() => {
                        this.lookupValue(searchString);
                        this.setState({ updateFlip: !this.state.updateFlip });
                        this.ignoreToggle = false;
                    });
                }}
                key="loadFullGraph"
            >
                <Icon id="fullExploreSpinIcon" icon={faSpinner} className="mr-1 align-self-center hidden" spin />
                Load full graph and try again
            </DropdownItem>
        );
    };

    toggleFunction = () => {
        if (!this.ignoreToggle) {
            this.setState({ dropdownMenuOpen: !this.state.dropdownMenuOpen });
        }
    };

    render() {
        return (
            <div className="ml-2" style={{ paddingTop: '5px', display: 'flex', position: 'relative', left: '-20px' }}>
                <Input
                    bsSize="sm"
                    type="text"
                    style={{ paddingRight: '30px' }}
                    placeholder={this.props.placeHolder}
                    value={this.state.value}
                    onChange={this.handleChange}
                    onFocus={this.mouseEntered}
                    onKeyDown={this.handleKeyDown}
                />
                <Dropdown
                    color="secondary"
                    size="sm"
                    style={{ marginLeft: '-40px', flexGrow: '1', display: 'flex', height: 'min-content', paddingTop: '5px' }}
                    isOpen={this.state.dropdownMenuOpen}
                    toggle={this.toggleFunction}
                >
                    <DropdownToggle style={{ position: 'relative', right: '160px', zIndex: '-500', height: '30px' }} />
                    <DropdownMenu>{this.searchEntries}</DropdownMenu>
                </Dropdown>

                <Icon
                    icon={faCrosshairs}
                    className={this.state.locateClass}
                    style={{ position: 'relative', right: '30px', cursor: this.state.activeTargetButton ? 'pointer' : 'auto' }}
                    title={this.state.locateTitle}
                    onClick={this.props.graphVis.zoomToANode}
                />
            </div>
        );
    }
}

SearchAutoComplete.propTypes = {
    graphVis: PropTypes.object.isRequired,
    placeHolder: PropTypes.string
};

export default SearchAutoComplete;
