import { faArrowsAltH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, CloseButton, Skeleton } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CSSProperties, FC, useEffect, useState } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import useSWR from 'swr';

import DiffTitle, { type TitleData } from '@/components/DiffView/DiffTitle';
import useColorMode from '@/components/hooks/useColorMode';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import { reverse } from '@/lib/namedRoute';
import { getResource, resourcesUrl } from '@/services/backend/resources';

type DiffViewProps = {
    type: string;
    diffRoute: string;
    getData: (params: {
        oldId: string;
        newId: string;
    }) => Promise<{ oldText: string; newText: string; oldTitleData: TitleData; newTitleData: TitleData }>;
};

const DiffView: FC<DiffViewProps> = ({ type, diffRoute, getData }) => {
    const { oldId, newId } = useParams();
    const [oldText, setOldText] = useState('');
    const [newText, setNewText] = useState('');
    const [oldTitleData, setOldTitleData] = useState<TitleData | null>(null);
    const [newTitleData, setNewTitleData] = useState<TitleData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fullWidth, setFullWidth] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);
    const isDark = useColorMode() === 'dark';

    const { data: oldResource, isLoading: isOldResourceLoading } = useSWR(oldId ? [oldId, resourcesUrl, 'getResource'] : null, ([params]) =>
        getResource(params),
    );
    const { data: newResource, isLoading: isNewResourceLoading } = useSWR(newId ? [newId, resourcesUrl, 'getResource'] : null, ([params]) =>
        getResource(params),
    );

    const router = useRouter();
    const searchParams = useSearchParams();
    const switchedVersions = searchParams.get('switchedVersions');

    useEffect(() => {
        if (!isOldResourceLoading && !isNewResourceLoading && oldResource && newResource && oldResource.created_at > newResource.created_at) {
            router.push(`${reverse(diffRoute, { oldId: newId, newId: oldId })}?switchedVersions=true`);
        }
    }, [isOldResourceLoading, isNewResourceLoading, oldResource, newResource, oldId, newId, diffRoute, router]);

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
                const data = await getData({ oldId, newId });
                setOldText(data.oldText);
                setNewText(data.newText);
                setOldTitleData(data.oldTitleData);
                setNewTitleData(data.newTitleData);
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

    const wrapperStyle: CSSProperties = fullWidth ? { maxWidth: 'calc(100% - 20px)' } : {};
    const containerStyle: CSSProperties = {
        background: isDark ? '#1a1d21' : '#FAFBFC',
    };

    return (
        <>
            <TitleBar
                buttonGroup={
                    <Button size="sm" variant="secondary" onPress={() => setFullWidth((v) => !v)}>
                        <FontAwesomeIcon icon={faArrowsAltH} /> Full width
                    </Button>
                }
            >
                Compare {type} versions
            </TitleBar>
            <div style={wrapperStyle} className="mx-auto px-3 max-w-container transition-[max-width] duration-500">
                <div style={containerStyle} className="box rounded overflow-hidden">
                    {switchedVersions && (
                        <div className="m-4">
                            <Alert status="accent">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>Versions switched</Alert.Title>
                                    <Alert.Description>On the left side you find the old version and on the right the new version.</Alert.Description>
                                </Alert.Content>
                                <CloseButton aria-label="Close" onPress={handleDismiss} />
                            </Alert>
                        </div>
                    )}
                    {!isLoading && !hasFailed && (
                        <ReactDiffViewer
                            oldValue={oldText}
                            newValue={newText}
                            splitView
                            showDiffOnly={false}
                            useDarkTheme={isDark}
                            leftTitle={<DiffTitle data={oldTitleData} />}
                            rightTitle={<DiffTitle data={newTitleData} />}
                            styles={{
                                titleBlock: {
                                    height: 'auto',
                                    overflow: 'visible',
                                    padding: '0 8px',
                                },
                            }}
                        />
                    )}
                    {isLoading && !hasFailed && (
                        <div className="p-6 grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Skeleton className="w-full h-12 rounded" />
                                <Skeleton className="w-full h-72 rounded" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Skeleton className="w-full h-12 rounded" />
                                <Skeleton className="w-full h-72 rounded" />
                            </div>
                        </div>
                    )}
                    {hasFailed && (
                        <div className="p-6">
                            <Alert status="danger">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Title>Something went wrong</Alert.Title>
                                    <Alert.Description>An error has occurred, please try this action again.</Alert.Description>
                                </Alert.Content>
                            </Alert>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DiffView;
