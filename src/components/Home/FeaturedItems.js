import { FormGroup, Label, Input, ListGroup, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { RESOURCES } from 'constants/graphSettings';
import ContentLoader from 'react-content-loader';
import CardFactory from 'components/Cards/CardFactory/CardFactory';
import useResearchFieldContent from 'components/ResearchField/hooks/useResearchFieldContent';
import { VISIBILITY_FILTERS } from 'constants/contentTypes';
import { reverseWithSlug } from 'utils';

const ListGroupStyled = styled(ListGroup)`
    &&& .list-group-item {
        border-radius: 0;
        border-right-width: 0;
        border-left-width: 0;
    }
`;

const FeaturedItems = ({ researchFieldId, researchFieldLabel, featuredClass }) => {
    const { items, sort, includeSubFields, isLoading, setSort, setIncludeSubFields } = useResearchFieldContent({
        researchFieldId,
        initialSort: 'combined',
        initialClassFilterOptions: [{ id: featuredClass.id, label: featuredClass.label }],
        initClassesFilter: [{ id: featuredClass.id, label: featuredClass.label }],
        initialIncludeSubFields: true,
    });

    return (
        <div className="pt-2 pb-3">
            <div className="d-flex justify-content-end mb-2 me-2">
                {researchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && (
                    <div className="d-flex me-2 rounded" style={{ fontSize: '0.875rem', padding: '0.25rem 1.25rem' }}>
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
                )}
                <div>
                    <div className="mb-0">
                        <Input
                            value={sort}
                            onChange={e => setSort(e.target.value)}
                            bsSize="sm"
                            type="select"
                            name="sort"
                            id={`sort${featuredClass.label}`}
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
                            {items.map(item => (
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
                                to={
                                    researchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN
                                        ? `${reverseWithSlug(ROUTES.RESEARCH_FIELD, {
                                              researchFieldId,
                                              slug: researchFieldLabel,
                                          })}?sort=${sort}&includeSubFields=${includeSubFields}&classesFilter=${featuredClass.id}`
                                        : featuredClass.link
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
                        {sort === 'featured'
                            ? `No featured ${featuredClass.label.toLowerCase()} found`
                            : `There are no ${featuredClass.label.toLowerCase()} for this research field, yet`}
                    </div>
                ))}
            {isLoading && (
                <div className="p-3 text-start">
                    <ContentLoader
                        speed={2}
                        width={100}
                        height={50}
                        viewBox="0 0 100 50"
                        style={{ width: '100% !important' }}
                        backgroundColor="#f3f3f3"
                        foregroundColor="#ecebeb"
                    >
                        <rect x="0" y="0" rx="3" ry="3" width="100" height="20" />
                        <rect x="0" y="25" rx="3" ry="3" width="80" height="20" />
                    </ContentLoader>
                </div>
            )}
        </div>
    );
};

FeaturedItems.propTypes = {
    researchFieldId: PropTypes.string.isRequired,
    researchFieldLabel: PropTypes.string,
    featuredClass: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string,
        link: PropTypes.string,
    }).isRequired,
};

export default FeaturedItems;
