import { faArrowsAltH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { ContainerAnimated } from 'components/Comparison/styled';
import DiffTitle from 'components/SmartReview/Diff/DiffTitle/DiffTitle';
import useDiff from 'components/SmartReview/Diff/hooks/useDiff';
import useLoad from 'components/SmartReview/hooks/useLoad';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import React, { useEffect, useState } from 'react';
import ContentLoader from 'react-content-loader';
import ReactDiffViewer from 'react-diff-viewer';
import { useHistory, useParams } from 'react-router-dom';
import { useLocation } from 'react-use';
import { Alert, Button, ButtonGroup, Container } from 'reactstrap';
import queryString from 'query-string';
import TitleBar from 'components/TitleBar/TitleBar';

const SmartReviewDiff = () => {
    const { oldId, newId } = useParams();
    const { getArticleById } = useLoad();
    const [oldArticleText, setOldArticleText] = useState('');
    const [newArticleText, setNewArticleText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [versions, setVersions] = useState([]);
    const [fullWidth, setFullWidth] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const { articleToPlainText, isOldIdHigherThanNewId } = useDiff();
    const history = useHistory();
    const location = useLocation();
    const { switchedVersions } = queryString.parse(location.search);

    useEffect(() => {
        document.title = 'Compare article versions - ORKG';
    });

    useEffect(() => {
        if (!oldId || !newId) {
            return;
        }

        if (isOldIdHigherThanNewId({ oldId, newId })) {
            history.push(`${reverse(ROUTES.SMART_REVIEW_DIFF, { oldId: newId, newId: oldId })}?switchedVersions=true`);
            return;
        }

        const getArticles = async () => {
            setIsLoading(true);
            const oldArticle = await getArticleById(oldId);
            const newArticle = await getArticleById(newId);
            if (!oldArticle || !newArticle || oldArticle.paper?.id !== newArticle.paper?.id) {
                setHasFailed(true);
                return;
            }
            const versions = oldArticle.versions; // versions for new and old article are the same

            setOldArticleText(articleToPlainText(oldArticle));
            setNewArticleText(articleToPlainText(newArticle));
            setVersions(versions);
            setIsLoading(false);
        };

        getArticles();
    }, [oldId, newId, getArticleById, articleToPlainText, isOldIdHigherThanNewId, history]);

    const handleDismiss = () => {
        history.push(reverse(ROUTES.SMART_REVIEW_DIFF, { oldId, newId }));
    };

    const containerStyle = fullWidth ? { maxWidth: 'calc(100% - 20px)' } : {};
    containerStyle.background = '#FAFBFC';

    return (
        <>
            <TitleBar
                buttonGroup={
                    <Button size="sm" color="secondary" onClick={() => setFullWidth(v => !v)}>
                        <Icon icon={faArrowsAltH} className="mr-1" /> Full width
                    </Button>
                }
            >
                Compare SmartReview versions
            </TitleBar>
            <ContainerAnimated style={containerStyle} className="box rounded p-0 overflow-hidden">
                {switchedVersions && (
                    <div className="m-3">
                        <Alert color="info" toggle={handleDismiss}>
                            We have switched the versions for you. On the left side you find the old version and on the right the new version
                        </Alert>
                    </div>
                )}
                {!isLoading && !hasFailed && (
                    <ReactDiffViewer
                        oldValue={oldArticleText}
                        newValue={newArticleText}
                        splitView={true}
                        showDiffOnly={false}
                        leftTitle={<DiffTitle id={oldId} versions={versions} />}
                        rightTitle={<DiffTitle id={newId} versions={versions} />}
                    />
                )}
                {isLoading && !hasFailed && (
                    <div className="p-4">
                        <ContentLoader height={350} width="100%" speed={2} backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
                            <rect x="0" y="0" rx="2" ry="2" width="50" height="50" style={{ width: '49%' }} />
                            <rect x="0" y="60" rx="2" ry="2" width="50" height="300" style={{ width: '49%' }} />
                            <rect x="50%" y="0" rx="2" ry="2" width="50" height="50" style={{ width: '50%' }} />
                            <rect x="50%" y="60" rx="2" ry="2" width="50" height="300" style={{ width: '50%' }} />
                        </ContentLoader>
                    </div>
                )}
                {hasFailed && (
                    <div className="p-4">
                        <Alert color="danger">An error has occurred, please try this action again</Alert>
                    </div>
                )}
            </ContainerAnimated>
        </>
    );
};

export default SmartReviewDiff;
