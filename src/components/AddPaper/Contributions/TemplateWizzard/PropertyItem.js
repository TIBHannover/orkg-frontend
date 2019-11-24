import React, { Component } from 'react';
import { ListGroupItem, InputGroup, InputGroupAddon, Input } from 'reactstrap';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import TemplateOptionButton from 'components/AddPaper/Contributions/TemplateWizzard/TemplateOptionButton';
import ValueItem from 'components/AddPaper/Contributions/TemplateWizzard/ValueItem';
import AddValue from 'components/AddPaper/Contributions/TemplateWizzard/AddValue';
import { StyledButton } from './../styled';
import styled from 'styled-components';
import PropTypes from 'prop-types';

export const StatementsGroupStyle = styled(ListGroupItem)`
    position: relative;
    padding: 0 !important;
    :last-of-type {
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }
    &.inTemplate:first-of-type {
        border-top: 0;
    }
    &.noTemplate {
        border-top: 2px solid rgba(0, 0, 0, 0.125);
        border-radius: 4px;
    }
    & .propertyOptions {
        visibility: hidden;
    }
    &:hover .propertyOptions {
        visibility: visible;
        span {
            color: ${props => props.theme.buttonDark};
        }
    }
`;

export const PropertyStyle = styled.div`
    background-color: ${props => props.theme.ultraLightBlue};
    & > div {
        padding: 8px;
    }
    .propertyLabel {
        margin-right: 4px;
        font-weight: 500;
    }
    & input,
    & input:focus {
        outline: 0 !important;
        box-shadow: none !important;
        border-color: #ced4da !important;
        border-top-left-radius: 4px !important;
        border-bottom-left-radius: 4px !important;
    }

    &.editingLabel {
        padding-bottom: 15px !important;
    }
`;
export const ValuesStyle = styled.div`
    & > div {
        padding: 8px;
    }
    background-color: #fff;
`;

class PropertyItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownValueTypeOpen: false,
            editPropertyLabel: false
        };
        this.inputRefsProperty = React.createRef();
    }

    handleEditPropertyLabel = () => {
        if (this.state.editPropertyLabel) {
            this.setState({ editPropertyLabel: false });
        } else {
            // enable editing and focus on the input
            this.setState({ editPropertyLabel: true }, () => {
                this.inputRefsProperty.current.focus();
            });
        }
    };

    render() {
        return (
            <StatementsGroupStyle className={`${this.props.inTemplate ? 'inTemplate' : 'noTemplate'} ${!this.props.inTemplate ? ' mt-3' : ''}`}>
                <div className={'row no-gutters'}>
                    <PropertyStyle className={`col-4 ${this.state.editPropertyLabel ? 'editingLabel' : ''}`}>
                        {!this.state.editPropertyLabel ? (
                            <div>
                                <div className={'propertyLabel'}>{this.props.label}</div>
                                <div className={'propertyOptions'}>
                                    <TemplateOptionButton title={'Edit Property'} icon={faPen} action={() => this.handleEditPropertyLabel()} />
                                    <TemplateOptionButton title={'Delete Property'} icon={faTrash} action={() => null} />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <InputGroup size="sm">
                                    <Input
                                        bsSize="sm"
                                        placeholder="Edit property"
                                        innerRef={this.inputRefsProperty}
                                        onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                    />
                                    <InputGroupAddon addonType="append">
                                        <StyledButton outline onClick={() => this.handleEditPropertyLabel()}>
                                            Done
                                        </StyledButton>
                                    </InputGroupAddon>
                                </InputGroup>
                            </div>
                        )}
                    </PropertyStyle>
                    <ValuesStyle className={'col-8 valuesList'}>
                        <div>
                            {this.props.values.map(v => (
                                <ValueItem key={`${v.id}`} label={v.label} />
                            ))}
                            <AddValue />
                        </div>
                    </ValuesStyle>
                </div>
            </StatementsGroupStyle>
        );
    }
}

PropertyItem.propTypes = {
    label: PropTypes.string.isRequired,
    values: PropTypes.array.isRequired,
    inTemplate: PropTypes.bool.isRequired
};

PropertyItem.defaultProps = {
    inTemplate: false,
    label: 'Programming language',
    values: []
};

export default PropertyItem;
