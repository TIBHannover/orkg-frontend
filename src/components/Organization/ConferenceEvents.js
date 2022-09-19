import { useState, useEffect } from 'react';
import { Container, ListGroup } from 'reactstrap';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getComparisonsByOrganizationId, getSeriesListByConferenceId } from 'services/backend/organizations';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import ContentLoader from 'react-content-loader';
import { getComparisonData, groupVersionsOfComparisons } from 'utils';
import { find } from 'lodash';
import PropTypes from 'prop-types';
import { getConferenceEventsByDoi } from 'services/datacite';
import EventsCard from './EventsCard';

const ConferenceEvents = ({ organizationId }) => {
    const [isLoadingConferences, setIsLoadingConferences] = useState(null);
    const [conferencesList, setConferencesList] = useState([]);

    useEffect(() => {
        const loadConferences = async () => {
            let res = [];
            setIsLoadingConferences(true);
            getSeriesListByConferenceId(organizationId)
                .then(responseJson => {
                    console.log(responseJson);
                    setConferencesList(responseJson);
                    // document.title = `${responseJson.name} - Organization - ORKG`;
                    // (responseJson.id);
                    // (responseJson.name);
                    // responseJson.homepage);
                    // (responseJson.logo);
                    // setIsLoading(false);
                    // (responseJson.created_by);
                    // (responseJson.type);
                    // (responseJson.metadata && responseJson.metadata.date ? responseJson.metadata.date : '');
                    // (responseJson.metadata && responseJson.metadata.is_double_blind && responseJson.metadata.is_double_blind);
                    // (responseJson.doi);
                })
                .catch(error => {
                    setIsLoadingConferences(false);
                });
            /*
            const ev = getConferenceEventsByDoi(conferenceDoi);
            Promise.all([ev])
            .then(async data => {
            let res = [];
            const ri = data[0].data.attributes.relatedIdentifiers;
            for (let i = 0; i < ri.length; i += 1) {
            const evv = await getConferenceEventsByDoi(ri[i].relatedIdentifier);
            res.push({
            doi: evv.data.id,
            title: evv.data.attributes.titles.find(t => t.titleType === null).title,
            dates: evv.data.attributes.dates,
            process: evv.data.attributes.descriptions.find(d => d.descriptionType === 'Methods').description,
            });
            }
            setConferencesList(res);
            })
            .catch(e => {}); */
            setIsLoadingConferences(false);
        };

        loadConferences();
    }, [organizationId, organizationId]);

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-grow-1">
                    <h1 className="h5 flex-shrink-0 mb-0">Conference Events</h1>
                </div>
            </Container>
            <Container className="p-0 box rounded">
                {!isLoadingConferences && (
                    <ListGroup>
                        {console.log(conferencesList)}
                        {conferencesList.length > 0 ? (
                            <>
                                {conferencesList.map(conference => (
                                    <EventsCard conference={conference} key={`pc${conference.display_id}`} />
                                ))}
                            </>
                        ) : (
                            <div className="text-center mt-4 mb-4">No Conferences</div>
                        )}
                    </ListGroup>
                )}
                {isLoadingConferences && (
                    <div className="text-center mt-4 mb-4 p-5 container box rounded">
                        <div className="text-start">
                            <ContentLoader
                                speed={2}
                                width={400}
                                height={50}
                                viewBox="0 0 400 50"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
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
    organizationId: PropTypes.string.isRequired,
};

export default ConferenceEvents;
