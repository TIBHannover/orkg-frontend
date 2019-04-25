import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Button } from 'reactstrap';
import { Link } from "react-router-dom";
import ROUTES from '../../constants/routes.js';

class RecentlyAddedPapers extends Component {
    render() {
        return (
            <div className="mt-5 pl-3 pr-3">
                <ListGroup>
                    <ListGroupItem className="p-0 m-0 mb-4" style={{ border: 0 }}>
                        <h5><a href="/" style={{ color: 'inherit' }}>Wiles’s proof of Fermat’s last theorem</a></h5>
                        <p className="small mb-1 text-secondary">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p>
                        <a href="/"><span className="badge badge-secondary">Mathematics</span></a> <a href="/"><span className="badge badge-secondary">Modularity theorem</span></a>
                    </ListGroupItem>
                    <ListGroupItem className="p-0 m-0 mb-4" style={{ border: 0 }}>
                        <h5><a href="/" style={{ color: 'inherit' }}>Gruber's design of ontologies</a></h5>
                        <p className="small mb-1 text-secondary">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p>
                        <a href="/"><span className="badge badge-secondary">Mathematics</span></a> <a href="/"><span className="badge badge-secondary">Modularity theorem</span></a>
                    </ListGroupItem>
                    <ListGroupItem className="p-0 m-0 mb-4" style={{ border: 0 }}>
                        <h5><a href="/" style={{ color: 'inherit' }}>Design criteria for ontologies</a></h5>
                        <p className="small mb-1 text-secondary">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p>
                        <a href="/"><span className="badge badge-secondary">Mathematics</span></a> <a href="/"><span className="badge badge-secondary">Modularity theorem</span></a>
                    </ListGroupItem>
                </ListGroup>

                <div className="text-center">
                    <Link to={ROUTES.HOME}>
                        <Button color="primary" className="mr-3">More papers</Button>
                    </Link>
                </div>
            </div>
        );
    }
}

export default RecentlyAddedPapers;