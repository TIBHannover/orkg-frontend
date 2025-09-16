import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC } from 'react';
import styled from 'styled-components';

import Tooltip from '@/components/FloatingUI/Tooltip';
import ConditionalWrapper from '@/components/Utils/ConditionalWrapper';
import ROUTES from '@/constants/routes';

const NodeHeaderStyled = styled.div`
    background: ${(props) => props.theme.secondary};
    color: #fff;
`;

type NodeHeaderProps = {
    label: string;
    id: string;
};

const NodeHeader: FC<NodeHeaderProps> = ({ label, id }) => {
    return (
        <NodeHeaderStyled className="p-2 d-flex">
            {/* eslint-disable-next-line react/no-unstable-nested-components */}
            <ConditionalWrapper condition={label?.length > 40} wrapper={(children: React.ReactNode) => <Tooltip content={label}>{children}</Tooltip>}>
                <div className="text-truncate d-inline-block me-2" style={{ maxWidth: 300 }}>
                    {label}
                </div>
            </ConditionalWrapper>{' '}
            <Tooltip content="Go to template page">
                <Link target="_blank" href={reverse(ROUTES.TEMPLATE, { id })}>
                    <FontAwesomeIcon icon={faLink} color="#fff" />
                </Link>
            </Tooltip>
        </NodeHeaderStyled>
    );
};

export default NodeHeader;
