import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICellRendererParams } from 'ag-grid-community';
import classNames from 'classnames';
import React, { useState } from 'react';
import styled from 'styled-components';

import CellButtons from '@/app/grid-editor/components/CellMenu/CellButtons';
import { TData } from '@/app/grid-editor/context/GridContext';
import Popover from '@/components/FloatingUI/Popover';

const CellMenuButton = styled.button`
    border-radius: 100%;
    background-color: ${(props) => props.theme.lightDarker};
    color: ${(props) => props.theme.dark};
    border-width: 0;

    /* to override bootstrap button styles because var(--bs-btn-disabled-bg) is not defined */
    &.disabled {
        background-color: ${(props) => props.theme.lightDarker};
    }

    & .icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 1.5rem;
        width: 1.5rem;
    }

    &:hover {
        background-color: ${(props) => props.theme.secondary};
        color: #fff;
    }

    &:focus {
        box-shadow: 0 0 0 0.2rem rgba(203, 206, 209, 0.5);
    }
`;

type CellMenuProps = ICellRendererParams<TData> & {
    isHovered?: boolean;
};

const CellMenu = (params: CellMenuProps) => {
    const { value, api, node, colDef, isHovered = false } = params;

    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className={classNames(
                'tw:opacity-0 tw:group-hover:opacity-100 tw:group-focus-within:opacity-100 tw:transition-opacity tw:absolute tw:top-1 tw:right-1 tw:z-10',
                { 'tw:opacity-100': isOpen || isHovered },
            )}
        >
            <Popover
                placement="bottom"
                showArrow
                onTrigger={(open) => setIsOpen(open)}
                content={
                    <div className="p-1">
                        <CellButtons value={value} api={api} node={node} colDef={colDef} />
                    </div>
                }
                contentStyle={{ zIndex: 99 }}
            >
                <CellMenuButton
                    type="button"
                    className="btn btn-link p-0"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                        if (e.code === 'Enter' || e.code === 'Space') {
                            e.stopPropagation();
                        }
                    }}
                    aria-label="Open cell menu"
                >
                    <span className="icon-wrapper">
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                    </span>
                </CellMenuButton>
            </Popover>
        </div>
    );
};

export default CellMenu;
