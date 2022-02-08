import Tippy from '@tippyjs/react';
import DiffView from 'components/DiffView/DiffView';
import useDiff from 'components/DiffView/useDiff';
import useLoad from 'components/Review/hooks/useLoad';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';

const ReviewDiff = () => {
    const { reviewToPlainText } = useDiff();
    const { getArticleById } = useLoad();

    const getData = async ({ oldId, newId }) => {
        const oldArticle = await getArticleById(oldId);
        const newArticle = await getArticleById(newId);

        if (!oldArticle || !newArticle || oldArticle.paper?.id !== newArticle.paper?.id) {
            throw new Error('Articles not found');
        }

        return {
            oldText: reviewToPlainText(oldArticle),
            newText: reviewToPlainText(newArticle),
            oldTitleData: getTitleData(oldArticle),
            newTitleData: getTitleData(newArticle)
        };
    };

    const getTitleData = ({ versions, articleId: id }) => {
        const version = versions.find(version => version.id === id);
        if (!version) {
            return null;
        }

        const versionNumber = versions.length ? versions.length - versions.findIndex(version => version.id === id) : null;
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
            buttonText: 'View article'
        };
    };

    return <DiffView diffRoute={ROUTES.REVIEW_DIFF} type="review" getData={getData} />;
};

export default ReviewDiff;
