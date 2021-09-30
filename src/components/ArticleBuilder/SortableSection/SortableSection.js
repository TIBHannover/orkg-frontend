import { faArrowDown, faArrowUp, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import { DeleteButton, MoveButton, MoveHandle, SectionStyled } from 'components/ArticleBuilder/styled';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { sortableHandle } from 'react-sortable-hoc';
import { Button } from 'reactstrap';

const SortableSection = ({ handleDelete, handleSort, children }) => {
    const [isHovering, setIsHovering] = useState(false);

    const SortableHandle = sortableHandle(() => (
        <MoveHandle className={isHovering ? 'hover' : ''}>
            <Icon icon={faBars} />
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
                <Icon icon={faTimes} />
            </DeleteButton>
            <SortableHandle />
            <MoveButton className={isHovering ? 'hover up' : 'up'}>
                <Tippy content="Move up">
                    <span>
                        <Button className="p-0 w-100" color="secondary" onClick={() => handleSort('up')} aria-label="Move section up">
                            <Icon icon={faArrowUp} />
                        </Button>
                    </span>
                </Tippy>
            </MoveButton>
            <MoveButton className={isHovering ? 'hover down' : 'down'}>
                <Tippy content="Move down">
                    <span>
                        <Button className="p-0 w-100" color="secondary" onClick={() => handleSort('down')} aria-label="Move section down">
                            <Icon icon={faArrowDown} />
                        </Button>
                    </span>
                </Tippy>
            </MoveButton>
            {children}
        </SectionStyled>
    );
};

SortableSection.propTypes = {
    handleSort: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired
};

export default SortableSection;
