import { Checkbox, ListBox, Popover, Tooltip } from '@heroui/react';
import { FC } from 'react';
import type { Selection } from 'react-aria-components';

import useComparisonPopup, { ContributionData } from '@/components/ComparisonPopup/useComparisonPopup';

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

const AddToComparison: FC<AddToComparisonProps> = ({ contributionId, paper, showLabel = false }) => {
    const { comparison, updateComparison } = useComparisonPopup();

    const isSelected = getSelectionState(contributionId, paper.contributions, comparison.allIds);
    const hasMultipleContributions = !contributionId && paper.contributions.length > 1;

    const toggleContribution = (cId: string) => {
        updateComparison((current) => {
            const isInComparison = current.allIds.includes(cId);

            if (isInComparison) {
                // Remove from comparison
                const { [cId]: _removed, ...remainingById } = current.byId;
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

    const handleSelectionChange = (keys: Selection) => {
        if (keys === 'all') return;

        const newSelectedIds = [...keys] as string[];
        const currentSelectedIds = paper.contributions.filter((c) => comparison.allIds.includes(c.id)).map((c) => c.id);

        const added = newSelectedIds.filter((id) => !currentSelectedIds.includes(id));
        const removed = currentSelectedIds.filter((id) => !newSelectedIds.includes(id));

        if (added.length > 0) {
            added.forEach((id) => toggleContribution(id));
        }
        if (removed.length > 0) {
            removed.forEach((id) => toggleContribution(id));
        }
    };

    if (!contributionId && paper.contributions.length === 0) {
        return null;
    }

    const simpleTooltipText = isSelected ? 'Remove from comparison' : 'Add to comparison';

    const selectedKeys = new Set(paper.contributions.filter((c) => comparison.allIds.includes(c.id)).map((c) => c.id));

    const checkbox = (
        <Checkbox aria-label="Add to comparison" isSelected={!!isSelected} isIndeterminate={isSelected === 'half'} onChange={handleCheckboxChange}>
            <Checkbox.Content>
                <Checkbox.Control>
                    <Checkbox.Indicator />
                </Checkbox.Control>
                {showLabel && 'Add to comparison'}
            </Checkbox.Content>
        </Checkbox>
    );

    if (hasMultipleContributions) {
        return (
            <Popover>
                <span>{checkbox}</span>
                <Popover.Content placement="bottom start">
                    <Popover.Dialog className="p-2">
                        <ListBox
                            aria-label="Select contributions to compare"
                            selectionMode="multiple"
                            selectedKeys={selectedKeys}
                            onSelectionChange={handleSelectionChange}
                            className="w-[300px]"
                        >
                            {paper.contributions.map((contribution) => (
                                <ListBox.Item key={contribution.id} id={contribution.id} textValue={contribution.label}>
                                    <div>{contribution.label}</div>
                                    <div>
                                        <small>{contribution.id}</small>
                                    </div>
                                    <ListBox.Item.Indicator />
                                </ListBox.Item>
                            ))}
                        </ListBox>
                    </Popover.Dialog>
                </Popover.Content>
            </Popover>
        );
    }

    return (
        <Tooltip>
            <Tooltip.Trigger className="inline-flex">{checkbox}</Tooltip.Trigger>
            <Tooltip.Content>{simpleTooltipText}</Tooltip.Content>
        </Tooltip>
    );
};

export default AddToComparison;
