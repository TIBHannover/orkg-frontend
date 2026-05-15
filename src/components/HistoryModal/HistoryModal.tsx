import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Alert, Button, cn, Modal, Separator, Spinner } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import Select, { components, GroupBase, OptionProps } from 'react-select';
import useSWR from 'swr';

import ActivityItem from '@/components/ActivityItem/ActivityItem';
import { customClassNames, customStyles } from '@/components/Autocomplete/styles';
import MarkFeaturedUnlistedContainer from '@/components/MarkFeaturedUnlisted/MarkFeaturedUnlistedContainer/MarkFeaturedUnlistedContainer';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { reverse } from '@/lib/namedRoute';
import { getResource, resourcesUrl } from '@/services/backend/resources';

const Option = ({ children, ...props }: OptionProps<VersionOption, false, GroupBase<VersionOption>>) => (
    <components.Option {...props}>
        {children}
        <div>
            <small>{props.data.comment}</small>
        </div>
    </components.Option>
);

type Version = {
    id: string;
    created_at: string;
    created_by: string;
    changelog?: string;
    link: string;
};

type VersionOption = {
    label: string;
    value: string;
    comment: string;
};

type HistoryModalProps = {
    id?: string;
    show: boolean;
    toggle: () => void;
    title: string;
    versions?: Version[];
    routeDiff?: string;
    showFeaturedButtons?: boolean;
    isLoading?: boolean;
};

const HistoryModal: FC<HistoryModalProps> = ({
    id,
    show,
    toggle,
    title,
    versions = [],
    routeDiff,
    showFeaturedButtons = true,
    isLoading = false,
}) => {
    const [selectedVersion1, setSelectedVersion1] = useState<VersionOption | null>(null);
    const [selectedVersion2, setSelectedVersion2] = useState<VersionOption | null>(null);
    const router = useRouter();
    const options = versions.map((version, index) => ({
        label: `Version ${versions.length - index}`,
        value: version.id,
        comment: version.changelog ?? '',
    }));

    const { data: resources } = useSWR(
        showFeaturedButtons && versions.length > 0 ? [versions.map(({ id }) => id), resourcesUrl, 'getResource'] : null,
        ([params]) => Promise.all(params.map((_id) => getResource(_id))),
    );

    const handleCompare = () => {
        if (!routeDiff) {
            return;
        }
        router.push(reverse(routeDiff, { oldId: selectedVersion1?.value, newId: selectedVersion2?.value }));
    };

    const showCompareSection = routeDiff && versions.length > 1;

    return (
        <Modal.Backdrop
            isOpen={show}
            onOpenChange={(open) => {
                if (!open) toggle();
            }}
        >
            <Modal.Container size="md">
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>{title}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        {isLoading && (
                            <div className="flex justify-center py-6">
                                <Spinner />
                            </div>
                        )}
                        {!isLoading && versions.length > 0 && (
                            <div>
                                {showCompareSection && (
                                    <>
                                        <section>
                                            <h3 className="text-base font-semibold mb-1">Compare versions</h3>
                                            <p className="text-sm text-default-500 mb-3">
                                                Select two versions to review the differences between them.
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <Select<VersionOption>
                                                    value={selectedVersion1}
                                                    onChange={(v) => setSelectedVersion1(v)}
                                                    options={options}
                                                    components={{ Option }}
                                                    blurInputOnSelect
                                                    openMenuOnFocus
                                                    className="grow focus-primary"
                                                    classNamePrefix="react-select"
                                                    classNames={customClassNames as any}
                                                    styles={customStyles as any}
                                                    menuPosition="fixed"
                                                    placeholder="Old version"
                                                />
                                                <span className="text-sm text-default-500">vs</span>
                                                <Select
                                                    value={selectedVersion2}
                                                    onChange={(v) => setSelectedVersion2(v)}
                                                    options={options}
                                                    components={{ Option }}
                                                    blurInputOnSelect
                                                    openMenuOnFocus
                                                    className="grow"
                                                    classNamePrefix="react-select"
                                                    classNames={customClassNames as any}
                                                    styles={customStyles as any}
                                                    menuPosition="fixed"
                                                    placeholder="New version"
                                                />
                                                <Button
                                                    isDisabled={!selectedVersion2 || !selectedVersion1}
                                                    variant="secondary"
                                                    className="px-3"
                                                    onPress={handleCompare}
                                                    aria-label="Compare selected versions"
                                                >
                                                    <FontAwesomeIcon icon={faSearch} />
                                                </Button>
                                            </div>
                                        </section>
                                        <Separator className="my-5" />
                                    </>
                                )}
                                <h3 className="text-base font-semibold mb-3">Version history</h3>
                                <div>
                                    {versions.map((version, i) => (
                                        <ActivityItem key={version.id} isLast={i === versions.length - 1}>
                                            <div
                                                className={cn(
                                                    'flex items-center text-[15px] mb-1',
                                                    id === version.id ? 'font-bold text-foreground' : 'text-muted',
                                                )}
                                            >
                                                {version.created_at ? dayjs(version.created_at)?.format('DD MMMM YYYY - H:mm') : ''}{' '}
                                                {id === version.id && <>(This version)</>}
                                                <span className="ml-2">
                                                    <UserAvatar userId={version.created_by} />
                                                </span>
                                            </div>
                                            <div className="text-foreground">
                                                Version {versions.length - i}
                                                {showFeaturedButtons && (
                                                    <div className="ml-1 inline-block">
                                                        <MarkFeaturedUnlistedContainer
                                                            size="xs"
                                                            id={version.id}
                                                            featured={resources?.find((resource) => resource.id === version.id)?.featured ?? false}
                                                            unlisted={resources?.find((resource) => resource.id === version.id)?.unlisted ?? false}
                                                        />
                                                    </div>
                                                )}
                                                {version.changelog && (
                                                    <>
                                                        : <em>{version.changelog}</em>
                                                    </>
                                                )}{' '}
                                                <br />
                                                {id !== version.id && (
                                                    <Link onClick={toggle} href={version.link} className="text-accent hover:text-accent-darker">
                                                        View this version
                                                    </Link>
                                                )}
                                            </div>
                                        </ActivityItem>
                                    ))}
                                </div>
                            </div>
                        )}
                        {!isLoading && versions.length === 0 && (
                            <Alert status="accent">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Description>No versions have been found</Alert.Description>
                                </Alert.Content>
                            </Alert>
                        )}
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default HistoryModal;
