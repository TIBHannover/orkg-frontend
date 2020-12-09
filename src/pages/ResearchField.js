import React, { useState } from 'react';
import {
    Container,
    Button,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Card,
    CardBody,
    Row,
    Col,
    Badge,
    Modal,
    ModalBody,
    ModalHeader,
    ListGroup,
    ListGroupItem
} from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faEllipsisV, faAngleDoubleDown } from '@fortawesome/free-solid-svg-icons';
import useResearchField from 'components/ResearchField/hooks/useResearchField';
import useResearchFieldObservatories from 'components/ResearchField/hooks/useResearchFieldObservatories';
import useResearchFieldPapers from 'components/ResearchField/hooks/useResearchFieldPapers';
import useResearchFieldComparison from 'components/ResearchField/hooks/useResearchFieldComparison';
import useResearchFieldProblems from 'components/ResearchField/hooks/useResearchFieldProblems';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import { NavLink } from 'react-router-dom';
import PaperCard from 'components/PaperCard/PaperCard';
import ROUTES from 'constants/routes';

function ResearchField(props) {
    const [researchFieldData, subResearchFields, isLoading, isFailedLoading] = useResearchField();
    const [researchFieldObservatories] = useResearchFieldObservatories();
    const [papers, isLoadingPapers, hasNextPage, isLastPageReached, loadMorePapers] = useResearchFieldPapers();
    const [comparisons, isLoadingComparisons, hasNextPageComparison, isLastPageReachedComparison, loadMoreComparisons] = useResearchFieldComparison();
    const [
        researchProblems,
        isLoadingResearchProblems,
        hasNextPageProblems,
        isLastPageReachedProblems,
        currentPageProblems,
        loadMoreProblems
    ] = useResearchFieldProblems();
    const [menuOpen, setMenuOpen] = useState(false);
    const { researchFieldId } = props.match.params;

    const [isSubResearchFieldsModalOpen, setIsSubResearchFieldsModalOpen] = useState(false);
    const [isProblemsModalOpen, setIsProblemsModalOpen] = useState(false);
    const [isObservatoriesModalOpen, setIsObservatoriesModalOpen] = useState(false);

    return (
        <div>
            {isLoading && (
                <div className="text-center mt-4 mb-4">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
            {!isLoading && isFailedLoading && <div className="text-center mt-4 mb-4">Failed loading the resource</div>}
            {!isLoading && !isFailedLoading && (
                <div>
                    <Breadcrumbs researchFieldId={researchFieldId} />

                    <Container className="d-flex align-items-center">
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Research field</h1>

                        <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)} nav inNavbar>
                            <DropdownToggle size="sm" color="darkblue" className="px-3 rounded-right" style={{ marginLeft: 2 }}>
                                <Icon icon={faEllipsisV} />
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem tag={NavLink} exact to={reverse(ROUTES.RESOURCE, { id: researchFieldId })}>
                                    View resource
                                </DropdownItem>
                            </DropdownMenu>
                        </ButtonDropdown>
                    </Container>
                    <Container className="p-0">
                        <Card>
                            <CardBody>
                                <h3 className="mt-4 mb-4">{researchFieldData && researchFieldData.label}</h3>
                            </CardBody>
                        </Card>

                        <Row className="mt-3">
                            <Col md="4" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Research subfields</h5>
                                    {subResearchFields && subResearchFields.length > 0 && (
                                        <ul className="pl-3 pt-2">
                                            {subResearchFields.slice(0, 5).map(subRF => (
                                                <li key={`subrp${subRF.id}`}>
                                                    <Link to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: subRF.id })}>
                                                        {subRF.label}{' '}
                                                        <small>
                                                            <Badge className="ml-1" color="info" pill>
                                                                {subRF.numPapers}
                                                            </Badge>
                                                        </small>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {subResearchFields.length > 5 && (
                                        <>
                                            <Button
                                                onClick={() => setIsSubResearchFieldsModalOpen(v => !v)}
                                                className="mt-1 mb-2 mr-3 float-right clearfix p-0"
                                                color="link"
                                            >
                                                <small>+ See more</small>
                                            </Button>
                                        </>
                                    )}
                                    {subResearchFields.length > 5 && (
                                        <Modal
                                            isOpen={isSubResearchFieldsModalOpen}
                                            toggle={() => setIsSubResearchFieldsModalOpen(v => !v)}
                                            size="lg"
                                        >
                                            <ModalHeader toggle={() => setIsSubResearchFieldsModalOpen(v => !v)}>
                                                Research subfields of {researchFieldData && researchFieldData.label}{' '}
                                            </ModalHeader>
                                            <ModalBody>
                                                <div className="pl-3 pr-3">
                                                    <ListGroup>
                                                        {subResearchFields.map(subRF => (
                                                            <ListGroupItem key={`subrf${subRF.id}`} className="justify-content-between">
                                                                <Link
                                                                    onClick={() => setIsSubResearchFieldsModalOpen(false)}
                                                                    to={reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: subRF.id })}
                                                                >
                                                                    {subRF.label}
                                                                    <small>
                                                                        <Badge className="ml-1" color="info" pill>
                                                                            {subRF.numPapers}
                                                                        </Badge>
                                                                    </small>
                                                                </Link>
                                                            </ListGroupItem>
                                                        ))}
                                                    </ListGroup>
                                                </div>
                                            </ModalBody>
                                        </Modal>
                                    )}
                                    {subResearchFields && subResearchFields.length === 0 && <>No sub research fields.</>}
                                </div>
                            </Col>
                            <Col md="4" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Research problems</h5>
                                    <div>
                                        <small className="text-muted">
                                            Research problems of <i>papers</i> that are addressing this field
                                        </small>
                                    </div>
                                    <>
                                        {researchProblems && researchProblems.length > 0 && (
                                            <ul className="pl-1 pt-2">
                                                {researchProblems.slice(0, 5).map(researchProblem => (
                                                    <li key={`rp${researchProblem.problem.id}`}>
                                                        <Link
                                                            to={reverse(ROUTES.RESEARCH_PROBLEM, {
                                                                researchProblemId: researchProblem.problem.id
                                                            })}
                                                        >
                                                            {researchProblem.problem.label}
                                                            <small>
                                                                <Badge className="ml-1" color="info" pill>
                                                                    {researchProblem.papers}
                                                                </Badge>
                                                            </small>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        {researchProblems.length > 5 && (
                                            <>
                                                <Button
                                                    onClick={() => setIsProblemsModalOpen(v => !v)}
                                                    className="mt-1 mb-2 mr-3 float-right clearfix p-0"
                                                    color="link"
                                                >
                                                    <small>+ See more</small>
                                                </Button>
                                            </>
                                        )}
                                        {researchProblems.length > 5 && (
                                            <Modal isOpen={isProblemsModalOpen} toggle={() => setIsProblemsModalOpen(v => !v)} size="lg">
                                                <ModalHeader toggle={() => setIsProblemsModalOpen(v => !v)}>
                                                    Research problems of {researchFieldData && researchFieldData.label}{' '}
                                                </ModalHeader>
                                                <ModalBody>
                                                    <ListGroup>
                                                        {researchProblems.map(researchProblem => (
                                                            <ListGroupItem key={`rp${researchProblem.id}`} className="justify-content-between">
                                                                <Link
                                                                    to={reverse(ROUTES.RESEARCH_PROBLEM, {
                                                                        researchProblemId: researchProblem.problem.id
                                                                    })}
                                                                >
                                                                    {researchProblem.problem.label}
                                                                    <small>
                                                                        <Badge className="ml-1" color="info" pill>
                                                                            {researchProblem.papers}
                                                                        </Badge>
                                                                    </small>
                                                                </Link>
                                                            </ListGroupItem>
                                                        ))}

                                                        {hasNextPageProblems && (
                                                            <ListGroupItem
                                                                style={{ cursor: 'pointer' }}
                                                                className="text-center"
                                                                action
                                                                onClick={!isLoadingResearchProblems ? loadMoreProblems : undefined}
                                                            >
                                                                <Icon icon={faAngleDoubleDown} /> Load more research problems
                                                            </ListGroupItem>
                                                        )}
                                                        {!hasNextPageProblems && isLastPageReachedProblems && (
                                                            <ListGroupItem tag="div" className="text-center">
                                                                You have reached the last page.
                                                            </ListGroupItem>
                                                        )}
                                                    </ListGroup>
                                                </ModalBody>
                                            </Modal>
                                        )}
                                        {researchProblems && researchProblems.length === 0 && <>No research problems.</>}
                                    </>
                                    {isLoadingResearchProblems && currentPageProblems === 1 && (
                                        <ListGroupItem tag="div" className="text-center">
                                            Loading research problems ...
                                        </ListGroupItem>
                                    )}
                                </div>
                            </Col>
                            <Col md="4" className="d-flex">
                                <div className="box rounded-lg p-4 flex-grow-1">
                                    <h5>Observatories</h5>
                                    {researchFieldObservatories && researchFieldObservatories.length > 0 && (
                                        <ul className="pl-1 pt-2">
                                            {researchFieldObservatories.slice(0, 5).map(observatory => (
                                                <li key={`obsrf${observatory.id}`}>
                                                    <Link to={reverse(ROUTES.OBSERVATORY, { id: observatory.id })}>{observatory.name} </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {researchFieldObservatories.length > 5 && (
                                        <>
                                            <Button
                                                onClick={() => setIsObservatoriesModalOpen(v => !v)}
                                                className="mt-1 mb-2 mr-3 float-right clearfix p-0"
                                                color="link"
                                            >
                                                <small>+ See more</small>
                                            </Button>
                                        </>
                                    )}
                                    {researchFieldObservatories.length > 5 && (
                                        <Modal isOpen={isObservatoriesModalOpen} toggle={() => setIsObservatoriesModalOpen(v => !v)} size="lg">
                                            <ModalHeader toggle={() => setIsObservatoriesModalOpen(v => !v)}>
                                                Observatories of {researchFieldData && researchFieldData.label}{' '}
                                            </ModalHeader>
                                            <ModalBody>
                                                <div className="pl-3 pr-3">
                                                    <ListGroup>
                                                        {researchFieldObservatories.map(observatory => (
                                                            <ListGroupItem key={`obsrf${observatory.id}`} className="justify-content-between">
                                                                <Link
                                                                    onClick={() => setIsObservatoriesModalOpen(false)}
                                                                    to={reverse(ROUTES.OBSERVATORY, { id: observatory.id })}
                                                                >
                                                                    {observatory.name}
                                                                </Link>
                                                            </ListGroupItem>
                                                        ))}
                                                    </ListGroup>
                                                </div>
                                            </ModalBody>
                                        </Modal>
                                    )}
                                    {researchFieldObservatories && researchFieldObservatories.length === 0 && <>No observatories.</>}
                                </div>
                            </Col>
                        </Row>
                    </Container>

                    <Container className="p-0">
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Comparisons</h1>
                    </Container>
                    <Container className="p-0">
                        {comparisons.length > 0 && (
                            <div>
                                {comparisons.map(comparison => {
                                    return comparison && <ComparisonCard comparison={{ ...comparison }} key={`pc${comparison.id}`} />;
                                })}
                            </div>
                        )}
                        {comparisons.length === 0 && !isLoadingComparisons && (
                            <div className="box rounded-lg p-5 text-center mt-4 mb-4">
                                There are no published comparisons for this research field, yet.
                                <br />
                            </div>
                        )}
                        {isLoadingComparisons && (
                            <div className="text-center mt-4 mb-4">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
                        )}
                        {!isLoadingComparisons && hasNextPageComparison && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center mt-2"
                                onClick={!isLoadingComparisons ? loadMoreComparisons : undefined}
                            >
                                Load more comparisons
                            </div>
                        )}
                        {!hasNextPageComparison && isLastPageReachedComparison && (
                            <div className="text-center mt-3">You have reached the last page.</div>
                        )}
                    </Container>

                    <Container className="p-0">
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Papers</h1>
                    </Container>
                    <Container className="p-0">
                        {papers.length > 0 && (
                            <div>
                                {papers.map(paper => {
                                    return (
                                        paper && (
                                            <PaperCard
                                                paper={{
                                                    id: paper.id,
                                                    title: paper.label,
                                                    ...paper
                                                }}
                                                key={`pc${paper.id}`}
                                            />
                                        )
                                    );
                                })}
                            </div>
                        )}
                        {papers.length === 0 && !isLoadingPapers && (
                            <div className="box rounded-lg p-5 text-center mt-4 mb-4">
                                There are no papers for this research field, yet.
                                <br />
                                <br />
                                <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                    <Button size="sm" color="primary " className="mr-3">
                                        Add paper
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
                    </Container>
                </div>
            )}
        </div>
    );
}

ResearchField.propTypes = {
    match: PropTypes.shape({
        params: PropTypes.shape({
            researchFieldId: PropTypes.string
        }).isRequired
    }).isRequired
};

export default ResearchField;
