import { reverse } from 'named-urls';
import Link from 'next/link';
import useSWR from 'swr';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import ListGroup from '@/components/Ui/List/ListGroup';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';
import { getAllObservatoriesByOrganizationId, organizationsUrl } from '@/services/backend/organizations';

const Observatories = ({ organizationsId }: { organizationsId: string }) => {
    const { data: observatories, isLoading: isLoadingObservatories } = useSWR(
        organizationsId ? [organizationsId, organizationsUrl, 'getAllObservatoriesByOrganizationId'] : null,
        ([params]) => getAllObservatoriesByOrganizationId(params),
    );

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-grow-1">
                    <h1 className="h5 flex-shrink-0 mb-0">Observatories</h1>
                </div>
            </Container>
            <Container className="p-0">
                {observatories && observatories.length > 0 && (
                    <ListGroup className="box">
                        {observatories.map((observatory) => (
                            <div key={`c${observatory.display_id}`} className="list-group-item pe-2 p-3">
                                <div>
                                    <Link href={reverse(ROUTES.OBSERVATORY, { id: observatory.display_id })}>{observatory.name}</Link>
                                </div>
                                <div className="tw:line-clamp-3">
                                    <small className="text-muted">{observatory.description}</small>
                                </div>
                            </div>
                        ))}
                    </ListGroup>
                )}
                {observatories?.length === 0 && !isLoadingObservatories && (
                    <div className="container box rounded">
                        <div className="p-5 text-center mt-4 mb-4">No Observatories</div>
                    </div>
                )}
                {isLoadingObservatories && (
                    <div className="text-center mt-4 mb-4 p-5 container box rounded'">
                        <div className="text-start">
                            <ContentLoader speed={2} width={400} height={50} viewBox="0 0 400 50" style={{ width: '100% !important' }}>
                                <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                            </ContentLoader>
                        </div>
                    </div>
                )}
            </Container>
        </>
    );
};

export default Observatories;
