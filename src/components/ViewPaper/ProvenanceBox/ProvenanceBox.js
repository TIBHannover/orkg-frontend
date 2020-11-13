import React, { useState } from 'react';
import { StyledItemProvenanceBox, AnimationContainer, StyledActivity, ProvenanceBoxTabs, ErrorMessage, SidebarStyledBox } from './styled';
import ObservatoryModal from 'components/ObservatoryModal/ObservatoryModal';
import { TransitionGroup } from 'react-transition-group';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { MISC } from 'constants/graphSettings';

export default function ProvenanceBox(props) {
    const [showAssignObservatory, setShowAssignObservatory] = useState(false);
    const user = useSelector(state => state.auth.user);

    const [activeTab, setActiveTab] = useState(1);

    return (
        <div className="col-md-3">
            {!isEmpty(props.observatoryInfo) && (
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
                    <TransitionGroup exit={false}>
                        {activeTab === 1 ? (
                            <AnimationContainer key={1} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                                <div>
                                    <ul className="list-group">
                                        <StyledItemProvenanceBox>
                                            <b style={{ textTransform: 'uppercase' }}>{props.observatoryInfo.name}</b>
                                            <br />
                                            <Link to={reverse(ROUTES.ORGANIZATION, { id: props.observatoryInfo.organization.id })}>
                                                <img
                                                    style={{ marginTop: 8, marginBottom: 8, maxWidth: '80%', height: 'auto' }}
                                                    className="mx-auto d-block"
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
                                        {props.observatoryInfo.created_by && props.observatoryInfo.created_by.id && (
                                            <StyledItemProvenanceBox>
                                                <b>ADDED BY</b>
                                                <br />
                                                <Link to={reverse(ROUTES.USER_PROFILE, { userId: props.observatoryInfo.created_by.id })}>
                                                    {props.observatoryInfo.created_by.display_name}
                                                </Link>
                                            </StyledItemProvenanceBox>
                                        )}
                                        <StyledItemProvenanceBox>
                                            <b>CONTRIBUTORS</b>
                                            {props.contributors &&
                                                props.contributors.map((contributor, index) => (
                                                    <div key={`cntbrs-${contributor.id}${index}`}>
                                                        {contributor.created_by.display_name !== 'Unknown' && (
                                                            <span>
                                                                <Link to={reverse(ROUTES.USER_PROFILE, { userId: contributor.created_by.id })}>
                                                                    {contributor.created_by.display_name}
                                                                </Link>
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                        </StyledItemProvenanceBox>
                                    </ul>
                                    {!!user && user.isCurationAllowed && (
                                        <Button size="sm" className="float-right" onClick={() => setShowAssignObservatory(true)} color="link">
                                            <Icon icon={faPen} /> Edit
                                        </Button>
                                    )}
                                </div>
                            </AnimationContainer>
                        ) : (
                            <AnimationContainer key={2} classNames="fadeIn" timeout={{ enter: 700, exit: 0 }}>
                                <div>
                                    <div className="pt-3 pb-3 pl-3 pr-3">
                                        {props.contributors &&
                                            props.contributors.map(contributor => {
                                                return (
                                                    <StyledActivity key={`prov-${contributor.id}`} className="pl-3 pb-3">
                                                        <div className="time">{moment(contributor.createdAt).format('DD MMM YYYY')}</div>
                                                        <div>
                                                            {contributor.created_by.display_name ===
                                                                props.observatoryInfo.created_by.display_name && (
                                                                <>
                                                                    Added by{' '}
                                                                    <Link to={reverse(ROUTES.USER_PROFILE, { userId: contributor.created_by.id })}>
                                                                        <b>{contributor.created_by.display_name}</b>
                                                                    </Link>
                                                                </>
                                                            )}

                                                            {contributor.created_by.display_name !==
                                                                props.observatoryInfo.created_by.display_name && (
                                                                <>
                                                                    Updated by{' '}
                                                                    {contributor.created_by.id !== MISC.UNKNOWN_ID ? (
                                                                        <Link
                                                                            to={reverse(ROUTES.USER_PROFILE, { userId: contributor.created_by.id })}
                                                                        >
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
                        )}
                    </TransitionGroup>
                </SidebarStyledBox>
            )}
            {isEmpty(props.observatoryInfo) && !!user && user.isCurationAllowed && (
                <Button size="sm" outline onClick={() => setShowAssignObservatory(true)}>
                    Assign to observatory
                </Button>
            )}
            <ObservatoryModal
                callBack={props.changeObservatory}
                showDialog={showAssignObservatory}
                resourceId={props.resourceId}
                toggle={() => setShowAssignObservatory(v => !v)}
            />
        </div>
    );
}

ProvenanceBox.propTypes = {
    contributors: PropTypes.array,
    observatoryInfo: PropTypes.object,
    changeObservatory: PropTypes.func,
    resourceId: PropTypes.string.isRequired
};
