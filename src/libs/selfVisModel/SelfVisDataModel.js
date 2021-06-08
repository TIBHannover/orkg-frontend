import MachineReadableRepresentation from './MachineReadableRepresentation';
import DataForChart from './VisRenderer/googleDataWrapper';
import { validateCellMapping } from './ValidateCellMapping';

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
    }

    /** exposed functions ----------------------------------------------------------------------**/
    /** ----------------------------------------------------------------------------------------**/
    integrateInputData = input => {
        // this will check if we actually have to update the input data (re-run the parser)
        // comes in handy when we will change between comparisons
        this.__compareIfNewInput(input); // << assigns the object if needed and sets flag for parser
        this.__parseInputIfNeeded();
    };

    /** CURRENTLY HACKISH **/
    setRenderingMethod = method => {
        this._renderingMethod = method;
    };
    getRenderingMethod = () => {
        return this._renderingMethod;
    };
    setRenderingEngine = engine => {
        this._renderingEngine = engine;
    };

    setGCData = data => {
        this._googleChartsData = data;
    };

    saveCustomizationState = state => {
        this.__customizationStateObject = state;
    };
    loadCustomizationState = () => {
        return this.__customizationStateObject;
    };

    getGoogleChartsData = () => {
        if (this._renderingMethod === 'Table') {
            return this._googleChartsData.useAllColumns();
        } else {
            const customizationState = { ...this.loadCustomizationState() };
            const stateForGDC = {
                xAxis: customizationState.xAxisSelector,
                xAxisLabel: customizationState.xAxisLabel,
                yAxisLabel: customizationState.yAxisLabel,
                yAxis: customizationState.yAxisSelector,
                yAxisIntervals: customizationState.yAxisInterValSelectors
            };
            return this._googleChartsData.createDataFromSelectors(stateForGDC);
        }
    };

    getReconstructionModel = () => {
        // the reconstruction model fetches the set flags and labels ;
        // get propertyAnchors;
        const reconstructionModel = {};
        const selectedPropertyAnchors = this.mrrModel.propertyAnchors.filter(item => item.isSelectedColumn() === true);

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
                    propertyMapperType: anchor.propertyMapperType
                });
            } else {
                reconstructionModel.propertyAnchors.push({
                    positionPropertyAnchor: anchor.positionPropertyAnchor,
                    propertyMapperType: anchor.propertyMapperType
                });
            }
        });

        // reconstruct the contribution anchors;
        const selectedContribAnchors = this.mrrModel.contributionAnchors.filter(item => item.isSelectedRow() === true);
        selectedContribAnchors.forEach(anchor => {
            // extract some information to be able to reconstruct it later;
            if (anchor.label !== anchor.originalLabel) {
                reconstructionModel.contributionAnchors.push({
                    label: anchor.label,
                    originalLabel: anchor.originalLabel,
                    positionContribAnchor: anchor.positionContribAnchor
                });
            } else {
                reconstructionModel.contributionAnchors.push({
                    positionContribAnchor: anchor.positionContribAnchor
                });
            }
        });

        // reconstruct the cell Values;
        const selectedCells = this.mrrModel.dataItems.filter(item => item.itemIsSelectedForUse === true);
        selectedCells.forEach(cell => {
            // extract some information to be able to reconstruct it later;

            if (cell.label !== cell.originalLabel) {
                reconstructionModel.dataCells.push({
                    label: cell.label,
                    originalLabel: cell.originalLabel,
                    positionContribAnchor: cell.positionContribAnchor,
                    positionPropertyAnchor: cell.positionPropertyAnchor
                });
            } else {
                reconstructionModel.dataCells.push({
                    positionContribAnchor: cell.positionContribAnchor,
                    positionPropertyAnchor: cell.positionPropertyAnchor
                });
            }
        });

        if (selectedPropertyAnchors.length === 0 || selectedCells.length === 0 || selectedContribAnchors.length === 0) {
            return undefined; // << this is an error there is no data in the model
        }

        const customizationState = { ...this.loadCustomizationState() };
        // HACKIS: TODO: read only required options;
        delete customizationState.errorDataNotSupported;
        delete customizationState.errorMessage;
        customizationState.xAxisSelectorOpen = false; // overwrites it for the reconstruction
        if (customizationState.yAxisSelectorOpen) {
            for (let i = 0; i < customizationState.yAxisSelectorOpen.length; i++) {
                customizationState.yAxisSelectorOpen[i] = false;
            }
        }
        for (const name in customizationState.yAxisInterValSelectors) {
            if (customizationState.yAxisInterValSelectors.hasOwnProperty(name)) {
                customizationState.yAxisInterValSelectors[name].isOpen = false;
            }
        }

        reconstructionModel.customizationState = customizationState;
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
                    this.mrrModel.contributionAnchors[position].isSelectedRowForUse = false;
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

            // rest the customizationState
            this.saveCustomizationState({
                errorDataNotSupported: false,
                errorMessage: undefined,
                xAxisSelector: undefined,
                xAxisLabel: undefined,
                yAxisLabel: undefined,
                xAxisSelectorOpen: false,
                yAxisSelector: [],
                yAxisInterValSelectors: {},
                yAxisSelectorOpen: [],
                yAxisSelectorCount: 1
            });
            this.createGDCDataModel();
        }
    };

    applyReconstructionModel = model => {
        const data = model.data;

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
                // set this to be selected in the model;
                this.mrrModel.contributionAnchors[position].isSelectedRowForUse = true;
                // always reset the label to original
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
            }
        });

        // apply selection for cell values;
        reconstructionObject.dataCells.forEach(cell => {
            const rowIndex = cell.positionContribAnchor;
            const colIndex = cell.positionPropertyAnchor;
            const item = this.modelAccess.getItem(rowIndex, colIndex);
            if (item) {
                item.setItemSelected(true);
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
        // this now neeeds to apply some selectors
        this.saveCustomizationState(reconstructionObject.customizationState);
        const stateForGDC = {
            xAxis: reconstructionObject.customizationState.xAxisSelector,
            yAxis: reconstructionObject.customizationState.yAxisSelector,
            yAxisIntervals: reconstructionObject.customizationState.yAxisInterValSelectors,
            xAxisLabel: reconstructionObject.customizationState.xAxisLabel,
            yAxisLabel: reconstructionObject.customizationState.yAxisLabel
        };

        const resultingData = this._googleChartsData.createDataFromSelectors(stateForGDC);
        return resultingData;
    };

    /** HACKISH ENDS**/

    // getter functions for various models: TODO

    createGDCDataModel = () => {
        // filter the propertyAnchors by selectionFlag;
        const filteredProperties = this.mrrModel.propertyAnchors.filter(
            item => item.isSelectedColumnForUse === true && item.propertyMapperType !== 'Select Mapper'
        );
        // now figure out how many rows we do have;
        const filteredContribs = this.mrrModel.contributionAnchors.filter(item => item.isSelectedRowForUse === true);

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
    /** private functions ----------------------------------------------------------------------**/
    /** ----------------------------------------------------------------------------------------**/

    // Force Cell Validation
    forceCellValidation = () => {
        // get selected cells;
        const selectedCells = this.mrrModel.dataItems.filter(item => item.itemIsSelectedForUse);
        selectedCells.forEach(cell => {
            const pos = cell.positionPropertyAnchor;
            const mapper = this.mrrModel.propertyAnchors[pos].getPropertyMapperType();
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
    };

    /** GROUPED FUNCTIONS : handling input model and parse it **/
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
}
