import { faCheck, faPlus, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Skeleton, toast } from '@heroui/react';
import capitalize from 'capitalize';
import Link from 'next/link';
import { FC, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import useAuthentication from '@/components/hooks/useAuthentication';
import AddOrganization from '@/components/Observatory/AddOrganization';
import { ORGANIZATIONS_MISC } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { updateObservatory } from '@/services/backend/observatories';
import { getOrganizationLogoUrl } from '@/services/backend/organizations';
import { Organization } from '@/services/backend/types';

type OrganizationsBoxProps = {
    organizations: Organization[];
    isLoadingOrganizations: boolean;
    isEditMode: boolean;
    observatoryId: string;
    mutateObservatory: () => void;
};

const OrganizationsBox: FC<OrganizationsBoxProps> = ({ organizations, isLoadingOrganizations, observatoryId, mutateObservatory, isEditMode }) => {
    const { user } = useAuthentication();
    const [showAddOrganizationDialog, setShowAddOrganizationDialog] = useState(false);

    const deleteOrganization = async (organization: Organization) => {
        try {
            await updateObservatory(observatoryId, {
                organizations: organizations.filter((o) => o.id !== organization.id).map((o) => o.id),
            });
            mutateObservatory();
            toast.success('Organization deleted successfully');
        } catch {
            toast.danger('Error deleting an organization');
        }
    };

    const canEdit = isEditMode && !!user && user.isCurationAllowed;

    if (!canEdit && !isLoadingOrganizations && organizations.length === 0) {
        return null;
    }

    return (
        <div className="box rounded-lg p-3">
            {!isLoadingOrganizations && (
                <div className="flex flex-wrap justify-center items-center gap-3">
                    {organizations.map((organization) => (
                        <div key={organization.id} className="relative w-40 h-24 flex items-center justify-center rounded-lg border bg-white p-2">
                            <Link
                                href={reverse(ROUTES.ORGANIZATION, {
                                    type: capitalize(ORGANIZATIONS_MISC.GENERAL),
                                    id: organization.displayId,
                                })}
                                className="flex items-center justify-center w-full h-full"
                            >
                                <img
                                    className="max-h-full max-w-full object-contain"
                                    src={getOrganizationLogoUrl(organization.id)}
                                    alt={`${organization.name} logo`}
                                />
                            </Link>
                            {canEdit && (
                                <div className="absolute top-1 right-1">
                                    <ActionButton
                                        title="Delete this organization from the observatory"
                                        icon={faTrash}
                                        requireConfirmation
                                        confirmationMessage="Are you sure to delete?"
                                        confirmationButtons={[
                                            {
                                                title: 'Delete',
                                                color: 'danger',
                                                icon: faCheck,
                                                action: () => deleteOrganization(organization),
                                            },
                                            {
                                                title: 'Cancel',
                                                color: 'secondary',
                                                icon: faTimes,
                                            },
                                        ]}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                    {canEdit && (
                        <>
                            <Button variant="outline" size="sm" onPress={() => setShowAddOrganizationDialog((v) => !v)}>
                                <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                Add organization
                            </Button>
                            <AddOrganization
                                showDialog={showAddOrganizationDialog}
                                toggle={() => setShowAddOrganizationDialog((v) => !v)}
                                id={observatoryId}
                                organizations={organizations}
                                mutateObservatory={mutateObservatory}
                            />
                        </>
                    )}
                </div>
            )}
            {isLoadingOrganizations && (
                <div className="flex flex-wrap justify-center items-center gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="w-40 h-24 rounded-lg" />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrganizationsBox;
