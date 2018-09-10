import React, {Component} from 'react';
import ShortRecord from "../statements/ShortRecord";

export default class Contributions extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <ShortRecord header="http://orkg.tib.eu/resource/68bcfb497a403353f68bf3144b35aaf5"
                    href="#">
                ""
            </ShortRecord>
            <ShortRecord header="http://orkg.tib.eu/resource/0" href="#">
                "Record 1"
            </ShortRecord>
            <ShortRecord header="http://orkg.tib.eu/resource/1" href="#">
                "Record 2"
            </ShortRecord>
            <ShortRecord header="http://orkg.tib.eu/resource/2" href="#">
                "Record 3"
            </ShortRecord>
        </div>
    }

}