import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react';
import Select, { components, GroupBase, OptionProps } from 'react-select';
import { Alert, Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import styled from 'styled-components';
import useSWR from 'swr';

import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import MarkFeaturedUnlistedContainer from '@/components/Comparison/ComparisonHeader/MarkFeaturedUnlistedContainer';
import UserAvatar from '@/components/UserAvatar/UserAvatar';
import { getResource, resourcesUrl } from '@/services/backend/resources';

const Option = ({ children, ...props }: OptionProps<VersionOption, false, GroupBase<VersionOption>>) => (
    <components.Option {...props}>
        {children}
        <div>
            <small>{props.data.comment}</small>
        </div>
    </components.Option>
);

const Activity = styled.div`
    border-left: 3px solid #e9ebf2;
    color: ${(props) => props.theme.bodyColor};

    a {
        color: ${(props) => props.theme.primary};
    }

    &:last-child {
        border-left: none;
        padding-left: 1.2rem !important;
    }
`;

const Time = styled.div`
    &:not(.selected) {
        color: rgba(100, 100, 100, 0.57);
    }
    &.selected {
        font-weight: 700;
    }
    margin-top: -0.2rem;
    margin-bottom: 0.2rem;
    font-size: 15px;
    display: flex;
    align-items: center;
    &::before {
        width: 1rem;
        height: 1rem;
        margin-left: -1.6rem;
        margin-right: 0.5rem;
        border-radius: 15px;
        content: '';
        background-color: #c2c6d6;
        display: inline-block;
    }
`;

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
    id: string;
    show: boolean;
    toggle: () => void;
    title: string;
    versions?: Version[];
    routeDiff: string;
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

    const { data: resources } = useSWR(versions.length > 0 ? [versions.map(({ id }) => id), resourcesUrl, 'getResource'] : null, ([params]) =>
        Promise.all(params.map((_id) => getResource(_id))),
    );

    const handleCompare = () => {
        router.push(reverse(routeDiff, { oldId: selectedVersion1?.value, newId: selectedVersion2?.value }));
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>{title}</ModalHeader>
            <ModalBody>
                {isLoading && (
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                )}
                {!isLoading && versions.length > 0 && (
                    <div>
                        <div className="p-2">
                            {versions.length > 1 && (
                                <div className="mb-4">
                                    <h2 className="h6">Compare versions</h2>
                                    <div className="d-flex w-100">
                                        <Select<VersionOption>
                                            value={selectedVersion1}
                                            onChange={(v) => setSelectedVersion1(v)}
                                            options={options}
                                            components={{ Option }}
                                            blurInputOnSelect
                                            openMenuOnFocus
                                            className="flex-grow-1 me-1 focus-primary"
                                            classNamePrefix="react-select"
                                            placeholder="Select version"
                                        />
                                        <Select
                                            value={selectedVersion2}
                                            onChange={(v) => setSelectedVersion2(v)}
                                            options={options}
                                            components={{ Option }}
                                            blurInputOnSelect
                                            openMenuOnFocus
                                            className="flex-grow-1 me-1"
                                            classNamePrefix="react-select"
                                            placeholder="Select version"
                                        />
                                        <SelectGlobalStyle />
                                        <Button
                                            disabled={!selectedVersion2 || !selectedVersion1}
                                            color="secondary"
                                            className="px-2"
                                            onClick={handleCompare}
                                        >
                                            <FontAwesomeIcon icon={faSearch} />
                                        </Button>
                                    </div>
                                    <hr />
                                </div>
                            )}
                            <h2 className="h6 mb-0">Version history</h2>
                        </div>
                        <div className="p-4">
                            {versions.map((version, i) => (
                                <Activity key={version.id} className="ps-3 pb-3">
                                    <Time className={id === version.id ? 'selected' : ''}>
                                        {version.created_at ? dayjs(version.created_at)?.format('DD MMMM YYYY - H:mm') : ''}{' '}
                                        {id === version.id && <>(This version)</>}
                                        <span className="ms-2">
                                            <UserAvatar userId={version.created_by} />
                                        </span>
                                    </Time>
                                    <div>
                                        Version {versions.length - i}
                                        {showFeaturedButtons && (
                                            <div className="ms-1 d-inline-block ">
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
                                            <Link onClick={toggle} href={version.link}>
                                                View this version
                                            </Link>
                                        )}
                                    </div>
                                </Activity>
                            ))}
                        </div>
                    </div>
                )}
                {versions.length === 0 && <Alert color="info">No versions have been found</Alert>}
            </ModalBody>
        </Modal>
    );
};

export default HistoryModal;
