import { Skeleton } from '@heroui/react';
import Link from 'next/link';
import useSWR from 'swr';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getAllObservatoriesByOrganizationId, organizationsUrl } from '@/services/backend/organizations';

type ObservatoriesProps = {
    organizationsId: string;
};

const Observatories = ({ organizationsId }: ObservatoriesProps) => {
    const { data: observatories, isLoading: isLoadingObservatories } = useSWR(
        organizationsId ? [organizationsId, organizationsUrl, 'getAllObservatoriesByOrganizationId'] : null,
        ([params]) => getAllObservatoriesByOrganizationId(params),
    );

    return (
        <>
            <div className="mx-auto px-3 max-w-container flex items-center my-6">
                <div className="flex grow">
                    <h1 className="text-xl shrink-0 mb-0">Observatories</h1>
                </div>
            </div>
            <div className="mx-auto px-3 max-w-container">
                {observatories && observatories.length > 0 && (
                    <ul className="m-0 flex w-full flex-col list-none divide-y divide-border bg-surface overflow-hidden rounded-[var(--radius)] border border-border box">
                        {observatories.map((observatory) => (
                            <li key={`c${observatory.display_id}`} className="block p-4">
                                <div>
                                    <Link href={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })}>{observatory.name}</Link>
                                </div>
                                <div className="line-clamp-3">
                                    <small className="text-muted">{observatory.description}</small>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {observatories?.length === 0 && !isLoadingObservatories && (
                    <div className="box rounded">
                        <div className="p-12 text-center my-6">No Observatories</div>
                    </div>
                )}
                {isLoadingObservatories && (
                    <div className="my-6 box rounded p-4">
                        <div className="flex flex-col gap-2">
                            <Skeleton className="w-full h-5 rounded" />
                            <Skeleton className="w-3/4 h-5 rounded" />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Observatories;
