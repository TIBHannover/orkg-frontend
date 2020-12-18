import React, { Component } from 'react';
import SelfVisDataModel from 'libs/selfVisModel/SelfVisDataModel';
import { ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledDropdownToggle = styled(DropdownToggle)`
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 122px;
`;

export default class DropDownMapperSelector extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataModel(); // this access the instance of the data (its a singleton)

        let initMapper = 'Select Mapper';
        if (this.props.data && this.props.data.getPropertyMapperType()) {
            initMapper = this.props.data.getPropertyMapperType();
        }

        this.state = {
            isOpen: false,
            selectedMapper: initMapper
        };
        this.mapperTypes = ['Select Mapper', 'Number', 'String', 'Date'];
    }

    componentDidUpdate = (prevProps, prevState) => {
        if (this.state.selectedMapper !== prevState.selectedMapper) {
            if (this.props.callBack) {
                this.props.callBack();
            }
        }
    };

    /** Rendering functions **/
    /** render based on propFlag **/
    render() {
        const items = this.mapperTypes.map((item, id) => {
            return (
                <DropdownItem
                    key={'dropdownItemIndexKey_' + id}
                    onClick={() => {
                        this.props.data.setPropertyMapperType(item);
                        this.setState({ selectedMapper: item });
                    }}
                >
                    {item}
                </DropdownItem>
            );
        });

        return (
            <ButtonDropdown
                color="darkblue"
                size="sm"
                className="pl-0 m-0 flex-grow-1"
                isOpen={this.state.isOpen}
                toggle={() => {
                    this.setState({
                        isOpen: !this.state.isOpen
                    });
                }}
            >
                <StyledDropdownToggle caret color="darkblue" className="pl-1" style={{ borderBottomRightRadius: '0', borderBottomLeftRadius: '0' }}>
                    {this.state.selectedMapper}
                </StyledDropdownToggle>
                <DropdownMenu>{items}</DropdownMenu>
            </ButtonDropdown>
        );
    }
}

DropDownMapperSelector.propTypes = {
    data: PropTypes.object,
    callBack: PropTypes.func
};
