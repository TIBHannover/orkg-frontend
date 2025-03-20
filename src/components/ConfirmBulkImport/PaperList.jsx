import { faArrowsAltV, faCalendar, faExclamationCircle, faExclamationTriangle, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import StatementList from 'components/ConfirmBulkImport/StatementList';
import Tooltip from 'components/FloatingUI/Tooltip';
import ROUTES from 'constants/routes';
import dayjs from 'dayjs';
import { reverse } from 'named-urls';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { Fragment, useState } from 'react';
import { Alert, Badge, Button, ListGroup } from 'reactstrap';
import styled from 'styled-components';

const PaperCardStyled = styled.div`
    & .options {
        display: none;
    }

    &.selected {
        background: ${(props) => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        display: block;
    }
`;

const PaperList = ({ papers, existingPaperIds, idToLabel, validationErrors = {} }) => {
    const [showContributions, setShowContributions] = useState([]);

    const handleCardClick = (i) => {
        if (showContributions.includes(i)) {
            setShowContributions((state) => state.filter((j) => j !== i));
        } else {
            setShowContributions((state) => [...state, i]);
        }
    };

    const handleExpandAll = () => {
        setShowContributions(papers.map((_, i) => i));
    };

    const handleCollapseAll = () => {
        setShowContributions([]);
    };

    const hasValidationErrorsForPaper = (i) =>
        validationErrors?.[i] && Object.keys(validationErrors?.[i]).find((property) => validationErrors?.[i][property]?.find((error) => error));

    const hasValidationErrors = validationErrors && Object.keys(validationErrors).find((_, i) => hasValidationErrorsForPaper(i));

    return (
        <>
            {hasValidationErrors && (
                <Alert color="warning">Some provided data types are not matching cell values. Please check papers with a warning icon</Alert>
            )}
            <div className="w-100 text-end">
                {showContributions.length === 0 ? (
                    <Button size="sm" color="secondary" className="mb-2" onClick={handleExpandAll}>
                        <FontAwesomeIcon icon={faArrowsAltV} /> Expand all data
                    </Button>
                ) : (
                    <Button size="sm" color="secondary" className="mb-2" onClick={handleCollapseAll}>
                        <FontAwesomeIcon icon={faArrowsAltV} /> Collapse all data
                    </Button>
                )}
            </div>
            <ListGroup>
                {papers.map((paper, i) => (
                    <Fragment key={i}>
                        <PaperCardStyled
                            className="list-group-item list-group-item-action"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleCardClick(i)}
                        >
                            <div className="d-flex">
                                <span className="flex-grow-1">
                                    {Object.keys(paper.contents[0].statements).length === 0 && (
                                        <Alert color="danger">
                                            <FontAwesomeIcon icon={faExclamationCircle} className="me-2" /> Paper can't be imported because it doesn't
                                            contain any contribution data
                                        </Alert>
                                    )}
                                    {hasValidationErrorsForPaper(i) && <FontAwesomeIcon icon={faExclamationTriangle} className="text-warning me-2" />}

                                    {existingPaperIds[i] && (
                                        <Link href={reverse(ROUTES.VIEW_PAPER, { resourceId: existingPaperIds[i] })} target="_blank">
                                            {paper.title ? paper.title : <i>No title</i>}
                                        </Link>
                                    )}
                                    {!existingPaperIds[i] && paper.title && (
                                        <>
                                            <Tooltip content="A new ORKG paper will be created">
                                                <span>
                                                    <Badge color="info" className="me-1 py-1 px-2">
                                                        New
                                                    </Badge>
                                                </span>
                                            </Tooltip>
                                            {paper.title}
                                        </>
                                    )}
                                    {!existingPaperIds[i] && !paper.title && <span>No title</span>}
                                </span>
                                <div className="flex-shrink-1 text-muted ps-3" style={{ fontSize: '140%', opacity: 0.7 }}>
                                    #{i + 1}
                                </div>
                            </div>
                            <small>
                                <FontAwesomeIcon size="sm" icon={faUser} />{' '}
                                {paper.authors.length > 0 ? (
                                    paper.authors.map((a) => a.name).join(' • ')
                                ) : (
                                    <i className="ms-1">No authors provided</i>
                                )}
                                {(paper.publicationMonth || paper.publicationYear) && (
                                    <FontAwesomeIcon size="sm" icon={faCalendar} className="ms-2 me-1" />
                                )}
                                {paper.publicationMonth && paper.publicationMonth > 0 ? dayjs(paper.publicationMonth, 'M').format('MMMM') : ''}{' '}
                                {paper.publicationYear}
                            </small>
                        </PaperCardStyled>
                        {showContributions.includes(i) && (
                            <PaperCardStyled className="list-group-item">
                                <ListGroup className="listGroupEnlarge" style={{ fontSize: '90%' }}>
                                    {Object.keys(paper.contents[0].statements).length > 0 && (
                                        <>
                                            {Object.keys(paper.contents[0].statements).map((property) => (
                                                <StatementList
                                                    key={property}
                                                    property={property}
                                                    idToLabel={idToLabel}
                                                    values={paper.contents[0].statements[property]}
                                                    validationErrors={validationErrors?.[i]?.[property]}
                                                />
                                            ))}
                                        </>
                                    )}
                                    {Object.keys(paper.contents[0].statements).length === 0 && <>No contribution data to import.</>}
                                </ListGroup>
                            </PaperCardStyled>
                        )}
                    </Fragment>
                ))}
            </ListGroup>
        </>
    );
};

PaperList.propTypes = {
    papers: PropTypes.array.isRequired,
    existingPaperIds: PropTypes.array.isRequired,
    idToLabel: PropTypes.object.isRequired,
    validationErrors: PropTypes.object,
};

export default PaperList;
