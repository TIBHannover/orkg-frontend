import { CLASSES, PREDICATES } from 'constants/graphSettings';
import routes from 'constants/routes';
import moment from 'moment';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getStatementsByObjectAndPredicate, getStatementsBySubjects } from 'services/backend/statements';
import styled from 'styled-components';

const Activity = styled.div`
    border-left: 3px solid #e9ebf2;
    color: ${props => props.theme.bodyColor};

    a {
        color: ${props => props.theme.ORKGPrimaryColor};
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
    const paperId = useSelector(state => state.smartArticle.paper.id);
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        if (!paperId) {
            return;
        }
        const getVersions = async () => {
            const statements = await getStatementsByObjectAndPredicate({ objectId: paperId, predicateId: PREDICATES.HAS_PAPER });

            // TODO: can/should we rely on the default statement ordering?
            const ids = statements.map(version => version.subject.id);
            const versionsStatements = await getStatementsBySubjects({ ids });

            const versionsList = versionsStatements
                .map(versionSubject => ({
                    ...versionSubject.statements.find(
                        statement =>
                            statement.subject.classes.includes(CLASSES.SMART_ARTICLE_PUBLISHED) && statement.predicate.id === PREDICATES.DESCRIPTION
                    )
                }))
                .map(statement => ({
                    id: statement.subject.id,
                    date: statement.subject.created_at,
                    description: statement.object.label
                }));
            setVersions(versionsList);
        };
        getVersions();
    }, [paperId]);

    return (
        <Modal isOpen={show} toggle={toggle}>
            <ModalHeader toggle={toggle}>Publish history</ModalHeader>
            <ModalBody>
                {versions.length && (
                    <div className="p-4">
                        {versions.map((version, i) => (
                            <Activity key={version.id} className="pl-3 pb-3">
                                <Time className={id === version.id ? 'selected' : ''}>
                                    {version.date ? moment(version.date).format('DD MMMM YYYY - H:mm') : ''}{' '}
                                    {id === version.id && <>(This version)</>}
                                </Time>
                                <div>
                                    Version {versions.length - i}: <em>{version.description}</em> <br />
                                    {id !== version.id && (
                                        <Link onClick={props.toggle} to={reverse(routes.SMART_ARTICLE, { id: version.id })}>
                                            View article at this version
                                        </Link>
                                    )}
                                </div>
                            </Activity>
                        ))}
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
