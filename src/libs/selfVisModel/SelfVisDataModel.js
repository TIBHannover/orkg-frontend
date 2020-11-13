import MachineReadableRepresentation from './MachineReadableRepresentation';
import DataForChart from './VisRenderer/googleDataWrapper';

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

    setXAxisSelector = val => {
        this.xAxisSelector = val;
    };
    // TODO: this should support an array
    setYAxisSelector = val => {
        this.yAxisSelector = val;
    };

    setDataForRendering = data => {
        this._dataForRendering = data; // this is the data we store for the rendering of the charts ( it has the data that is fed into the chart renderer
    };

    getReconstructionModel = () => {
        // the reconstruction model fetches the set flags and labels ;
        // get propertyAnchors;
        const reconstructionModel = {};
        const selectedPropertyAnchors = this.mrrModel.propertyAnchors.filter(item => item.isSelectedColumn() === true);
        console.log('This is the propertyAnchors that are selected:22 ', selectedPropertyAnchors);

        reconstructionModel.propertyAnchors = [];
        reconstructionModel.contributionAnchors = [];
        reconstructionModel.dataCells = [];
        selectedPropertyAnchors.forEach(anchor => {
            // extract some information to be able to reconstruct it later;
            reconstructionModel.propertyAnchors.push({
                label: anchor.label,
                originalLabel: anchor.originalLabel,
                positionPropertyAnchor: anchor.positionPropertyAnchor,
                propertyMapperType: anchor.propertyMapperType
            });
        });

        // reconstruct the contribution anchors;
        const selectedContribAnchors = this.mrrModel.contributionAnchors.filter(item => item.isSelectedRow() === true);
        selectedContribAnchors.forEach(anchor => {
            // extract some information to be able to reconstruct it later;
            reconstructionModel.contributionAnchors.push({
                label: anchor.label,
                originalLabel: anchor.originalLabel,
                positionContribAnchor: anchor.positionContribAnchor
            });
        });

        // reconstruct the cell Values;
        const selectedCells = this.mrrModel.dataItems.filter(item => item.itemIsSelectedForUse === true);
        selectedCells.forEach(cell => {
            // extract some information to be able to reconstruct it later;
            reconstructionModel.dataCells.push({
                label: cell.label,
                originalLabel: cell.originalLabel,
                positionContribAnchor: cell.positionContribAnchor,
                positionPropertyAnchor: cell.positionPropertyAnchor
            });
        });

        console.log('This is the reconstruction model');
        console.log(reconstructionModel);
    };

    /** HACKISH ENDS**/

    // getter functions for various models: TODO

    createGDCDataModel = () => {
        // filter the propertyAnchors by selectionFlag;
        console.log('CREATING GDC DATA MODEL   2  ');
        const filteredProperties = this.mrrModel.propertyAnchors.filter(item => item.isSelectedColumnForUse === true);
        console.log(filteredProperties, '<< selected for use');
        // now figure out how many rows we do have;
        const filteredContribs = this.mrrModel.contributionAnchors.filter(item => item.isSelectedRowForUse === true);

        // lets build the table information
        // headers First;
        // const headersArray = [];
        // headersArray.push('Contribution');
        // then the properties if they have a mapper;

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
        console.log(gdc.getChartData(), '<< CHART DATA ');
        this.setGCData(gdc);
    };

    //----------------------------------------------------------------------------------------------
    /** private functions ----------------------------------------------------------------------**/
    /** ----------------------------------------------------------------------------------------**/

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
                // thing to do;
                this.requiresParing = false;
            } else {
                this.__setInputData(data);
                this.requiresParing = true;
            }
        }
    };

    __parseInputIfNeeded = () => {
        // debug msg
        if (!this.requiresParing) {
            console.log('[Debug]: -- No parsing required!, for now parsing anyways');
        }

        if (this.requiresParing) {
            this.__parseInput();
        }
        this.requiresParing = false;
    };
    __parseInput = () => {
        // parses input of the input data
        console.log('PARSE INPUT CALLED ');

        const parser = new MachineReadableRepresentation(this._inputData);
        parser.execute();
        this.mrrModel = parser.getResult();
        console.log(this.mrrModel);
        this.modelAccess = parser;
        // modularize the parser as a class
    };
}
