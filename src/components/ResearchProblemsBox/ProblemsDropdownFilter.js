import { useState } from 'react';
import { Button, FormGroup, Label, Input } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import { stringifySort } from 'utils';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const ProblemsDropdownFilter = ({ sort, isLoading, includeSubFields, setSort, setIncludeSubFields }) => {
    const [tippy, setTippy] = useState({});
    const isCurationAllowed = useSelector(state => state.auth.user?.isCurationAllowed);
    return (
        <>
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
                                <option value="combined">Top recent</option>
                                <option value="newest">Recently added</option>
                                <option value="featured">Featured</option>
                                {isCurationAllowed && <option value="unlisted">Unlisted</option>}
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
                    <Button color="light" className="flex-shrink-0 pl-3 pr-3" style={{ marginLeft: 'auto' }} size="sm">
                        {stringifySort(sort)} <Icon icon={faChevronDown} />
                    </Button>
                </span>
            </Tippy>
        </>
    );
};

ProblemsDropdownFilter.propTypes = {
    sort: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
    includeSubFields: PropTypes.bool.isRequired,
    setSort: PropTypes.func.isRequired,
    setIncludeSubFields: PropTypes.func.isRequired
};

export default ProblemsDropdownFilter;
