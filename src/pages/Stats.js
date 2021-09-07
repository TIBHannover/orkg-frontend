import { useState, useEffect } from 'react';
import { Container, Row } from 'reactstrap';
import { CLASSES } from 'constants/graphSettings';
import ColoredStatsBox from 'components/Stats/ColoredStatsBox';
import { toast } from 'react-toastify';
import { getStats } from 'services/backend/stats';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import TitleBar from 'components/TitleBar/TitleBar';

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
            <TitleBar>General statistics</TitleBar>

            <Container>
                <Row>
                    <ColoredStatsBox link={reverse(ROUTES.PAPERS)} number={stats.papers} label="Papers" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.COMPARISONS)} number={stats.comparisons} label="Comparisons" isLoading={isLoading} />
                    <ColoredStatsBox
                        link={reverse(ROUTES.VISUALIZATIONS)}
                        number={stats.visualizations}
                        label="Visualizations"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox number={stats.problems} label="Research problems" isLoading={isLoading} />
                </Row>
                <Row>
                    <ColoredStatsBox number={stats.contributions} label="Contributions" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.RESEARCH_FIELDS)} number={stats.fields} label="Research fields" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.TEMPLATES)} number={stats.templates} label="Templates" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.SMART_REVIEWS)} number={stats.smart_reviews} label="SmartReviews" isLoading={isLoading} />
                </Row>
                <Row>
                    <ColoredStatsBox number={stats.users} label="Users" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.ORGANIZATIONS)} number={stats.organizations} label="Organizations" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.OBSERVATORIES)} number={stats.observatories} label="Observatories" isLoading={isLoading} />
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

            <Container>
                <Row>
                    <ColoredStatsBox link={reverse(ROUTES.BENCHMARKS)} number={stats.resources} label="Resources" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.PROPERTIES)} number={stats.predicates} label="Properties" isLoading={isLoading} />
                    <ColoredStatsBox number={stats.statements} label="Statements" isLoading={isLoading} />
                    <ColoredStatsBox number={stats.literals} label="Literals" isLoading={isLoading} />
                    <ColoredStatsBox link={reverse(ROUTES.CLASSES)} number={stats.classes} label="Classes" isLoading={isLoading} />
                </Row>
            </Container>
        </div>
    );
};

export default Stats;
