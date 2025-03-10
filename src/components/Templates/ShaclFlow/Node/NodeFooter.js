import { faLock, faLockOpen, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useCountInstances from 'components/Class/hooks/useCountInstances';
import Tooltip from 'components/FloatingUI/Tooltip';
import PropTypes from 'prop-types';
import { Badge } from 'reactstrap';
import styled from 'styled-components';

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
                <Tooltip
                    content={
                        isClosed
                            ? 'This templates is closed (users cannot add additional properties)'
                            : 'This templates is open (users can add additional properties)'
                    }
                >
                    {isClosed ? <FontAwesomeIcon icon={faLock} color="#505565" /> : <FontAwesomeIcon icon={faLockOpen} color="#505565" />}
                </Tooltip>
            </div>
            <div>
                <Tooltip content="Number of instances">
                    <span>
                        <Badge pill>{!isLoadingCount ? countInstances : <FontAwesomeIcon spin icon={faSpinner} />}</Badge>
                    </span>
                </Tooltip>
            </div>
        </NodeFooterStyled>
    );
}

NodeFooter.propTypes = {
    isClosed: PropTypes.bool.isRequired,
    targetClass: PropTypes.object.isRequired,
};

export default NodeFooter;
