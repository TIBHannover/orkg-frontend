import { useRef, useEffect } from 'react';
import Tippy from '@tippyjs/react';
import { CustomInput } from 'reactstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Select, { components } from 'react-select';
import { useSelector, useDispatch } from 'react-redux';
import { addToComparison, removeFromComparison } from 'actions/viewPaper';

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

const CustomInputStyled = styled(CustomInput)`
    &.custom-control {
        z-index: 0;
    }
`;

Option.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.string.isRequired
};

const AddToComparison = ({ contributionId, paper }) => {
    const dispatch = useDispatch();
    const inputCheckboxRef = useRef();
    const comparison = useSelector(state => state.viewPaper.comparison);
    const isSelected = useSelector(state => {
        if (!contributionId && paper.contributions.length === 0) {
            return false;
        }
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

    useEffect(() => {
        if (inputCheckboxRef.current && isSelected === 'half') {
            inputCheckboxRef.current.indeterminate = true;
        } else if (inputCheckboxRef.current) {
            inputCheckboxRef.current.indeterminate = false;
        }
    }, [isSelected]);

    if (!contributionId && paper.contributions.length === 0) {
        return null;
    }

    return (
        <Tippy
            theme={!contributionId && paper.contributions?.length > 1 ? 'visualizationPreview' : undefined}
            placement="bottom-start"
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
            <span>
                <CustomInputStyled
                    onChange={() =>
                        !contributionId && paper.contributions?.length > 1
                            ? toggleAllCompare()
                            : toggleCompare(contributionId || paper.contributions?.[0].id)
                    }
                    checked={!!isSelected}
                    type="checkbox"
                    innerRef={inputCheckboxRef}
                    id={`add2CPid${paper.id}cid${contributionId ?? ''}`}
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
