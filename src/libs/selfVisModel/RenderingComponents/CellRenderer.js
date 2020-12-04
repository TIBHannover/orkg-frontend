import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import SelfVisDataMode from '../SelfVisDataModel';
import { PropertyCell, ContributionCell, MetaCell, MetaMapperSelector, MetaMapperSelectorSimple, ValueCell } from './styledComponents';
import Tippy from '@tippy.js/react';

export default class CellRenderer extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
    }

    render() {
        return (
            <>
                {this.props.type === 'property' && (
                    <Tippy content={this.props.data.label ?? 'Error'}>
                        <PropertyCell>{this.props.data.label}</PropertyCell>
                    </Tippy>
                )}
                {this.props.type === 'contribution' && (
                    <Tippy content={this.props.data.label ?? 'Error'}>
                        <ContributionCell>{this.props.data.label}</ContributionCell>
                    </Tippy>
                )}
                {this.props.type === 'value' && (
                    <Tippy content={this.props.data.label ?? 'Error'}>
                        <ValueCell>{this.props.data.label}</ValueCell>
                    </Tippy>
                )}
                {this.props.type === 'metaNode' && <MetaCell />}
                {this.props.type === 'metaNodeHeader' && <MetaMapperSelector style={{ backgroundColor: 'white' }} />}
                {this.props.type === 'metaNodeSelector' && <MetaMapperSelector>{this.props.children}</MetaMapperSelector>}
                {this.props.type === 'metaNodeSelectorSimple' && <MetaMapperSelectorSimple>{this.props.children}</MetaMapperSelectorSimple>}
            </>
        );
    }
}

CellRenderer.propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.object,
    children: PropTypes.any
};
