'use client';

import type { SyntheticEvent } from 'react';

const SURVEY_URL = 'https://tib.eu/umfragen/index.php/452957';
const PAGE_URL_FIELD = 'G01Q01';

const buildSurveyUrl = (pageUrl: string) => {
    const url = new URL(SURVEY_URL);
    url.searchParams.set(PAGE_URL_FIELD, pageUrl);
    // LimeSurvey only applies prefilled answers when a new response is started
    url.searchParams.set('newtest', 'Y');
    return url.toString();
};

const setSurveyHref = (event: SyntheticEvent<HTMLAnchorElement>) => {
    event.currentTarget.href = buildSurveyUrl(window.location.href);
};

const ReportContentLink = () => (
    <a href={SURVEY_URL} target="_blank" rel="noopener noreferrer" onPointerDown={setSurveyHref} onClick={setSurveyHref}>
        Report content
    </a>
);

export default ReportContentLink;
