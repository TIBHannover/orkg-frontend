import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import SelfVisDataMode from '../SelfVisDataModel';
import styled from 'styled-components';
import Tippy from '@tippy.js/react';

/** Cell renderer has three flags obtained from props
 * >> 1) isColHeader, 2) isRowHeader, 3) isCellValue
 * >> add flags for editing.
 *
 *
 * **/

export default class CellRenderer extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)

        // see data;
    }

    componentDidUpdate = prevProps => {
        // always make sure that you have the pointer to the data;
        // this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)
    };

    /** Rendering functions **/
    /** render based on propFlag **/
    render() {
        return (
            <>
                {this.props.type === 'property' && (
                    <Tippy content={this.props.data.label}>
                        <PropertyCell>{this.props.data.label}</PropertyCell>
                    </Tippy>
                )}
                {this.props.type === 'contribution' && (
                    <Tippy content={this.props.data.label}>
                        <ContributionCell>{this.props.data.label}</ContributionCell>
                    </Tippy>
                )}
                {this.props.type === 'value' && (
                    <Tippy content={this.props.data.label}>
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

/** adding styled divs for different cell items **/
export const PropertyCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    color: white;
    background: #80869b;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    width: 150px;
    min-width: 150px;
    height: 30px;
    padding: 0 2px;
    margin: 0 1px;
`;

export const ValueCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;

    background: #ccc;
    color: black;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 1px 1px;
`;

export const ContributionCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    background: #e86161;
    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 1px 1px;
`;

export const MetaCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;

    background: white;
    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 1px 1px;
`;

export const MetaMapperSelector = styled.div`
    overflow: visible;
    background: white;
    display: flex;
    color: white;
    width: 150px;
    min-width: 150px;
    height: 30px;

    margin: 1px 1px;
`;
export const MetaMapperSelectorSimple = styled.div`
    overflow: visible;
    background: black;
    color: white;
    display: flex;
    width: 150px;
    min-width: 150px;
    height: 30px;
    margin: 1px 1px;
`;
