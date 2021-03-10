import { useState } from 'react';
import { FormGroup, Label, Input, ListGroup, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import useResearchFieldComparison from 'components/ResearchField/hooks/useResearchFieldComparison';
import ContentLoader from 'react-content-loader';
import { reverse } from 'named-urls';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { MISC } from 'constants/graphSettings';
import { SmallButton } from 'components/styled';
import Tippy from '@tippyjs/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const ListGroupStyled = styled(ListGroup)`
    &&& .list-group-item {
        border-radius: 0;
        border-right-width: 0;
        border-left-width: 0;
    }
`;

const FeaturedComparisons = ({ researchFieldId }) => {
    const { comparisons, sort, includeSubFields, isLoading, setSort, setIncludeSubFields } = useResearchFieldComparison({
        researchFieldId: researchFieldId,
        initialSort: 'featured',
        initialIncludeSubFields: true,
        pageSize: 10
    });
    const [tippy, setTippy] = useState({});

    return (
        <div className="pt-2 pb-3">
            <div className="mr-2 d-flex justify-content-end mb-2">
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
                                    {researchFieldId === MISC.RESEARCH_FIELD_MAIN && <option value="featured">Featured</option>}
                                </Input>
                            </FormGroup>
                            {researchFieldId !== MISC.RESEARCH_FIELD_MAIN && (
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
                            )}
                        </div>
                    }
                >
                    <span>
                        <SmallButton color="lightblue" className="flex-shrink-0 pl-3 pr-3" style={{ marginLeft: 'auto' }} size="sm">
                            View <Icon icon={faChevronDown} />
                        </SmallButton>
                    </span>
                </Tippy>
            </div>
            {!isLoading &&
                (comparisons.length > 0 ? (
                    <>
                        <ListGroupStyled>
                            {comparisons.map(comparison => {
                                return comparison && <ComparisonCard comparison={comparison} key={`pc${comparison.id}`} />;
                            })}
                        </ListGroupStyled>

                        <div className="text-center mt-2">
                            <Button
                                tag={Link}
                                to={
                                    researchFieldId !== MISC.RESEARCH_FIELD_MAIN
                                        ? reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: researchFieldId })
                                        : sort === 'featured'
                                        ? ROUTES.FEATURED_COMPARISONS
                                        : ROUTES.COMPARISONS
                                }
                                color="primary"
                                size="sm"
                                className="flex-shrink-0 mr-2"
                            >
                                View more
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        {sort === 'featured' ? 'No featured comparison found' : 'There are no published comparison for this research field, yet.'}
                    </div>
                ))}
            {isLoading && (
                <div className="p-3 text-left">
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
    );
};

FeaturedComparisons.propTypes = {
    researchFieldId: PropTypes.string.isRequired
};

export default FeaturedComparisons;
