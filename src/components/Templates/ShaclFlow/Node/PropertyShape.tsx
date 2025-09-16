import { Position } from '@xyflow/react';
import { FC } from 'react';
import styled from 'styled-components';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Handle from '@/components/Templates/ShaclFlow/Node/Handle';
import DATA_TYPES from '@/constants/DataTypes';
import { ENTITIES } from '@/constants/graphSettings';
import { PropertyShape } from '@/services/backend/types';

const PropertyShapeStyled = styled.div`
    background: ${(props) => props.theme.light};
    color: ${(props) => props.theme.secondaryDarker};
    border-bottom: 1px solid #000;
`;

const Circle = styled.div`
    width: 22px;
    height: 22px;
    text-align: center;
    color: #fff;
    border-radius: 100%;
    background: ${(props) => props.theme.secondaryDarker};
`;

type PropertyShapeProps = {
    data: PropertyShape;
    nodeId: string;
};

const PropertyShapeComponent: FC<PropertyShapeProps> = ({ data, nodeId }) => {
    let initialType;
    let range;
    if ('class' in data) {
        range = data.class;
    } else if ('datatype' in data) {
        range = data.datatype;
    }
    if (range?.id) {
        if (
            DATA_TYPES.filter((dt) => dt._class === ENTITIES.LITERAL)
                .map((t) => t.classId)
                .includes(range.id)
        ) {
            initialType = 'L';
        } else {
            initialType = 'C';
        }
    } else {
        initialType = null;
    }

    return (
        <PropertyShapeStyled className="py-1 px-2 position-relative">
            {initialType === 'C' && <Handle id={data.path.id} type="source" position={Position.Right} />}

            <div className="d-flex">
                <div className="flex-grow-1 me-2 d-flex">
                    <DescriptionTooltip
                        id={data.path.id}
                        _class={ENTITIES.PREDICATE}
                        showURL
                        extraContent={
                            data.path.label?.length > 40 ? (
                                <tr>
                                    <td>Label</td>
                                    <td>{data.path.label}</td>
                                </tr>
                            ) : (
                                ''
                            )
                        }
                    >
                        <span className="text-truncate d-inline-block me-1" style={{ maxWidth: 300 }}>
                            {data.path.label}
                        </span>
                    </DescriptionTooltip>{' '}
                    [{data.min_count}..{data.max_count ?? '*'}]
                </div>
                {initialType && range && (
                    <DescriptionTooltip id={range.id} _class={ENTITIES.CLASS} showURL>
                        <Circle>{initialType}</Circle>
                    </DescriptionTooltip>
                )}
            </div>
        </PropertyShapeStyled>
    );
};

export default PropertyShapeComponent;
