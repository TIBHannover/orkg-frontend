import React, { Component } from 'react';
import { Input } from 'reactstrap';
import { faTrash, faPen, faQuestion } from '@fortawesome/free-solid-svg-icons';
import TemplateOptionButton from 'components/AddPaper/Contributions/TemplateWizzard/TemplateOptionButton';
import styled from 'styled-components';
import PropTypes from 'prop-types';

export const TemplateHeaderStyle = styled.div`
    cursor: default;
    background-color: ${props => props.theme.darkblue};
    border-color: ${props => props.theme.darkblue};
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
    color: #fff;
    position: relative;
    display: block;
    padding: 0.75rem 1.25rem;

    .form-control {
        border-width: 0;
        border-radius: 0 !important;
        height: calc(1em + 0.25rem + 4px) !important;
        padding: 0 0.5rem;
        outline: 0;

        &:focus {
            outline: 0;
            border: 1px dashed ${props => props.theme.ultraLightBlueDarker};
            box-shadow: none;
        }
    }
    & .type {
        font-size: small;
        color: ${props => props.theme.ultraLightBlueDarker};
        .span {
            background-color: ${props => props.theme.buttonDark};
            color: ${props => props.theme.darkblue};
        }
    }
`;

class TemplateHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            predicateLabel: this.props.label,
            editPredicateLabel: false
        };
        this.inputRefs = React.createRef();
    }

    handleEditPredicateLabel = () => {
        if (this.state.editPredicateLabel) {
            this.setState({ editPredicateLabel: false });
        } else {
            // enable editing and focus on the input
            this.setState({ editPredicateLabel: true }, () => {
                this.inputRefs.current.focus();
            });
        }
    };

    handleChangeLabel = event => {
        this.setState({ predicateLabel: event.target.value });
    };

    render() {
        return (
            <div>
                <TemplateHeaderStyle className={'d-flex'}>
                    <div className="flex-grow-1 mr-4">
                        {!this.state.editPredicateLabel ? (
                            <>
                                {this.state.predicateLabel}
                                <div className={'headerOptions'}>
                                    <TemplateOptionButton title={'Edit label'} icon={faPen} action={() => this.handleEditPredicateLabel()} />
                                    <TemplateOptionButton title={'Delete Statements'} icon={faTrash} action={() => null} />
                                </div>
                            </>
                        ) : (
                            <>
                                <Input
                                    value={this.state.predicateLabel}
                                    innerRef={this.inputRefs}
                                    onChange={this.handleChangeLabel}
                                    onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                                    onBlur={e => {
                                        this.handleEditPredicateLabel();
                                    }}
                                />
                            </>
                        )}
                    </div>
                    <div className={'type'}>
                        Template
                        <TemplateOptionButton
                            title={
                                'A template is a defined structure of a contribution, this stucture is mostly shared between papers in the same research field.'
                            }
                            icon={faQuestion}
                            iconWrapperSize={'20px'}
                            iconSize={'10px'}
                            action={() => null}
                        />
                    </div>
                </TemplateHeaderStyle>
            </div>
        );
    }
}

TemplateHeader.propTypes = {
    label: PropTypes.string.isRequired
};

export default TemplateHeader;
