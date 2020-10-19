import MachineReadableRepresentation from './MachineReadableRepresentation';

export default class SelfVisDataMode {
    static instance;
    constructor() {
        if (SelfVisDataMode.instance) {
            return SelfVisDataMode.instance;
        }
        SelfVisDataMode.instance = this;

        this._inputData = {};
        this.requiresParing = false;
    }

    /** exposed functions ----------------------------------------------------------------------**/
    /** ----------------------------------------------------------------------------------------**/
    integrateInputData = input => {
        // this will check if we actually have to update the input data (re-run the parser)
        // comes in handy when we will change between comparisons
        this.__compareIfNewInput(input); // << assigns the object if needed and sets flag for parser
        this.__parseInputIfNeeded();
    };

    // getter functions for various models: TODO

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

        // if (this.requiresParing) {
        this.__parseInput();
        // }
        this.requiresParing = false;
    };
    __parseInput = () => {
        // parses input of the input data
        console.log('PARSE INPUT CALLED ');

        const parser = new MachineReadableRepresentation(this._inputData);
        parser.execute();
        this.mrrModel = parser.getResult();
        console.log(this.mrrModel);
        // modularize the parser as a class
    };
}
