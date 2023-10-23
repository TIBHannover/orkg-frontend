import FeaturedItems from 'components/Home/FeaturedItems';
import useSearchParams from 'components/NextJsMigration/useSearchParams';
import Tabs from 'components/Tabs/Tabs';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import propTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';

function HomeTabsContainer({ researchFieldId, researchFieldLabel }) {
    const params = useParams();
    const searchParams = useSearchParams();
    const { slug } = params;
    const navigate = useNavigate();

    const onTabChange = tab => {
        if (researchFieldId && slug) {
            navigate(
                `${`${reverse(ROUTES.HOME_WITH_RESEARCH_FIELD, {
                    researchFieldId,
                    slug,
                })}`}?tab=${tab}`,
            );
        } else {
            navigate(
                `${`${reverse(ROUTES.HOME, {
                    researchFieldId,
                    slug,
                })}`}?tab=${tab}`,
            );
        }
    };

    const items = [
        {
            label: 'Comparisons',
            classId: CLASSES.COMPARISON,
        },
        {
            label: 'Papers',
            classId: CLASSES.PAPER,
        },
        {
            label: 'Visualizations',
            classId: CLASSES.VISUALIZATION,
        },
        {
            label: 'Reviews',
            classId: CLASSES.SMART_REVIEW_PUBLISHED,
        },
        {
            label: 'Lists',
            classId: CLASSES.LITERATURE_LIST_PUBLISHED,
        },
    ];

    return (
        <Tabs
            className="box rounded"
            getPopupContainer={trigger => trigger.parentNode}
            destroyInactiveTabPane={true}
            onChange={onTabChange}
            activeKey={searchParams.get('tab') ?? 'comparisons'}
            items={items.map(({ label, classId }) => ({
                label,
                key: label.toLowerCase(),
                children: (
                    <FeaturedItems researchFieldLabel={researchFieldLabel} researchFieldId={researchFieldId} classId={classId} classLabel={label} />
                ),
            }))}
        />
    );
}

HomeTabsContainer.propTypes = {
    researchFieldLabel: propTypes.string,
    researchFieldId: propTypes.string,
};

export default HomeTabsContainer;
