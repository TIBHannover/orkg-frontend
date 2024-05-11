import useRouter from 'components/NextJsMigration/useRouter';
import useSearchParams from 'components/NextJsMigration/useSearchParams';
import Tabs from 'components/Tabs/Tabs';
import Items from 'components/UserProfile/Items';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { FC } from 'react';
import { Container } from 'reactstrap';

type IntegratedListProps = {
    sdgId: string;
};

const IntegratedList: FC<IntegratedListProps> = ({ sdgId }) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeTab = searchParams.get('tab') ?? 'papers';

    const onTabChange = (tab: string) => {
        router.push(
            `${reverse(ROUTES.SUSTAINABLE_DEVELOPMENT_GOAL, {
                sdg: sdgId,
            })}?tab=${tab}`,
        );
    };

    return (
        <Container className="mt-4 p-0">
            <Tabs
                className="box rounded"
                destroyInactiveTabPane
                onChange={onTabChange}
                activeKey={activeTab}
                items={[
                    {
                        label: 'Papers',
                        key: 'papers',
                        children: <Items filterLabel="papers" filterClass={CLASSES.PAPER} filters={{ sdg: sdgId }} />,
                    },
                    {
                        label: 'Comparisons',
                        key: 'comparisons',
                        children: <Items filterLabel="comparisons" filterClass={CLASSES.COMPARISON} filters={{ sdg: sdgId }} />,
                    },
                    {
                        label: 'Reviews',
                        key: 'reviews',
                        children: <Items filterLabel="reviews" filterClass={CLASSES.SMART_REVIEW} filters={{ sdg: sdgId, published: true }} />,
                    },
                    {
                        label: 'Lists',
                        key: 'lists',
                        children: <Items filterLabel="lists" filterClass={CLASSES.LITERATURE_LIST} filters={{ sdg: sdgId, published: true }} />,
                    },
                ]}
            />
        </Container>
    );
};

export default IntegratedList;
