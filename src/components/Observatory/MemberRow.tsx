import { FC, ReactNode } from 'react';
import useSWR from 'swr';

import ContributorCard from '@/components/Cards/ContributorCard/ContributorCard';
import { MISC } from '@/constants/graphSettings';
import { getOrganization, organizationsUrl } from '@/services/backend/organizations';
import { Contributor, Organization } from '@/services/backend/types';

type MemberRowProps = {
    member: Contributor;
    organizationsList: Organization[];
    actions?: ReactNode;
    className?: string;
};

const MemberRow: FC<MemberRowProps> = ({ member, organizationsList, actions, className = '' }) => {
    const localOrg = member.organizationId ? organizationsList.find((o) => o.id === member.organizationId) : undefined;
    const shouldFetch = !!member.organizationId && member.organizationId !== MISC.UNKNOWN_ID && !localOrg;

    const { data: fetchedOrg } = useSWR(shouldFetch ? [member.organizationId, organizationsUrl, 'getOrganization'] : null, ([id]) =>
        getOrganization(id),
    );

    const orgName = localOrg?.name ?? fetchedOrg?.name;

    return (
        <div className={`flex items-start gap-2 ${className}`}>
            <div className="grow min-w-0">
                <ContributorCard id={member.id} subTitle={orgName} />
            </div>
            {actions}
        </div>
    );
};

export default MemberRow;
