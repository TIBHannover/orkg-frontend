import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Popover } from '@heroui/react';
import { ICellRendererParams } from 'ag-grid-community';
import classNames from 'classnames';
import { useState } from 'react';

import CellButtons from '@/app/grid-editor/components/CellMenu/CellButtons';
import { TData } from '@/app/grid-editor/context/GridContext';

type CellMenuProps = ICellRendererParams<TData> & {
    isHovered?: boolean;
};

const CellMenu = (params: CellMenuProps) => {
    const { value, api, node, colDef, isHovered = false } = params;

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={classNames('opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity absolute top-1 right-1 z-10', {
                'opacity-100': isOpen || isHovered,
            })}
        >
            <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
                <Button
                    isIconOnly
                    size="sm"
                    variant="tertiary"
                    aria-label="Open cell menu"
                    className="!h-6 !w-6 !min-w-6 rounded-full bg-content2 text-foreground-600 hover:bg-secondary-solid hover:text-white shadow-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                        if (e.code === 'Enter' || e.code === 'Space') {
                            e.stopPropagation();
                        }
                    }}
                >
                    <FontAwesomeIcon icon={faEllipsisVertical} className="text-xs" />
                </Button>
                <Popover.Content placement="bottom" className="z-[99]">
                    <Popover.Dialog className="p-1">
                        <Popover.Arrow />
                        <CellButtons value={value} api={api} node={node} colDef={colDef} onClose={() => setIsOpen(false)} />
                    </Popover.Dialog>
                </Popover.Content>
            </Popover>
        </div>
    );
};

export default CellMenu;
