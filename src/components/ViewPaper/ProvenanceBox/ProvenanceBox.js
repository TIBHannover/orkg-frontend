import React, { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { StyledItemProvenanceBox, AnimationContainer, StyledActivity, ProvenanceBoxTabs, ErrorMessage, SidebarStyledBox } from './styled';
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
                                <div>
                                    <b>{props.observatory.name}</b>
                                    <br />
                                    <center>
                                        <img style={{ paddingTop: 8 }} height="70" src={props.observatory.organizationLogo} alt="" />
                                    </center>
                                    <p style={{ fontSize: 12 }}>{props.observatory.organizationName}</p>
                                </div>
                            </StyledItemProvenanceBox>

                            <StyledItemProvenanceBox>
                                <p>
                                    <b>DATE ADDED</b>
                                    <br />
                                    {props.observatoryInfo.created_at}
                                </p>
                            </StyledItemProvenanceBox>

                            <StyledItemProvenanceBox>
                                <p>
                                    <b>ADDED BY</b>
                                    <br />
                                    {props.observatory.userName}
                                </p>
                            </StyledItemProvenanceBox>
                            <StyledItemProvenanceBox>
                                <b>CONTRIBUTORS</b>
                                {props.userData.map((key, index) => {
                                    return <div key={`cntbrs-${index}`}>{key['created_by'] !== 'Unknown' && <span>{key['created_by']}</span>}</div>;
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
                            {props.userData.map((key, index) => {
                                return (
                                    <StyledActivity key={`prov-${index}`} className="pl-3 pb-3">
                                        <div className={'time'}>{key['created_at']}</div>
                                        <div>
                                            {key['created_by'] === props.observatory.userName && (
                                                <>
                                                    Added by <b>{key['created_by']}</b>{' '}
                                                </>
                                            )}

                                            {key['created_by'] !== props.observatory.userName && (
                                                <>
                                                    Updated by <b>{key['created_by']}</b>{' '}
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
    observatory: PropTypes.object.isRequired,
    userData: PropTypes.array.isRequired,
    observatoryInfo: PropTypes.object.isRequired
};
