import { faChevronDown, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import PaperCard from 'components/Cards/PaperCard/PaperCard';
import Link from 'next/link';
import useResearchFieldPapers from 'components/ResearchField/hooks/useResearchFieldPapers';
import TitleBar from 'components/TitleBar/TitleBar';
import { SubTitle } from 'components/styled';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import ROUTES from 'constants/routes';
import PropTypes from 'prop-types';
import { forwardRef, useState } from 'react';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import { Button, Container, FormGroup, Input, Label, ListGroup } from 'reactstrap';
import { convertPaperToNewFormat, stringifySort } from 'utils';

const SortButton = forwardRef((props, ref) => (
    <Button innerRef={ref} color="secondary" className="ps-3 pe-3" size="sm">
        {stringifySort(props.sort)} <Icon icon={faChevronDown} />
    </Button>
));

SortButton.displayName = 'SortButton';

SortButton.propTypes = {
    sort: PropTypes.string.isRequired,
};

const Papers = ({ id, boxShadow = false, showBreadcrumbs = true }) => {
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
        setIncludeSubFields,
    } = useResearchFieldPapers({ researchFieldId: id, initialSort: 'combined', initialIncludeSubFields: true });
    const [tippy, setTippy] = useState({});

    const visibilityText =
        {
            [VISIBILITY_FILTERS.FEATURED]: 'featured',
            [VISIBILITY_FILTERS.UNLISTED]: 'unlisted',
        }[sort] || '';

    return (
        <>
            <TitleBar
                titleSize="h5"
                titleAddition={
                    <SubTitle className="mb-0">
                        <small className="text-muted mb-0 text-small">
                            {totalElements === 0 && isLoading ? <Icon icon={faSpinner} spin /> : <>{`${totalElements} papers`}</>}
                        </small>
                    </SubTitle>
                }
                buttonGroup={
                    <Tippy
                        interactive
                        trigger="click"
                        placement="bottom-end"
                        onCreate={(instance) => setTippy(instance)}
                        content={
                            <div className="p-2" style={{ width: '150px' }}>
                                <FormGroup>
                                    <Label for="sortPapers">Sort</Label>
                                    <Input
                                        value={sort}
                                        onChange={(e) => {
                                            tippy.hide();
                                            setSort(e.target.value);
                                        }}
                                        bsSize="sm"
                                        type="select"
                                        name="sort"
                                        id="sortPapers"
                                        disabled={isLoading}
                                    >
                                        <option value="combined">Top recent</option>
                                        <option value={VISIBILITY_FILTERS.ALL_LISTED}>Recently added</option>
                                        <option value={VISIBILITY_FILTERS.FEATURED}>Featured</option>
                                        <option value={VISIBILITY_FILTERS.UNLISTED}>Unlisted</option>
                                    </Input>
                                </FormGroup>
                                <FormGroup check>
                                    <Label check>
                                        <Input
                                            onChange={(e) => {
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
                        <SortButton sort={sort} />
                    </Tippy>
                }
            >
                Papers
            </TitleBar>
            <Container className="p-0">
                {papers.length > 0 && (
                    <ListGroup className={boxShadow ? 'box' : ''}>
                        {papers.map(
                            (paper) =>
                                paper && <PaperCard paper={convertPaperToNewFormat(paper)} showBreadcrumbs={showBreadcrumbs} key={`pc${paper.id}`} />,
                        )}
                        {!isLoading && hasNextPage && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center"
                                onClick={!isLoading ? handleLoadMore : undefined}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (!isLoading) {
                                            handleLoadMore();
                                        }
                                    }
                                }}
                                role="button"
                                tabIndex={0}
                            >
                                Load more papers
                            </div>
                        )}
                        {!hasNextPage && isLastPageReached && page !== 1 && <div className="text-center mt-3">You have reached the last page</div>}
                    </ListGroup>
                )}
                {papers.length === 0 && !isLoading && (
                    <div className={boxShadow ? 'container box rounded' : ''}>
                        <div className="p-5 text-center mt-4 mb-4">
                            There are no {visibilityText} papers for this research field, yet
                            <br />
                            <br />
                            <Link href={ROUTES.ADD_PAPER}>
                                <Button size="sm" color="primary " className="me-3">
                                    Add paper
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
                {isLoading && (
                    <div className={`text-center mt-4 mb-4 ${page === 0 ? 'p-5 container rounded' : ''} ${boxShadow && page === 0 ? 'box' : ''}`}>
                        {page !== 0 && (
                            <>
                                <Icon icon={faSpinner} spin /> Loading
                            </>
                        )}
                        {page === 0 && (
                            <div className="text-start">
                                <ContentLoader speed={2} width={400} height={50} viewBox="0 0 400 50" style={{ width: '100% !important' }}>
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
    boxShadow: PropTypes.bool,
    showBreadcrumbs: PropTypes.bool,
};

export default Papers;
