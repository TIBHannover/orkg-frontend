import React, {Component} from 'react';
import ShortRecord from "../statements/ShortRecord";

export default class Contributions extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <ShortRecord header="http://orkg.tib.eu/resource/68bcfb497a403353f68bf3144b35aaf5">
                ""
            </ShortRecord>
            <ShortRecord header="http://orkg.tib.eu/resource/0">
                "Record 1"
            </ShortRecord>
            <ShortRecord header="http://orkg.tib.eu/resource/1">
                "Record 2"
            </ShortRecord>
            <ShortRecord header="http://orkg.tib.eu/resource/2">
                "Record 3"
            </ShortRecord>
        </div>;
    }

}