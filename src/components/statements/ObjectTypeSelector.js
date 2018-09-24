import React, {Component} from 'react';

export default class ObjectTypeSelector extends Component {

    render() {
        return <div className="snakView-typeSelector">
            <span className="snakTypeSelector" aria-disabled="false">
                <span className="fa fa-bars" title="custom value"></span>
            </span>
        </div>
    }

}