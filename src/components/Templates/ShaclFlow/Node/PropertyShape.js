import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import Handle from 'components/Templates/ShaclFlow/Node/Handle';
import DATA_TYPES from 'constants/DataTypes.js';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';
import { Position } from 'reactflow';
import styled from 'styled-components';

const PropertyShapeStyled = styled.div`
    background: ${props => props.theme.light};
    color: ${props => props.theme.secondaryDarker};
    border-bottom: 1px solid #000;
`;

const Circle = styled.div`
    width: 22px;
    height: 22px;
    text-align: center;
    color: #fff;
    border-radius: 100%;
    background: ${props => props.theme.secondaryDarker};
`;

function PropertyShape({ data }) {
    let initialType;

    if (data.value?.id) {
        if (
            DATA_TYPES.filter(dt => dt._class === ENTITIES.LITERAL)
                .map(t => t.classId)
                .includes(data.value.id)
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
            {initialType === 'C' && <Handle id={data.property.id} type="source" position={Position.Right} />}

            <div className="d-flex">
                <div className="flex-grow-1 me-2 d-flex">
                    <DescriptionTooltip
                        id={data.property.id}
                        _class={ENTITIES.PREDICATE}
                        showURL={true}
                        extraContent={
                            data.property.label?.length > 40 ? (
                                <>
                                    <tr>
                                        <td>Label</td>
                                        <td>{data.property.label}</td>
                                    </tr>
                                </>
                            ) : (
                                ''
                            )
                        }
                    >
                        <span className="text-truncate d-inline-block me-1" style={{ maxWidth: 300 }}>
                            {data.property.label}
                        </span>
                    </DescriptionTooltip>{' '}
                    [{data.minCount}..{data.maxCount ?? '*'}]
                </div>
                {initialType && (
                    <DescriptionTooltip id={data.value.id} _class={ENTITIES.CLASS} showPageURL={true} showURL={true}>
                        <Circle>{initialType}</Circle>
                    </DescriptionTooltip>
                )}
            </div>
        </PropertyShapeStyled>
    );
}

PropertyShape.propTypes = {
    data: PropTypes.object.isRequired,
};

export default PropertyShape;
