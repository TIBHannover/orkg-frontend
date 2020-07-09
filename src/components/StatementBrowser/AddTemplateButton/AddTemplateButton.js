import React, { Component } from 'react';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import TemplateDetailsTooltip from './TemplateDetailsTooltip';
import { fillResourceWithTemplate } from 'actions/statementBrowser';
import { connect } from 'react-redux';
import Tippy from '@tippy.js/react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const IconWrapper = styled.span`
    background-color: #d1d5e4;
    position: absolute;
    left: 0;
    height: 100%;
    top: 0;
    width: 28px;
    border-radius: inherit;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.darkblue};
    padding-left: 3px;
`;

const Label = styled.div`
    padding-left: 28px;
`;

class AddTemplateButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isAdding: false
        };
        this.ref = React.createRef();
    }

    addTemplate = () => {
        this.setState({ isAdding: true });
        this.props
            .fillResourceWithTemplate({
                templateID: this.props.id,
                selectedResource: this.props.selectedResource,
                syncBackend: this.props.syncBackend
            })
            .then(Data => {
                this.ref.current.removeAttribute('disabled');
                this.setState({ isAdding: false });
            });
    };

    render() {
        return (
            <Tippy content={<TemplateDetailsTooltip id={this.props.id} source={this.props.source} />}>
                <span>
                    <Button
                        innerRef={this.ref}
                        onClick={() => {
                            this.ref.current.setAttribute('disabled', 'disabled');
                            this.addTemplate();
                        }}
                        size="sm"
                        color="light"
                        className="mr-2 mb-2 position-relative px-3 rounded-pill border-0"
                    >
                        <IconWrapper>
                            {!this.state.isAdding && <Icon size="sm" icon={faPlus} />}
                            {this.state.isAdding && <Icon icon={faSpinner} spin />}
                        </IconWrapper>
                        <Label>{this.props.label}</Label>
                    </Button>
                </span>
            </Tippy>
        );
    }
}

AddTemplateButton.propTypes = {
    fillResourceWithTemplate: PropTypes.func.isRequired,
    selectedResource: PropTypes.string, // The resource to prefill with the template
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    source: PropTypes.object.isRequired,
    syncBackend: PropTypes.bool.isRequired
};

AddTemplateButton.defaultProps = {
    label: '',
    syncBackend: false
};

const mapDispatchToProps = dispatch => ({
    fillResourceWithTemplate: data => dispatch(fillResourceWithTemplate(data))
});

export default connect(
    null,
    mapDispatchToProps
)(AddTemplateButton);
