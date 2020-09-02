import React from 'react';
import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { Link } from 'react-router-dom';
import moment from 'moment';
import styled from 'styled-components';

const StyledActivity = styled.div`
    border-left: 3px solid #e9ebf2;
    color: ${props => props.theme.bodyColor};
    .time {
        color: rgba(100, 100, 100, 0.57);
        margin-top: -0.2rem;
        margin-bottom: 0.2rem;
        font-size: 15px;
    }
    .time::before {
        width: 1rem;
        height: 1rem;
        margin-left: -1.6rem;
        margin-right: 0.5rem;
        border-radius: 15px;
        content: '';
        background-color: #c2c6d6;
        display: inline-block;
    }
    a {
        color: ${props => props.theme.ORKGPrimaryColor};
    }

    &:last-child {
        border-left: none;
        padding-left: 1.2rem !important;
    }
`;

function ComparisonVersions(props) {
    return (
        <Modal onOpened={() => {}} isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Comparison versions</ModalHeader>
            <ModalBody>
                <p>List of versions of this comparison: </p>
                <div className="p-4">
                    {props.hasNextVersions &&
                        props.hasNextVersions.length > 0 &&
                        props.hasNextVersions.map(nextVersion => (
                            <StyledActivity key={`n${nextVersion.id}`} className="pl-3 pb-3">
                                <div className="time">{nextVersion.created_at ? moment(nextVersion.created_at).format('DD MMMM YYYY') : ''}</div>
                                <div>
                                    A version published{' '}
                                    <Link onClick={props.toggle} to={reverse(ROUTES.COMPARISON, { comparisonId: nextVersion.id })}>
                                        {nextVersion.id}
                                    </Link>
                                </div>
                            </StyledActivity>
                        ))}
                    {props.metaData.id && (
                        <StyledActivity className="pl-3 pb-3">
                            <div className="time">{props.metaData.createdAt ? moment(props.metaData.createdAt).format('DD MMMM YYYY') : ''}</div>
                            <div>
                                <b>Current version </b>published
                            </div>
                        </StyledActivity>
                    )}

                    {props.metaData.hasPreviousVersion && (
                        <StyledActivity className="pl-3 pb-3">
                            <div className="time">
                                {props.metaData.hasPreviousVersion.created_at
                                    ? moment(props.metaData.hasPreviousVersion.created_at).format('DD MMMM YYYY')
                                    : ''}
                            </div>
                            <div>
                                A version published{' '}
                                <Link onClick={props.toggle} to={reverse(ROUTES.COMPARISON, { comparisonId: props.metaData.hasPreviousVersion.id })}>
                                    {props.metaData.hasPreviousVersion.id}
                                </Link>
                            </div>
                        </StyledActivity>
                    )}
                </div>
            </ModalBody>
        </Modal>
    );
}

ComparisonVersions.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    metaData: PropTypes.object.isRequired,
    hasNextVersions: PropTypes.array.isRequired
};

export default ComparisonVersions;
