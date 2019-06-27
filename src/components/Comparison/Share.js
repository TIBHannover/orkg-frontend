import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Input, InputGroup, InputGroupAddon, Button, Tooltip as ReactstrapTooltip } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';

class Share extends Component {

    constructor(props) {
        super(props);

        this.state = {
            showTooltipCopiedLink: false,
        }

    }

    toggleTooltip = (e) => {
        if (e && e.type !== 'mouseover') {
            this.setState({ showTooltipCopiedLink: !this.state.showTooltipCopiedLink });
        }
    }

    render() {
        return (
            <Modal isOpen={this.props.showDialog} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>Share link</ModalHeader>
                <ModalBody>
                    <p>The created comparison can be shared using the following link: </p>

                    <InputGroup>
                        <Input
                            value={this.props.url}
                            disabled
                        />
                        <InputGroupAddon addonType="append">
                            <CopyToClipboard id="copyToClipboardLink" text={this.props.url} onCopy={() => { this.setState({ showTooltipCopiedLink: true });}} >
                                <Button
                                    color="primary"
                                    className="pl-3 pr-3"
                                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                >
                                    <Icon icon={faClipboard} />
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip placement="top" target="copyToClipboardLink" trigger={'hover'} toggle={this.toggleTooltip} isOpen={this.state.showTooltipCopiedLink}>
                                Copied!
                            </ReactstrapTooltip>
                        </InputGroupAddon>
                    </InputGroup>

                </ModalBody>
            </Modal >
        );
    }
}

Share.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
}

const mapStateToProps = state => ({
    //viewPaper: state.viewPaper,
});

export default connect(
    mapStateToProps
)(Share);