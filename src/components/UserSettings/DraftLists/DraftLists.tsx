import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import { Alert } from 'reactstrap';

import useAuthentication from '@/components/hooks/useAuthentication';
import ListPage from '@/components/PaginatedContent/ListPage';
import ShortRecord from '@/components/ShortRecord/ShortRecord';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getLiteratureLists, listsUrl } from '@/services/backend/literatureLists';
import { LiteratureList } from '@/services/backend/types';

const DraftLists = () => {
    const { user } = useAuthentication();

    useEffect(() => {
        document.title = 'Draft lists - ORKG';
    });

    const renderListItem = (list: LiteratureList) => (
        <ShortRecord key={list.id} header={list.title} href={reverse(ROUTES.LIST, { id: list.id })}>
            <div className="time">
                <FontAwesomeIcon size="sm" icon={faCalendar} className="me-1" />{' '}
                {list.created_at ? dayjs(list.created_at).format('DD MMMM YYYY') : ''}
            </div>
        </ShortRecord>
    );

    if (!user) {
        return null;
    }

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

DraftLists.propTypes = {};

export default DraftLists;
