'use client';

import { useEffect } from 'react';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import ConferenceMetadataBox from '@/components/Conference/ConferenceMetadataBox';
import ConferenceTabsContainer from '@/components/Conference/ConferenceTabsContainer';
import ResearchProblemBox from '@/components/Conference/ResearchProblemBox';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import { conferenceSeriesUrl, getConferenceById } from '@/services/backend/conferences-series';
import { getStatusCode } from '@/services/backend/problemDetails';

const ConferenceDetails = () => {
    const { id } = useParams();

    const {
        data: conference,
        isLoading: isLoadingConference,
        error: errorConference,
    } = useSWR(id ? [id, conferenceSeriesUrl, 'getConferenceById'] : null, ([params]) => getConferenceById(params), { shouldRetryOnError: false });

    useEffect(() => {
        if (conference?.name) {
            document.title = `${conference.name} - Conference event - ORKG`;
        }
    }, [conference?.name]);

    if (isLoadingConference) {
        return (
            <div className="max-w-container mx-auto px-3 mt-12">
                <div className="box rounded py-6 px-12 flow-root">Loading ...</div>
            </div>
        );
    }

    if (errorConference || !conference) {
        return getStatusCode(errorConference) === 404 ? <NotFound /> : <InternalServerError error={errorConference} />;
    }

    return (
        <>
            <TitleBar titleAddition={<SubTitle>Conference event</SubTitle>} wrap={false}>
                {conference.name}
            </TitleBar>
            <div className="max-w-container mx-auto px-3 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 items-stretch">
                    <ResearchProblemBox id={conference.id} />
                    <ConferenceMetadataBox url={conference.homepage} metadata={conference.metadata} organizationId={conference.organizationId} />
                </div>
                <div className="mt-4">
                    <ConferenceTabsContainer id={conference.id} />
                </div>
            </div>
        </>
    );
};

export default ConferenceDetails;
