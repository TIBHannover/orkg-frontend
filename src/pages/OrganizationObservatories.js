import React, { Component } from 'react';
import ShortRecord from '../components/ShortRecord/ShortRecord';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { getAllObservatoriesbyOrganizationId, getOrganization } from '../network';
import { Container } from 'reactstrap';
import PropTypes from 'prop-types';
import ROUTES from '../constants/routes';
import { reverse } from 'named-urls';

class OrganizationObservatories extends Component {
    constructor(props) {
        super(props);

        this.state = {
            observatories: [],
            createdBy: '',
            isNextPageLoading: false
        };
    }

    componentDidMount() {
        document.title = 'Observatories - ORKG';

        this.loadObservatories();
        this.getOrganization(this.props.match.params.id);
    }

    loadObservatories = () => {
        this.setState({ isNextPageLoading: true });
        getAllObservatoriesbyOrganizationId(this.props.match.params.id)
            .then(observatories => {
                if (observatories.length > 0) {
                    this.setState({
                        observatories: observatories,
                        isNextPageLoading: false
                    });
                } else {
                    this.setState({
                        isNextPageLoading: false
                    });
                }
            })
            .catch(error => {
                this.setState({
                    isNextPageLoading: false
                });
            });
    };

    getOrganization = id => {
        getOrganization(id).then(organization => {
            this.setState({
                createdBy: organization.created_by
            });
        });
    };

    render() {
        return (
            <>
                <Container className="p-0">
                    <h1 className="h4 mt-4 mb-4">Observatories List</h1>
                </Container>
                <Container className={'box rounded pt-4 pb-4 pl-5 pr-5 clearfix'}>
                    <div className="clearfix">
                        {this.props.user !== null && this.props.user.id === this.state.createdBy && (
                            <Link className="float-right mb-2 mt-2 clearfix" to={reverse(ROUTES.ADD_OBSERVATORY, { id: this.props.match.params.id })}>
                                <span className="fa fa-plus" /> Create new observatory
                            </Link>
                        )}
                    </div>
                    {this.state.observatories.length > 0 && (
                        <div>
                            {this.state.observatories.map(observatory => {
                                return (
                                    <ShortRecord
                                        key={observatory.id}
                                        header={observatory.name}
                                        href={reverse(ROUTES.OBSERVATORY, { id: observatory.id })}
                                    />
                                );
                            })}
                        </div>
                    )}
                    {this.state.observatories.length === 0 && !this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">No Observatories yet!</div>
                    )}
                    {this.state.isNextPageLoading && (
                        <div className="text-center mt-4 mb-4">
                            <Icon icon={faSpinner} spin /> Loading
                        </div>
                    )}
                </Container>
            </>
        );
    }
}

const mapStateToProps = state => ({
    user: state.auth.user
});

OrganizationObservatories.propTypes = {
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
)(OrganizationObservatories);
