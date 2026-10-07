import { faPen } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import styled from 'styled-components';

import ActionButtonView from '@/components/ActionButton/ActionButtonView';
import useComparison from '@/components/Comparison/hooks/useComparison';
import useAuthentication from '@/components/hooks/useAuthentication';
import ObservatoryModal from '@/components/ObservatoryModal/ObservatoryModal';
import useIsEditMode from '@/components/Utils/hooks/useIsEditMode';
import { ORGANIZATIONS_TYPES } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getOrganizationLogoUrl } from '@/services/backend/organizations';

const OrganizationBannerStyled = styled.div`
    border: 1px solid ${(props) => props.theme.lightDarker};
    border-radius: 5px;
    display: flex;
    padding: 5px;
    align-items: center;
    flex-direction: column;
    max-width: 200px;
    flex-shrink: 0;
`;

const ObservatoryBox = () => {
    const [isOpenObservatoryModal, setIsOpenObservatoryModal] = useState(false);
    const { comparison, organization, observatory, conferenceSeries, mutate } = useComparison();
    const { isEditMode } = useIsEditMode();
    const { user } = useAuthentication();
    const [optimizedLogo, setOptimizedLogo] = useState(true);

    if (!comparison) {
        return null;
    }

    const organizationType = ORGANIZATIONS_TYPES.find((t) => t.id === organization?.type)?.label;
    let route = '';
    if (conferenceSeries) {
        route = reverse(ROUTES.EVENT_SERIES, { id: conferenceSeries.display_id });
    } else if (organization && organizationType) {
        route = reverse(ROUTES.ORGANIZATION, { type: organizationType, id: organization.displayId });
    }
    const link = observatory?.id ? reverse(ROUTES.OBSERVATORY, { id: observatory.display_id }) : route;

    const handleUpdate = () => {
        mutate();
    };

    const isCurationAllowed = !!user && user.isCurationAllowed;

    return organization || observatory || conferenceSeries || (isEditMode && isCurationAllowed) ? (
        <OrganizationBannerStyled className={isEditMode ? '' : 'pr-5'}>
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
                    <div>{observatory?.name || organization?.name || conferenceSeries?.name}</div>
                </Link>

                {isEditMode && isCurationAllowed && (
                    <>
                        {!organization && !observatory && !conferenceSeries && (
                            <span className="text-gray-500 mx-3 italic text-sm">No observatory assigned</span>
                        )}
                        <ActionButtonView icon={faPen} action={() => setIsOpenObservatoryModal(true)} title="Edit" />
                    </>
                )}
            </div>

            {isOpenObservatoryModal && (
                <ObservatoryModal
                    callBack={handleUpdate}
                    showDialog
                    resourceId={comparison.id}
                    observatory={observatory}
                    organization={organization}
                    conferenceSeries={conferenceSeries}
                    allowConferenceSeries
                    resourceType="comparison"
                    toggle={() => setIsOpenObservatoryModal((v) => !v)}
                />
            )}
        </OrganizationBannerStyled>
    ) : null;
};

export default ObservatoryBox;
