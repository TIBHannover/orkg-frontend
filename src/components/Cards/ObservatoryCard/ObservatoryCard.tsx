import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from '@heroui/react';
import Link from 'next/link';

import useObservatoryStats from '@/components/Observatory/hooks/useObservatoryStats';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getOrganizationLogoUrl } from '@/services/backend/organizations';
import { Observatory } from '@/services/backend/types';

type ObservatoryCardProps = {
    observatory: Observatory;
};

const ObservatoryCard = ({ observatory }: ObservatoryCardProps) => {
    const { stats, isLoading: isLoadingStats } = useObservatoryStats({ id: observatory.id });

    return (
        <Card className="h-full border border-border">
            <Link href={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })} className="group no-underline">
                <Card.Content className="p-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                        {observatory.organization_ids.map((oId) => (
                            <span key={oId} className="mt-2.5 p-0.5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={getOrganizationLogoUrl(oId)} alt={`${oId} logo`} height="45" className="h-[45px] w-auto" />
                            </span>
                        ))}
                    </div>
                    <div className="mt-2">
                        <div className="font-bold group-hover:underline">{observatory.name}</div>
                        <div className="mt-1 text-sm text-foreground-500">
                            Papers: <b>{!isLoadingStats ? stats.papers : <FontAwesomeIcon icon={faSpinner} spin size="sm" />}</b>
                            <br />
                            Comparisons: <b>{!isLoadingStats ? stats.comparisons : <FontAwesomeIcon icon={faSpinner} spin size="sm" />}</b>
                        </div>
                    </div>
                </Card.Content>
            </Link>
        </Card>
    );
};

export default ObservatoryCard;
