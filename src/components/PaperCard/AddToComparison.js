import { useState, useContext } from 'react';
import { faCheckSquare, faMinusSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { ThemeContext } from 'styled-components';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Select, { components } from 'react-select';
import { useSelector, useDispatch } from 'react-redux';
import { addToComparison, removeFromComparison } from 'actions/viewPaper';

const StyledIcon = styled(Icon)`
    cursor: pointer;
`;

const Option = ({ children, data, ...props }) => {
    return (
        <components.Option {...props}>
            <div>{children}</div>
            <div>
                <small>{data.value}</small>
            </div>
        </components.Option>
    );
};

Option.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired
};

const AddToComparison = ({ contributionId, paper }) => {
    const [over, setOver] = useState(false);
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();
    const comparison = useSelector(state => state.viewPaper.comparison);
    const isSelected = useSelector(state => {
        if (!contributionId && paper.contributions?.length > 1) {
            return paper.contributions.every(c => comparison.allIds?.includes(c.id))
                ? true
                : paper.contributions.some(c => comparison.allIds?.includes(c.id))
                ? 'half' // for papers with multiple contributions
                : false;
        }
        return contributionId ? comparison.allIds.includes(contributionId) : comparison.allIds.includes(paper.contributions?.[0].id);
    });

    const options = paper.contributions?.map((contribution, index) => ({
        label: contribution.label,
        value: contribution.id
    }));

    const toggleCompare = cId => {
        if (comparison.allIds.includes(cId)) {
            dispatch(removeFromComparison(cId));
        } else {
            dispatch(
                addToComparison({
                    contributionId: cId,
                    contributionData: {
                        paperId: paper.id,
                        paperTitle: paper.label,
                        contributionTitle: paper.contributions.find(c => c.id === cId)?.label ?? ''
                    }
                })
            );
        }
    };

    const toggleAllCompare = () => {
        if (!isSelected || isSelected !== 'half') {
            paper.contributions.forEach(c => {
                toggleCompare(c.id);
            });
        } else {
            paper.contributions
                .filter(s => comparison.allIds.includes(s.id))
                .forEach(c => {
                    toggleCompare(c.id);
                });
        }
    };
    return (
        <Tippy
            theme={!contributionId && paper.contributions?.length > 1 ? 'visualizationPreview' : undefined}
            placement="bottom"
            interactiveDebounce={75}
            interactive={!contributionId && paper.contributions?.length > 1 ? true : false}
            content={
                !contributionId && paper.contributions?.length > 1 ? (
                    <div style={{ width: '300px' }}>
                        <Select
                            value={options.filter(o => comparison.allIds.includes(o.value))}
                            onChange={(selected, { action, option, removedValue }) => {
                                if (option) {
                                    toggleCompare(option.value);
                                } else if (removedValue) {
                                    toggleCompare(removedValue.value);
                                } else if (action === 'clear') {
                                    // Deleted all contributions from comparison
                                    options
                                        .filter(o => comparison.allIds.includes(o.value))
                                        .forEach(s => {
                                            toggleCompare(s.value);
                                        });
                                }
                            }}
                            options={options}
                            components={{ Option }}
                            openMenuOnFocus
                            isMulti={true}
                            placeholder="Select contribution to compare"
                            classNamePrefix="react-select"
                        />
                    </div>
                ) : isSelected ? (
                    'Remove from comparison'
                ) : (
                    `Add to comparison`
                )
            }
        >
            <span
                role="checkbox"
                tabIndex="0"
                aria-checked={isSelected}
                onClick={() =>
                    !contributionId && paper.contributions?.length > 1
                        ? toggleAllCompare()
                        : toggleCompare(contributionId || paper.contributions?.[0].id)
                }
                onKeyDown={() =>
                    !contributionId && paper.contributions?.length > 1
                        ? toggleAllCompare()
                        : toggleCompare(contributionId || paper.contributions?.[0].id)
                }
            >
                <StyledIcon
                    onMouseOver={() => setOver(true)}
                    onMouseLeave={() => setOver(false)}
                    size="sm"
                    icon={isSelected || over ? (isSelected === 'half' ? faMinusSquare : faCheckSquare) : faSquare}
                    color={isSelected || over ? themeContext.primary : themeContext.secondary}
                />
            </span>
        </Tippy>
    );
};

AddToComparison.propTypes = {
    contributionId: PropTypes.string,
    paper: PropTypes.object.isRequired
};

export default AddToComparison;
