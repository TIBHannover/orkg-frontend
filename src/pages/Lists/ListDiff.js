import Tippy from '@tippyjs/react';
import DiffView from 'components/DiffView/DiffView';
import useDiff from 'components/DiffView/useDiff';
import useList from 'components/List/hooks/useList';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';

const ListDiff = () => {
    const { listToPlainText } = useDiff();
    const { getListById } = useList();

    const getData = async ({ oldId, newId }) => {
        const oldList = await getListById(oldId);
        const newList = await getListById(newId);

        if (!oldList || !newList || oldList.list?.id !== newList.list?.id) {
            throw new Error('Lists not found');
        }

        return {
            oldText: listToPlainText(oldList),
            newText: listToPlainText(newList),
            oldTitleData: getTitleData(oldList),
            newTitleData: getTitleData(newList)
        };
    };

    const getTitleData = ({ versions, id }) => {
        const version = versions.find(version => version.id === id);
        if (!version) {
            return null;
        }

        const versionNumber = versions.length ? versions.length - versions.findIndex(version => version.id === id) : null;
        const publicationDate = version ? moment(version.date).format('DD MMMM YYYY - H:m:s') : null;

        return {
            creator: version.creator,
            route: reverse(ROUTES.LIST, { id: version.id }),
            headerText: version && (
                <Tippy content={`Update message: ${version.description}`}>
                    <span>
                        Version {versionNumber} - {publicationDate}
                    </span>
                </Tippy>
            ),
            buttonText: 'View list'
        };
    };

    return <DiffView diffRoute={ROUTES.LIST_DIFF} type="list" getData={getData} />;
};

export default ListDiff;
