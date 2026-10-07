import { faPen } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';
import styled from 'styled-components';

import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import useAuthentication from '@/components/hooks/useAuthentication';
import ObservatoryModal from '@/components/ObservatoryModal/ObservatoryModal';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { ORGANIZATIONS_TYPES } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getOrganizationLogoUrl } from '@/services/backend/organizations';
import { ConferenceSeries, Observatory, Organization } from '@/services/backend/types';

const ObservatoryBoxStyled = styled.div`
    float: right;
    border: 1px solid ${(props) => props.theme.lightDarker};
    border-radius: 5px;
    display: flex;
    padding: 5px;
    align-items: center;
    max-width: 40%;
    margin: 0 -25px 0 0;
    flex-direction: column;
    max-width: 200px;
    flex-shrink: 0;
`;

type ObservatoryBoxProps = {
    organization?: Organization;
    observatory?: Observatory;
    conferenceSeries?: ConferenceSeries;
    mutate?: () => void;
    resourceId: string;
};

const ObservatoryBox: FC<ObservatoryBoxProps> = ({ organization, observatory, conferenceSeries, mutate, resourceId }) => {
    const [isOpenObservatoryModal, setIsOpenObservatoryModal] = useState(false);
    const { isEditMode } = useIsEditMode();
    const { user } = useAuthentication();
    const [optimizedLogo, setOptimizedLogo] = useState(true);
    const organizationType = ORGANIZATIONS_TYPES.find((t) => t.id === organization?.type)?.label;
    let route = '';
    if (conferenceSeries) {
        route = reverse(ROUTES.EVENT_SERIES, { id: conferenceSeries.display_id });
    } else if (organization && organizationType) {
        route = reverse(ROUTES.ORGANIZATION, { type: organizationType, id: organization.displayId });
    }
    const link = observatory?.id ? reverse(ROUTES.OBSERVATORY, { id: observatory.display_id }) : route;

    const handleUpdate = () => {
        mutate?.();
    };
    return organization || observatory || conferenceSeries || isEditMode ? (
        <ObservatoryBoxStyled style={{ paddingRight: isEditMode ? 0 : 20 }}>
            <div className="flex items-center">
                <Link href={link} className="text-center" style={{ fontSize: '95%' }}>
                    {(organization || conferenceSeries) && (
                        <div className="relative" style={{ height: 65, width: 150 }}>
                            <Image
                                className="p-2"
                                src={getOrganizationLogoUrl(conferenceSeries?.organizationId || organization?.id || '')}
                                alt={`${conferenceSeries?.name ?? organization?.name} logo`}
                                layout="fill"
                                objectFit="contain"
                                unoptimized={!optimizedLogo}
                                onError={() => optimizedLogo && setOptimizedLogo(false)}
                            />
                        </div>
                    )}
                    <div>{conferenceSeries?.name || observatory?.name || organization?.name}</div>
                </Link>

                {isEditMode && !!user && user.isCurationAllowed && (
                    <>
                        {!organization && !observatory && !conferenceSeries && (
                            <span className="text-gray-500 ml-2 italic">No observatory assigned</span>
                        )}
                        <ActionButtonView icon={faPen} action={() => setIsOpenObservatoryModal(true)} isDisabled={false} title="Edit" />
                    </>
                )}
            </div>

            {isOpenObservatoryModal && (
                <ObservatoryModal
                    callBack={handleUpdate}
                    showDialog
                    resourceId={resourceId}
                    observatory={observatory}
                    organization={organization}
                    conferenceSeries={conferenceSeries}
                    toggle={() => setIsOpenObservatoryModal((v) => !v)}
                />
            )}
        </ObservatoryBoxStyled>
    ) : null;
};

export default ObservatoryBox;
