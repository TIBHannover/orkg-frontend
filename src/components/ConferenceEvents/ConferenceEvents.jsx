import { Skeleton } from '@heroui/react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import EventsCard from '@/components/Organization/EventsCard';
import ListGroup from '@/components/Ui/List/ListGroup';
import Container from '@/components/Ui/Structure/Container';
import { getSeriesListByConferenceId } from '@/services/backend/conferences-series';

const ConferenceEvents = ({ conferenceId, conferenceName }) => {
    const [isLoadingConferences, setIsLoadingConferences] = useState(null);
    const [conferencesList, setConferencesList] = useState([]);

    useEffect(() => {
        const loadConferences = async () => {
            setIsLoadingConferences(true);
            getSeriesListByConferenceId(conferenceId)
                .then((responseJson) => {
                    setConferencesList(responseJson.content);
                    document.title = `${conferenceName} - Conference - ORKG`;
                })
                .catch(() => {
                    setIsLoadingConferences(false);
                });
            setIsLoadingConferences(false);
        };

        loadConferences();
    }, [conferenceId, conferenceName]);

    return (
        <>
            <Container className="flex items-center mt-6 mb-6">
                <div className="flex grow">
                    <h1 className="text-xl shrink-0 mb-0">Conference events</h1>
                </div>
            </Container>
            <Container className="p-0 box rounded">
                {!isLoadingConferences && (
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
                {isLoadingConferences && (
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

ConferenceEvents.propTypes = {
    conferenceId: PropTypes.string.isRequired,
    conferenceName: PropTypes.string.isRequired,
};

export default ConferenceEvents;
