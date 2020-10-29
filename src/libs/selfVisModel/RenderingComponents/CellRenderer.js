import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import SelfVisDataMode from '../SelfVisDataModel';
import styled from 'styled-components';
import Tippy from '@tippy.js/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'reactstrap';

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
                {this.props.type === 'metaNode' && <MetaCell>Narf</MetaCell>}
            </>
        );
    }
}

CellRenderer.propTypes = {
    type: PropTypes.string.isRequired,
    data: PropTypes.object
};

/** adding styled divs for different cell items **/
export const PropertyCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;

    background: #ccc;
    color: red;
    width: 100px;
    height: 30px;
    margin: 0 2px;
`;

export const ValueCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;

    background: #ccc;
    color: black;
    width: 100px;
    height: 30px;
    margin: 2px 2px;
`;

export const ContributionCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;

    background: #0f0;
    color: red;
    width: 100px;
    height: 30px;
    margin: 2px 2px;
`;

export const MetaCell = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    display: ruby;

    background: black;
    color: white;
    width: 100px;
    height: 30px;
    margin: 2px 2px;
`;
