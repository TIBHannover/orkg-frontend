import useParams from 'components/NextJsMigration/useParams';
import useRouter from 'components/NextJsMigration/useRouter';
import Tabs from 'components/Tabs/Tabs';
import Items from 'components/UserProfile/Items';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';

function TabsContainer({ currentUserId, userId }) {
    const params = useParams();
    const { activeTab } = params;
    const router = useRouter();
    const onTabChange = (key) => {
        router.push(
            `${reverse(ROUTES.USER_PROFILE_TABS, {
                userId,
                activeTab: key,
            })}`,
        );
    };

    return (
        <Tabs
            className="box rounded"
            destroyInactiveTabPane
            onChange={onTabChange}
            activeKey={activeTab ?? 'comparisons'}
            items={[
                {
                    label: 'Comparisons',
                    key: 'comparisons',
                    children: <Items filterLabel="comparisons" filterClass={CLASSES.COMPARISON} filters={{ created_by: userId }} />,
                },

                {
                    label: 'Papers',
                    key: 'papers',
                    children: (
                        <Items
                            filterLabel="papers"
                            filterClass={CLASSES.PAPER}
                            filters={{ created_by: userId }}
                            showDelete={userId === currentUserId}
                            notFoundMessage="This user hasn't added any comparisons to ORKG yet"
                        />
                    ),
                },
                {
                    label: 'Visualizations',
                    key: 'visualizations',
                    children: (
                        <Items filterLabel="visualizations" filterClass={CLASSES.VISUALIZATION} filters={{ created_by: userId }} showDelete={false} />
                    ),
                },
                {
                    label: 'Reviews',
                    key: 'reviews',
                    children: <Items filterLabel="reviews" filterClass={CLASSES.SMART_REVIEW} filters={{ created_by: userId }} showDelete={false} />,
                },
                {
                    label: 'Lists',
                    key: 'lists',
                    children: <Items filterLabel="lists" filterClass={CLASSES.LITERATURE_LIST} filters={{ created_by: userId }} showDelete={false} />,
                },
                {
                    label: 'Templates',
                    key: 'templates',
                    children: <Items filterLabel="templates" filterClass={CLASSES.NODE_SHAPE} filters={{ createdBy: userId }} showDelete={false} />,
                },
            ]}
        />
    );
}

TabsContainer.propTypes = {
    currentUserId: PropTypes.string,
    userId: PropTypes.string,
};

export default TabsContainer;
