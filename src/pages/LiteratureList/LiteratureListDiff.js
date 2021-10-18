import Tippy from '@tippyjs/react';
import DiffView from 'components/DiffView/DiffView';
import useDiff from 'components/DiffView/useDiff';
import useLiteratureList from 'components/LiteratureList/hooks/useLiteratureList';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import React from 'react';

const LiteratureListDiff = () => {
    const { literatureListToPlainText } = useDiff();
    const { getListById } = useLiteratureList();

    const getData = async ({ oldId, newId }) => {
        const oldList = await getListById(oldId);
        const newList = await getListById(newId);

        if (!oldList || !newList || oldList.literatureList?.id !== newList.literatureList?.id) {
            throw new Error('Lists not found');
        }

        return {
            oldText: literatureListToPlainText(oldList),
            newText: literatureListToPlainText(newList),
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
            route: reverse(ROUTES.LITERATURE_LIST, { id: version.id }),
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

    return <DiffView diffRoute={ROUTES.LITERATURE_LIST_DIFF} type="literature list" getData={getData} />;
};

export default LiteratureListDiff;
