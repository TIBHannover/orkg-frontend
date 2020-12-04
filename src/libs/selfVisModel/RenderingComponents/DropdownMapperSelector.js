import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import SelfVisDataMode from '../SelfVisDataModel';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';

export default class DropDownMapperSelector extends Component {
    constructor(props) {
        super(props);
        this.selfVisModel = new SelfVisDataMode(); // this access the instance of the data (its a singleton)

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
            <div style={{ overflow: 'visible' }}>
                <Dropdown
                    color="darkblue"
                    size="sm"
                    //    className='mb-4 mt-4'
                    style={{
                        height: 'min-content',
                        paddingTop: '0px',
                        width: '50px'
                    }}
                    isOpen={this.state.isOpen}
                    toggle={() => {
                        this.setState({
                            isOpen: !this.state.isOpen
                        });
                    }}
                >
                    <DropdownToggle caret color="darkblue" className="dropdownToggleCaret">
                        {this.state.selectedMapper}
                    </DropdownToggle>
                    <DropdownMenu>{items}</DropdownMenu>
                </Dropdown>
            </div>
        );
    }
}

DropDownMapperSelector.propTypes = {
    data: PropTypes.object,
    callBack: PropTypes.func
};
