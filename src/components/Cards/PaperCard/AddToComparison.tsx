import { FC, useEffect, useRef } from 'react';
import Select, { ActionMeta, components, MultiValue, OptionProps } from 'react-select';
import styled from 'styled-components';

import { SelectGlobalStyle } from '@/components/Autocomplete/styled';
import useComparisonPopup, { ContributionData } from '@/components/ComparisonPopup/useComparisonPopup';
import Tooltip from '@/components/FloatingUI/Tooltip';
import FormGroup from '@/components/Ui/Form/FormGroup';
import Input from '@/components/Ui/Input/Input';
import Label from '@/components/Ui/Label/Label';

type Contribution = {
    id: string;
    label: string;
};

type Paper = {
    id: string;
    label?: string;
    title?: string;
    contributions: Contribution[];
};

type AddToComparisonProps = {
    contributionId?: string;
    paper: Paper;
    showLabel?: boolean;
};

type SelectOption = {
    label: string;
    value: string;
};

type SelectionState = boolean | 'half';

// Helper functions
const getSelectionState = (contributionId: string | undefined, contributions: Contribution[], comparisonIds: string[] = []): SelectionState => {
    if (!contributionId && contributions.length === 0) {
        return false;
    }

    if (!contributionId && contributions.length > 1) {
        const selectedCount = contributions.filter((c) => comparisonIds.includes(c.id)).length;
        if (selectedCount === contributions.length) {
            return true;
        }
        if (selectedCount > 0) {
            return 'half';
        }
        return false;
    }

    const targetId = contributionId || contributions[0]?.id;
    return targetId ? comparisonIds.includes(targetId) : false;
};

const createContributionData = (paper: Paper, contributionId: string): ContributionData => ({
    paperId: paper.id,
    paperTitle: paper.label || paper.title || '',
    contributionTitle: paper.contributions.find((c) => c.id === contributionId)?.label ?? '',
});

const Option: FC<OptionProps<SelectOption>> = ({ children, data, ...props }) => (
    <components.Option {...props} data={data}>
        <div>{children}</div>
        <div>
            <small>{data.value}</small>
        </div>
    </components.Option>
);

const CustomInputStyled = styled(Input)`
    &.custom-control {
        z-index: 0;
    }
`;

const SelectStyled = styled(Select<SelectOption, true>)`
    width: 300px;
    color: ${(props) => props.theme.bodyColor};
`;

const AddToComparison: FC<AddToComparisonProps> = ({ contributionId, paper, showLabel = false }) => {
    const inputCheckboxRef = useRef<HTMLInputElement>(null);
    const { comparison, updateComparison } = useComparisonPopup();

    const isSelected = getSelectionState(contributionId, paper.contributions, comparison.allIds);
    const hasMultipleContributions = !contributionId && paper.contributions.length > 1;

    const options: SelectOption[] = paper.contributions?.map((contribution) => ({
        label: contribution.label,
        value: contribution.id,
    }));

    const toggleContribution = (cId: string) => {
        updateComparison((current) => {
            const isInComparison = current.allIds.includes(cId);

            if (isInComparison) {
                // Remove from comparison
                const { [cId]: removed, ...remainingById } = current.byId;
                return {
                    byId: remainingById,
                    allIds: current.allIds.filter((id) => id !== cId),
                };
            }

            // Add to comparison
            return {
                byId: {
                    ...current.byId,
                    [cId]: createContributionData(paper, cId),
                },
                allIds: [...current.allIds, cId],
            };
        });
    };

    const toggleMultipleContributions = (contributionIds: string[]) => {
        updateComparison((current) => {
            const idsToRemove = contributionIds.filter((cId) => current.allIds.includes(cId));
            const idsToAdd = contributionIds.filter((cId) => !current.allIds.includes(cId));

            // Remove contributions
            const newById = { ...current.byId };
            idsToRemove.forEach((cId) => {
                delete newById[cId];
            });

            // Add new contributions
            idsToAdd.forEach((cId) => {
                newById[cId] = createContributionData(paper, cId);
            });

            const newAllIds = current.allIds.filter((id) => !idsToRemove.includes(id)).concat(idsToAdd);

            return {
                byId: newById,
                allIds: newAllIds,
            };
        });
    };

    const handleCheckboxChange = () => {
        if (hasMultipleContributions) {
            // Toggle all or remove partially selected
            const contributionsToToggle =
                isSelected === 'half' ? paper.contributions.filter((c) => comparison.allIds.includes(c.id)) : paper.contributions;

            toggleMultipleContributions(contributionsToToggle.map((c) => c.id));
        } else {
            toggleContribution(contributionId || paper.contributions[0].id);
        }
    };

    const handleSelectChange = (selected: MultiValue<SelectOption>, actionMeta: ActionMeta<SelectOption>) => {
        const { action, option, removedValue } = actionMeta;

        if (option) {
            toggleContribution((option as SelectOption).value);
        } else if (removedValue) {
            toggleContribution((removedValue as SelectOption).value);
        } else if (action === 'clear') {
            // Remove all selected contributions
            const contributionIdsToRemove = options.filter((o) => comparison.allIds.includes(o.value)).map((o) => o.value);
            toggleMultipleContributions(contributionIdsToRemove);
        }
    };

    useEffect(() => {
        if (inputCheckboxRef.current) {
            inputCheckboxRef.current.indeterminate = isSelected === 'half';
        }
    }, [isSelected]);

    if (!contributionId && paper.contributions.length === 0) {
        return null;
    }

    const checkboxId = `add2CPid${paper.id}cid${contributionId ?? ''}`;
    const simpleTooltipText = isSelected ? 'Remove from comparison' : 'Add to comparison';

    const tooltipContent = hasMultipleContributions ? (
        <>
            <SelectGlobalStyle />
            <SelectStyled
                value={options.filter((o) => comparison.allIds.includes(o.value))}
                onChange={handleSelectChange}
                options={options}
                components={{ Option }}
                openMenuOnFocus
                isMulti
                placeholder="Select contribution to compare"
                classNamePrefix="react-select"
            />
        </>
    ) : (
        simpleTooltipText
    );

    return (
        <Tooltip placement="bottom-start" content={tooltipContent}>
            <span>
                <FormGroup check>
                    <CustomInputStyled
                        onChange={handleCheckboxChange}
                        checked={!!isSelected}
                        type="checkbox"
                        innerRef={inputCheckboxRef}
                        id={checkboxId}
                    />
                    {showLabel && (
                        <Label check for={checkboxId} className="mb-0">
                            Add to comparison
                        </Label>
                    )}
                </FormGroup>
            </span>
        </Tooltip>
    );
};

export default AddToComparison;
