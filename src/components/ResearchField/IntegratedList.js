import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import CardFactory from 'components/Cards/CardFactory/CardFactory';
import useSearchParams from 'components/NextJsMigration/useSearchParams';
import useResearchFieldContent from 'components/ResearchField/hooks/useResearchFieldContent';
import { SubTitle, SubtitleSeparator } from 'components/styled';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { CLASSES } from 'constants/graphSettings';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import ContentLoader from 'react-content-loader';
import { toast } from 'react-toastify';
import { Container, FormGroup, Input, Label, ListGroup } from 'reactstrap';

const DEFAULT_CLASSES_FILTER = [
    { id: CLASSES.PAPER, label: 'Paper' },
    { id: CLASSES.COMPARISON, label: 'Comparison' },
    { id: CLASSES.VISUALIZATION, label: 'Visualization' },
    /*
    { id: CLASSES.SMART_REVIEW_PUBLISHED, label: 'Review' },
    { id: CLASSES.LITERATURE_LIST_PUBLISHED, label: 'List' }
    */
];

const IntegratedList = ({ id, slug, boxShadow }) => {
    const searchParams = useSearchParams();

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
        setIncludeSubFields,
    } = useResearchFieldContent({
        researchFieldId: id,
        slug,
        initialSort: searchParams.get('sort') ?? 'combined',
        initialClassFilterOptions: DEFAULT_CLASSES_FILTER,
        initClassesFilter: searchParams.get('classesFilter')
            ? DEFAULT_CLASSES_FILTER.filter(i => searchParams.get('classesFilter')?.split(',').includes(i.id))
            : DEFAULT_CLASSES_FILTER,
        initialIncludeSubFields: searchParams.get('classesFilter') ? Boolean(searchParams.get('includeSubFields') === 'true') : true,
        updateURL: true,
    });

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

    const visibilityText =
        {
            [VISIBILITY_FILTERS.FEATURED]: 'featured',
            [VISIBILITY_FILTERS.UNLISTED]: 'unlisted',
        }[sort] || '';

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
                    {DEFAULT_CLASSES_FILTER.map(({ id: _id, label }) => (
                        <FormGroup check key={_id} className="mb-0">
                            <Label check className="mb-0 ms-2" style={{ fontSize: '0.875rem' }}>
                                <Input
                                    onChange={() => handleSelect({ id: _id, label })}
                                    checked={classesFilter.map(i => i.id).includes(_id)}
                                    type="checkbox"
                                    disabled={isLoading}
                                />
                                {label}
                            </Label>
                        </FormGroup>
                    ))}
                </div>
                <div
                    className="d-flex mt-sm-2 me-md-2 rounded"
                    style={{ fontSize: '0.875rem', padding: '0.25rem 1.25rem', color: '#646464', backgroundColor: '#dcdee6' }}
                >
                    <FormGroup check className="mb-0">
                        <Label check className="mb-0">
                            <Input
                                onChange={e => setIncludeSubFields(e.target.checked)}
                                checked={includeSubFields}
                                type="checkbox"
                                disabled={isLoading}
                            />
                            Include subfields
                        </Label>
                    </FormGroup>
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
                            <option value={VISIBILITY_FILTERS.ALL_LISTED}>Recently added</option>
                            <option value={VISIBILITY_FILTERS.FEATURED}>Featured</option>
                            <option value={VISIBILITY_FILTERS.UNLISTED}>Unlisted</option>
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
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        if (!isLoading) {
                                            handleLoadMore();
                                        }
                                    }
                                }}
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
                            There are no {visibilityText} {classesFilter.map(c => c.label).join(', ')} for this research field, yet
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
