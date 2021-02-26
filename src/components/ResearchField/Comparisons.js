import { useState } from 'react';
import { Container, ListGroup, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import ComparisonCard from 'components/ComparisonCard/ComparisonCard';
import useResearchFieldComparison from 'components/ResearchField/hooks/useResearchFieldComparison';
import { SmallButton } from 'components/styled';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';

const Comparisons = ({ id }) => {
    const [comparisons, isLoadingComparisons, hasNextPageComparison, isLastPageReachedComparison, loadMoreComparisons] = useResearchFieldComparison({
        researchFieldId: id
    });
    const [tippy, setTippy] = useState({});
    const [sort, setSort] = useState('newest');
    const [includeSubFields, setIncludeSubFields] = useState(true);

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <h1 className="h4 flex-grow-1">Comparisons</h1>
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
                {comparisons.length > 0 && (
                    <ListGroup className="box">
                        {comparisons.map(comparison => {
                            return comparison && <ComparisonCard comparison={{ ...comparison }} key={`pc${comparison.id}`} />;
                        })}
                        {!isLoadingComparisons && hasNextPageComparison && (
                            <div
                                style={{ cursor: 'pointer' }}
                                className="list-group-item list-group-item-action text-center mt-2"
                                onClick={!isLoadingComparisons ? loadMoreComparisons : undefined}
                                onKeyDown={e => (e.keyCode === 13 ? (!isLoadingComparisons ? loadMoreComparisons : undefined) : undefined)}
                                role="button"
                                tabIndex={0}
                            >
                                Load more comparisons
                            </div>
                        )}
                        {!hasNextPageComparison && isLastPageReachedComparison && (
                            <div className="text-center mt-3">You have reached the last page.</div>
                        )}
                    </ListGroup>
                )}
                {comparisons.length === 0 && !isLoadingComparisons && (
                    <div className="box rounded-lg p-5 text-center mt-4 mb-4">
                        There are no published comparisons for this research field, yet.
                        <br />
                    </div>
                )}
                {isLoadingComparisons && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </Container>
        </>
    );
};

Comparisons.propTypes = {
    id: PropTypes.string.isRequired
};

export default Comparisons;
