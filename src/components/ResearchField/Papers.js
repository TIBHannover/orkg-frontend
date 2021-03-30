import { useState } from 'react';
import { Container, Button, ListGroup, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import PaperCard from 'components/PaperCard/PaperCard';
import useResearchFieldPapers from 'components/ResearchField/hooks/useResearchFieldPapers';
import ROUTES from 'constants/routes';
import { Link } from 'react-router-dom';
import ContentLoader from 'react-content-loader';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import { stringifySort } from 'utils';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';

const Papers = ({ id, boxShadow }) => {
    const {
        papers,
        sort,
        includeSubFields,
        isLoading,
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
                    <h1 className="h5 flex-shrink-0 mb-0">Papers</h1>
                    <>
                        <SubtitleSeparator />
                        <SubTitle className="mb-0">
                            <small className="text-muted mb-0 text-small">
                                {totalElements === 0 && isLoading ? <Icon icon={faSpinner} spin /> : <>{`${totalElements} papers`}</>}
                            </small>
                        </SubTitle>
                    </>
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
                                    disabled={isLoading}
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
                                        disabled={isLoading}
                                    />
                                    Include subfields
                                </Label>
                            </FormGroup>
                        </div>
                    }
                >
                    <span>
                        <Button color="darkblue" className="flex-shrink-0 pl-3 pr-3 ml-auto" size="sm">
                            {stringifySort(sort)} <Icon icon={faChevronDown} />
                        </Button>
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
                        {!isLoading && hasNextPage && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center"
                                onClick={!isLoading ? handleLoadMore : undefined}
                                onKeyDown={e => (e.keyCode === 13 ? (!isLoading ? handleLoadMore : undefined) : undefined)}
                                role="button"
                                tabIndex={0}
                            >
                                Load more papers
                            </div>
                        )}
                        {!hasNextPage && isLastPageReached && page !== 1 && <div className="text-center mt-3">You have reached the last page.</div>}
                    </ListGroup>
                )}
                {papers.length === 0 && !isLoading && (
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
                {isLoading && (
                    <div className={`text-center mt-4 mb-4 ${page === 0 ? 'p-5 container rounded' : ''} ${boxShadow ? 'box' : ''}`}>
                        {page !== 0 && (
                            <>
                                <Icon icon={faSpinner} spin /> Loading
                            </>
                        )}
                        {page === 0 && (
                            <div className="text-left">
                                <ContentLoader
                                    speed={2}
                                    width={400}
                                    height={50}
                                    viewBox="0 0 400 50"
                                    style={{ width: '100% !important' }}
                                    backgroundColor="#f3f3f3"
                                    foregroundColor="#ecebeb"
                                >
                                    <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                    <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                                </ContentLoader>
                            </div>
                        )}
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
