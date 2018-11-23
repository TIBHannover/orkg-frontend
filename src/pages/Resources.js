import React, {Component} from 'react';
import ShortRecord from '../components/statements/ShortRecord';
import {Link} from 'react-router-dom';
import {submitGetRequest, url} from '../network';

export default class Resources extends Component {
    state = {
        allResources: null,
        results: null,
        error: null,
    };

    async componentWillMount() {
        await this.findAllResources();
    }

    findAllResources = async () => {
        try {
            const responseJson = await submitGetRequest(url + 'resources/');

            this.setState({
                allResources: responseJson,
                error: null,
            });
        } catch (err) {
            console.error(err);
            this.setState({
                allResources: null,
                error: err.message,
            });
        }
    };

    render() {
        const resultsPresent = this.state.error || (this.state.allResources);

        if (this.state.error) {
            return <p><strong>Error:</strong> {this.state.error} </p>;
        }

        if (resultsPresent) {
            const resources = this.state.allResources.map(
                resource => <ShortRecord key={resource.id} header={resource.label}
                    href={`${process.env.PUBLIC_URL}/resource/${encodeURIComponent(resource.id)}`}>
                    </ShortRecord>
            );

            return <div>
                <div className="addResource toolbar addToolbar-container">
                    <span className="toolbar-button toolbar-button-add">
                        <Link to={`${process.env.PUBLIC_URL}/addResource`}>
                            <span className="fa fa-plus"/>add new resource
                        </Link>
                    </span>
                </div>
                {resources}
            </div>
        } else {
            return null;
        }
    }

}
