import { Container, ListGroup, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import useObservatoryContent from 'components/Observatory/hooks/useObservatoryContent';
import CardFactory from 'components/CardFactory/CardFactory';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import { CLASSES } from 'constants/graphSettings';
import { useSelector } from 'react-redux';
import ContentLoader from 'react-content-loader';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router';
import queryString from 'query-string';

const DEFAULT_CLASSES_FILTER = [
    { id: CLASSES.PAPER, label: 'Paper' },
    { id: CLASSES.COMPARISON, label: 'Comparison' },
    { id: CLASSES.VISUALIZATION, label: 'Visualization' },
    /*
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Review' },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'Literature list' }
    */
];

const IntegratedList = ({ id, slug, boxShadow }) => {
    const location = useLocation();
    const params = queryString.parse(location.search);

    const {
        items,
        sort,
        isLoading,
        hasNextPage,
        isLastPageReached,
        totalElements,
        page,
        classesFilter,
        handleLoadMore,
        setClassesFilter,
        setSort,
    } = useObservatoryContent({
        observatoryId: id,
        slug: slug,
        initialSort: params.sort ?? 'combined',
        initialClassFilterOptions: DEFAULT_CLASSES_FILTER,
        initClassesFilter: params.classesFilter
            ? DEFAULT_CLASSES_FILTER.filter(i => params.classesFilter.split(',').includes(i.id))
            : DEFAULT_CLASSES_FILTER,
        updateURL: true,
    });
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);

    const handleSelect = classFilter => {
        if (classesFilter.map(i => i.id).includes(classFilter.id) && classesFilter.length === 1) {
            toast.dismiss();
            toast.info('At least one type should be selected');
        } else {
            setClassesFilter(prev =>
                prev.map(i => i.id).includes(classFilter.id) ? prev.filter(item => item.id !== classFilter.id) : [...prev, classFilter],
            );
        }
    };

    return (
        <>
            <Container className="d-md-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-md-grow-1 align-items-center">
                    <h1 className="h5 mb-0 me-2">Content</h1>
                    <>
                        <SubtitleSeparator />
                        <SubTitle>
                            <small className="text-muted text-small mt-1">
                                {totalElements === 0 && isLoading ? <Icon icon={faSpinner} spin /> : <>{`${totalElements} items`}</>}
                            </small>
                        </SubTitle>
                    </>
                </div>
                <div
                    className="d-md-flex mt-sm-2  me-md-2 rounded"
                    style={{ fontSize: '0.875rem', padding: '0.25rem 1.25rem', color: '#646464', backgroundColor: '#dcdee6' }}
                >
                    <div className="me-1"> Show:</div>
                    {DEFAULT_CLASSES_FILTER.map(({ id, label }) => (
                        <FormGroup check key={id} className="mb-0">
                            <Label check className="mb-0 ms-2" style={{ fontSize: '0.875rem' }}>
                                <Input
                                    onChange={() => handleSelect({ id, label })}
                                    checked={classesFilter.map(i => i.id).includes(id)}
                                    type="checkbox"
                                    disabled={isLoading}
                                />
                                {label}
                            </Label>
                        </FormGroup>
                    ))}
                </div>
                <div className="mt-sm-2">
                    <div className="mb-0">
                        <Input
                            value={sort}
                            onChange={e => setSort(e.target.value)}
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
                    </div>
                </div>
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
                        {!hasNextPage && isLastPageReached && page !== 1 && <div className="text-center m-2">You have reached the last page</div>}
                    </ListGroup>
                )}
                {items.length === 0 && !isLoading && (
                    <div className={boxShadow ? 'container box rounded' : ''}>
                        <div className="p-5 text-center mt-4 mb-4">
                            There are no {sort === 'featured' ? 'featured' : sort === 'unlisted' ? 'unlisted' : ''}{' '}
                            {classesFilter.map(c => c.label).join(', ')} for this observatory, yet
                            <br />
                            <br />
                        </div>
                    </div>
                )}
                {isLoading && (
                    <div className={`mt-4 mb-4 ${page === 0 ? 'p-5 container box rounded' : ''}`}>
                        {page !== 0 && (
                            <div className="text-center">
                                <Icon icon={faSpinner} spin /> Loading
                            </div>
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
    slug: PropTypes.string,
    boxShadow: PropTypes.bool,
};

IntegratedList.defaultProps = {
    boxShadow: false,
};

export default IntegratedList;
