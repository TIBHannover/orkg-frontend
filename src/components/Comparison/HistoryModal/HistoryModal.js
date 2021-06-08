import { Modal, ModalHeader, ModalBody, Button } from 'reactstrap';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { Link, useHistory } from 'react-router-dom';
import moment from 'moment';
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import UserAvatar from 'components/UserAvatar/UserAvatar';
import useComparisonVersions from 'components/Comparison/hooks/useComparisonVersions';

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

const Option = ({ children, data, ...props }) => {
    return (
        <components.Option {...props}>
            {children}
            <div>
                <small>{data.created_at ? moment(data.created_at).format('DD MMMM YYYY - H:mm') : ''}</small>
            </div>
        </components.Option>
    );
};

Option.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired
};

function HistoryModal(props) {
    const { versions, isLoading, loadVersions } = useComparisonVersions({ comparisonId: props.comparisonId });
    const [selectedVersion1, setSelectedVersion1] = useState(null);
    const [selectedVersion2, setSelectedVersion2] = useState(null);
    const history = useHistory();
    const options = versions.map((version, index) => ({
        label: `Version ${versions.length - index}`,
        value: version.id,
        created_at: version.created_at
    }));

    useEffect(() => {
        loadVersions(props.comparisonId);
    }, [loadVersions, props.comparisonId]);

    const handleCompare = () => {
        history.push(reverse(ROUTES.COMPARISON_DIFF, { oldId: selectedVersion1.value, newId: selectedVersion2.value }));
    };

    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Comparison history</ModalHeader>
            <ModalBody>
                {!isLoading && versions.length > 1 && (
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
                            <Button disabled={!selectedVersion2 || !selectedVersion1} color="secondary" className="px-2" onClick={handleCompare}>
                                <Icon icon={faSearch} />
                            </Button>
                        </div>
                        <hr />
                    </div>
                )}
                <p>Version history:</p>
                <div className="p-4">
                    {isLoading && 'Loading...'}
                    {!isLoading &&
                        versions.map((version, i) => (
                            <Activity key={version.id} className="pl-3 pb-3">
                                <Time className={props.comparisonId === version.id || props.comparedComparisonId === version.id ? 'selected' : ''}>
                                    {version.created_at ? moment(version.created_at).format('DD MMMM YYYY - H:mm') : ''}{' '}
                                    {props.comparisonId === version.id && !props.comparedComparisonId && <>(This version)</>}
                                    {props.comparisonId === version.id && props.comparedComparisonId && <>(Old version)</>}
                                    {props.comparedComparisonId && props.comparedComparisonId === version.id && <>(New version)</>}
                                    <span className="ml-2">
                                        <UserAvatar userId={version.created_by} />
                                    </span>
                                </Time>
                                <div>
                                    Version {versions.length - i}
                                    <br />
                                    {props.comparisonId !== version.id && (
                                        <Link onClick={props.toggle} to={reverse(ROUTES.COMPARISON, { comparisonId: version.id })}>
                                            View comparison at this version
                                        </Link>
                                    )}
                                </div>
                            </Activity>
                        ))}
                </div>
            </ModalBody>
        </Modal>
    );
}

HistoryModal.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    comparisonId: PropTypes.string,
    comparedComparisonId: PropTypes.string
};

export default HistoryModal;
