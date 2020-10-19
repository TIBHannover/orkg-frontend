import Cell from './Cell';

export default class MachineReadableRepresentation {
    constructor(inputData) {
        this.inputDataAsJsonObject = inputData;
        this.mrrModel = {};
    }

    execute = () => {
        // parser execution function;
        console.log('THIS IS OUR INPUT ! ', this.inputDataAsJsonObject);

        // we actually dont care about transposition >> we create it always like row based entries for a single paper.

        // our data model will hold the contributionAnchros, propertyAnchors and valueAnhors

        this.createContributionAnchors(this.mrrModel);
        this.createPropertyAnchors(this.mrrModel);

        // NEXT STEPS:
        // parese the dataAnchors
        // which create a label and we should be add functions to get rows and cols
        // we use a single linear array to store the cell values
        // cells will have a row and column index
        // add function : getRow(index) => filters all cells with this index
        // add function : getCol(index) => filters all cells with this index

        // this function declaration is a bit shade, but lets simply use it
        // NO: this should be handled by the model tho the data!!!!
        this.mrrModel.getRow = function(index) {
            console.log(index, 'IT WORKS', this.propertyAnchors);
        };

        console.log('-----------------\n\n-------------------');
        console.log(this.mrrModel);
        console.log('^^^^ THE OUTPUT MODEL ^^^');
        this.mrrModel.getRow(123);
    };

    getResult = () => {
        return this.mrrModel;
    };

    getRow = index => {
        console.log('HERE GET THE ROWS');
    };

    getCol = index => {
        console.log('HERE GET THE COLS');
    };

    getPropertyAnchors = () => {
        // gives us the header information for the rendering
        return this.mrrModel.propertyAnchors;
    };
    getContributionAnchors = () => {
        // gives us the header information for the rendering
        return this.mrrModel.contributionAnchors;
    };

    createContributionAnchors(model) {
        // go through the input data and create the anchors for the contributions (add AnchorId)
        model.contributionAnchors = [];
        this.inputDataAsJsonObject.contributions.forEach((contrib, index) => {
            // create a cell as contributionAnchor;
            const aCell = new Cell();
            aCell.setFlagByName('contribution');
            aCell.initializeCellFromData(contrib, index);
            model.contributionAnchors.push(aCell);
        });
    }
    createPropertyAnchors(model) {
        // go through the input data and create the anchors for the contributions (add AnchorId)
        model.propertyAnchors = [];
        this.inputDataAsJsonObject.properties.forEach((property, index) => {
            console.log(property);
            // create a cell as contributionAnchor;
            const aCell = new Cell();
            aCell.setFlagByName('property');
            aCell.initializeCellFromData(property, index);
            model.propertyAnchors.push(aCell);
        });
    }
}
