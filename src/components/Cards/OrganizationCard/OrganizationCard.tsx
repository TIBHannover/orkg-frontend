import { Card, CardContent } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getOrganizationLogoUrl } from '@/services/backend/organizations';

type OrganizationCardProps = {
    organization: {
        id: string;
        displayId: string;
        name: string;
    };
    type?: string;
};

const OrganizationCard = ({ organization, type }: OrganizationCardProps) => {
    const [optimizedLogo, setOptimizedLogo] = useState(true);

    return (
        <Link href={reverse(ROUTES.ORGANIZATION, { type, id: organization.displayId })}>
            <Card className="h-full">
                <div className="relative h-[150px] w-full p-4">
                    <Image
                        className="p-2 object-contain"
                        src={getOrganizationLogoUrl(organization.id)}
                        alt={`${organization.name} logo`}
                        fill
                        unoptimized={!optimizedLogo}
                        onError={() => optimizedLogo && setOptimizedLogo(false)}
                    />
                </div>
                <CardContent>
                    <p className="text-center font-semibold">{organization.name}</p>
                </CardContent>
            </Card>
        </Link>
    );
};

export default OrganizationCard;
