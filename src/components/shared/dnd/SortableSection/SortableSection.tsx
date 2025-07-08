import { faArrowDown, faArrowUp, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, useState } from 'react';
import { Button } from 'reactstrap';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
import { defaultDragHandleProps } from '@/components/shared/dnd/dragAndDropUtils';

const SectionStyled = styled.div`
    position: relative;
    padding: 10px 40px 10px 40px !important;

    a {
        text-decoration: underline;
    }
`;

const DeleteButton = styled(Button)`
    position: absolute;
    top: -8px;
    left: -3px;
    z-index: 1;
    padding: 2px 8px !important;
    display: none !important;
    &.hover {
        display: block !important;
    }
`;

const MoveHandle = styled.div`
    width: 25px;
    height: 100%;
    position: absolute;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: move;
    color: grey;
    border-radius: 6px 0 0 6px;
    top: 0;
    z-index: 0;
    &.hover {
        background: ${(props) => props.theme.secondary};
        color: #fff;
    }
`;

const MoveButton = styled.div`
    position: absolute;
    left: 0;
    width: 25px;
    top: 25px;
    display: none;
    &.hover {
        display: block;
    }
    &.down {
        top: calc(100% - 30px);
    }
`;

export type SortableSectionProps = {
    handleDelete: () => void;
    handleSort: (direction: 'up' | 'down') => void;
    children: React.ReactNode;
    dragHandleRef?: (element: HTMLElement | null) => void;
    className?: string;
};

const SortableSection: FC<SortableSectionProps> = ({ handleDelete, handleSort, children, dragHandleRef, className = 'box rounded' }) => {
    const [isHovering, setIsHovering] = useState(false);

    return (
        <SectionStyled
            tabIndex={0}
            className={className}
            onFocus={() => setIsHovering(true)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <DeleteButton className={isHovering ? 'hover' : ''} color="primary" onClick={handleDelete} aria-label="Delete section">
                <FontAwesomeIcon icon={faTimes} />
            </DeleteButton>

            <MoveHandle className={isHovering ? 'hover' : ''} ref={dragHandleRef} {...defaultDragHandleProps} aria-label="Drag to reorder section">
                <FontAwesomeIcon icon={faBars} />
            </MoveHandle>

            <MoveButton className={isHovering ? 'hover' : ''}>
                <Tooltip content="Move up">
                    <span>
                        <Button className="p-0 w-100" color="secondary" onClick={() => handleSort('up')} aria-label="Move section up">
                            <FontAwesomeIcon icon={faArrowUp} />
                        </Button>
                    </span>
                </Tooltip>
            </MoveButton>

            <MoveButton className={isHovering ? 'hover down' : 'down'}>
                <Tooltip content="Move down">
                    <span>
                        <Button className="p-0 w-100" color="secondary" onClick={() => handleSort('down')} aria-label="Move section down">
                            <FontAwesomeIcon icon={faArrowDown} />
                        </Button>
                    </span>
                </Tooltip>
            </MoveButton>

            {children}
        </SectionStyled>
    );
};

export default SortableSection;
