'use client';

import capitalize from 'capitalize';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import useSWR from 'swr';

import ColoredStatsBox from '@/components/Stats/ColoredStatsBox';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import Row from '@/components/Ui/Structure/Row';
import { ORGANIZATIONS_MISC } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { getStatistics, statisticsUrl } from '@/services/backend/statistics';

const CONTENT_TYPES_NAMES = [
    'benchmark-count',
    'comparison-count',
    'contribution-count',
    'paper-count',
    'problem-count',
    'published-comparison-version-count',
    'published-literature-list-version-count',
    'research-field-count',
    'smart-review-count',
    'template-count',
    'visualization-count',
    'rosetta-stone-statement-count',
    'rosetta-stone-statement-version-count',
    'rosetta-stone-template-count',
];

const COMMUNITY_NAMES = ['contributors-count', 'observatory-count', 'organization-count'];

const THINGS_NAMES = ['resource-count', 'predicate-count', 'statement-count', 'literal-count', 'class-count'];

const Stats = () => {
    const { data: contentTypesStats, isLoading: isLoadingContentTypes } = useSWR([CONTENT_TYPES_NAMES, statisticsUrl, 'getStatistics'], ([params]) =>
        Promise.all(
            params.map((name) =>
                getStatistics({
                    group: 'content-types',
                    name,
                    ...(['comparison-count', 'smart-review-count'].includes(name) && { published: true }),
                }),
            ),
        ),
    );

    const { data: communityStats, isLoading: isLoadingCommunity } = useSWR([COMMUNITY_NAMES, statisticsUrl, 'getStatistics'], ([params]) =>
        Promise.all(params.map((name) => getStatistics({ group: 'community', name }))),
    );

    const { data: thingsStats, isLoading: isLoadingThings } = useSWR([THINGS_NAMES, statisticsUrl, 'getStatistics'], ([params]) =>
        Promise.all(params.map((name) => getStatistics({ group: 'things', name }))),
    );

    useEffect(() => {
        document.title = 'Stats - ORKG';
    }, []);

    const getStatisticsByName = (group: string, name: string) => {
        if (group === 'content-types') {
            return contentTypesStats?.find((stat) => stat.name === name)?.value;
        }
        if (group === 'community') {
            return communityStats?.find((stat) => stat.name === name)?.value;
        }
        if (group === 'things') {
            return thingsStats?.find((stat) => stat.name === name)?.value;
        }
        return undefined;
    };

    return (
        <div>
            <TitleBar>General statistics</TitleBar>

            <Container>
                <Row>
                    <ColoredStatsBox
                        link={reverse(ROUTES.PAPERS)}
                        number={getStatisticsByName('content-types', 'paper-count')}
                        label="Papers"
                        isLoading={isLoadingContentTypes}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.COMPARISONS)}
                        number={getStatisticsByName('content-types', 'comparison-count')}
                        label="Comparisons"
                        isLoading={isLoadingContentTypes}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.COMPARISONS)}
                        number={getStatisticsByName('content-types', 'published-comparison-version-count')}
                        label="Comparison versions"
                        isLoading={isLoadingContentTypes}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.VISUALIZATIONS)}
                        number={getStatisticsByName('content-types', 'visualization-count')}
                        label="Visualizations"
                        isLoading={isLoadingContentTypes}
                    />
                </Row>
                <Row>
                    <ColoredStatsBox
                        link={reverse(ROUTES.RESEARCH_FIELDS)}
                        number={getStatisticsByName('content-types', 'research-field-count')}
                        label="Research fields"
                        isLoading={isLoadingContentTypes}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.TEMPLATES)}
                        number={getStatisticsByName('content-types', 'template-count')}
                        label="Templates"
                        isLoading={isLoadingContentTypes}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.REVIEWS)}
                        number={getStatisticsByName('content-types', 'smart-review-count')}
                        label="Reviews"
                        isLoading={isLoadingContentTypes}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.LISTS)}
                        number={getStatisticsByName('content-types', 'published-literature-list-version-count')}
                        label="Lists"
                        isLoading={isLoadingContentTypes}
                    />
                </Row>
                <Row>
                    <ColoredStatsBox
                        number={getStatisticsByName('content-types', 'contribution-count')}
                        label="Contributions"
                        isLoading={isLoadingContentTypes}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.RS_STATEMENTS)}
                        number={getStatisticsByName('content-types', 'rosetta-stone-statement-count')}
                        label="Rosetta statements"
                        isLoading={isLoadingContentTypes}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.RS_STATEMENTS)}
                        number={getStatisticsByName('content-types', 'rosetta-stone-statement-version-count')}
                        label="Rosetta statement versions"
                        isLoading={isLoadingContentTypes}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.RS_TEMPLATES)}
                        number={getStatisticsByName('content-types', 'rosetta-stone-template-count')}
                        label="Statement types"
                        isLoading={isLoadingContentTypes}
                    />
                </Row>
                <Row>
                    <ColoredStatsBox number={getStatisticsByName('community', 'contributors-count')} label="Users" isLoading={isLoadingCommunity} />
                    <ColoredStatsBox
                        link={reverse(ROUTES.ORGANIZATIONS, { id: capitalize(ORGANIZATIONS_MISC.GENERAL) })}
                        number={getStatisticsByName('community', 'organization-count')}
                        label="Organizations"
                        isLoading={isLoadingCommunity}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.OBSERVATORIES)}
                        number={getStatisticsByName('community', 'observatory-count')}
                        label="Observatories"
                        isLoading={isLoadingCommunity}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.BENCHMARKS)}
                        number={getStatisticsByName('content-types', 'benchmark-count')}
                        label="Benchmarks"
                        isLoading={isLoadingContentTypes}
                    />
                    <ColoredStatsBox
                        number={getStatisticsByName('content-types', 'problem-count')}
                        label="Research problems"
                        isLoading={isLoadingContentTypes}
                    />
                </Row>
            </Container>
            <Container>
                <h1 className="h4 mt-4 mb-4">Technical values</h1>
            </Container>

            <Container>
                <Row>
                    <ColoredStatsBox
                        link={reverse(ROUTES.BENCHMARKS)}
                        number={getStatisticsByName('things', 'resource-count')}
                        label="Resources"
                        isLoading={isLoadingThings}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.PROPERTIES)}
                        number={getStatisticsByName('things', 'predicate-count')}
                        label="Properties"
                        isLoading={isLoadingThings}
                    />
                    <ColoredStatsBox number={getStatisticsByName('things', 'statement-count')} label="Statements" isLoading={isLoadingThings} />
                    <ColoredStatsBox number={getStatisticsByName('things', 'literal-count')} label="Literals" isLoading={isLoadingThings} />
                    <ColoredStatsBox
                        link={reverse(ROUTES.CLASSES)}
                        number={getStatisticsByName('things', 'class-count')}
                        label="Classes"
                        isLoading={isLoadingThings}
                    />
                </Row>
            </Container>
        </div>
    );
};

export default Stats;
