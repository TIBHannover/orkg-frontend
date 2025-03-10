'use client';

import DiffView from 'components/DiffView/DiffView';
import useDiff from 'components/DiffView/useDiff';
import Tooltip from 'components/FloatingUI/Tooltip';
import useList from 'components/List/hooks/useList';
import useParams from 'components/useParams/useParams';
import ROUTES from 'constants/routes';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import { LiteratureList } from 'services/backend/types';

const ListDiff = () => {
    const { listToPlainText } = useDiff();
    const { oldId, newId } = useParams<{ oldId: string; newId: string }>();
    const { list: oldList } = useList(oldId);
    const { list: newList } = useList(newId);

    const getTitleData = ({ versions, id }: LiteratureList) => {
        const version = versions.published.find((version) => version.id === id);
        if (!version) {
            return null;
        }

        const versionNumber = versions.published.length
            ? versions.published.length - versions.published.findIndex((version) => version.id === id)
            : null;
        const publicationDate = version ? dayjs(version.created_at).format('DD MMMM YYYY - H:m:s') : null;

        return {
            creator: null, // TODO version.creator
            route: reverse(ROUTES.LIST, { id: version.id }),
            headerText: version && (
                <Tooltip content={`Update message: ${version.changelog}`}>
                    <span>
                        Version {versionNumber} - {publicationDate}
                    </span>
                </Tooltip>
            ),
            buttonText: 'View list',
        };
    };

    const getData = async () => {
        if (!oldList || !newList || oldList.versions.head?.id !== newList.versions.head?.id) {
            throw new Error('Lists not found');
        }

        return {
            oldText: listToPlainText(oldList),
            newText: listToPlainText(newList),
            oldTitleData: getTitleData(oldList),
            newTitleData: getTitleData(newList),
        };
    };

    return <DiffView diffRoute={ROUTES.LIST_DIFF} type="list" getData={getData} />;
};

export default ListDiff;
