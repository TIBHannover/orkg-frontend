import React, { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { StyledItemProvenanceBox, AnimationContainer, StyledActivity, ProvenanceBoxTabs, ErrorMessage, SidebarStyledBox } from './styled';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';

export default function ProvenanceBox(props) {
    let rightSidebar;

    const [activeTab, setActiveTab] = useState(1);

    switch (activeTab) {
        case 1:
        default:
            rightSidebar = (
                <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                    <div>
                        <ul className="list-group">
                            <StyledItemProvenanceBox>
                                <b>{props.observatoryInfo.name}</b>
                                <br />
                                <Link to={reverse(ROUTES.ORGANIZATION, { id: props.observatoryInfo.organization.id })}>
                                    <img
                                        style={{ marginTop: 8, marginBottom: 8, maxWidth: '80%', height: 'auto' }}
                                        class="mx-auto d-block"
                                        src={props.observatoryInfo.organization.logo}
                                        alt=""
                                    />
                                </Link>
                                {/* <p> */}
                                    {/* <Link to={reverse(ROUTES.ORGANIZATION, { id: props.observatoryInfo.organization.id })}> */}
                                        {/* {props.observatoryInfo.organization.name} */}
                                    {/* </Link> */}
                                {/* </p> */}
                            </StyledItemProvenanceBox>

                            <StyledItemProvenanceBox>
                                <b>DATE ADDED</b>
                                <br />
                                {moment(props.observatoryInfo.created_at).format('DD MMM YYYY')}
                            </StyledItemProvenanceBox>

                            <StyledItemProvenanceBox>
                                <b>ADDED BY</b>
                                <br />
                                <Link to={reverse(ROUTES.USER_PROFILE, { userId: props.observatoryInfo.created_by.id })}>
                                    {props.observatoryInfo.created_by.display_name}
                                </Link>
                            </StyledItemProvenanceBox>
                            <StyledItemProvenanceBox>
                                <b>CONTRIBUTORS</b>
                                {props.contributors &&
                                    props.contributors.map((contributor, index) => {
                                        return (
                                            <div key={`cntbrs-${index}`}>
                                                {contributor.created_by.display_name !== 'Unknown' && (
                                                    <span>
                                                        <Link to={reverse(ROUTES.USER_PROFILE, { userId: contributor.created_by.id })}>
                                                            {contributor.created_by.display_name}
                                                        </Link>
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                            </StyledItemProvenanceBox>
                        </ul>
                    </div>
                </AnimationContainer>
            );
            break;
        case 2:
            rightSidebar = (
                <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                    <div>
                        <div className="pt-3 pb-3 pl-3 pr-3">
                            {props.contributors &&
                                props.contributors.map((contributor, index) => {
                                    return (
                                        <StyledActivity key={`prov-${index}`} className="pl-3 pb-3">
                                            <div className={'time'}>{moment(contributor.createdAt).format('DD MMM YYYY')}</div>
                                            <div>
                                                {contributor.created_by.display_name === props.observatoryInfo.created_by.display_name && (
                                                    <>
                                                        Added by{' '}
                                                        <Link to={reverse(ROUTES.USER_PROFILE, { userId: contributor.created_by.id })}>
                                                            <b>{contributor.created_by.display_name}</b>
                                                        </Link>
                                                    </>
                                                )}

                                                {contributor.created_by.display_name !== props.observatoryInfo.created_by.display_name && (
                                                    <>
                                                        Updated by{' '}
                                                        {contributor.created_by.id !== '00000000-0000-0000-0000-000000000000' ? (
                                                            <Link to={reverse(ROUTES.USER_PROFILE, { userId: contributor.created_by.id })}>
                                                                <b>{contributor.created_by.display_name}</b>
                                                            </Link>
                                                        ) : (
                                                            <b>{contributor.created_by.display_name}</b>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </StyledActivity>
                                    );
                                })}
                        </div>
                    </div>
                </AnimationContainer>
            );
            break;
    }

    return (
        <div className="col-md-3 ">
            <SidebarStyledBox className="box rounded-lg" style={{ minHeight: 430, backgroundColor: '#f8f9fb' }}>
                <ProvenanceBoxTabs className="clearfix d-flex">
                    <div id="div1" className={`h6 col-md-6 text-center tab ${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>
                        Provenance
                    </div>
                    <div id="div2" className={`h6 col-md-6 text-center tab ${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>
                        Timeline
                    </div>
                </ProvenanceBoxTabs>
                {props.observatoryInfo.extraction_method === 'AUTOMATIC' && (
                    <ErrorMessage className="alert-server">The data has been partially imported automatically.</ErrorMessage>
                )}
                <TransitionGroup exit={false}>{rightSidebar}</TransitionGroup>
            </SidebarStyledBox>
        </div>
    );
}

ProvenanceBox.propTypes = {
    contributors: PropTypes.array.isRequired,
    observatoryInfo: PropTypes.object.isRequired
};
