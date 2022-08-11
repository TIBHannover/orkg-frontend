import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { ENTITIES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import { getClasses } from 'services/backend/classes';

const Classes = () => {
    const renderListItem = classItem => (
        <ShortRecord key={classItem.id} header={classItem.label} href={reverse(ROUTES.CLASS, { id: classItem.id })}>
            {classItem.id}
        </ShortRecord>
    );

    const fetchItems = async ({ page, pageSize }) => {
        const { content: items, last, totalElements } = await getClasses({
            page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true,
        });

        return {
            items,
            last,
            totalElements,
        };
    };

    const buttons = (
        <RequireAuthentication component={Link} color="secondary" size="sm" className="btn btn-secondary btn-sm flex-shrink-0" to={ROUTES.ADD_CLASS}>
            <Icon icon={faPlus} /> Create class
        </RequireAuthentication>
    );

    return <ListPage label="classes" resourceClass={ENTITIES.CLASS} renderListItem={renderListItem} fetchItems={fetchItems} buttons={buttons} />;
};

export default Classes;
