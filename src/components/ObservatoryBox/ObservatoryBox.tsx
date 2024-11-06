import { faPen } from '@fortawesome/free-solid-svg-icons';
import capitalize from 'capitalize';
import ActionButtonView from 'components/ActionButton/ActionButtonView';
import ObservatoryModal from 'components/ObservatoryModal/ObservatoryModal';
import useIsEditMode from 'components/Utils/hooks/useIsEditMode';
import { ORGANIZATIONS_MISC } from 'constants/organizationsTypes';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { getOrganizationLogoUrl } from 'services/backend/organizations';
import { ConferenceSeries, Observatory, Organization } from 'services/backend/types';
import { RootStore } from 'slices/types';
import styled from 'styled-components';

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
    const user = useSelector((state: RootStore) => state.auth.user);

    let route = '';
    if (organization?.type === ORGANIZATIONS_MISC.EVENT) {
        route = reverse(ROUTES.EVENT_SERIES, { id: observatory?.display_id });
    } else if (organization?.type === ORGANIZATIONS_MISC.GENERAL) {
        route = reverse(ROUTES.ORGANIZATION, { type: capitalize(ORGANIZATIONS_MISC.GENERAL), id: organization.id });
    }
    const link = observatory?.id ? reverse(ROUTES.OBSERVATORY, { id: observatory.display_id }) : route;

    const handleUpdate = () => {
        mutate?.();
    };
    return organization || observatory || conferenceSeries || isEditMode ? (
        <ObservatoryBoxStyled style={{ paddingRight: isEditMode ? 0 : 20 }}>
            <div className="d-flex align-items-center">
                <Link href={link} className="text-center" style={{ fontSize: '95%' }}>
                    {(organization || conferenceSeries) && (
                        <div className="position-relative" style={{ height: 65, width: 150 }}>
                            <Image
                                className="p-2"
                                src={getOrganizationLogoUrl(conferenceSeries?.organizationId || organization?.id || '')}
                                alt={`${organization?.name} logo`}
                                layout="fill"
                                objectFit="contain"
                            />
                        </div>
                    )}
                    <div>{conferenceSeries?.name || observatory?.name || organization?.name}</div>
                </Link>

                {isEditMode && !!user && user.isCurationAllowed && (
                    <>
                        {!organization && !observatory && !conferenceSeries && (
                            <span className="text-muted ms-2 fst-italic">No observatory assigned</span>
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
                    toggle={() => setIsOpenObservatoryModal((v) => !v)}
                />
            )}
        </ObservatoryBoxStyled>
    ) : null;
};

export default ObservatoryBox;
