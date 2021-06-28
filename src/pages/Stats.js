import { useState, useEffect } from 'react';
import { Container, Row } from 'reactstrap';
import { CLASSES } from 'constants/graphSettings';
import { faBars, faFile, faTag, faChartBar, faCubes } from '@fortawesome/free-solid-svg-icons';
import ColoredStatsBox from 'components/Stats/ColoredStatsBox';
import InlineStatsBox from 'components/Stats/InlineStatsBox';
import { getResourcesByClass } from 'services/backend/resources';
import { toast } from 'react-toastify';
import { getStats } from 'services/backend/stats';

const Stats = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({});

    useEffect(() => {
        document.title = 'Stats - ORKG';
        setIsLoading(true);

        const calls = [
            getStats(),
            getResourcesByClass({
                id: CLASSES.COMPARISON,
                page: 0,
                items: 1
            }),
            getResourcesByClass({
                id: CLASSES.VISUALIZATION,
                page: 0,
                items: 1
            }),
            getResourcesByClass({
                id: CLASSES.TEMPLATE,
                page: 0,
                items: 1
            }),
            getResourcesByClass({
                id: CLASSES.SMART_REVIEW_PUBLISHED,
                page: 0,
                items: 1
            })
        ];
        Promise.all(calls)
            .then(([stats, comparisons, visualizations, templates, smartReviews]) => {
                setIsLoading(false);
                setStats({
                    ...stats,
                    comparisons: comparisons.totalElements,
                    visualizations: visualizations.totalElements,
                    templates: templates.totalElements,
                    smartReviews: smartReviews.totalElements
                });
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
                    <ColoredStatsBox number={stats.papers} label="Papers" icon={faFile} color="blue" className="mr-3" isLoading={isLoading} />
                    <ColoredStatsBox
                        number={stats.comparisons}
                        label="Comparisons"
                        icon={faCubes}
                        color="gray"
                        className="mr-3"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox
                        number={stats.visualizations}
                        label="Visualizations"
                        icon={faChartBar}
                        color="black"
                        className="mr-3"
                        isLoading={isLoading}
                    />

                    <ColoredStatsBox number={stats.problems} label="Research problems" icon={faTag} color="orange" isLoading={isLoading} />
                </Row>
            </Container>

            <Container className="mt-2">
                <Row>
                    <ColoredStatsBox
                        number={stats.contributions}
                        label="Contributions"
                        icon={faBars}
                        color="green"
                        className="mr-3"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox
                        number={stats.fields}
                        label="Research fields"
                        icon={faBars}
                        color="gray"
                        className="mr-3"
                        isLoading={isLoading}
                    />
                    <ColoredStatsBox number={stats.templates} label="Templates" icon={faBars} color="black" className="mr-3" isLoading={isLoading} />
                    <ColoredStatsBox number={stats.smartReviews} label="SmartReviews" icon={faBars} color="orange" isLoading={isLoading} />
                </Row>
            </Container>

            <Container>
                <h1 className="h4 mt-4 mb-4">Technical values</h1>
            </Container>

            <Container className="box rounded pt-4 pb-4 pl-5 pr-5">
                <Row>
                    <InlineStatsBox number={stats.resources} label="Resources" isLoading={isLoading} />
                    <InlineStatsBox number={stats.predicates} label="Properties" isLoading={isLoading} />
                    <InlineStatsBox number={stats.statements} label="Statements" isLoading={isLoading} />
                    <InlineStatsBox number={stats.literals} label="Literals" isLoading={isLoading} />
                    <InlineStatsBox number={stats.classes} label="Classes" hideBorder isLoading={isLoading} />
                </Row>
            </Container>
        </div>
    );
};

export default Stats;
