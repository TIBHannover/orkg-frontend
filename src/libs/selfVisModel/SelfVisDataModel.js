import { clone } from 'lodash';
import MachineReadableRepresentation from 'libs/selfVisModel/MachineReadableRepresentation';
import DataForChart from 'libs/selfVisModel/VisRenderer/googleDataWrapper';
import { validateCellMapping } from 'libs/selfVisModel/ValidateCellMapping';

export default class SelfVisDataMode {
    static instance;

    constructor() {
        if (SelfVisDataMode.instance) {
            return SelfVisDataMode.instance;
        }
        SelfVisDataMode.instance = this;

        this._inputData = {};
        this.requiresParing = false;
        this._googleChartsData = undefined;
        this.__customizationStateObject = undefined;

        // introducing share state object
        this.__sharedStateObject = {
            renderingMethod: 'Table',
            selectedColumns: [],
            customizer: {
                errorDataNotSupported: false,
                errorMessage: undefined,
                errorValue: -1,
                xAxisLabel: undefined,
                yAxisLabel: undefined,
                xAxisSelector: undefined,
                yAxisSelector: undefined,
                xAxisSelectorOpen: false,
                yAxisSelectorOpen: [],
                yAxisInterValSelectors: {},
                yAxisSelectorCount: 1,
            },
        };
    }

    /** Customization State Logic* */
    applySelectionToCustomizationState = (propertyAnchor, value) => {
        if (value === true) {
            // find based on index
            const res = this.__sharedStateObject.selectedColumns.find(item => item.positionPropertyAnchor === propertyAnchor.positionPropertyAnchor);
            if (!res) {
                this.__sharedStateObject.selectedColumns.push(propertyAnchor);
            }
        } // else it is already there -- which should never be the case

        if (value === false) {
            // remove it from the array;
            const res = this.__sharedStateObject.selectedColumns.find(item => item.positionPropertyAnchor === propertyAnchor.positionPropertyAnchor);
            const indexInArray = this.__sharedStateObject.selectedColumns.indexOf(res);
            if (indexInArray !== -1) {
                this.__sharedStateObject.selectedColumns.splice(indexInArray, 1);
            }
        }
    };

    resetSharedCustomizerObject = () => {
        this.__sharedStateObject.customizer = {
            errorDataNotSupported: false,
            errorMessage: undefined,
            errorValue: -1,
            xAxisLabel: undefined,
            yAxisLabel: undefined,
            xAxisSelector: undefined,
            yAxisSelector: undefined,
            xAxisSelectorOpen: false,
            yAxisSelectorOpen: [],
            yAxisInterValSelectors: {},
            yAxisSelectorCount: 1,
        };
    };

    getSharedCustomizerObject = () => this.__sharedStateObject.customizer;

    resetSharedCustomizationState = () => {
        this.__sharedStateObject = {
            renderingMethod: 'Table',
            selectedColumns: [],
            customizer: {
                errorDataNotSupported: false,
                errorMessage: undefined,
                errorValue: -1,
                xAxisSelector: undefined,
                xAxisLabel: undefined,
                yAxisLabel: undefined,
                yAxisSelector: undefined,
                xAxisSelectorOpen: false,
                yAxisSelectorOpen: [],
                yAxisInterValSelectors: {},
                yAxisSelectorCount: 1,
            },
        };
    };

    /** exposed functions ----------------------------------------------------------------------* */
    /** ----------------------------------------------------------------------------------------* */
    integrateInputData = input => {
        // this will check if we actually have to update the input data (re-run the parser)
        // comes in handy when we will change between comparisons
        this.__compareIfNewInput(input); // << assigns the object if needed and sets flag for parser
        this.__parseInputIfNeeded();
    };

    /** CURRENTLY HACKISH * */
    setRenderingMethod = method => {
        this._renderingMethod = method;
        this.__sharedStateObject.renderingMethod = method;
    };

    getRenderingMethod = () => this._renderingMethod;

    setRenderingEngine = engine => {
        this._renderingEngine = engine;
        this.__sharedStateObject.renderingEngine = engine;
    };

    setGCData = data => {
        this._googleChartsData = data;
    };

    saveCustomizationState = state => {
        this.__customizationStateObject = { ...state };
    };

    loadCustomizationState = () => ({ ...this.__customizationStateObject });

    getGoogleChartsData = () => {
        if (!this._googleChartsData) {
            return {}; // empty object
        }
        if (this._renderingMethod === 'Table') {
            return this._googleChartsData.useAllColumns();
        }
        return this._googleChartsData.createDataFromSharedCustomizer(this.__sharedStateObject.customizer);
    };

    getReconstructionModel = () => {
        // the reconstruction model fetches the set flags and labels ;
        // get propertyAnchors;
        const reconstructionModel = {};
        const selectedPropertyAnchors = this.__sharedStateObject.selectedColumns;

        reconstructionModel.propertyAnchors = [];
        reconstructionModel.contributionAnchors = [];
        reconstructionModel.dataCells = [];
        selectedPropertyAnchors.forEach(anchor => {
            // extract some information to be able to reconstruct it later;
            if (anchor.label !== anchor.originalLabel) {
                reconstructionModel.propertyAnchors.push({
                    label: anchor.label,
                    originalLabel: anchor.originalLabel,
                    positionPropertyAnchor: anchor.positionPropertyAnchor,
                    propertyMapperType: anchor.propertyMapperType,
                });
            } else {
                reconstructionModel.propertyAnchors.push({
                    positionPropertyAnchor: anchor.positionPropertyAnchor,
                    propertyMapperType: anchor.propertyMapperType,
                });
            }
        });

        // reconstruct the contribution anchors;
        const selectedContribAnchors = this.mrrModel.contributionAnchors;
        selectedContribAnchors.forEach(anchor => {
            // extract some information to be able to reconstruct it later;
            if (anchor.label !== anchor.originalLabel) {
                reconstructionModel.contributionAnchors.push({
                    label: anchor.label,
                    originalLabel: anchor.originalLabel,
                    positionContribAnchor: anchor.positionContribAnchor,
                });
            } else {
                reconstructionModel.contributionAnchors.push({
                    positionContribAnchor: anchor.positionContribAnchor,
                });
            }
        });

        // reconstruct the cell Values;
        const selectedCells = this.mrrModel.dataItems;
        selectedCells.forEach(cell => {
            // extract some information to be able to reconstruct it later;
            const colPos = cell.positionPropertyAnchor;
            if (this.mrrModel.propertyAnchors[colPos].isSelectedColumnForUse) {
                if (cell.label !== cell.originalLabel) {
                    reconstructionModel.dataCells.push({
                        label: cell.label,
                        originalLabel: cell.originalLabel,
                        positionContribAnchor: cell.positionContribAnchor,
                        positionPropertyAnchor: cell.positionPropertyAnchor,
                    });
                } else {
                    reconstructionModel.dataCells.push({
                        positionContribAnchor: cell.positionContribAnchor,
                        positionPropertyAnchor: cell.positionPropertyAnchor,
                    });
                }
            }
        });

        if (selectedPropertyAnchors.length === 0 || selectedCells.length === 0 || selectedContribAnchors.length === 0) {
            return undefined; // << this is an error there is no data in the model
        }

        if (this.__sharedStateObject.renderingMethod !== 'Table') {
            const sharedCustomizer = { ...this.__sharedStateObject.customizer };

            const customizationState = {
                errorValue: -1,
                xAxisLabel: 0,
                xAxisSelectorOpen: false,
                xAxisSelector: 0,
                yAxisLabel: 0,
                yAxisInterValSelectors: {},
                yAxisIntervals: {},
                yAxisSelectorOpen: [],
                yAxisSelector: [],
            };

            // reconstruct values one by one

            customizationState.xAxisLabel = sharedCustomizer.xAxisLabel;
            customizationState.yAxisLabel = sharedCustomizer.yAxisLabel;

            if (sharedCustomizer.xAxisSelector && sharedCustomizer.xAxisSelector.label) {
                customizationState.xAxisSelector = sharedCustomizer.xAxisSelector.label;

                sharedCustomizer.yAxisSelector.forEach((yAxis, id) => {
                    customizationState.yAxisSelector[id] = yAxis.axis.label;
                    customizationState.yAxisSelectorOpen[id] = false;

                    if (yAxis.intervals && yAxis.intervals.length > 0) {
                        // get the intervals;
                        customizationState.yAxisInterValSelectors[id] = [];
                        customizationState.yAxisIntervals[id] = [];
                        yAxis.intervals.forEach(interval => {
                            customizationState.yAxisInterValSelectors[id].push({
                                isOpen: false,
                                label: interval.item.label,
                            });
                            customizationState.yAxisIntervals[id].push({ isOpen: false, label: interval.item.label });
                        });
                    }
                });
            }
            reconstructionModel.customizationState = customizationState;
        } else {
            reconstructionModel.customizationState = {}; // add empty customization state obj
        }
        return reconstructionModel;
    };

    resetCustomizationModel = () => {
        if (!this.mrrModel) {
            // read it
            this.__parseInput();
        }

        if (this.mrrModel) {
            // applySelection in the contribution anchors;
            this.mrrModel.contributionAnchors.forEach(anchor => {
                const position = anchor.positionContribAnchor;
                if (this.mrrModel.contributionAnchors[position]) {
                    // set this to be selected in the model;
                    // this.mrrModel.contributionAnchors[position].isSelectedRowForUse = false;
                    this.mrrModel.contributionAnchors[position].label = anchor.originalLabel;
                }
            });

            this.mrrModel.propertyAnchors.forEach(anchor => {
                const position = anchor.positionPropertyAnchor;
                if (this.mrrModel.propertyAnchors[position]) {
                    // set this to be selected in the model;
                    this.mrrModel.propertyAnchors[position].isSelectedColumnForUse = false;
                    this.mrrModel.propertyAnchors[position].propertyMapperType = '';
                    this.mrrModel.propertyAnchors[position].label = anchor.originalLabel;
                }
            });
            this.mrrModel.dataItems.forEach(cell => {
                const rowIndex = cell.positionContribAnchor;
                const colIndex = cell.positionPropertyAnchor;

                const item = this.modelAccess.getItem(rowIndex, colIndex);
                if (item) {
                    item.setItemSelected(false);
                    if (cell.label) {
                        item.setLabel(cell.originalLabel);
                    }
                    item.cellValueIsValid = false;
                }
            });

            this.setRenderingMethod('Table'); // << Default rendering Method
            this.resetSharedCustomizationState();
            this.createGDCDataModel();
        }
    };

    applyReconstructionModel = model => {
        const data = clone(model.data);

        if (!this.mrrModel) {
            console.log('Model Failed!');
            console.log(this._inputData);
            return;
        }

        // reset the data model to original
        this.resetCustomizationModel();

        this.setRenderingMethod(data.visMethod);
        this.setRenderingEngine(data.renderingEngine);
        // reconstruct the data;
        const reconstructionObject = data.reconstructionData;

        // applySelection in the contribution anchors;
        reconstructionObject.contributionAnchors.forEach(anchor => {
            const position = anchor.positionContribAnchor;
            if (this.mrrModel.contributionAnchors[position]) {
                this.mrrModel.contributionAnchors[position].isSelectedRowForUse = true;
                this.mrrModel.contributionAnchors[position].label = this.mrrModel.contributionAnchors[position].originalLabel;
                // overwrite a label
                if (anchor.label) {
                    this.mrrModel.contributionAnchors[position].label = anchor.label;
                }
            }
        });

        // apply Selection for property anchors;
        reconstructionObject.propertyAnchors.forEach(anchor => {
            const position = anchor.positionPropertyAnchor;
            if (this.mrrModel.propertyAnchors[position]) {
                // set this to be selected in the model;
                this.mrrModel.propertyAnchors[position].isSelectedColumnForUse = true;
                this.mrrModel.propertyAnchors[position].propertyMapperType = anchor.propertyMapperType;

                // always reset the label to original
                this.mrrModel.propertyAnchors[position].label = this.mrrModel.propertyAnchors[position].originalLabel;
                // overwrite a label
                if (anchor.label) {
                    this.mrrModel.propertyAnchors[position].label = anchor.label;
                }
                this.__sharedStateObject.selectedColumns.push(this.mrrModel.propertyAnchors[position]);
            }
        });

        // apply selection for cell values;
        reconstructionObject.dataCells.forEach(cell => {
            const rowIndex = cell.positionContribAnchor;
            const colIndex = cell.positionPropertyAnchor;
            const item = this.modelAccess.getItem(rowIndex, colIndex);
            if (item) {
                item.setLabel(item.originalLabel);
                if (cell.label) {
                    item.setLabel(cell.label);
                }
                item.cellValueIsValid = true;
            }
        });
        this.createGDCDataModel();

        if (data.visMethod === 'Table') {
            return this._googleChartsData.useAllColumns();
        }

        // we need to synchronize the shared object with reconstruction model
        this.synchronizeSharedCustomizationStateObject(reconstructionObject.customizationState);

        return this._googleChartsData.createDataFromSharedCustomizer(this.__sharedStateObject.customizer);
    };

    synchronizeSharedCustomizationStateObject = reconstruct => {
        const { customizer } = this.__sharedStateObject;

        // axis selector;
        // we have a label for the Axis;
        const xAxisGuess = this.requestAnIndex(reconstruct.xAxisSelector);
        if (xAxisGuess.error === undefined) {
            customizer.xAxisSelector = this.mrrModel.propertyAnchors[xAxisGuess.index];
        } else {
            customizer.xAxisSelector = { label: 'Contribution' }; // assume default values
        }
        customizer.xAxisLabel = reconstruct.xAxisLabel;
        customizer.yAxisLabel = reconstruct.yAxisLabel;

        // adjust yAxis selectors;
        const yAxisSelectors = [];
        reconstruct.yAxisSelector.forEach(item => {
            // item is a string
            const yAxisGuess = this.requestAnIndex(item);
            yAxisSelectors.push({ axis: this.mrrModel.propertyAnchors[yAxisGuess.index] });
        });
        customizer.yAxisSelector = yAxisSelectors;

        // reconstruct intervals
        // customizer.yAxisInterValSelectors = {};
        for (const intervalAxisID in reconstruct.yAxisIntervals) {
            if (reconstruct.yAxisIntervals.hasOwnProperty(intervalAxisID)) {
                const selectedIntervals = reconstruct.yAxisIntervals[intervalAxisID];
                // createSelector for that
                const yAxisIntervalGuesses = [];
                selectedIntervals.forEach(item => {
                    const yAxisGuess = this.requestAnIndex(item.label);
                    if (yAxisGuess.index) {
                        yAxisIntervalGuesses.push({ isOpen: false, item: this.mrrModel.propertyAnchors[yAxisGuess.index] });
                    }
                });
                customizer.yAxisSelector[intervalAxisID].intervals = yAxisIntervalGuesses;
            }
        }

        this.__sharedStateObject.customizer = customizer;
    };

    /** HACKISH ENDS* */

    requestAnIndex = label => {
        const guess = this.mrrModel.propertyAnchors.find(element => element.label === label);

        if (guess) {
            return { index: guess.positionPropertyAnchor, label: guess.label };
        }
        return { error: 'NotFound' };
    };

    createGDCDataModel = () => {
        // filter the propertyAnchors by selectionFlag;
        const filteredProperties = this.mrrModel.propertyAnchors.filter(
            item => item.isSelectedColumnForUse === true && item.propertyMapperType !== 'Select Mapper',
        );
        // now figure out how many rows we do have;
        // const filteredContribs = this.mrrModel.contributionAnchors.filter(item => item.isSelectedRowForUse === true);
        const filteredContribs = this.mrrModel.contributionAnchors;

        const gdc = new DataForChart();
        gdc.addColumn('string', 'Contribution');

        filteredProperties.forEach(property => {
            if (property.propertyMapperType) {
                // headersArray.push(property.label);
                if (property.propertyMapperType === 'String') {
                    gdc.addColumn('string', property.label);
                }
                if (property.propertyMapperType === 'Date') {
                    gdc.addColumn('date', property.label);
                }
                if (property.propertyMapperType === 'Number') {
                    gdc.addColumn('number', property.label);
                }
            }
        });
        // now we need to fill the values with the row Entries;

        const renderingDimX = filteredProperties.length;
        const renderingDimY = filteredContribs.length;

        for (let i = 0; i < renderingDimY; i++) {
            // renders row;
            const rowArray = [];
            const contribItem = filteredContribs[i];
            rowArray.push(contribItem.label);

            for (let j = 0; j < renderingDimX; j++) {
                // renders the cell
                const propertyItem = filteredProperties[j];
                if (propertyItem.propertyMapperType) {
                    // we should get this value;
                    const rowIndex = contribItem.positionContribAnchor;
                    const colIndex = propertyItem.positionPropertyAnchor;
                    const item = this.modelAccess.getItem(rowIndex, colIndex);

                    if (item.cellValueIsValid === true) {
                        if (propertyItem.propertyMapperType === 'Date') {
                            rowArray.push(new Date(item.label));
                        } else {
                            rowArray.push(item.label);
                        }
                    } else {
                        rowArray.push(undefined);
                    }
                }
            }
            gdc.addRow(...rowArray);
        }
        this.setGCData(gdc);
    };

    //----------------------------------------------------------------------------------------------
    /** private functions ----------------------------------------------------------------------* */
    /** ----------------------------------------------------------------------------------------* */

    // Force Cell Validation
    forceCellValidation = () => {
        // get selected cells;

        // perform validation on selected columns;
        const selectedCols = this.mrrModel.propertyAnchors.filter(item => item.isSelectedColumnForUse);

        selectedCols.forEach(col => {
            // get data item from matrix;
            const colIndex = col.positionPropertyAnchor;
            const colCells = this.modelAccess.getCol(colIndex);

            colCells.forEach(cell => {
                const mapper = this.mrrModel.propertyAnchors[colIndex].getPropertyMapperType();
                if (mapper) {
                    // call the validator for this cell value;
                    const { error } = validateCellMapping(mapper, cell.label);
                    if (error) {
                        cell.cellValueIsValid = false;
                    } else {
                        cell.cellValueIsValid = true;
                    }
                }
            });
        });
    };

    /** GROUPED FUNCTIONS : handling input model and parse it * */
    __setInputData = data => {
        this._inputData = data;
    };

    __compareIfNewInput = data => {
        // no data yet in the input
        if (!this._inputData.contributionsList) {
            this.__setInputData(data);
            this.requiresParing = true;
        } else {
            // we have some data, but check if we use the same contributions or not
            if (this._inputData.contributionsList === data.contributionsList) {
                this.requiresParing = false;
            } else {
                this.__setInputData(data);
                this.requiresParing = true;
            }
        }
    };

    __parseInputIfNeeded = () => {
        // debug msg
        if (this.requiresParing) {
            this.__parseInput();
            this.requiresParing = false;
        }
    };

    __parseInput = () => {
        // parses input of the input data
        const parser = new MachineReadableRepresentation(this._inputData);
        parser.execute();
        this.mrrModel = parser.getResult();
        this.modelAccess = parser;
    };

    debug = () => {
        console.log(this.__sharedStateObject);
        const reconstructionData = this.getReconstructionModel();
        console.log(reconstructionData);
        console.log(this.getGoogleChartsData());
    };
}
