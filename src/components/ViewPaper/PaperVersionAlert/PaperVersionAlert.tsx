import { Alert, Button } from '@heroui/react';
import Link from 'next/link';
import { AnchorHTMLAttributes, FC, useState } from 'react';

import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import HistoryModal from '@/components/ViewPaper/HistoryModal/HistoryModal';
import useViewPaper from '@/components/ViewPaper/hooks/useViewPaper';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type PaperVersionAlertProps = {
    isPublishedVersionView?: boolean;
};

const PaperVersionAlert: FC<PaperVersionAlertProps> = ({ isPublishedVersionView = false }) => {
    const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
    const { resourceId } = useParams();
    const { version, originalPaperId, publishedVersions } = useViewPaper({ paperId: resourceId });

    const isNotLatestVersion = !!publishedVersions?.[0] && publishedVersions[0].id !== resourceId;

    if (!(!isPublishedVersionView && version) && !(isPublishedVersionView && originalPaperId)) {
        return null;
    }

    return (
        <>
            {!isPublishedVersionView && version && (
                <Container className="mb-2">
                    <Alert status="warning" className="shadow">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>Published version available</Alert.Title>
                            <Alert.Description>
                                A published version of this paper is available. You are currently viewing the live data.
                            </Alert.Description>
                        </Alert.Content>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                render={(props) => (
                                    <Link
                                        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
                                        href={reverse(ROUTES.VIEW_PAPER, { resourceId: version.id })}
                                    />
                                )}
                            >
                                View published version
                            </Button>
                            <Button size="sm" variant="secondary" onPress={() => setIsOpenHistoryModal(true)}>
                                History
                            </Button>
                        </div>
                    </Alert>
                </Container>
            )}
            {isPublishedVersionView && originalPaperId && (
                <Container className="mb-2">
                    <Alert status="warning" className="shadow">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>{isNotLatestVersion ? 'Newer version available' : 'Viewing published version'}</Alert.Title>
                            <Alert.Description>
                                This is a published snapshot of the paper.
                                {isNotLatestVersion && ' A newer published version exists.'}
                            </Alert.Description>
                        </Alert.Content>
                        <div className="flex flex-wrap items-center gap-2">
                            {isNotLatestVersion && (
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    render={(props) => (
                                        <Link
                                            {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
                                            href={reverse(ROUTES.VIEW_PAPER, { resourceId: publishedVersions[0].id })}
                                        />
                                    )}
                                >
                                    View latest
                                </Button>
                            )}
                            <Button
                                size="sm"
                                variant="secondary"
                                render={(props) => (
                                    <Link
                                        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
                                        href={reverse(ROUTES.VIEW_PAPER, { resourceId: originalPaperId })}
                                    />
                                )}
                            >
                                Fetch live data
                            </Button>
                            <Button size="sm" variant="secondary" onPress={() => setIsOpenHistoryModal(true)}>
                                History
                            </Button>
                        </div>
                    </Alert>
                </Container>
            )}
            {isOpenHistoryModal && <HistoryModal paperId={resourceId} toggle={() => setIsOpenHistoryModal(false)} />}
        </>
    );
};

export default PaperVersionAlert;
