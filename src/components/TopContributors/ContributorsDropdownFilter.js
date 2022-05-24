import { useState } from 'react';
import { DropdownMenu, DropdownItem, FormGroup, Label, Input, UncontrolledButtonDropdown, DropdownToggle, Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { MISC } from 'constants/graphSettings';
import Tippy from '@tippyjs/react';
import { stringifySort } from 'utils';
import PropTypes from 'prop-types';

const ContributorsDropdownFilter = ({ sort, isLoading, includeSubFields, setSort, setIncludeSubFields, researchFieldId }) => {
    const [tippy, setTippy] = useState({});
    return (
        <>
            {researchFieldId === MISC.RESEARCH_FIELD_MAIN && (
                <UncontrolledButtonDropdown>
                    <DropdownToggle caret className="ps-3 pe-3" size="sm" color="light">
                        {stringifySort(sort)}
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem disabled={isLoading} onClick={() => setSort('top')}>
                            Last 30 days
                        </DropdownItem>
                        <DropdownItem disabled={isLoading} onClick={() => setSort('all')}>
                            All time
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            )}
            {researchFieldId !== MISC.RESEARCH_FIELD_MAIN && (
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
                                    <option value="top">Last 30 days</option>
                                    <option value="all">All time</option>
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
                        <Button color="light" className="flex-shrink-0 ps-3 pe-3" style={{ marginLeft: 'auto' }} size="sm">
                            {stringifySort(sort)} <Icon icon={faChevronDown} />
                        </Button>
                    </span>
                </Tippy>
            )}
        </>
    );
};

ContributorsDropdownFilter.propTypes = {
    sort: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
    includeSubFields: PropTypes.bool.isRequired,
    setSort: PropTypes.func.isRequired,
    researchFieldId: PropTypes.string,
    setIncludeSubFields: PropTypes.func.isRequired,
};

export default ContributorsDropdownFilter;
