import React, {Component} from 'react';
import './AddResource.css';

export default class AddResource extends Component {

    render() {
        return <div>
            <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Resource name or DOI"
                        aria-label="Resource name or DOI" aria-describedby="basic-addon2"/>
                <div class="input-group-append">
                    <button class="btn btn-outline-primary" type="button">Add</button>
                </div>
            </div>
        </div>
    }

}