import { faLock, faLockOpen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import useCountInstances from 'components/Class/hooks/useCountInstances';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Badge } from 'reactstrap';

const NodeFooterStyled = styled.div`
    background: ${(props) => props.theme.lightDarker};
    color: ${(props) => props.theme.secondaryDarker};
    border-bottom-left-radius: ${(props) => props.theme.borderRadius};
    border-bottom-right-radius: ${(props) => props.theme.borderRadius};
    font-size: 12px;
`;

function NodeFooter({ isClosed, targetClass }) {
    const { countInstances, isLoading: isLoadingCount } = useCountInstances(targetClass.id);
    return (
        <NodeFooterStyled className="px-2 py-1 d-flex justify-content-between">
            <div>
                <Tippy
                    content={
                        isClosed
                            ? 'This templates is closed (users cannot add additional properties)'
                            : 'This templates is open (users can add additional properties)'
                    }
                >
                    {isClosed ? <Icon icon={faLock} color="#505565" /> : <Icon icon={faLockOpen} color="#505565" />}
                </Tippy>
            </div>
            <div>
                <Tippy content="Number of instances">
                    <span>
                        <Badge pill>{!isLoadingCount ? countInstances : <Icon spin icon={faSpinner} />}</Badge>
                    </span>
                </Tippy>
            </div>
        </NodeFooterStyled>
    );
}

NodeFooter.propTypes = {
    isClosed: PropTypes.bool.isRequired,
    targetClass: PropTypes.object.isRequired,
};

export default NodeFooter;
