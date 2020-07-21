import React, { Component } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Button, ButtonGroup, Badge } from 'reactstrap';
import { getCitationByDOI } from 'network';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { ContainerAnimated } from './styled';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
//import { StyledItemProvenanceBox, AnimationContainer, ProvenanceBoxTabs, ErrorMessage, SidebarStyledBox } from './styled';
import PropTypes from 'prop-types';

class ExportCitations extends Component {
    constructor(props) {
        super(props);
        this.state = {
            citation: '',
            isLoading: false
        };
    }

    componentDidMount() {
        this.getCitation('apa');
    }

    componentDidUpdate(prevProps) {
        if (this.props.DOI !== prevProps.DOI) {
            this.getCitation('apa');
        }
    }

    toggle = type => {
        this.setState(prevState => ({
            [type]: !prevState[type]
        }));
    };

    getCitation = style => {
        this.setState({ isLoading: true });
        if (this.props.DOI) {
            getCitationByDOI(this.props.DOI, style)
                .then(response => {
                    console.log(response);
                    this.setState({
                        citation: response,
                        isLoading: false
                    });
                })
                .catch(error => {
                    this.setState({
                        isLoading: false
                    });
                });
        }
    };

    render() {
        return (
            <>
                <div>
                    <ContainerAnimated className="d-flex align-items-center">
                        <h5 className="h4 mt-4 mb-4 flex-grow-1">Citation </h5>
                        <div style={{ marginLeft: 'auto' }} className="flex-shrink-0 mt-4">
                            <ButtonGroup className="float-right mb-4 ml-1">
                                <Dropdown
                                    style={{ width: '100px' }}
                                    group
                                    isOpen={this.state.dropdownOpen}
                                    toggle={() => this.toggle('dropdownOpen')}
                                >
                                    <DropdownToggle color="darkblue" size="sm" className="rounded-right">
                                        <span className="mr-2">APA</span> <Icon icon={faAngleDown} />
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <DropdownItem onClick={() => this.getCitation('ieee')}>IEEE</DropdownItem>
                                        <DropdownItem onClick={() => this.getCitation('harvard3')}>Harvard</DropdownItem>
                                        <DropdownItem onClick={() => this.getCitation('chicago-author-date')}>Chicago</DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </ButtonGroup>
                        </div>
                    </ContainerAnimated>
                </div>
                <hr />
                {!this.state.isLoading && (
                    <div>
                        <h6> {this.state.citation} </h6>
                    </div>
                )}
            </>
        );
    }
}

ExportCitations.propTypes = {
    DOI: PropTypes.string.isRequired
};

export default ExportCitations;
