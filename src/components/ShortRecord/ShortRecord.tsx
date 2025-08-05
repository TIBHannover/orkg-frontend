import Link from 'next/link';
import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import Col from '@/components/Ui/Structure/Col';
import Row from '@/components/Ui/Structure/Row';

const StyledShortRecord = styled.div`
    & .options {
        display: none;
    }

    &.selected {
        background: ${(props) => props.theme.bodyBg};
    }

    &:hover .options,
    &.selected .options {
        display: block;
    }
`;

interface ShortRecordProps {
    /** Link of the header label */
    href: string;
    /** Content displayed under header label */
    children: string | [] | ReactNode;
    /** Header label */
    header: string;
}

const ShortRecord: FC<ShortRecordProps> = ({ href, header, children }) => (
    <StyledShortRecord className="list-group-item px-4 py-3">
        <Row>
            <Col sm={12}>
                <Link href={href}>{header || <i>No label</i>}</Link>
                <br />
                <small>{children}</small>
            </Col>
        </Row>
    </StyledShortRecord>
);

export default ShortRecord;
