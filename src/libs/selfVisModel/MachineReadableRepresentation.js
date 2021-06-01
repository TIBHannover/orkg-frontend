import Cell from './Cell';

export default class MachineReadableRepresentation {
    constructor(inputData) {
        this.inputDataAsJsonObject = inputData;
        console.log('>>> THIS IS INPUT DATA ', inputData);
        this.mrrModel = {};
    }

    execute = () => {
        // parser execution function;
        // we actually dont care about transposition >> we create it always like row based entries for a single paper.
        // our data model will hold the contributionAnchors, propertyAnchors and valueAnchors

        this.createContributionAnchors(this.mrrModel);
        this.createPropertyAnchors(this.mrrModel);
        this.createDataItemAnchors(this.mrrModel);

        this.mrrModel.getRow = function(index) {};
    };

    getResult = () => {
        return this.mrrModel;
    };

    getRow = index => {
        // we use the notation, that the row describes the cell values related to the contribution anchors
        // so it will return all values for a "property" relating to all contributions
        return this.mrrModel.dataItems.filter(item => item.positionContribAnchor === index);
    };

    getCol = index => {
        // we use the notation, that the row describes the cell values related to the property anchors
        // so it will return all values for a "contribution" relating to all properties
        return this.mrrModel.dataItems.filter(item => item.positionPropertyAnchor === index);
    };
    getItem = (rowIndex, colIndex) => {
        const itemsArray = this.mrrModel.dataItems.filter(
            item => item.positionPropertyAnchor === colIndex && item.positionContribAnchor === rowIndex
        );
        if (itemsArray.length === 1) {
            return itemsArray[0];
        } else {
            return null; //<< ERROR
        }
    };

    createDataItemAnchors(model) {
        this.mrrModel.dataItems = [];

        // linear storing the items;
        // got through the propertyAnchors;
        model.propertyAnchors.forEach((property, rowIndex) => {
            const thatData = this.inputDataAsJsonObject.data[property.propertyAnchor.id];
            if (thatData) {
                thatData.forEach((cell, colIndex) => {
                    // create a cell
                    const dataCell = new Cell();
                    dataCell.setFlagByName('value');
                    dataCell.initializeCellValueFromData(cell, rowIndex, colIndex);
                    model.dataItems.push(dataCell);
                });
            }
        });
    }

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
            // create a cell as contributionAnchor;
            const aCell = new Cell();
            aCell.setFlagByName('property');
            aCell.initializeCellFromData(property, index);
            model.propertyAnchors.push(aCell);
        });
    }
}
