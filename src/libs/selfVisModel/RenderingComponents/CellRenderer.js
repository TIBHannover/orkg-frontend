import React from 'react';
import { PropertyCell, ContributionCell, MetaCell, MetaMapperSelector, MetaMapperSelectorSimple, ValueCell } from './styledComponents';
import Tippy from '@tippyjs/react';
import PropTypes from 'prop-types';

export default function CellRenderer(props) {
    return (
        <>
            {props.type === 'property' && (
                <Tippy content={props.data.label ?? 'Error'}>
                    <PropertyCell>{props.data.label}</PropertyCell>
                </Tippy>
            )}
            {props.type === 'contribution' && (
                <Tippy content={props.data.label ?? 'Error'}>
                    <ContributionCell>{props.data.label}</ContributionCell>
                </Tippy>
            )}
            {props.type === 'value' && (
                <Tippy content={props.data.label ?? 'Error'}>
                    <ValueCell>{props.data.label}</ValueCell>
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
    children: PropTypes.any
};
