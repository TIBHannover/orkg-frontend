import React, { Component } from 'react';
import { InputGroup, InputGroupAddon, Input } from 'reactstrap';
import { faTrash, faPen } from '@fortawesome/free-solid-svg-icons';
import TemplateOptionButton from 'components/AddPaper/Contributions/TemplateWizzard/TemplateOptionButton';
import { StyledButton, ValueItemStyle } from './../styled';
import PropTypes from 'prop-types';

class ValueItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
            editValueLabel: false
        };
        this.inputRefsValue = React.createRef();
    }

    handleEditValueLabel = () => {
        if (this.state.editValueLabel) {
            this.setState({ editValueLabel: false });
        } else {
            // enable editing and focus on the input
            this.setState({ editValueLabel: true }, () => {
                this.inputRefsValue.current.focus();
            });
        }
    };

    render() {
        return (
            <ValueItemStyle className={this.state.editValueLabel ? 'editingLabel' : ''}>
                {!this.state.editValueLabel ? (
                    <div>
                        <div className={'valueLabel'}>{this.props.label}</div>
                        <div className={'valueOptions'}>
                            <TemplateOptionButton title={'Edit value'} icon={faPen} action={() => this.handleEditValueLabel()} />
                            <TemplateOptionButton title={'Delete value'} icon={faTrash} action={() => this.handleEditValueLabel()} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <InputGroup size="sm">
                            <Input
                                bsSize="sm"
                                placeholder="Edit value"
                                innerRef={this.inputRefsValue}
                                onKeyDown={e => e.keyCode === 13 && e.target.blur()} // Disable multiline Input
                            />
                            <InputGroupAddon addonType="append">
                                <StyledButton outline onClick={() => this.handleEditValueLabel()}>
                                    Done
                                </StyledButton>
                            </InputGroupAddon>
                        </InputGroup>
                    </div>
                )}
            </ValueItemStyle>
        );
    }
}

ValueItem.propTypes = {
    label: PropTypes.string.isRequired
};

ValueItem.defaultProps = {
    label: ''
};

export default ValueItem;
