import React, { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { StyledItemProvenanceBox, AnimationContainer, StyledActivity, ProvenanceBoxTabs, ErrorMessage, SidebarStyledBox } from './styled';
import moment from 'moment';
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
                                <img
                                    style={{ marginTop: 8, marginBottom: 8, maxWidth: '100%', height: 'auto' }}
                                    class="mx-auto d-block"
                                    src={props.observatoryInfo.organization.logo}
                                    alt=""
                                />
                                <p style={{ fontSize: 12 }}>{props.observatoryInfo.organization.name}</p>
                            </StyledItemProvenanceBox>

                            <StyledItemProvenanceBox>
                                <b>DATE ADDED</b>
                                <br />
                                {moment(props.observatoryInfo.created_at).format('DD MMM YYYY')}
                            </StyledItemProvenanceBox>

                            <StyledItemProvenanceBox>
                                <b>ADDED BY</b>
                                <br />
                                {props.observatoryInfo.created_by.display_name}
                            </StyledItemProvenanceBox>
                            <StyledItemProvenanceBox>
                                <b>CONTRIBUTORS</b>
                                {props.contributors &&
                                    props.contributors.map((contributor, index) => {
                                        return (
                                            <div key={`cntbrs-${index}`}>
                                                {contributor.created_by.display_name !== 'Unknown' && (
                                                    <span>{contributor.created_by.display_name}</span>
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
                                            <div className={'time'}>{moment(contributor.created_at).format('DD MMM YYYY')}</div>
                                            <div>
                                                {contributor.created_by.display_name === props.observatoryInfo.created_by.display_name && (
                                                    <>
                                                        Added by <b>{contributor.created_by.display_name}</b>{' '}
                                                    </>
                                                )}

                                                {contributor.created_by.display_name !== props.observatoryInfo.created_by.display_name && (
                                                    <>
                                                        Updated by <b>{contributor.created_by.display_name}</b>{' '}
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
                {props.observatoryInfo.automatic_extraction && (
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
