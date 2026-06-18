import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import capitalize from 'capitalize';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC, ReactNode, useState } from 'react';

import useAuthentication from '@/components/hooks/useAuthentication';
import ObservatoryModal from '@/components/ObservatoryModal/ObservatoryModal';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import { MISC } from '@/constants/graphSettings';
import { ORGANIZATIONS_MISC } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getOrganizationLogoUrl } from '@/services/backend/organizations';
import { Contributor, Observatory, Organization, Paper } from '@/services/backend/types';

type ProvenanceItemProps = {
    children: ReactNode;
};

const ProvenanceItem: FC<ProvenanceItemProps> = ({ children }) => (
    <li className="bg-surface px-4 pt-2.5 pb-4 text-xs border-b border-border last:border-b-0">{children}</li>
);

type ProvenanceProps = {
    observatoryInfo?: Observatory;
    organizationInfo?: Organization;
    paperResource: Paper;
    contributors: { created_at: string; created_by: Contributor }[];
    createdBy?: Contributor;
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
    const { dataCiteDoi, mutatePaper } = useViewPaper({ paperId: paperResource.id });

    return (
        <div>
            <ul className="list-none p-0 m-0 pt-2">
                {!isLoadingProvenance && (observatoryInfo || organizationInfo) && (
                    <ProvenanceItem>
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
                                        id: organizationInfo.displayId,
                                    })}
                                >
                                    <img className="mx-auto block my-2 max-w-[80%] h-auto" src={getOrganizationLogoUrl(organizationInfo.id)} alt="" />
                                </Link>
                            </>
                        )}
                    </ProvenanceItem>
                )}
                {isLoadingProvenance && 'Loading ...'}

                <ProvenanceItem>
                    <div className="mb-1">
                        <b>Added on</b>
                    </div>
                    {paperResource.created_at && dayjs(paperResource.created_at).format('DD MMM YYYY')}
                </ProvenanceItem>
                {createdBy && createdBy.id && (
                    <ProvenanceItem>
                        <div className="mb-1">
                            <b>Added by</b>
                        </div>
                        <UserAvatar userId={createdBy.id} showDisplayName={true} />
                    </ProvenanceItem>
                )}

                <ProvenanceItem>
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
                                        {contributor.created_by.displayName}
                                    </Link>
                                </div>
                            ))}
                    {!isLoadingContributors && contributors?.length === 0 && 'No contributors'}
                    {isLoadingContributors && 'Loading ...'}
                </ProvenanceItem>
                {dataCiteDoi && (
                    <ProvenanceItem>
                        <div className="mb-1">
                            <b>DOI</b>
                        </div>
                        <a href={`https://doi.org/${dataCiteDoi}`} target="_blank" rel="noopener noreferrer">
                            https://doi.org/{dataCiteDoi}
                        </a>
                    </ProvenanceItem>
                )}
            </ul>
            {!!user && user.isCurationAllowed && (
                <div className="text-center">
                    <Button size="sm" className="button--orkg-secondary my-2" onPress={() => setShowAssignObservatory(true)}>
                        <FontAwesomeIcon icon={faPen} /> {observatoryInfo ? 'Edit' : 'Assign to observatory'}
                    </Button>
                </div>
            )}
            <ObservatoryModal
                callBack={() => {
                    mutatePaper();
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
