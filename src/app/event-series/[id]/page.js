'use client';

import { useState, useEffect } from 'react';
import { Col, Row, Container } from 'reactstrap';
import InternalServerError from 'app/error';
import { SubTitle } from 'components/styled';
import NotFound from 'app/not-found';
import useParams from 'components/NextJsMigration/useParams';
import TitleBar from 'components/TitleBar/TitleBar';
import { getConferenceById } from 'services/backend/conferences-series';
import Comparisons from 'components/Organization/Comparisons';
import ConferenceMetadataBox from 'components/Conference/ConferenceMetadataBox';
import ResearchProblemBox from 'components/Conference/ResearchProblemBox';

const ConferenceDetails = () => {
    const [error, setError] = useState(null);
    const [conferenceId, setConferenceId] = useState(null);
    const [label, setLabel] = useState(null);
    const [url, setUrl] = useState(null);
    const [metadata, setMetadata] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { id } = useParams();

    useEffect(() => {
        const loadConference = () => {
            setIsLoading(true);
            getConferenceById(id)
                .then((conference) => {
                    document.title = `${conference.name} - Details`;
                    setConferenceId(conference.id);
                    setLabel(conference.name);
                    setUrl(conference.homepage);
                    setMetadata(conference.metadata);
                    setIsLoading(false);
                })
                .catch((error) => {
                    setIsLoading(false);
                    setError(error);
                });
        };
        loadConference();
    }, [id]);

    return (
        <>
            {isLoading && <Container className="box rounded py-4 px-5 mt-5 clearfix">Loading ...</Container>}
            {!isLoading && error && <>{error.statusCode === 404 ? <NotFound /> : <InternalServerError />}</>}
            {!isLoading && !error && label && (
                <>
                    <TitleBar titleAddition={<SubTitle>Conference event</SubTitle>} wrap={false}>
                        {label}
                    </TitleBar>
                    <Container className="p-0">
                        <Row className="mt-3">
                            <Col md="6" className="d-flex">
                                <ResearchProblemBox id={conferenceId} />
                            </Col>
                            <Col md="6" className="d-flex">
                                <ConferenceMetadataBox url={url} metadata={metadata} isLoading={isLoading} />
                            </Col>
                        </Row>
                    </Container>
                    <Comparisons organizationsId={conferenceId} />
                </>
            )}
        </>
    );
};

export default ConferenceDetails;
