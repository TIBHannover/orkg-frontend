import React, { Component } from 'react';
import ShortRecord from '../components/ShortRecord/ShortRecord';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { getAllObservatoriesbyOrganizationId } from '../network';
import { Container } from 'reactstrap';
import PropTypes from 'prop-types';
import ROUTES from '../constants/routes';
import { reverse } from 'named-urls';

class ObservatoryDetails extends Component {
    constructor(props) {
        super(props);

        this.pageSize = 25;

        this.state = {
            resources: [],
            results: null,
            isNextPageLoading: false,
            hasNextPage: false,
            page: 1,
            isLastPageReached: false,
            resourceId: '',
            label: ''
        };
    }

    componentDidMount() {
        document.title = 'Observatories - ORKG';
        
        this.loadMoreResources();
    }

    loadMoreResources = () => {
        this.setState({ isNextPageLoading: true });
        getAllObservatoriesbyOrganizationId(this.props.match.params.id).then(resources => {
            if (resources.length > 0) {
                this.setState({
                    resources: [...this.state.resources, ...resources],
                    isNextPageLoading: false,
                    hasNextPage: resources.length < this.pageSize ? false : true,
                    page: this.state.page + 1
                });
            } else {
                this.setState({
                    isNextPageLoading: false,
                    hasNextPage: false,
                    isLastPageReached: true
                });
            }
        });
    };

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Observatories List</h1>
                </Container>
                <Container className={'box pt-4 pb-4 pl-5 pr-5 clearfix'}>
                    <div className="clearfix">
                        {this.props.user && (
                            <Link className="float-right mb-2 mt-2 clearfix" to={reverse(ROUTES.ADD_OBSERVATORY, { id: this.props.match.params.id })}>
                                <span className="fa fa-plus" /> Create new observatory
                            </Link>
                        )}
                    </div>
                    {this.state.resources.length > 0 && (
                        <div>
                            {this.state.resources.map(resource => {
                                return (
                                    <ShortRecord key={resource.id} header={resource.name} href={reverse(ROUTES.OBSERVATORY, { id: resource.id })} />
                                );
                            })}
                        </div>
                    )}
                    {this.state.resources.length === 0 && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">No Observatories</div>
                    )}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                    {!this.state.isNextPageLoading && this.state.hasNextPage && (
                        <div
                            style={{ cursor: 'pointer' }}
                            className="list-group-item list-group-item-action text-center mt-2"
                            onClick={!this.state.isNextPageLoading ? this.loadMoreResources : undefined}
                        >
                            Load more resources
                        </div>
                    )}
                    {!this.state.hasNextPage && this.state.isLastPageReached && (
                        <div className="text-center mt-3">You have reached the last page.</div>
                    )}
                </Container>
            </>
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

ObservatoryDetails.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            id: PropTypes.string.isRequired
        }).isRequired
    }).isRequired,
    user: PropTypes.object
};

export default connect(
    mapStateToProps,
    null
)(ObservatoryDetails);
