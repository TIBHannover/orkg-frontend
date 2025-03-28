import PropTypes from 'prop-types';

import Tooltip from '@/components/FloatingUI/Tooltip';
import {
    ContributionCell,
    MetaCell,
    MetaMapperSelector,
    MetaMapperSelectorSimple,
    PropertyCell,
    TippyContainer,
    ValueCell,
} from '@/libs/selfVisModel/RenderingComponents/styledComponents';

export default function CellRenderer(props) {
    return (
        <>
            {(props.type === 'property' || props.type === 'contribution' || props.type === 'value') && (
                <Tooltip content={props.data.label ?? 'Empty'} contentStyle={{ maxWidth: '300px' }}>
                    <TippyContainer>
                        {props.type === 'property' && (
                            <PropertyCell>
                                {props.data.label !== props.data.originalLabel ? <b>{props.data.label}</b> : props.data.label}
                            </PropertyCell>
                        )}
                        {props.type === 'contribution' && (
                            <ContributionCell>
                                {props.data.label !== props.data.originalLabel ? <b>{props.data.label}</b> : props.data.label}
                            </ContributionCell>
                        )}
                        {props.type === 'value' && (
                            <ValueCell>{props.data.label !== props.data.originalLabel ? <b>{props.data.label}</b> : props.data.label}</ValueCell>
                        )}
                    </TippyContainer>
                </Tooltip>
            )}
            {props.type === 'metaNode' && <MetaCell />}
            {props.type === 'metaNodeHeader' && <MetaMapperSelector style={{ backgroundColor: 'white' }} />}
            {props.type === 'metaNodeSelector' && <MetaMapperSelector>{props.children}</MetaMapperSelector>}
            {props.type === 'metaNodeSelectorSimple' && <MetaMapperSelectorSimple>{props.children}</MetaMapperSelectorSimple>}
        </>
    );
}

CellRenderer.propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.object,
    children: PropTypes.any,
};
