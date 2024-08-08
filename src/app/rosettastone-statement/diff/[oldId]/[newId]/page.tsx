'use client';

import DiffView from 'components/DiffView/DiffView';
import ROUTES from 'constants/routes';

const StatementDiff = () => {
    const getData = async () => {
        // const oldArticle = await getArticleById(oldId);
        // const newArticle = await getArticleById(newId);
        /*
        if (!oldArticle || !newArticle || oldArticle.paper?.id !== newArticle.paper?.id) {
            throw new Error('Articles not found');
        }
        */
        return {
            oldText: 'Not yet implemented, please come back later',
            newText: 'Not yet implemented, please come back later',
            oldTitleData: 'Not implemented',
            newTitleData: 'Not implemented',
        };
    };
    /*
    const getTitleData = ({ versions, articleId: id }) => {
        const version = versions.find((version) => version.id === id);
        if (!version) {
            return null;
        }

        const versionNumber = versions.length ? versions.length - versions.findIndex((version) => version.id === id) : null;
        const publicationDate = version ? moment(version.date).format('DD MMMM YYYY - H:m:s') : null;

        return {
            creator: version.creator,
            route: reverse(ROUTES.REVIEW, { id: version.id }),
            headerText: version && (
                <Tippy content={`Update message: ${version.description}`}>
                    <span>
                        Version {versionNumber} - {publicationDate}
                    </span>
                </Tippy>
            ),
            buttonText: 'View article',
        };
    };
    */
    return <DiffView diffRoute={ROUTES.REVIEW_DIFF} type="statement" getData={getData} />;
};

export default StatementDiff;
