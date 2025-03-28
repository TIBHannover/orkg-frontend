import { FC } from 'react';
import styled from 'styled-components';

import { getBackgroundColor } from '@/components/DataBrowser/utils/dataBrowserUtils';

const LineContainer = styled.div`
    width: 12px;
    position: relative;
    height: 100%;
`;

const HorizontalLine = styled.div`
    border-top: 2px solid ${(props) => props.theme.lightDarker};
    width: 8px;
    height: 2px;
    position: absolute;
    top: 50%;
    left: 10px;
`;

const VerticalLine = styled.div`
    border-right: 2px solid ${(props) => props.theme.lightDarker};
    width: 2px;
    height: 100%;
    margin: 0 0 0 10px;
`;

type HierarchyIndicatorProps = {
    path: string[];
    side: 'left' | 'right';
    showHorizontalLine?: boolean;
};

const HierarchyIndicator: FC<HierarchyIndicatorProps> = ({ path = [], side, showHorizontalLine = true }) => {
    return (
        <div className={`d-flex flex-shrink-0 clearfix ${side === 'right' ? 'flex-row-reverse' : ''}`}>
            {path?.map((_path, index) => (
                <LineContainer key={index} style={{ background: getBackgroundColor(index) }}>
                    <VerticalLine
                        style={{
                            opacity: side === 'left' ? 1 : 0.0,
                        }}
                    />
                    {showHorizontalLine && side === 'left' && index === path.length - 1 && <HorizontalLine />}
                </LineContainer>
            ))}
        </div>
    );
};
export default HierarchyIndicator;
