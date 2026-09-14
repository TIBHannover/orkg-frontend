import { faCheck, faEye, faEyeSlash, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Popover, Switch, Tooltip } from '@heroui/react';
import { range } from 'lodash';
import { FC, useState } from 'react';

import ActionButton from '@/components/ActionButton/ActionButton';
import PredicateView from '@/components/DataBrowser/components/Body/PredicateView/PredicateView';
import HierarchyIndicator from '@/components/DataBrowser/components/Body/Statement/HierarchyIndicator';
import { useDataBrowserState } from '@/components/DataBrowser/context/DataBrowserContext';
import useCanEdit from '@/components/DataBrowser/hooks/useCanEdit';
import useHistory from '@/components/DataBrowser/hooks/useHistory';
import { StatementWrapperStyled } from '@/components/DataBrowser/styles/styled';
import { Statement } from '@/services/backend/types';

type TriplePredicateProps = {
    level: number;
    statement: Statement;
    deleteStatement: () => void;
    isHidden?: boolean;
};

const TriplePredicate: FC<TriplePredicateProps> = ({ level, statement, deleteStatement, isHidden }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isVisibilityPopoverOpen, setIsVisibilityPopoverOpen] = useState(false);
    const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
    const { config } = useDataBrowserState();
    const { isEditMode, onToggleComparisonPropertyVisibility, comparisonSelectedPaths } = config;
    const { history } = useHistory();

    const { canEdit } = useCanEdit();

    // Inline-expanded sub-levels aren't part of the browser history, so their predicate path
    // can't be derived here — only top-level rows expose the toggle. Gated on edit mode:
    // toggling persists to the comparison, so read-only viewers must not get the control.
    // Hidden rows without the toggle still get a non-interactive eye-slash indicator below.
    const showVisibilityToggle = isEditMode && comparisonSelectedPaths !== undefined && onToggleComparisonPropertyVisibility && level === 0;

    const handleToggleVisibility = async (show: boolean) => {
        if (!onToggleComparisonPropertyVisibility) {
            return;
        }
        // history alternates entity/predicate starting at the comparison source ([sourceId, predicateId, entityId, ...]);
        // odd-index elements + the current predicate form the predicate path from that source
        const predicatePath = [...history.filter((_, idx) => idx % 2 !== 0), statement.predicate.id];
        setIsTogglingVisibility(true);
        try {
            await onToggleComparisonPropertyVisibility(predicatePath, show);
            // Rows are ordered by selected_paths, so this row moves once they refetch — close the
            // popover instead of leaving it anchored where the button used to be.
            setIsVisibilityPopoverOpen(false);
        } catch {
            // errorHandler already toasted
        } finally {
            setIsTogglingVisibility(false);
        }
    };

    return (
        <>
            {level > 0 && <HierarchyIndicator path={range(level).map((c) => c.toString())} side="left" />}
            <StatementWrapperStyled className="px-2 py-1 flex items-center grow">
                {showVisibilityToggle && (
                    <div className="mr-2">
                        <Popover isOpen={isVisibilityPopoverOpen} onOpenChange={setIsVisibilityPopoverOpen}>
                            <Button
                                isIconOnly
                                variant="ghost"
                                size="sm"
                                className="min-w-6 h-6 w-6 p-0"
                                aria-label={
                                    isHidden ? 'Property hidden in comparison, click to change' : 'Property displayed in comparison, click to change'
                                }
                            >
                                <FontAwesomeIcon icon={isHidden ? faEyeSlash : faEye} />
                            </Button>
                            <Popover.Content placement="top">
                                <Popover.Dialog>
                                    <Popover.Arrow />
                                    <div className="flex flex-col gap-2 p-1 max-w-80">
                                        <Switch
                                            isSelected={!isHidden}
                                            isDisabled={isTogglingVisibility}
                                            onChange={handleToggleVisibility}
                                            className="flex items-center gap-3"
                                        >
                                            <Switch.Content>
                                                <Switch.Control>
                                                    <Switch.Thumb />
                                                </Switch.Control>
                                                <span className="text-sm font-medium">Display property inside the comparison</span>
                                            </Switch.Content>
                                        </Switch>
                                    </div>
                                </Popover.Dialog>
                            </Popover.Content>
                        </Popover>
                    </div>
                )}
                {!showVisibilityToggle && isHidden && (
                    <div className="mr-2">
                        <Tooltip delay={0}>
                            <Tooltip.Trigger>
                                <FontAwesomeIcon icon={faEyeSlash} className="text-muted cursor-help" aria-label="Property hidden in comparison" />
                            </Tooltip.Trigger>
                            <Tooltip.Content showArrow className="max-w-[300px]">
                                <Tooltip.Arrow />
                                This property is not displayed inside the comparison. To show this property, edit the comparison and click on
                                &apos;Manage properties&apos;.
                            </Tooltip.Content>
                        </Tooltip>
                    </div>
                )}
                <PredicateView predicate={statement.predicate} />{' '}
                {canEdit && isEditMode && (
                    <span className={`ml-1 ${!isFocused && 'actionButtons'}`}>
                        <ActionButton
                            open={isFocused}
                            setOpen={setIsFocused}
                            title="Delete statement"
                            icon={faTrash}
                            requireConfirmation
                            confirmationMessage="Are you sure?"
                            confirmationButtons={[
                                {
                                    title: 'Delete',
                                    color: 'danger',
                                    icon: faCheck,
                                    action: deleteStatement,
                                },
                                {
                                    title: 'Cancel',
                                    color: 'secondary',
                                    icon: faTimes,
                                },
                            ]}
                        />
                    </span>
                )}
            </StatementWrapperStyled>
        </>
    );
};

export default TriplePredicate;
