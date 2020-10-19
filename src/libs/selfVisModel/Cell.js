/* Description:
------------------------------------------------------------------------------------------------------------------------

// Parser Requirements
  A cell holds data from the original input data
  It should know which contribution it belongs to , which property , and the value
  Further More it should know which IJ it has (using the row based model for each contribution)

// User Interaction Requirements
  The user should be able to the flag for the cell if it is selected or not;
  
  
// Validation Mechanics for mapper
  the mapper determines for a whole column the type of mapping 
  It should have a flag valid mapping under this mapper 

* */

export default class Cell {
    constructor() {
        // using "Anchor" names as notation
        this.contributionAnchor = null;
        this.propertyAnchor = null;
        this.valueAnchor = null;
        this.pathAnchor = null; // << comparison data has a path which allows us to fetch the value

        // Type flags;
        // gives us some flexibility and we are able to reuse the cells for the header information
        //------------------------------------------
        this.propertyAnchorFlag = false;
        this.contributionAnchgorFlag = false;
        this.valueAnchorFlag = false;
        // the type of the flag has to be determined and only one of the above applies.

        // some additional vars;
        this.label = 'EMPTY';
        this.positionContribAnchor = -1;
        this.positionPropertyAnchor = -1;
    }

    setFlagByName = name => {
        if (name === 'property') {
            this.propertyAnchorFlag = true;
        }
        if (name === 'contribution') {
            this.contributionAnchgorFlag = true;
        }
        if (name === 'value') {
            this.valueAnchorFlag = true;
        }
    };

    initializeCellFromData = (data, index) => {
        // the data is here the name of the orkg comparison input thing that has the paths
        // it is the atomic value (ish)
        // cells are populated from the MRR model

        // flag based;

        if (this.contributionAnchgorFlag === true) {
            this.contributionAnchor = data;
            this.positionContribAnchor = index;
            this.label = data.contributionLabel + '(' + data.paperId + ')'; // << for now to keep string short
        }
        if (this.propertyAnchorFlag === true) {
            this.propertyAnchor = data;
            this.positionPropertyAnchor = index;
            this.label = data.label;
        }
    };
}
