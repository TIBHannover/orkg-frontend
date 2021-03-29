import { useState, useEffect, useCallback } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, FormGroup, Input, Label, ListGroup, ListGroupItem, InputGroup, Alert } from 'reactstrap';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { getResourcesByClass } from 'services/backend/resources';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import ContentLoader from 'react-content-loader';
import { getPaperByDOI } from 'services/backend/misc';
import REGEX from 'constants/regex';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { PREDICATES, CLASSES } from 'constants/graphSettings';
import Tippy from '@tippyjs/react';

const StyledLoadMoreButton = styled.div`
    padding-top: 0;
    & span {
        cursor: pointer;
        border: 2px solid rgba(0, 0, 0, 0.125);
        border-top: 0;
        border-top-right-radius: 0;
        border-top-left-radius: 0;
        border-bottom-right-radius: 12px;
        border-bottom-left-radius: 12px;
    }
    &.action:hover span {
        z-index: 1;
        color: #495057;
        text-decoration: underline;
        background-color: #f8f9fa;
    }
`;

const StyledListGroupItem = styled(ListGroupItem)`
    overflow-wrap: break-word;
    word-break: break-all;

    &:last-child {
        border-bottom-right-radius: ${props => (props.rounded === 'true' ? '0 !important' : '')};
    }
`;

export default function AddContribution(props) {
    const [searchPaper, setSearchPaper] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [isNextPageLoading, setIsNextPageLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);

    const [paperResult, setPaperResult] = useState([]);
    const [selectedContributions, setSelectedContributions] = useState([]);

    const numberOfPaper = 5;

    const loadMoreResults = (searchQuery, page) => {
        if (searchQuery.length === 0) {
            setPaperResult([]);
            setCurrentPage(1);
            setIsNextPageLoading(false);
            return;
        }
        setIsNextPageLoading(true);
        const doi = searchQuery.startsWith('http') ? searchQuery.substring(searchQuery.indexOf('10.')) : searchQuery;

        // The entry is a DOI, check if it exists in the database
        if (doi.trim().match(new RegExp(REGEX.DOI))) {
            getPaperByDOI(doi.trim())
                .then(result =>
                    getStatementsBySubjectAndPredicate({
                        subjectId: result.id,
                        predicateId: PREDICATES.HAS_CONTRIBUTION
                    })
                        .then(contributions => {
                            return {
                                ...result,
                                contributions: contributions
                                    .sort((a, b) => {
                                        return a.object.label.localeCompare(b.object.label);
                                    })
                                    .map(contribution => ({ ...contribution.object, checked: false })),
                                label: result.title
                            };
                        })
                        .then(paperData => {
                            setPaperResult([paperData]);
                            setIsNextPageLoading(false);
                            setHasNextPage(false);
                            setCurrentPage(1);
                        })
                )
                .catch(() => {
                    if (page === 1) {
                        setPaperResult([]);
                    }
                    setIsNextPageLoading(false);
                    setHasNextPage(false);
                });
        } else {
            getResourcesByClass({
                page: page || currentPage,
                items: numberOfPaper,
                sortBy: 'id',
                desc: true,
                q: searchQuery,
                id: CLASSES.PAPER,
                returnContent: true
            })
                .then(results => {
                    if (results.length > 0) {
                        const paper = results.map(resource =>
                            getStatementsBySubjectAndPredicate({
                                subjectId: resource.id,
                                predicateId: PREDICATES.HAS_CONTRIBUTION
                            }).then(contributions => {
                                return {
                                    ...resource,
                                    contributions: contributions
                                        .sort((a, b) => {
                                            return a.object.label.localeCompare(b.object.label);
                                        })
                                        .map(contribution => ({ ...contribution.object, checked: false }))
                                };
                            })
                        );
                        Promise.all(paper).then(paperData => {
                            setPaperResult([...(page === 1 ? [] : paperResult), ...paperData]);
                            setIsNextPageLoading(false);
                            setHasNextPage(results.length < numberOfPaper ? false : true);
                            setCurrentPage(page);
                        });
                    } else {
                        if (page === 1) {
                            setPaperResult([]);
                        }
                        setIsNextPageLoading(false);
                        setHasNextPage(false);
                    }
                })
                .catch(error => {
                    console.log(error);
                    toast.error('Something went wrong while loading search results.');
                });
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedGetLoadMoreResults = useCallback(debounce(loadMoreResults, 500), []);

    const toggleContribution = contributionsID => {
        if (!selectedContributions.includes(contributionsID)) {
            setSelectedContributions(prev => [...prev, contributionsID]);
        } else {
            setSelectedContributions(selectedContributions.filter(i => i !== contributionsID));
        }
    };

    const togglePaper = (paper, e) => {
        let newSelectedContributions = selectedContributions;
        if (paper.contributions.length > 0) {
            paper.contributions.map(contribution => {
                if (e.target.checked && !selectedContributions.includes(contribution.id)) {
                    //setSelectedContributions(prev => [...prev, contribution.id]);
                    newSelectedContributions = [...newSelectedContributions, contribution.id];
                } else if (!e.target.checked) {
                    newSelectedContributions = [...newSelectedContributions.filter(i => i !== contribution.id)];
                }
                return null;
            });
        }
        setSelectedContributions(newSelectedContributions);
    };

    useEffect(() => {
        setHasNextPage(false);
        setCurrentPage(1);
        setSelectedContributions([]);
        setIsNextPageLoading(true);
        debouncedGetLoadMoreResults(searchPaper, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchPaper]);

    return (
        <Modal isOpen={props.showDialog} toggle={props.toggle} size="lg">
            <ModalHeader toggle={props.toggle}>Add contribution</ModalHeader>
            <ModalBody>
                <FormGroup>
                    <Label for="title">Paper title or DOI</Label>
                    <InputGroup>
                        <Input
                            value={searchPaper}
                            placeholder="Search contributions by paper title or DOI..."
                            type="text"
                            name="title"
                            id="title"
                            onChange={e => setSearchPaper(e.target.value)}
                        />
                    </InputGroup>
                </FormGroup>
                <div>
                    {isNextPageLoading && searchPaper && paperResult.length === 0 && (
                        <ContentLoader
                            style={{ width: '100% !important' }}
                            width="100%"
                            height="100%"
                            viewBox="0 0 100 20"
                            speed={2}
                            backgroundColor="#f3f3f3"
                            foregroundColor="#ecebeb"
                        >
                            <rect x="0" y="0" width="100%" height="2" />
                            <rect x="0" y="5" width="100%" height="2" />
                            <rect x="0" y="10" width="100%" height="2" />
                            <rect x="0" y="15" width="100%" height="2" />
                        </ContentLoader>
                    )}
                    {!isNextPageLoading && searchPaper && paperResult.length === 0 && (
                        <div>
                            <div className="text-center mt-4 mb-4">
                                There are no results, please try a different search term{' '}
                                {props.allowCreate && (
                                    <>
                                        or{' '}
                                        <Button color="light" size="sm" onClick={() => props.onCreatePaper(searchPaper)}>
                                            Add new paper
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                    {paperResult.length > 0 && (
                        <>
                            <Alert color="info">
                                Select the contributions you want to add{' '}
                                {props.allowCreate && (
                                    <>
                                        or you click on <Icon icon={faPlusCircle} className="text-primary" /> if you want to create a new contribution
                                        for an existing paper
                                    </>
                                )}
                            </Alert>
                            <ListGroup>
                                {paperResult.map((paper, index) => {
                                    return (
                                        <StyledListGroupItem action key={`result-${index}`} className="pt-2 pb-2">
                                            <Label check className="pr-2 pl-2">
                                                <Input type="checkbox" onChange={e => togglePaper(paper, e)} /> {paper.label}{' '}
                                                <Tippy content="Open paper in new window">
                                                    <span>
                                                        <Link
                                                            title="View the paper page"
                                                            target="_blank"
                                                            to={reverse(ROUTES.VIEW_PAPER, { resourceId: paper.id })}
                                                        >
                                                            <Icon icon={faExternalLinkAlt} />
                                                        </Link>
                                                    </span>
                                                </Tippy>
                                                {props.allowCreate && (
                                                    <Tippy content="Create new contribution for this paper">
                                                        <span className="ml-2">
                                                            <Button
                                                                color="link"
                                                                className="p-0"
                                                                size="lg"
                                                                onClick={() => props.onCreateContribution(paper.id)}
                                                            >
                                                                <Icon icon={faPlusCircle} />
                                                            </Button>
                                                        </span>
                                                    </Tippy>
                                                )}
                                            </Label>
                                            {paper.contributions.length > 1 && (
                                                <ul style={{ listStyle: 'none' }}>
                                                    {paper.contributions.map(contribution => {
                                                        return (
                                                            <li key={`ccb${contribution.id}`}>
                                                                <Label check className="pr-1 pl-1">
                                                                    <Input
                                                                        type="checkbox"
                                                                        checked={selectedContributions.includes(contribution.id)}
                                                                        onChange={() => toggleContribution(contribution.id)}
                                                                    />{' '}
                                                                    {contribution.label}
                                                                </Label>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            )}
                                        </StyledListGroupItem>
                                    );
                                })}
                            </ListGroup>
                        </>
                    )}
                    {!isNextPageLoading && hasNextPage && (
                        <StyledLoadMoreButton className="text-right action">
                            <div
                                className="btn btn-link btn-sm"
                                onClick={() => loadMoreResults(searchPaper, currentPage + 1)}
                                onKeyDown={e => (e.keyCode === 13 ? loadMoreResults(searchPaper, currentPage + 1) : undefined)}
                                role="button"
                                tabIndex={0}
                            >
                                + Load more
                            </div>
                        </StyledLoadMoreButton>
                    )}
                    {isNextPageLoading && hasNextPage && (
                        <StyledLoadMoreButton className="text-right action">
                            <span className="btn btn-link btn-sm">Loading...</span>
                        </StyledLoadMoreButton>
                    )}
                </div>
            </ModalBody>
            <ModalFooter className="d-flex">
                {props.allowCreate && (
                    <div className="flex-grow-1">
                        <Button color="lightblue" onClick={() => props.onCreatePaper(searchPaper)}>
                            Add new paper
                        </Button>
                    </div>
                )}
                <Button
                    disabled={selectedContributions.length === 0}
                    color="primary"
                    className="float-right"
                    onClick={() => {
                        props.onAddContributions(selectedContributions);
                        setSelectedContributions([]);
                        props.toggle();
                    }}
                >
                    Add contribution{selectedContributions.length > 1 && 's'}
                    {selectedContributions.length > 0 && ` (${selectedContributions.length})`}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
AddContribution.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    onAddContributions: PropTypes.func.isRequired,
    allowCreate: PropTypes.bool,
    onCreateContribution: PropTypes.func,
    onCreatePaper: PropTypes.func
};

AddContribution.defaultProps = {
    allowCreate: false,
    onCreateContribution: () => {},
    onCreatePaper: () => {}
};
