import { useState } from 'react';
import { Container, Button, ListGroup, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import PaperCard from 'components/PaperCard/PaperCard';
import useResearchFieldPapers from 'components/ResearchField/hooks/useResearchFieldPapers';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import { SmallButton } from 'components/styled';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';

const Papers = ({ id, boxShadow }) => {
    const {
        papers,
        sort,
        includeSubFields,
        isLoadingPapers,
        hasNextPage,
        isLastPageReached,
        totalElements,
        page,
        handleLoadMore,
        setSort,
        setIncludeSubFields
    } = useResearchFieldPapers({ researchFieldId: id, initialSort: 'newest', initialIncludeSubFields: true });
    const [tippy, setTippy] = useState({});

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-grow-1">
                    <h1 className="h4">Papers</h1>
                    <div className="text-muted ml-3 mt-1">
                        {totalElements === 0 && isLoadingPapers ? <Icon icon={faSpinner} spin /> : totalElements} Paper
                    </div>
                </div>

                <Tippy
                    interactive={true}
                    trigger="click"
                    placement="bottom-end"
                    onCreate={instance => setTippy(instance)}
                    content={
                        <div className="p-2">
                            <FormGroup>
                                <Label for="sortPapers">Sort</Label>
                                <Input
                                    value={sort}
                                    onChange={e => {
                                        tippy.hide();
                                        setSort(e.target.value);
                                    }}
                                    bsSize="sm"
                                    type="select"
                                    name="sort"
                                    id="sortPapers"
                                    disabled={isLoadingPapers}
                                >
                                    <option value="newest">Newest first</option>
                                    <option value="oldest">Oldest first</option>
                                </Input>
                            </FormGroup>
                            <FormGroup check>
                                <Label check>
                                    <Input
                                        onChange={e => {
                                            tippy.hide();
                                            setIncludeSubFields(e.target.checked);
                                        }}
                                        checked={includeSubFields}
                                        type="checkbox"
                                        style={{ marginTop: '0.1rem' }}
                                        disabled={isLoadingPapers}
                                    />
                                    Include subfields
                                </Label>
                            </FormGroup>
                        </div>
                    }
                >
                    <span>
                        <SmallButton className="flex-shrink-0 pl-3 pr-3" style={{ marginLeft: 'auto' }} size="sm">
                            View <Icon icon={faChevronDown} />
                        </SmallButton>
                    </span>
                </Tippy>
            </Container>
            <Container className="p-0">
                {papers.length > 0 && (
                    <ListGroup className={boxShadow ? 'box' : ''}>
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
                        {!isLoadingPapers && hasNextPage && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center"
                                onClick={!isLoadingPapers ? handleLoadMore : undefined}
                                onKeyDown={e => (e.keyCode === 13 ? (!isLoadingPapers ? handleLoadMore : undefined) : undefined)}
                                role="button"
                                tabIndex={0}
                            >
                                Load more papers
                            </div>
                        )}
                        {!hasNextPage && isLastPageReached && page !== 1 && <div className="text-center mt-3">You have reached the last page.</div>}
                    </ListGroup>
                )}
                {papers.length === 0 && !isLoadingPapers && (
                    <div className={boxShadow ? 'container box rounded' : ''}>
                        <div className="p-5 text-center mt-4 mb-4">
                            There are no papers for this research field, yet.
                            <br />
                            <br />
                            <Link to={ROUTES.ADD_PAPER.GENERAL_DATA}>
                                <Button size="sm" color="primary " className="mr-3">
                                    Add paper
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
                {isLoadingPapers && (
                    <div className={`text-center mt-4 mb-4 ${page === 0 ? 'p-5 container box rounded' : ''}`}>
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </Container>
        </>
    );
};

Papers.propTypes = {
    id: PropTypes.string.isRequired,
    boxShadow: PropTypes.bool
};

Papers.defaultProps = {
    boxShadow: false
};

export default Papers;
