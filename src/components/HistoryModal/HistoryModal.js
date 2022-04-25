import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import MarkFeaturedUnlistedContainer from 'components/Comparison/MarkFeaturedUnlistedContainer';
import moment from 'moment';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select, { components } from 'react-select';
import { Alert, Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import styled from 'styled-components';
import { SelectGlobalStyle } from 'components/Autocomplete/styled';

const Option = ({ children, data, ...props }) => {
    return (
        <components.Option {...props}>
            {children}
            <div>
                <small>{data.comment}</small>
            </div>
        </components.Option>
    );
};

Option.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired
};

const Activity = styled.div`
    border-left: 3px solid #e9ebf2;
    color: ${props => props.theme.bodyColor};

    a {
        color: ${props => props.theme.primary};
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

const HistoryModal = ({ id, show, toggle, title, versions = [], routeDiff }) => {
    const [selectedVersion1, setSelectedVersion1] = useState(null);
    const [selectedVersion2, setSelectedVersion2] = useState(null);
    const navigate = useNavigate();
    const options = versions.map((version, index) => ({
        label: `Version ${versions.length - index}`,
        value: version.id,
        comment: version.description
    }));

    const handleCompare = () => {
        navigate(reverse(routeDiff, { oldId: selectedVersion1.value, newId: selectedVersion2.value }));
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>{title}</ModalHeader>
            <ModalBody>
                {versions.length > 0 && (
                    <div>
                        <div className="p-2">
                            {versions.length > 1 && (
                                <div className="mb-4">
                                    <h2 className="h6">Compare versions</h2>
                                    <div className="d-flex w-100">
                                        <Select
                                            value={selectedVersion1}
                                            onChange={v => setSelectedVersion1(v)}
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
                                            onChange={v => setSelectedVersion2(v)}
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
                                            <Icon icon={faSearch} />
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
                                        {version.created_at ? moment(version.created_at).format('DD MMMM YYYY - H:mm') : ''}{' '}
                                        {id === version.id && <>(This version)</>}
                                        <span className="ms-2">
                                            <UserAvatar userId={version.created_by} />
                                        </span>
                                    </Time>
                                    <div>
                                        Version {versions.length - i}
                                        <div className="ms-1 d-inline-block ">
                                            <MarkFeaturedUnlistedContainer
                                                size="xs"
                                                id={version?.id}
                                                featured={version?.featured}
                                                unlisted={version?.unlisted}
                                            />
                                        </div>
                                        {version.description && (
                                            <>
                                                : <em>{version.description}</em>
                                            </>
                                        )}{' '}
                                        <br />
                                        {id !== version.id && (
                                            <Link onClick={toggle} to={version.link}>
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

HistoryModal.propTypes = {
    id: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    versions: PropTypes.array,
    routeDiff: PropTypes.string.isRequired
};

export default HistoryModal;
