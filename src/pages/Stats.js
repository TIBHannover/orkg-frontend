import { useState, useEffect } from 'react';
import { Container, Row } from 'reactstrap';
import { CLASSES } from 'constants/graphSettings';
import ColoredStatsBox from 'components/Stats/ColoredStatsBox';
import InlineStatsBox from 'components/Stats/InlineStatsBox';
import { toast } from 'react-toastify';
import { getStats } from 'services/backend/stats';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';

const Stats = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({});

    useEffect(() => {
        document.title = 'Stats - ORKG';
        setIsLoading(true);
        getStats([CLASSES.BENCHMARK])
            .then(stats => {
                setIsLoading(false);
                setStats(stats);
            })
            .catch(e => {
                setIsLoading(false);
                toast.error('Failed loading statistics data');
            });
    }, []);

    return (
        <div>
            <Container>
                <h1 className="h4 mt-4 mb-4">General statistics</h1>
            </Container>

            <Container>
                <Row>
                    <ColoredStatsBox link={reverse(ROUTES.PAPERS)} number={stats.papers} label="Papers" className="mr-3" isLoading={isLoading} />
                    <ColoredStatsBox
                        link={reverse(ROUTES.COMPARISONS)}
                        number={stats.comparisons}
                        label="Comparisons"
                        className="mr-3"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.VISUALIZATIONS)}
                        number={stats.visualizations}
                        label="Visualizations"
                        className="mr-3"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox number={stats.problems} label="Research problems" isLoading={isLoading} />
                </Row>
            </Container>

            <Container className="mt-3">
                <Row>
                    <ColoredStatsBox number={stats.contributions} label="Contributions" className="mr-3" isLoading={isLoading} />
                    <ColoredStatsBox
                        link={reverse(ROUTES.RESEARCH_FIELDS)}
                        number={stats.fields}
                        label="Research fields"
                        className="mr-3"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.TEMPLATES)}
                        number={stats.templates}
                        label="Templates"
                        className="mr-3"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox link={reverse(ROUTES.SMART_REVIEWS)} number={stats.smart_reviews} label="SmartReviews" isLoading={isLoading} />
                </Row>
            </Container>
            <Container className="mt-3">
                <Row>
                    <ColoredStatsBox number={stats.users} label="Users" className="mr-3" isLoading={isLoading} />
                    <ColoredStatsBox
                        link={reverse(ROUTES.ORGANIZATIONS)}
                        number={stats.organizations}
                        label="Organizations"
                        className="mr-3"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.OBSERVATORIES)}
                        number={stats.observatories}
                        label="Observatories"
                        className="mr-3"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox
                        link={reverse(ROUTES.BENCHMARKS)}
                        number={stats.extras?.[CLASSES.BENCHMARK]}
                        label="Benchmarks"
                        isLoading={isLoading}
                    />
                </Row>
            </Container>
            <Container>
                <h1 className="h4 mt-4 mb-4">Technical values</h1>
            </Container>

            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <Row>
                    <InlineStatsBox link={reverse(ROUTES.RESOURCES)} number={stats.resources} label="Resources" isLoading={isLoading} />
                    <InlineStatsBox link={reverse(ROUTES.PROPERTIES)} number={stats.predicates} label="Properties" isLoading={isLoading} />
                    <InlineStatsBox number={stats.statements} label="Statements" isLoading={isLoading} />
                    <InlineStatsBox number={stats.literals} label="Literals" isLoading={isLoading} />
                    <InlineStatsBox link={reverse(ROUTES.CLASSES)} number={stats.classes} label="Classes" hideBorder isLoading={isLoading} />
                </Row>
            </Container>
        </div>
    );
};

export default Stats;
