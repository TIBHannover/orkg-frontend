import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { UncontrolledButtonDropdown } from 'reactstrap';

import Popover from '@/components/FloatingUI/Popover';
import Button from '@/components/Ui/Button/Button';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';
import { RESOURCES } from '@/constants/graphSettings';
import { stringifySort } from '@/utils';

const ContributorsDropdownFilter = ({
    sort,
    isLoading,
    includeSubFields,
    setSort,
    setIncludeSubFields,
    researchFieldId = RESOURCES.RESEARCH_FIELD_MAIN,
}) => {
    const [isOpenPopover, setIsOpenPopover] = useState(false);
    return (
        <>
            {researchFieldId === RESOURCES.RESEARCH_FIELD_MAIN && (
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
            {researchFieldId !== RESOURCES.RESEARCH_FIELD_MAIN && (
                <Popover
                    placement="bottom-end"
                    content={
                        <div className="p-2">
                            <FormGroup>
                                <Label for="sortPapers">Sort</Label>
                                <Input
                                    value={sort}
                                    onChange={(e) => {
                                        setIsOpenPopover(false);
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
                                        onChange={(e) => {
                                            setIsOpenPopover(false);
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
                    open={isOpenPopover}
                    onOpenChange={setIsOpenPopover}
                >
                    <span>
                        <Button
                            onClick={() => setIsOpenPopover((v) => !v)}
                            color="light"
                            className="flex-shrink-0 ps-3 pe-3"
                            style={{ marginLeft: 'auto' }}
                            size="sm"
                        >
                            {stringifySort(sort)} <FontAwesomeIcon icon={faChevronDown} />
                        </Button>
                    </span>
                </Popover>
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
