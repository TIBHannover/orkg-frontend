import { faLock, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const NodeFooterStyled = styled.div`
    background: ${props => props.theme.lightDarker};
    color: ${props => props.theme.secondaryDarker};
    border-bottom-left-radius: ${props => props.theme.borderRadius};
    border-bottom-right-radius: ${props => props.theme.borderRadius};
    font-size: 12px;
`;

function NodeFooter({ isClosed }) {
    return (
        <NodeFooterStyled className="px-2 py-1">
            <Tippy
                content={
                    isClosed
                        ? 'This templates is closed (users cannot add additional properties)'
                        : 'This templates is open (users can add additional properties)'
                }
            >
                {isClosed ? <Icon icon={faLock} color="#505565" /> : <Icon icon={faLockOpen} color="#505565" />}
            </Tippy>
        </NodeFooterStyled>
    );
}

NodeFooter.propTypes = {
    isClosed: PropTypes.bool.isRequired,
};

export default NodeFooter;
