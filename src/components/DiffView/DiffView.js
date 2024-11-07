import { faArrowsAltH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ContainerAnimated } from 'components/Comparison/styled';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import DiffTitle from 'components/DiffView/DiffTitle';
import TitleBar from 'components/TitleBar/TitleBar';
import useParams from 'components/useParams/useParams';
import { reverse } from 'named-urls';
import { useRouter, useSearchParams } from 'next/navigation';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { Alert, Button } from 'reactstrap';
import { getResource, resourcesUrl } from 'services/backend/resources';
import useSWR from 'swr';

const DiffView = ({ type, diffRoute, getData }) => {
    const { oldId, newId } = useParams();
    const [oldText, setOldText] = useState('');
    const [newText, setNewText] = useState('');
    const [oldTitleData, setOldTitleData] = useState({});
    const [newTitleData, setNewTitleData] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [fullWidth, setFullWidth] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    const { data: oldResource, isLoading: isOldResourceLoading } = useSWR(oldId ? [oldId, resourcesUrl, 'getResource'] : null, ([params]) =>
        getResource(params),
    );
    const { data: newResource, isLoading: isNewResourceLoading } = useSWR(newId ? [newId, resourcesUrl, 'getResource'] : null, ([params]) =>
        getResource(params),
    );

    const router = useRouter();
    const searchParams = useSearchParams();
    const switchedVersions = searchParams.get('switchedVersions');

    if (!isOldResourceLoading && !isNewResourceLoading && oldResource.created_at > newResource.created_at) {
        router.push(`${reverse(diffRoute, { oldId: newId, newId: oldId })}?switchedVersions=true`);
    }

    useEffect(() => {
        document.title = `Compare ${type} versions - ORKG`;
    });

    useEffect(() => {
        if (!oldId || !newId) {
            return;
        }

        const getContent = async () => {
            setIsLoading(true);
            try {
                const { oldText, newText, oldTitleData, newTitleData } = await getData({ oldId, newId });
                setOldText(oldText);
                setNewText(newText);
                setOldTitleData(oldTitleData);
                setNewTitleData(newTitleData);
                setHasFailed(false);
            } catch (e) {
                console.error(e);
                setHasFailed(true);
            }
            setIsLoading(false);
        };

        getContent();
    }, [oldId, newId, diffRoute, getData]);

    const handleDismiss = () => {
        router.push(reverse(diffRoute, { oldId, newId }));
    };

    const containerStyle = fullWidth ? { maxWidth: 'calc(100% - 20px)' } : {};
    containerStyle.background = '#FAFBFC';

    return (
        <>
            <TitleBar
                buttonGroup={
                    <Button size="sm" color="secondary" onClick={() => setFullWidth((v) => !v)}>
                        <FontAwesomeIcon icon={faArrowsAltH} className="me-1" /> Full width
                    </Button>
                }
            >
                Compare {type} versions
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
                        oldValue={oldText}
                        newValue={newText}
                        splitView
                        showDiffOnly={false}
                        leftTitle={<DiffTitle data={oldTitleData} />}
                        rightTitle={<DiffTitle data={newTitleData} />}
                    />
                )}
                {isLoading && !hasFailed && (
                    <div className="p-4">
                        <ContentLoader height={350} width="100%" speed={2}>
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

DiffView.propTypes = {
    type: PropTypes.string.isRequired,
    diffRoute: PropTypes.string.isRequired,
    getData: PropTypes.func.isRequired,
};

export default DiffView;
