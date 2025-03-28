import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Container, ListGroup } from 'reactstrap';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import EventsCard from '@/components/Organization/EventsCard';
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
            <Container className="d-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-grow-1">
                    <h1 className="h5 flex-shrink-0 mb-0">Conference events</h1>
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
                            <div className="text-center mt-4 mb-4">No conferences</div>
                        )}
                    </ListGroup>
                )}
                {isLoadingConferences && (
                    <div className="text-center mt-4 mb-4 p-5 container box rounded">
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

ConferenceEvents.propTypes = {
    conferenceId: PropTypes.string.isRequired,
    conferenceName: PropTypes.string.isRequired,
};

export default ConferenceEvents;
