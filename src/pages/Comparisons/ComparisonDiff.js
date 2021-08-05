import { faArrowsAltH, faHistory } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { ContainerAnimated } from 'components/Comparison/styled';
import DiffTitle from 'components/Comparison/Diff/DiffTitle/DiffTitle';
import useDiff from 'components/Comparison/Diff/hooks/useDiff';
import HistoryModal from 'components/Comparison/HistoryModal/HistoryModal';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import React, { useEffect, useState } from 'react';
import ContentLoader from 'react-content-loader';
import ReactDiffViewer from 'react-diff-viewer';
import { useHistory, useParams } from 'react-router-dom';
import { useLocation } from 'react-use';
import { getComparisonData } from 'utils';
import { Alert, Button } from 'reactstrap';
import queryString from 'query-string';
import { getStatementsBySubject } from 'services/backend/statements';
import { getResource } from 'services/backend/resources';
import TitleBar from 'components/TitleBar/TitleBar';

const ComparisonDiff = () => {
    const { oldId, newId } = useParams();
    const [oldComparison, setOldComparison] = useState('');
    const [newComparison, setNewComparison] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fullWidth, setFullWidth] = useState(false);
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
    const { comparisonToPlainText, isOldIdHigherThanNewId } = useDiff();
    const history = useHistory();
    const location = useLocation();
    const { switchedVersions } = queryString.parse(location.search);

    useEffect(() => {
        document.title = 'Compare comparison versions - ORKG';
    });

    useEffect(() => {
        if (!oldId || !newId) {
            return;
        }

        if (isOldIdHigherThanNewId({ oldId, newId })) {
            history.push(`${reverse(ROUTES.COMPARISON_DIFF, { oldId: newId, newId: oldId })}?switchedVersions=true`);
            return;
        }

        const getArticles = async () => {
            setIsLoading(true);
            Promise.all([getResource(oldId), getResource(newId), getStatementsBySubject({ id: oldId }), getStatementsBySubject({ id: newId })]).then(
                ([oldResource, newResource, oldStatements, newStatements]) => {
                    setOldComparison(getComparisonData(oldResource, oldStatements));
                    setNewComparison(getComparisonData(newResource, newStatements));
                }
            );
            setIsLoading(false);
        };

        getArticles();
    }, [oldId, newId, comparisonToPlainText, isOldIdHigherThanNewId, history]);

    const handleDismiss = () => {
        history.push(reverse(ROUTES.COMPARISON_DIFF, { oldId, newId }));
    };

    const containerStyle = fullWidth ? { maxWidth: 'calc(100% - 20px)' } : {};
    containerStyle.background = '#FAFBFC';

    return (
        <>
            <TitleBar
                buttonGroup={
                    <>
                        <Button size="sm" color="secondary" onClick={() => setIsOpenHistoryModal(true)}>
                            <Icon icon={faHistory} className="mr-1" /> View history
                        </Button>
                        <Button size="sm" color="secondary" onClick={() => setFullWidth(v => !v)} style={{ marginLeft: 1 }}>
                            <Icon icon={faArrowsAltH} className="mr-1" /> Full width
                        </Button>
                    </>
                }
            >
                Compare versions
            </TitleBar>
            <ContainerAnimated style={containerStyle} className="box rounded p-0 overflow-hidden">
                {switchedVersions && (
                    <div className="m-3">
                        <Alert color="info" toggle={handleDismiss}>
                            We have switched the versions for you. On the left side you find the old version and on the right the new version
                        </Alert>
                    </div>
                )}
                {!isLoading && oldComparison && newComparison && (
                    <ReactDiffViewer
                        oldValue={comparisonToPlainText(oldComparison)}
                        newValue={comparisonToPlainText(newComparison)}
                        splitView={true}
                        showDiffOnly={false}
                        leftTitle={<DiffTitle id={oldId} comparison={oldComparison} />}
                        rightTitle={<DiffTitle id={newId} comparison={newComparison} />}
                    />
                )}
                {isLoading && (
                    <div className="p-4">
                        <ContentLoader height={350} width="100%" speed={2} backgroundColor="#f3f3f3" foregroundColor="#ecebeb">
                            <rect x="0" y="0" rx="2" ry="2" width="50" height="50" style={{ width: '49%' }} />
                            <rect x="0" y="60" rx="2" ry="2" width="50" height="300" style={{ width: '49%' }} />
                            <rect x="50%" y="0" rx="2" ry="2" width="50" height="50" style={{ width: '50%' }} />
                            <rect x="50%" y="60" rx="2" ry="2" width="50" height="300" style={{ width: '50%' }} />
                        </ContentLoader>
                    </div>
                )}

                {isOpenHistoryModal && (
                    <HistoryModal
                        comparisonId={oldComparison.id}
                        comparedComparisonId={newComparison.id}
                        toggle={() => setIsOpenHistoryModal(v => !v)}
                        showDialog={isOpenHistoryModal}
                    />
                )}
            </ContainerAnimated>
        </>
    );
};

export default ComparisonDiff;
