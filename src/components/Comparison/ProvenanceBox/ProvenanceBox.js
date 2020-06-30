import React, { Component } from 'react';
import { getResource, getObservatoryAndOrganizationInformation, getUserInformationById } from 'network';
import { StyledItemProvenanceBox, AnimationContainer, ProvenanceBoxTabs, ErrorMessage, SidebarStyledBox } from './styled';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';

class ProvenanceBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            observatoryInfo: {},
            isLoading: false
        };
    }

    componentDidMount() {
        this.loadObservatory();
    }

    componentDidUpdate(prevProps) {
        if (this.props.resourceId !== prevProps.resourceId) {
            this.loadObservatory();
        }
    }

    loadObservatory = () => {
        this.setState({ isLoading: true });
        if (this.props.resourceId) {
            getResource(this.props.resourceId)
                .then(comparisonResource => {
                    console.log(comparisonResource);

                    if (
                        comparisonResource.observatory_id &&
                        comparisonResource.observatory_id !== '00000000-0000-0000-0000-000000000000' &&
                        comparisonResource.created_by &&
                        comparisonResource.created_by !== '00000000-0000-0000-0000-000000000000'
                    ) {
                        const observatory = getObservatoryAndOrganizationInformation(
                            comparisonResource.observatory_id,
                            comparisonResource.organization_id
                        );
                        const creator = getUserInformationById(comparisonResource.created_by);
                        Promise.all([observatory, creator]).then(data => {
                            this.setState({
                                observatoryInfo: {
                                    ...data[0],
                                    created_at: comparisonResource.created_at,
                                    created_by: data[1],
                                    extraction_method: comparisonResource.extraction_method
                                },
                                isLoading: false
                            });
                        });
                    }
                })
                .catch(error => {
                    this.setState({
                        isLoading: false
                    });
                });
        }
    };

    render() {
        return (
            <>
                {!this.state.isLoading && this.state.observatoryInfo.created_by && (
                    <div className="col-md-12 ">
                        <br />
                        <br />
                        <SidebarStyledBox
                            className="box rounded-lg"
                            style={{ minHeight: 430, width: 240, backgroundColor: '#f8f9fb', float: 'right' }}
                        >
                            <ProvenanceBoxTabs className="clearfix d-flex">
                                <div id="div1" className="h6 tab">
                                    <span style={{ textAlign: 'center', fontWeight: 'bold', marginLeft: 73 }}>Provenance</span>
                                    <br />
                                    <br />
                                    <AnimationContainer classNames="fadeIn">
                                        <div>
                                            <ul className="list-group">
                                                <StyledItemProvenanceBox>
                                                    <b>{this.state.observatoryInfo.name}</b>
                                                    <br />
                                                    <Link to={reverse(ROUTES.ORGANIZATION, { id: this.state.observatoryInfo.organization.id })}>
                                                        <img
                                                            style={{ marginTop: 8, marginBottom: 8, maxWidth: '80%', height: 'auto' }}
                                                            class="mx-auto d-block"
                                                            src={this.state.observatoryInfo.organization.logo}
                                                            alt=""
                                                        />
                                                    </Link>
                                                </StyledItemProvenanceBox>

                                                <StyledItemProvenanceBox>
                                                    <b>DATE ADDED</b>
                                                    <br />
                                                    {moment(this.state.observatoryInfo.created_at).format('DD MMM YYYY')}
                                                </StyledItemProvenanceBox>

                                                <StyledItemProvenanceBox>
                                                    <b>ADDED BY</b>
                                                    <br />
                                                    <Link to={reverse(ROUTES.USER_PROFILE, { userId: this.state.observatoryInfo.created_by.id })}>
                                                        {this.state.observatoryInfo.created_by.display_name}
                                                    </Link>
                                                </StyledItemProvenanceBox>
                                            </ul>
                                        </div>
                                    </AnimationContainer>
                                </div>
                            </ProvenanceBoxTabs>
                            {this.state.observatoryInfo.extraction_method === 'AUTOMATIC' && (
                                <ErrorMessage className="alert-server">The data has been partially imported automatically.</ErrorMessage>
                            )}
                        </SidebarStyledBox>
                    </div>
                )}
            </>
        );
    }
}

ProvenanceBox.propTypes = {
    resourceId: PropTypes.string.isRequired
};

export default ProvenanceBox;
