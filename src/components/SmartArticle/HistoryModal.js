import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import ROUTES from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import Select, { components } from 'react-select';
import { Alert, Button, Modal, ModalBody, ModalHeader } from 'reactstrap';
import styled from 'styled-components';

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

const HistoryModal = props => {
    const { id, show, toggle } = props;
    const versions = useSelector(state => state.smartArticle.versions);
    const [selectedVersion1, setSelectedVersion1] = useState(null);
    const [selectedVersion2, setSelectedVersion2] = useState(null);
    const history = useHistory();
    const options = versions.map((version, index) => ({
        label: `Version ${versions.length - index}`,
        value: version.id,
        comment: version.description
    }));

    const handleCompare = () => {
        history.push(reverse(ROUTES.SMART_ARTICLE_DIFF, { oldId: selectedVersion1.value, newId: selectedVersion2.value }));
    };

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>Publish history</ModalHeader>
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
                                            className="flex-grow-1 mr-1 focus-primary"
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
                                            className="flex-grow-1 mr-1"
                                            classNamePrefix="react-select"
                                            placeholder="Select version"
                                        />
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
                                <Activity key={version.id} className="pl-3 pb-3">
                                    <Time className={id === version.id ? 'selected' : ''}>
                                        {version.date ? moment(version.date).format('DD MMMM YYYY - H:mm') : ''}{' '}
                                        {id === version.id && <>(This version)</>}
                                        <span className="ml-2">
                                            <UserAvatar userId={version.creator} />
                                        </span>
                                    </Time>
                                    <div>
                                        Version {versions.length - i}: <em>{version.description}</em> <br />
                                        {id !== version.id && (
                                            <Link onClick={props.toggle} to={reverse(ROUTES.SMART_ARTICLE, { id: version.id })}>
                                                View article at this version
                                            </Link>
                                        )}
                                    </div>
                                </Activity>
                            ))}
                        </div>
                    </div>
                )}
                {versions.length === 0 && <Alert color="info">This article is not published yet</Alert>}
            </ModalBody>
        </Modal>
    );
};

HistoryModal.propTypes = {
    id: PropTypes.string.isRequired,
    toggle: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
};

export default HistoryModal;
