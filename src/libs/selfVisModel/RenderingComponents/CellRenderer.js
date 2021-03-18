import {
    PropertyCell,
    ContributionCell,
    MetaCell,
    MetaMapperSelector,
    MetaMapperSelectorSimple,
    ValueCell,
    TippyContainer
} from './styledComponents';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';

export default function CellRenderer(props) {
    return (
        <>
            {(props.type === 'property' || props.type === 'contribution' || props.type === 'value') && (
                <Tippy singleton={props.tippyTarget} content={props.data.label ?? 'Empty'}>
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
                </Tippy>
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
    tippyTarget: PropTypes.object
};
