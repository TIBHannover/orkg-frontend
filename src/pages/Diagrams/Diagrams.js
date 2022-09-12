import { useEffect } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from 'constants/graphSettings';
import DiagramCard from 'components/DiagramCard/DiagramCard';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { getVisualizationData } from 'utils';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';

const Diagrams = () => {
    useEffect(() => {
        document.title = 'Diagrams - ORKG';
    });

    const renderListItem = diagram => <DiagramCard key={diagram?.id} diagram={diagram} />;

    const fetchItems = async ({ resourceClass, page, pageSize }) => {
        let items = [];

        const { content: resources, last, totalElements } = await getResourcesByClass({
            id: resourceClass,
            page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true,
        });

        if (resources.length) {
            items = await getStatementsBySubjects({ ids: resources.map(item => item.id) }).then(statements =>
                statements.map(statementsForSubject =>
                    getVisualizationData(resources.find(resource => resource.id === statementsForSubject.id), statementsForSubject.statements),
                ),
            );
        }

        return {
            items,
            last,
            totalElements,
        };
    };

    const buttons = (
        <>
            <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm" to={ROUTES.NEW_DIAGRAM}>
                <Icon icon={faPlus} /> Create diagram
            </RequireAuthentication>
        </>
    );

    return <ListPage label="diagrams" resourceClass={CLASSES.DIAGRAM} renderListItem={renderListItem} fetchItems={fetchItems} buttons={buttons} />;
};

export default Diagrams;
