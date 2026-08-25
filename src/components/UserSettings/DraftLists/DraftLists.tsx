import { useEffect } from 'react';

import EntityCard from '@/components/Cards/EntityCard/EntityCard';
import useAuthentication from '@/components/hooks/useAuthentication';
import ListPage from '@/components/PaginatedContent/ListPage';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getLiteratureLists, listsUrl } from '@/services/backend/literatureLists';
import { LiteratureList } from '@/services/backend/types';

const DraftLists = () => {
    const { user } = useAuthentication();

    useEffect(() => {
        document.title = 'Draft lists - ORKG';
    });

    const renderListItem = (list: LiteratureList) => (
        <EntityCard key={list.id} item={list} label={list.title} href={reverse(ROUTES.LIST, { id: list.id })} showCreatedBy={false} />
    );

    if (!user) {
        return null;
    }

    return (
        <div>
            <div className="mb-5 px-3">
                <h2 className="text-xl mb-2">View draft lists</h2>
                <p className="leading-relaxed rounded bg-surface-tertiary p-4">
                    When you start working on a list, by default it is a draft version. These versions are listed on this page. As soon as you publish
                    a list, it becomes publicly listed.
                </p>
            </div>
            <ListPage
                label="draft list"
                resourceClass={CLASSES.LITERATURE_LIST}
                renderListItem={renderListItem}
                fetchFunction={getLiteratureLists}
                fetchFunctionName="getLiteratureLists"
                fetchUrl={listsUrl}
                fetchExtraParams={{ created_by: user.id, published: false }}
                disableSearch
                hideTitleBar
            />
        </div>
    );
};

export default DraftLists;
