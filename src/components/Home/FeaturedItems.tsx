import Link from 'next/link';
import { FormGroup, Label, Input, ListGroup, Button } from 'reactstrap';
import ROUTES from 'constants/routes';
import styled from 'styled-components';
import { CLASSES, RESOURCES } from 'constants/graphSettings';
import ContentLoader from 'components/ContentLoader/ContentLoader';
import CardFactory from 'components/Cards/CardFactory/CardFactory';
import useResearchFieldContent from 'components/ResearchField/hooks/useResearchFieldContent';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { reverseWithSlug } from 'utils';
import { FC } from 'react';

const ListGroupStyled = styled(ListGroup)`
    &&& .list-group-item {
        border-radius: 0;
        border-right-width: 0;
        border-left-width: 0;
    }
`;

type FeaturedItemsProps = {
    researchFieldId: string;
    researchFieldLabel: string;
    classId: string;
    classLabel: string;
};

const FeaturedItems: FC<FeaturedItemsProps> = ({ researchFieldId, researchFieldLabel, classId, classLabel }) => {
    const { items, sort, includeSubFields, isLoading, setSort, setIncludeSubFields } = useResearchFieldContent({
        researchFieldId,
        initialSort: 'combined',
        initialClassFilterOptions: [{ id: classId, label: classId }],
        initClassesFilter: [{ id: classId, label: classId }],
        initialIncludeSubFields: true,
    });

    const contentTypeLink = {
        [CLASSES.COMPARISON]: ROUTES.COMPARISONS,
        [CLASSES.PAPER]: ROUTES.PAPERS,
        [CLASSES.VISUALIZATION]: ROUTES.VISUALIZATIONS,
        [CLASSES.SMART_REVIEW_PUBLISHED]: ROUTES.REVIEWS,
        [CLASSES.LITERATURE_LIST_PUBLISHED]: ROUTES.LISTS,
    }[classId];

    return (
        <div className="pt-2 pb-3">
            <div className="d-flex justify-content-end mb-2 me-2">
                {researchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && (
                    <div className="d-flex me-2 rounded" style={{ fontSize: '0.875rem', padding: '0.25rem 1.25rem' }}>
                        <FormGroup check className="mb-0">
                            <Label check className="mb-0">
                                <Input
                                    onChange={(e) => setIncludeSubFields(e.target.checked)}
                                    checked={includeSubFields}
                                    type="checkbox"
                                    disabled={isLoading}
                                />
                                Include subfields
                            </Label>
                        </FormGroup>
                    </div>
                )}
                <div>
                    <div className="mb-0">
                        <Input
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                            bsSize="sm"
                            type="select"
                            name="sort"
                            id={`sort${classId}`}
                            disabled={isLoading}
                        >
                            <option value="combined">Top recent</option>
                            <option value={VISIBILITY_FILTERS.ALL_LISTED}>Recently added</option>
                            <option value={VISIBILITY_FILTERS.FEATURED}>Featured</option>
                        </Input>
                    </div>
                </div>
            </div>
            {!isLoading &&
                (items.length > 0 ? (
                    <>
                        <ListGroupStyled>
                            {items.map((item) => (
                                <CardFactory
                                    showBadge={false}
                                    showCurationFlags={false}
                                    showAddToComparison={false}
                                    key={`item${item.id}`}
                                    item={item}
                                />
                            ))}
                        </ListGroupStyled>

                        <div className="text-center mt-2">
                            <Button
                                tag={Link}
                                href={
                                    researchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN
                                        ? `${reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                              researchFieldId,
                                              slug: researchFieldLabel,
                                          })}?sort=${sort}&includeSubFields=${includeSubFields}&classesFilter=${classId}`
                                        : contentTypeLink
                                }
                                color="primary"
                                size="sm"
                                className="flex-shrink-0 me-2"
                            >
                                View more
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center mt-4 mb-4">
                        {sort === 'featured' ? `No featured ${classLabel} found` : `There are no ${classLabel} for this research field, yet`}
                    </div>
                ))}
            {isLoading && (
                <div className="p-3 text-start">
                    <ContentLoader speed={2} width={100} height={50} viewBox="0 0 100 50" style={{ width: '100% !important' }}>
                        <rect x="0" y="0" rx="3" ry="3" width="100" height="20" />
                        <rect x="0" y="25" rx="3" ry="3" width="80" height="20" />
                    </ContentLoader>
                </div>
            )}
        </div>
    );
};

export default FeaturedItems;
