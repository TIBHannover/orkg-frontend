'use client';

import capitalize from 'capitalize';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import { Container, Row } from 'reactstrap';
import useSWR from 'swr';

import ColoredStatsBox from '@/components/Stats/ColoredStatsBox';
import TitleBar from '@/components/TitleBar/TitleBar';
import { CLASSES } from '@/constants/graphSettings';
import { ORGANIZATIONS_MISC } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { getStats, statsUrl } from '@/services/backend/stats';

const Stats = () => {
    const { data: stats, isLoading } = useSWR(
        [[CLASSES.BENCHMARK, CLASSES.COMPARISON_PUBLISHED, CLASSES.LITERATURE_LIST_PUBLISHED], statsUrl, 'getStats'],
        ([params]) => getStats(params),
    );

    useEffect(() => {
        document.title = 'Stats - ORKG';
    }, []);

    return (
        <div>
            <TitleBar>General statistics</TitleBar>

            <Container>
                <Row>
                    <ColoredStatsBox link={reverse(ROUTES.PAPERS)} number={stats?.papers} label="Papers" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.COMPARISONS)} number={stats?.comparisons} label="Comparisons" isLoading={isLoading} />
                    <ColoredStatsBox
                        link={reverse(ROUTES.COMPARISONS)}
                        number={stats?.extras?.[CLASSES.COMPARISON_PUBLISHED]}
                        label="Comparison versions"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.VISUALIZATIONS)}
                        number={stats?.visualizations}
                        label="Visualizations"
                        isLoading={isLoading}
                    />
                </Row>
                <Row>
                    <ColoredStatsBox number={stats?.contributions} label="Contributions" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.RESEARCH_FIELDS)} number={stats?.fields} label="Research fields" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.TEMPLATES)} number={stats?.templates} label="Templates" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.REVIEWS)} number={stats?.smart_reviews} label="Reviews" isLoading={isLoading} />
                    <ColoredStatsBox
                        link={reverse(ROUTES.LISTS)}
                        number={stats?.extras?.[CLASSES.LITERATURE_LIST_PUBLISHED]}
                        label="Lists"
                        isLoading={isLoading}
                    />
                </Row>
                <Row>
                    <ColoredStatsBox number={stats?.users} label="Users" isLoading={isLoading} />
                    <ColoredStatsBox
                        link={reverse(ROUTES.ORGANIZATIONS, { id: capitalize(ORGANIZATIONS_MISC.GENERAL) })}
                        number={stats?.organizations}
                        label="Organizations"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox link={reverse(ROUTES.OBSERVATORIES)} number={stats?.observatories} label="Observatories" isLoading={isLoading} />
                    <ColoredStatsBox
                        link={reverse(ROUTES.BENCHMARKS)}
                        number={stats?.extras?.[CLASSES.BENCHMARK]}
                        label="Benchmarks"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox number={stats?.problems} label="Research problems" isLoading={isLoading} />
                </Row>
            </Container>
            <Container>
                <h1 className="h4 mt-4 mb-4">Technical values</h1>
            </Container>

            <Container>
                <Row>
                    <ColoredStatsBox link={reverse(ROUTES.BENCHMARKS)} number={stats?.resources} label="Resources" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.PROPERTIES)} number={stats?.predicates} label="Properties" isLoading={isLoading} />
                    <ColoredStatsBox number={stats?.statements} label="Statements" isLoading={isLoading} />
                    <ColoredStatsBox number={stats?.literals} label="Literals" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.CLASSES)} number={stats?.classes} label="Classes" isLoading={isLoading} />
                </Row>
            </Container>
        </div>
    );
};

export default Stats;
