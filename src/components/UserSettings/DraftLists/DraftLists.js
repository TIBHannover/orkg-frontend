import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import ShortRecord from 'components/ShortRecord/ShortRecord';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert } from 'reactstrap';
import { getResources } from 'services/backend/resources';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';

const DraftLists = () => {
    const user = useSelector((state) => state.auth.user);

    useEffect(() => {
        document.title = 'Draft lists - ORKG';
    });

    const renderListItem = (list) => (
        <ShortRecord key={list.id} header={list.label} href={reverse(ROUTES.LIST, { id: list.id })}>
            <div className="time">
                <Icon size="sm" icon={faCalendar} className="me-1" /> {list.created_at ? moment(list.created_at).format('DD MMMM YYYY') : ''}
            </div>
        </ShortRecord>
    );

    const fetchItems = async ({ resourceClass, page, pageSize }) => {
        const {
            content: resources,
            last,
            totalElements,
        } = await getResources({
            include: [resourceClass],
            page,
            size: pageSize,
            sortBy: [{ property: 'created_at', direction: 'desc' }],
            created_by: user.id,
        });

        if (resources.length) {
            return Promise.all(
                resources.map((resource) =>
                    getStatementsBySubjectAndPredicate({ subjectId: resource.id, predicateId: PREDICATES.HAS_PUBLISHED_VERSION }),
                ),
            )
                .then((resourcesStatements) =>
                    resourcesStatements.map((statements, idx) => {
                        if (!statements.length) {
                            return resources[idx];
                        }
                        return null;
                    }),
                )
                .then((unpublishedItems) => {
                    const items = unpublishedItems.filter((v) => v);
                    return {
                        items,
                        last,
                        totalElements: items.length,
                    };
                });
        }
        return {
            items: [],
            last,
            totalElements,
        };
    };

    return (
        <div>
            <div className="box rounded pt-4 pb-3 px-4 mb-3">
                <h2 className="h5">View draft lists</h2>
                <Alert color="info" className="mt-3" fade={false}>
                    When you start working on a list, by default it is a draft version. Those versions are listed on this page. As soon as you publish
                    a list, it becomes publicly listed
                </Alert>
            </div>

            <ListPage
                label="draft list"
                resourceClass={CLASSES.LITERATURE_LIST}
                renderListItem={renderListItem}
                fetchItems={fetchItems}
                pageSize={50}
                disableSearch
                hideTitleBar
            />
        </div>
    );
};

DraftLists.propTypes = {};

export default DraftLists;
