import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import capitalize from 'capitalize';
import useAuthentication from 'components/hooks/useAuthentication';
import ObservatoryModal from 'components/ObservatoryModal/ObservatoryModal';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import { StyledItemProvenanceBox } from 'components/ViewPaper/ProvenanceBox/styled';
import { MISC } from 'constants/graphSettings';
import { ORGANIZATIONS_MISC } from 'constants/organizationsTypes';
import ROUTES from 'constants/routes';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';
import { getOrganizationLogoUrl } from 'services/backend/organizations';
import { Contributor, Observatory, Organization, Paper } from 'services/backend/types';
import { setPaperObservatory } from 'slices/viewPaperSlice';

type ProvenanceProps = {
    observatoryInfo: Observatory;
    organizationInfo: Organization;
    paperResource: Paper;
    contributors: { created_at: string; created_by: Contributor }[];
    createdBy: Contributor;
    isLoadingProvenance: boolean;
    isLoadingContributors: boolean;
};

const Provenance: FC<ProvenanceProps> = ({
    observatoryInfo,
    organizationInfo,
    paperResource,
    contributors,
    createdBy,
    isLoadingProvenance,
    isLoadingContributors,
}) => {
    const [showAssignObservatory, setShowAssignObservatory] = useState(false);
    const { user } = useAuthentication();
    // @ts-expect-error
    const dataCiteDoi = useSelector((state) => state.viewPaper.dataCiteDoi);
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
                                        href={reverse(ROUTES.OBSERVATORY, {
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
                                    href={reverse(ROUTES.ORGANIZATION, {
                                        type: capitalize(ORGANIZATIONS_MISC.GENERAL),
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
                                        src={getOrganizationLogoUrl(organizationInfo.id)}
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
                    {paperResource.created_at && dayjs(paperResource.created_at).format('DD MMM YYYY')}
                </StyledItemProvenanceBox>
                {createdBy && createdBy.id && (
                    <StyledItemProvenanceBox>
                        <div className="mb-1">
                            <b>Added by</b>
                        </div>
                        <UserAvatar userId={createdBy.id} />
                        <Link
                            href={reverse(ROUTES.USER_PROFILE, {
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
                            .filter((c) => c.created_by.id !== MISC.UNKNOWN_ID)
                            .map((contributor, index) => (
                                <div key={`cntbrs-${contributor.created_by.id}${index}`}>
                                    <Link
                                        href={reverse(ROUTES.USER_PROFILE, {
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
                        <a href={`https://doi.org/${dataCiteDoi}`} target="_blank" rel="noopener noreferrer">
                            https://doi.org/{dataCiteDoi}
                        </a>
                    </StyledItemProvenanceBox>
                )}
            </ul>
            {!!user && user.isCurationAllowed && (
                <div className="text-center">
                    <Button size="sm" className="mt-2 mb-2" onClick={() => setShowAssignObservatory(true)}>
                        <FontAwesomeIcon icon={faPen} /> {observatoryInfo ? 'Edit' : 'Assign to observatory'}
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
                toggle={() => setShowAssignObservatory((v) => !v)}
            />
        </div>
    );
};

export default Provenance;
