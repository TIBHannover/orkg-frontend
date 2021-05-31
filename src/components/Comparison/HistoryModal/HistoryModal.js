import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import moment from 'moment';
import styled from 'styled-components';
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

function HistoryModal(props) {
    const { versions, isLoading } = useComparisonVersions({ comparisonId: props.comparisonId });
    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Comparison history</ModalHeader>
            <ModalBody>
                <p>Version history:</p>
                <div className="p-4">
                    {isLoading && 'Loading...'}
                    {!isLoading &&
                        versions.map((version, i) => (
                            <Activity key={version.id} className="pl-3 pb-3">
                                <Time className={props.comparisonId === version.id ? 'selected' : ''}>
                                    {version.created_at ? moment(version.created_at).format('DD MMMM YYYY - H:mm') : ''}{' '}
                                    {props.comparisonId === version.id && <>(This version)</>}
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
    comparisonId: PropTypes.string
};

export default HistoryModal;
