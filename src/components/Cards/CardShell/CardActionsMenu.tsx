'use client';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, cn, Dropdown, Label } from '@heroui/react';
import { FC } from 'react';

export type CardAction = {
    /** Stable identifier of the entry, also used as the React key */
    key: string;
    label: string;
    icon?: IconDefinition;
    /** Style the entry as destructive (e.g. delete). Keeps danger styling inside the menu instead of on the card */
    isDanger?: boolean;
    isDisabled?: boolean;
    onAction: () => void;
};

type CardActionsMenuProps = {
    /** Menu entries; with an empty list no trigger is rendered at all */
    actions: CardAction[];
    /** Accessible name of the trigger button */
    triggerLabel?: string;
};

/**
 * The standard overflow ("kebab") menu for a card's actions column. A single muted trigger keeps
 * long listings calm — no row of buttons per card — and scales from one action to many without
 * changing the card layout. Usually fed through `CardShell`'s `menuActions` prop rather than
 * rendered directly.
 */
const CardActionsMenu: FC<CardActionsMenuProps> = ({ actions, triggerLabel = 'More actions' }) => {
    if (actions.length === 0) {
        return null;
    }
    return (
        <Dropdown>
            <Button isIconOnly size="sm" variant="ghost" aria-label={triggerLabel} className="text-muted">
                <FontAwesomeIcon icon={faEllipsisVertical} />
            </Button>
            <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu>
                    {actions.map((action) => (
                        <Dropdown.Item
                            key={action.key}
                            id={action.key}
                            textValue={action.label}
                            variant={action.isDanger ? 'danger' : undefined}
                            isDisabled={action.isDisabled}
                            onAction={action.onAction}
                        >
                            {action.icon && (
                                <FontAwesomeIcon icon={action.icon} fixedWidth className={cn('shrink-0', action.isDanger ? 'text-danger' : 'text-muted')} />
                            )}
                            <Label>{action.label}</Label>
                        </Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
};

export default CardActionsMenu;
