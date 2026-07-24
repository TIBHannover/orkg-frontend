import { faQuestionCircle, faSlidersH } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, Popover } from '@heroui/react';
import dayjs from 'dayjs';
import { useState } from 'react';

import Breadcrumbs from '@/components/DataBrowser/components/Header/Breadcrumbs/Breadcrumbs';
import Metadata from '@/components/DataBrowser/components/Header/Metadata/Metadata';
import Preferences from '@/components/DataBrowser/components/Header/Preferences/Preferences';
import NotFound from '@/components/DataBrowser/components/NotFound/NotFound';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import useSnapshotStatement from '@/components/DataBrowser/hooks/useSnapshotStatement';

const Header = () => {
    const { isUsingSnapshot } = useSnapshotStatement();
    const { config } = useDataBrowserState();
    const { error } = useEntity();
    const { isEditMode, snapshotCreatedAt } = config;
    const { canEdit } = useCanEdit();

    const [preferencesPopover, setPreferencesPopover] = useState(false);

    if (error && error.statusCode === 404) {
        return <NotFound />;
    }
    if (error) {
        throw error;
    }

    return (
        <div>
            {isUsingSnapshot && snapshotCreatedAt && (
                <Alert status="accent" className="mb-0 p-2 rounded-none">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>
                            You are viewing a snapshot of the data, which was taken on {dayjs(snapshotCreatedAt)?.format('DD MMMM YYYY - H:mm:ss')}
                        </Alert.Title>
                    </Alert.Content>
                </Alert>
            )}
            <div className="flex border-b border-border p-2 items-center gap-2">
                <Breadcrumbs />
                <div className="ml-auto shrink-0 flex">
                    <Popover isOpen={preferencesPopover} onOpenChange={setPreferencesPopover}>
                        <Button variant="outline" size="sm" isIconOnly aria-label="Preferences" className="!rounded-e-none !border-r-0 text-muted">
                            <FontAwesomeIcon fixedWidth icon={faSlidersH} />
                        </Button>
                        <Popover.Content>
                            <Popover.Dialog>
                                <Popover.Arrow />
                                <Preferences closeTippy={() => setPreferencesPopover(false)} />
                            </Popover.Dialog>
                        </Popover.Content>
                    </Popover>
                    <Button
                        variant="outline"
                        size="sm"
                        isIconOnly
                        aria-label="Open help center"
                        className="!rounded-s-none text-muted"
                        onPress={() => window.open('https://orkg.org/help-center/category/2', '_blank', 'noopener,noreferrer')}
                    >
                        <FontAwesomeIcon fixedWidth icon={faQuestionCircle} />
                    </Button>
                </div>
            </div>
            {!canEdit && isEditMode && (
                <Alert status="accent" className="mb-0 p-2 rounded-none border-t border-border">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>A shared resource cannot be edited directly</Alert.Title>
                        <Alert.Description>
                            <a
                                href="https://orkg.org/help-center/article/29/%22A_shared_resource_cannot_be_edited_directly%22_-_What_does_that_mean"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary underline inline-flex items-center gap-1"
                            >
                                Learn more
                                <FontAwesomeIcon icon={faQuestionCircle} />
                            </a>
                        </Alert.Description>
                    </Alert.Content>
                </Alert>
            )}
            <Metadata />
        </div>
    );
};

export default Header;
