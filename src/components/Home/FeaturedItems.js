import { useState } from 'react';
import { FormGroup, Label, Input, ListGroup, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { MISC } from 'constants/graphSettings';
import ContentLoader from 'react-content-loader';
import CardFactory from 'components/CardFactory/CardFactory';
import useResearchFieldContent from 'components/ResearchField/hooks/useResearchFieldContent';
import { stringifySort } from 'utils';
import { reverse } from 'named-urls';
import Tippy from '@tippyjs/react';

const ListGroupStyled = styled(ListGroup)`
    &&& .list-group-item {
        border-radius: 0;
        border-right-width: 0;
        border-left-width: 0;
    }
`;

const FeaturedItems = ({ researchFieldId, classID, label }) => {
    const { items, sort, includeSubFields, isLoading, setSort, setIncludeSubFields } = useResearchFieldContent({
        researchFieldId: researchFieldId,
        initialSort: 'combined',
        initialClassFilterOptions: [{ id: classID, label: label }],
        initClassesFilter: [{ id: classID, label: label }],
        initialIncludeSubFields: true
    });
    const [tippy, setTippy] = useState({});

    return (
        <div className="pt-2 pb-3">
            <div className="d-flex justify-content-end mb-2 me-2">
                <Tippy
                    interactive={true}
                    trigger="click"
                    placement="bottom-end"
                    onCreate={instance => setTippy(instance)}
                    content={
                        <div className="p-2">
                            <FormGroup>
                                <Label for={`sort${label}`}>Sort</Label>
                                <Input
                                    value={sort}
                                    onChange={e => {
                                        tippy.hide();
                                        setSort(e.target.value);
                                    }}
                                    bsSize="sm"
                                    type="select"
                                    name="sort"
                                    id={`sort${label}`}
                                    disabled={isLoading}
                                >
                                    <option value="combined">Top recent</option>
                                    <option value="newest">Recently added</option>
                                    <option value="featured">Featured</option>
                                </Input>
                            </FormGroup>
                            {researchFieldId !== MISC.RESEARCH_FIELD_MAIN && (
                                <FormGroup check>
                                    <Input
                                        onChange={e => {
                                            tippy.hide();
                                            setIncludeSubFields(e.target.checked);
                                        }}
                                        checked={includeSubFields}
                                        type="checkbox"
                                        id={`includeSubFields${label}`}
                                        style={{ marginTop: '0.1rem' }}
                                        disabled={isLoading}
                                    />
                                    <Label check for={`includeSubFields${label}`} className="mb-0">
                                        Include subfields
                                    </Label>
                                </FormGroup>
                            )}
                        </div>
                    }
                >
                    <span>
                        <Button color="light" className="flex-shrink-0 ps-3 pe-3" style={{ marginLeft: 'auto' }} size="sm">
                            {stringifySort(sort)} <Icon icon={faChevronDown} />
                        </Button>
                    </span>
                </Tippy>
            </div>
            {!isLoading &&
                (items.length > 0 ? (
                    <>
                        <ListGroupStyled>
                            {items.map(item => {
                                return (
                                    <CardFactory
                                        showBadge={false}
                                        showCurationFlags={false}
                                        showAddToComparison={false}
                                        key={`item${item.id}`}
                                        item={item}
                                    />
                                );
                            })}
                        </ListGroupStyled>

                        <div className="text-center mt-2">
                            <Button
                                tag={Link}
                                to={
                                    researchFieldId !== MISC.RESEARCH_FIELD_MAIN
                                        ? reverse(ROUTES.RESEARCH_FIELD, { researchFieldId: researchFieldId })
                                        : ROUTES.PAPERS
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
                        {sort === 'featured' ? `No featured ${label} found` : `There are no ${label} for this research field, yet.`}
                    </div>
                ))}
            {isLoading && (
                <div className="p-3 text-start">
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

FeaturedItems.propTypes = {
    researchFieldId: PropTypes.string.isRequired,
    classID: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
};

export default FeaturedItems;
