import { Skeleton } from '@heroui/react';
import { FC, useEffect } from 'react';
import useSWR from 'swr';

import EventsCard from '@/components/Organization/EventsCard';
import ListGroup from '@/components/Ui/List/ListGroup';
import Container from '@/components/Ui/Structure/Container';
import { conferenceSeriesUrl, getSeriesListByConferenceId } from '@/services/backend/conferences-series';

type ConferenceEventsProps = {
    conferenceId: string;
    conferenceName: string;
};

const ConferenceEvents: FC<ConferenceEventsProps> = ({ conferenceId, conferenceName }) => {
    const { data: conferencesList = [], isLoading } = useSWR(
        conferenceId ? [conferenceId, conferenceSeriesUrl, 'getSeriesListByConferenceId'] : null,
        async ([id]) => (await getSeriesListByConferenceId(id)).content,
        { shouldRetryOnError: false },
    );

    useEffect(() => {
        document.title = `${conferenceName} - Conference - ORKG`;
    }, [conferenceName]);

    return (
        <>
            <Container className="flex items-center mt-6 mb-6">
                <div className="flex grow">
                    <h1 className="text-xl shrink-0 mb-0">Conference events</h1>
                </div>
            </Container>
            <Container className="p-0 box rounded">
                {!isLoading && (
                    <ListGroup>
                        {conferencesList.length > 0 ? (
                            <>
                                {conferencesList.map((conference) => (
                                    <EventsCard conference={conference} key={`pc${conference.display_id}`} />
                                ))}
                            </>
                        ) : (
                            <div className="text-center mt-6 mb-6">No conferences</div>
                        )}
                    </ListGroup>
                )}
                {isLoading && (
                    <div className="mt-6 mb-6 container mx-auto px-4 box rounded">
                        <div className="text-left flex flex-col gap-2">
                            <Skeleton className="w-full h-5 rounded" />
                            <Skeleton className="w-3/4 h-5 rounded" />
                        </div>
                    </div>
                )}
            </Container>
        </>
    );
};

export default ConferenceEvents;
