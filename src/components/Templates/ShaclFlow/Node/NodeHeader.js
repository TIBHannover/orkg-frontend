import Link from 'next/link';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import Tippy from '@tippyjs/react';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const NodeHeaderStyled = styled.div`
    background: ${(props) => props.theme.secondary};
    color: #fff;
`;

function NodeHeader({ label, id }) {
    return (
        <NodeHeaderStyled className="p-2 d-flex">
            <ConditionalWrapper condition={label?.length > 40} wrapper={(children) => <Tippy content={label}>{children}</Tippy>}>
                <div className="text-truncate d-inline-block me-2" style={{ maxWidth: 300 }}>
                    {label}
                </div>
            </ConditionalWrapper>{' '}
            <Tippy content="Go to template page">
                <Link target="_blank" href={reverse(ROUTES.TEMPLATE, { id })}>
                    <FontAwesomeIcon icon={faLink} color="#fff" />
                </Link>
            </Tippy>
        </NodeHeaderStyled>
    );
}

NodeHeader.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
};

export default NodeHeader;
