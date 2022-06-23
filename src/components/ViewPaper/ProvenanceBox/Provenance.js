import { useState } from 'react';
import ObservatoryModal from 'components/ObservatoryModal/ObservatoryModal';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { setPaperObservatory } from 'slices/viewPaperSlice';
import { faPen } from '@fortawesome/free-solid-svg-icons';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { Button } from 'reactstrap';
import { MISC } from 'constants/graphSettings';
import { StyledItemProvenanceBox } from './styled';

const Provenance = ({ observatoryInfo, organizationInfo, paperResource, contributors, createdBy, isLoadingProvenance, isLoadingContributors }) => {
    const [showAssignObservatory, setShowAssignObservatory] = useState(false);
    const user = useSelector(state => state.auth.user);
    const dataCiteDoi = useSelector(state => state.viewPaper.dataCiteDoi?.label);
    const dispatch = useDispatch();

    return (
        <div>
            <ul className="list-group pt-2">
                {!isLoadingProvenance && (observatoryInfo || organizationInfo) && (
                    <StyledItemProvenanceBox>
                        {observatoryInfo && (
                            <>
                                <div className="mb-1">
                                    <b>Belongs to observatory</b>
                                </div>
                                {observatoryInfo.display_id && (
                                    <Link
                                        to={reverse(ROUTES.OBSERVATORY, {
                                            id: observatoryInfo.display_id,
                                        })}
                                    >
                                        {observatoryInfo.name}
                                    </Link>
                                )}
                                <br />
                            </>
                        )}
                        {organizationInfo && (
                            <>
                                {!observatoryInfo && (
                                    <div className="mb-2">
                                        <b>Belongs to organization</b>
                                    </div>
                                )}
                                <Link
                                    to={reverse(ROUTES.ORGANIZATION, {
                                        id: organizationInfo.display_id,
                                    })}
                                >
                                    <img
                                        style={{
                                            marginTop: 8,
                                            marginBottom: 8,
                                            maxWidth: '80%',
                                            height: 'auto',
                                        }}
                                        className="mx-auto d-block"
                                        src={organizationInfo.logo}
                                        alt=""
                                    />
                                </Link>
                            </>
                        )}
                    </StyledItemProvenanceBox>
                )}
                {isLoadingProvenance && 'Loading ...'}

                <StyledItemProvenanceBox>
                    <div className="mb-1">
                        <b>Added on</b>
                    </div>
                    {paperResource.created_at && moment(paperResource.created_at).format('DD MMM YYYY')}
                </StyledItemProvenanceBox>
                {createdBy && createdBy.id && (
                    <StyledItemProvenanceBox>
                        <div className="mb-1">
                            <b>Added by</b>
                        </div>
                        <UserAvatar userId={createdBy.id} />
                        <Link
                            to={reverse(ROUTES.USER_PROFILE, {
                                userId: createdBy.id,
                            })}
                            className="ms-2"
                        >
                            {createdBy.display_name}
                        </Link>
                    </StyledItemProvenanceBox>
                )}

                <StyledItemProvenanceBox>
                    <div className="mb-1">
                        <b>Contributors</b>
                    </div>
                    {!isLoadingContributors &&
                        contributors?.length > 0 &&
                        contributors
                            .filter(c => c.created_by !== MISC.UNKNOWN_ID)
                            .map((contributor, index) => (
                                <div key={`cntbrs-${contributor.id}${index}`}>
                                    <Link
                                        to={reverse(ROUTES.USER_PROFILE, {
                                            userId: contributor.created_by.id,
                                        })}
                                    >
                                        {contributor.created_by.display_name}
                                    </Link>
                                </div>
                            ))}
                    {!isLoadingContributors && contributors?.length === 0 && 'No contributors'}
                    {isLoadingContributors && 'Loading ...'}
                </StyledItemProvenanceBox>
                {dataCiteDoi && (
                    <StyledItemProvenanceBox>
                        <div className="mb-1">
                            <b>DOI</b>
                        </div>
                        {dataCiteDoi}
                    </StyledItemProvenanceBox>
                )}
            </ul>
            {!!user && user.isCurationAllowed && (
                <div className="text-center">
                    <Button size="sm" className="mt-2 mb-2" onClick={() => setShowAssignObservatory(true)}>
                        <Icon icon={faPen} /> {observatoryInfo ? 'Edit' : 'Assign to observatory'}
                    </Button>
                </div>
            )}
            <ObservatoryModal
                callBack={(observatory_id, organization_id) => {
                    dispatch(setPaperObservatory({ observatory_id, organization_id }));
                }}
                showDialog={showAssignObservatory}
                resourceId={paperResource.id}
                observatory={observatoryInfo}
                organization={organizationInfo}
                toggle={() => setShowAssignObservatory(v => !v)}
            />
        </div>
    );
};

Provenance.propTypes = {
    contributors: PropTypes.array,
    observatoryInfo: PropTypes.object,
    organizationInfo: PropTypes.object,
    paperResource: PropTypes.object,
    createdBy: PropTypes.object,
    isLoadingProvenance: PropTypes.bool,
    isLoadingContributors: PropTypes.bool,
};

export default Provenance;
