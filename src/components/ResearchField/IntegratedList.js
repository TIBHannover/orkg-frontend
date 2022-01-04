import { useState } from 'react';
import { Button, Container, ListGroup, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import useResearchFieldContent from 'components/ResearchField/hooks/useResearchFieldContent';
import ClassesBadgesFilter from 'components/ClassesBadgesFilter/ClassesBadgesFilter';
import CardFactory from 'components/CardFactory/CardFactory';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import { CLASSES } from 'constants/graphSettings';
import Tippy from '@tippyjs/react';
import { useSelector } from 'react-redux';
import ContentLoader from 'react-content-loader';
import { stringifySort } from 'utils';
import PropTypes from 'prop-types';

const DEFAULT_CLASSES_FILTER = [
    { id: CLASSES.PAPER, label: 'Paper' },
    { id: CLASSES.COMPARISON, label: 'Comparison' },
    { id: CLASSES.VISUALIZATION, label: 'Visualization' },
    { id: CLASSES.SMART_REVIEW, label: 'SmartReview' }
];

const IntegratedList = ({ id, boxShadow }) => {
    const {
        items,
        sort,
        includeSubFields,
        isLoading,
        hasNextPage,
        isLastPageReached,
        totalElements,
        page,
        classesFilter,
        handleLoadMore,
        setClassesFilter,
        setSort,
        setIncludeSubFields
    } = useResearchFieldContent({
        researchFieldId: id,
        initialSort: 'combined',
        initialClassFilterOptions: DEFAULT_CLASSES_FILTER,
        initClassesFilter: DEFAULT_CLASSES_FILTER,
        initialIncludeSubFields: true
    });
    const [tippy, setTippy] = useState({});
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-grow-1">
                    <h1 className="h5 flex-shrink-0 mb-0 me-2">Content</h1>
                    <>
                        <SubtitleSeparator />
                        <SubTitle className="mb-0">
                            <small className="text-muted mb-0 text-small">
                                {totalElements === 0 && isLoading ? <Icon icon={faSpinner} spin /> : <>{`${totalElements} items`}</>}
                            </small>
                        </SubTitle>
                    </>
                </div>
                <ClassesBadgesFilter
                    initialClassFilterOptions={DEFAULT_CLASSES_FILTER}
                    setClassesFilter={setClassesFilter}
                    classesFilter={classesFilter}
                    disabled={isLoading}
                />
                <Tippy
                    interactive={true}
                    trigger="click"
                    placement="bottom-end"
                    onCreate={instance => setTippy(instance)}
                    content={
                        <div className="p-2">
                            <FormGroup>
                                <Label for="sortComparisons">Sort</Label>
                                <Input
                                    value={sort}
                                    onChange={e => {
                                        tippy.hide();
                                        setSort(e.target.value);
                                    }}
                                    bsSize="sm"
                                    type="select"
                                    name="sort"
                                    id="sortComparisons"
                                    disabled={isLoading}
                                >
                                    <option value="combined">Top recent</option>
                                    <option value="newest">Recently added</option>
                                    <option value="featured">Featured</option>
                                    {isCurationAllowed && <option value="unlisted">Unlisted</option>}
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
                        <Button color="secondary" className="flex-shrink-0 ps-3 pe-3 ms-auto" size="sm">
                            {stringifySort(sort)} <Icon icon={faChevronDown} />
                        </Button>
                    </span>
                </Tippy>
            </Container>
            <Container className="p-0">
                {items.length > 0 && (
                    <ListGroup className={boxShadow ? 'box' : ''}>
                        {items.map(item => (
                            <CardFactory showBadge={true} showCurationFlags={true} showAddToComparison={true} key={`item${item.id}`} item={item} />
                        ))}
                        {!isLoading && hasNextPage && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center"
                                onClick={!isLoading ? handleLoadMore : undefined}
                                onKeyDown={e => (e.keyCode === 13 ? (!isLoading ? handleLoadMore : undefined) : undefined)}
                                role="button"
                                tabIndex={0}
                            >
                                Load more content
                            </div>
                        )}
                        {!hasNextPage && isLastPageReached && page !== 1 && <div className="text-center mt-3">You have reached the last page.</div>}
                    </ListGroup>
                )}
                {items.length === 0 && !isLoading && (
                    <div className={boxShadow ? 'container box rounded' : ''}>
                        <div className="p-5 text-center mt-4 mb-4">
                            There are no {sort === 'featured' ? 'featured' : sort === 'unlisted' ? 'unlisted' : ''}{' '}
                            {classesFilter.map(c => c.label).join(', ')} for this research field, yet.
                            <br />
                            <br />
                        </div>
                    </div>
                )}
                {isLoading && (
                    <div className={`text-center mt-4 mb-4 ${page === 0 ? 'p-5 container box rounded' : ''}`}>
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

IntegratedList.propTypes = {
    id: PropTypes.string.isRequired,
    boxShadow: PropTypes.bool
};

IntegratedList.defaultProps = {
    boxShadow: false
};

export default IntegratedList;
