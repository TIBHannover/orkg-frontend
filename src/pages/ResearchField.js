import { useState, useEffect, useRef } from 'react';
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
import { faSpinner, faEllipsisV, faAngleDoubleDown, faPen } from '@fortawesome/free-solid-svg-icons';
import useResearchField from 'components/ResearchField/hooks/useResearchField';
import useResearchFieldObservatories from 'components/ResearchField/hooks/useResearchFieldObservatories';
import useResearchFieldPapers from 'components/ResearchField/hooks/useResearchFieldPapers';
import useResearchFieldComparison from 'components/ResearchField/hooks/useResearchFieldComparison';
import useResearchFieldProblems from 'components/ResearchField/hooks/useResearchFieldProblems';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import ExternalDescription from 'components/ResearchProblem/ExternalDescription';
import ObservatoriesCarousel from 'components/ObservatoriesCarousel/ObservatoriesCarousel';
import Breadcrumbs from 'components/Breadcrumbs/Breadcrumbs';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { reverse } from 'named-urls';
import { NavLink } from 'react-router-dom';
import PaperCard from 'components/PaperCard/PaperCard';
import ROUTES from 'constants/routes';

function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

function ResearchField(props) {
    const [researchFieldData, subResearchFields, isLoading, isFailedLoading, loadResearchFieldData] = useResearchField();
    const [editMode, setEditMode] = useState(false);
    const prevEditMode = usePrevious({ editMode });
    const [observatories, isLoadingObservatories] = useResearchFieldObservatories();
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

    const user = useSelector(state => state.auth.user);

    useEffect(() => {
        if (!editMode && prevEditMode && prevEditMode.editMode !== editMode) {
            loadResearchFieldData(researchFieldId);
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
            {!isLoading && isFailedLoading && <div className="text-center mt-4 mb-4">Failed loading the resource</div>}
            {!isLoading && !isFailedLoading && (
                <div>
                    {editMode && (
                        <StatementBrowserDialog
                            show={editMode}
                            toggleModal={() => setEditMode(v => !v)}
                            id={researchFieldId}
                            label={researchFieldData.label}
                            enableEdit={true}
                            syncBackend={true}
                            type="resource"
                        />
                    )}
                    <Breadcrumbs researchFieldId={researchFieldId} disableLastField />

                    <Container className="d-flex align-items-center">
                        <h1 className="h4 mt-4 mb-4 flex-grow-1">Research field</h1>

                        <ButtonDropdown isOpen={menuOpen} toggle={() => setMenuOpen(v => !v)} nav inNavbar>
                            {!!user && user.isCurationAllowed && (
                                <Button size="sm" className="float-right" onClick={() => setEditMode(v => !v)} color="darkblue">
                                    <Icon icon={faPen} /> Edit
                                </Button>
                            )}
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
                                {researchFieldData.description && <div className="mb-4">{researchFieldData.description}</div>}
                                {researchFieldData.sameAs && (
                                    <ExternalDescription
                                        query={researchFieldData.sameAs ? researchFieldData.sameAs.label : researchFieldData.label}
                                    />
                                )}
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
                                <div className="box rounded-lg flex-grow-1">
                                    <h5 className="pt-4 pl-4">Observatories</h5>
                                    <hr className="mx-3 mt-0" />
                                    <ObservatoriesCarousel observatories={observatories} isLoading={isLoadingObservatories} />
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
                                onKeyDown={e => (e.keyCode === 13 ? (!isLoadingComparisons ? loadMoreComparisons : undefined) : undefined)}
                                role="button"
                                tabIndex={0}
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
                                onKeyDown={e => (e.keyCode === 13 ? (!isLoadingPapers ? loadMorePapers : undefined) : undefined)}
                                role="button"
                                tabIndex={0}
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
