import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, Badge } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import ResearchProblemHeaderBar from './ResearchProblemHeaderBar';
import useResearchProblem from './hooks/useResearchProblem';
import useResearchProblemPapers from './hooks/useResearchProblemPapers';
import useResearchProblemStatistics from './hooks/useResearchProblemStatistics';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ContributorCard from 'components/ContributorCard/ContributorCard';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import PaperCard from 'components/PaperCard/PaperCard';
import ExternalDescription from './ExternalDescription';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import ROUTES from 'constants/routes';

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

function ResearchProblem(props) {
    const [researchProblemData, isLoading, loadResearchProblemData] = useResearchProblem();
    const [editMode, setEditMode] = useState(false);
    const prevEditMode = usePrevious({ editMode });
    const [isContributorsModalOpen, setIsContributorsModalOpen] = useState(false);
    const [contributors, setContributors] = useState([]);
    const [contributions, isLoadingPapers, hasNextPage, isLastPageReached, loadMorePapers] = useResearchProblemPapers();
    const [researchFields, isLoadingResearchFields] = useResearchProblemStatistics();

    useEffect(() => {
        if (!editMode && prevEditMode && prevEditMode.editMode !== editMode) {
            loadResearchProblemData(props.match.params.researchProblemId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editMode]);

    return (
        <div>
            {isLoading && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!isLoading && (
                <div>
                    {editMode && (
                        <StatementBrowserDialog
                            show={editMode}
                            toggleModal={() => setEditMode(v => !v)}
                            resourceId={props.match.params.researchProblemId}
                            resourceLabel={researchProblemData.label}
                            enableEdit={true}
                            syncBackend={true}
                        />
                    )}
                    <ResearchProblemHeaderBar toggleEdit={() => setEditMode(v => !v)} title={researchProblemData.label} />
                    <Container className="p-0">
                        <div className="box rounded-lg clearfix pt-4 pb-4 pl-5 pr-5">
                            <h3>{researchProblemData && researchProblemData.label}</h3>
                            {researchProblemData.description && <div className="mb-4">{researchProblemData.description}</div>}
                            {researchProblemData.sameAs && (
                                <ExternalDescription
                                    query={researchProblemData.sameAs ? researchProblemData.sameAs.label : researchProblemData.label}
                                />
                            )}
                        </div>
                        <Row className="mt-3">
                            <Col md="6" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Sub-problems</h5>
                                    {researchProblemData.subProblems && researchProblemData.subProblems.length > 0 && (
                                        <>
                                            {researchProblemData.subProblems.map(subP => (
                                                <div key={`subrp${subP.id}`}>
                                                    <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: subP.id })}>{subP.label}</Link>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    {researchProblemData.subProblems && researchProblemData.subProblems.length === 0 && (
                                        <>No sub research problems.</>
                                    )}
                                </div>
                            </Col>
                            <Col md="6" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Super-problems</h5>
                                    {researchProblemData.superProblems && researchProblemData.superProblems.length > 0 && (
                                        <>
                                            {researchProblemData.superProblems.map(supP => (
                                                <div key={`suprp${supP.id}`}>
                                                    <Link to={reverse(ROUTES.RESEARCH_PROBLEM, { researchProblemId: supP.id })}>{supP.label}</Link>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    {researchProblemData.superProblems && researchProblemData.superProblems.length === 0 && (
                                        <>No super research problems.</>
                                    )}
                                </div>
                            </Col>
                        </Row>

                        <Row className="mt-3">
                            <Col md="4" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Leaderboard</h5>
                                    Coming soon
                                    {/* 
                                    <div className="mt-2">
                                        <div>
                                            <ContributorCard
                                                contributor={{
                                                    ...{ id: '', display_name: 'Display name', email: 'test@example.com' },
                                                    subTitle: '4 papers'
                                                }}
                                            />
                                            <hr style={{ width: '90%', margin: '10px auto' }} />
                                        </div>
                                    </div>
                                            */}
                                </div>
                                {/* 
                                {contributors.length > 3 && (
                                    <>
                                        <Button
                                            onClick={() => setIsContributorsModalOpen(v => !v)}
                                            className="mt-1 float-right clearfix p-0"
                                            color="link"
                                        >
                                            <small>+ See more</small>
                                        </Button>
                                        <Modal isOpen={isContributorsModalOpen} toggle={() => setIsContributorsModalOpen(v => !v)} size="lg">
                                            <ModalHeader toggle={() => setIsContributorsModalOpen(v => !v)}>Contributors</ModalHeader>
                                            <ModalBody>
                                                <div className="clearfix">
                                                    {contributors.map((user, index) => {
                                                        return (
                                                            <div key={`moc${index}`}>
                                                                <ContributorCard
                                                                    contributor={{
                                                                        ...user,
                                                                        subTitle: '4 papers'
                                                                    }}
                                                                />

                                                                <hr style={{ width: '90%', margin: '10px auto' }} />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </ModalBody>
                                        </Modal>
                                    </>
                                )}
                                */}
                            </Col>
                            <Col md="4" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Research fields</h5>
                                    <div>
                                        <small className="text-muted">
                                            Research fields of <i>papers</i> that are addressing this problem
                                        </small>
                                    </div>
                                    {!isLoadingResearchFields ? (
                                        <div className="mb-4 mt-4">
                                            {researchFields.length > 0 ? (
                                                <ul className="pl-1">
                                                    {researchFields.map((researchField, index) => {
                                                        return (
                                                            <li>
                                                                <Link to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: researchField.id })}>
                                                                    {researchField.label}
                                                                </Link>
                                                                <small>
                                                                    <Badge
                                                                        className="ml-1"
                                                                        href={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: researchField.id })}
                                                                        color="info"
                                                                        pill
                                                                    >
                                                                        {researchField.freq}
                                                                    </Badge>
                                                                </small>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <div className="text-center mt-4 mb-4">No research fields</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center mt-4 mb-4">Loading research fields ...</div>
                                    )}
                                </div>
                            </Col>
                            <Col md="4" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Managed by</h5>
                                    Coming soon
                                </div>
                            </Col>
                        </Row>
                        {/*
                         */}
                    </Container>

                    <Container className="p-0">
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Papers</h1>
                    </Container>
                    <Container className="p-0">
                        {contributions.length > 0 && (
                            <div>
                                {contributions.map(contribution => {
                                    return (
                                        contribution && (
                                            <PaperCard
                                                paper={{
                                                    id: contribution.papers[0].subject.id,
                                                    title: contribution.papers[0].subject.label,
                                                    ...contribution.papers[0].data
                                                }}
                                                contribution={{ id: contribution.subject.id, title: contribution.subject.label }}
                                                key={`pc${contribution.id}`}
                                            />
                                        )
                                    );
                                })}
                            </div>
                        )}
                        {contributions.length === 0 && !isLoadingPapers && (
                            <div className="text-center mt-4 mb-4">
                                There are no articles for this research problem, yet.
                                <br />
                                Start the graphing in ORKG by sharing a paper.
                                <br />
                                <br />
                                <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                    <Button size="sm" color="primary " className="mr-3">
                                        Share paper
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {isLoadingPapers && (
                            <div className="text-center mt-4 mb-4">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
                        )}
                        {!isLoadingPapers && hasNextPage && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center mt-2"
                                onClick={!isLoadingPapers ? loadMorePapers : undefined}
                            >
                                Load more papers
                            </div>
                        )}
                        {!hasNextPage && isLastPageReached && <div className="text-center mt-3">You have reached the last page.</div>}
                        <ComparisonPopup />
                    </Container>
                </div>
            )}
        </div>
    );
}

ResearchProblem.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            researchProblemId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default ResearchProblem;
