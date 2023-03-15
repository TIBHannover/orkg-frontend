import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { CLASSES } from 'constants/graphSettings';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import { getResourcesByClass } from 'services/backend/resources';

const STATISTICS = [
    {
        label: 'Comparisons',
        class: CLASSES.COMPARISON,
    },
    {
        label: 'Papers',
        class: CLASSES.PAPER,
    },
    {
        label: 'Reviews',
        class: CLASSES.SMART_REVIEW,
    },
    {
        label: 'Templates',
        class: CLASSES.TEMPLATE,
    },
    {
        label: 'Visualizations',
        class: CLASSES.VISUALIZATION,
    },
];

const UserStatistics = ({ userId }) => {
    const [statistics, setStatistics] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            if (!userId) {
                return;
            }
            try {
                setIsLoading(true);
                const statsPromises = STATISTICS.map(statistic => getResourcesByClass({ id: statistic.class, creator: userId }));
                const _stats = (await Promise.all(statsPromises)).map((statistic, index) => ({
                    number: statistic.totalElements,
                    label: STATISTICS[index].label,
                }));
                setStatistics(_stats);
            } catch (e) {
                console.log(e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [userId]);

    return (
        <Row className="border rounded p-2 mt-3">
            {statistics.map((statistic, index) => (
                <Col key={statistic.label} className={`d-flex flex-column align-items-center ${index + 1 < statistics.length ? 'border-end' : ''}`}>
                    <span className="h4 m-0">{statistic.number}</span>
                    <span>{pluralize(statistic.label, statistic.number)}</span>
                </Col>
            ))}
            {isLoading && (
                <div className="text-center py-2">
                    <Icon icon={faSpinner} spin /> Loading...
                </div>
            )}
        </Row>
    );
};

UserStatistics.propTypes = {
    userId: PropTypes.string.isRequired,
};

export default UserStatistics;
