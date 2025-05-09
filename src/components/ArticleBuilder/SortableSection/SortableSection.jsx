import { faArrowDown, faArrowUp, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { sortableHandle } from 'react-sortable-hoc';
import { Button } from 'reactstrap';

import { DeleteButton, MoveButton, MoveHandle, SectionStyled } from '@/components/ArticleBuilder/styled';
import Tooltip from '@/components/FloatingUI/Tooltip';

const SortableSection = ({ handleDelete, handleSort, children }) => {
    const [isHovering, setIsHovering] = useState(false);

    const SortableHandle = sortableHandle(() => (
        <MoveHandle className={isHovering ? 'hover' : ''}>
            <FontAwesomeIcon icon={faBars} />
        </MoveHandle>
    ));

    return (
        <SectionStyled
            tabIndex="0"
            className="box rounded"
            onFocus={() => setIsHovering(true)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <DeleteButton className={isHovering ? 'hover' : ''} color="primary" onClick={handleDelete} aria-label="Delete section">
                <FontAwesomeIcon icon={faTimes} />
            </DeleteButton>
            <SortableHandle />
            <MoveButton className={isHovering ? 'hover up' : 'up'}>
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

SortableSection.propTypes = {
    handleSort: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default SortableSection;
