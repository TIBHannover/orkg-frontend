import React, { Component } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Input,
    InputGroup,
    InputGroupAddon,
    Button,
    Tooltip as ReactstrapTooltip,
    CustomInput,
    Alert,
    FormGroup,
    Label
} from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from '../../constants/routes.js';
import queryString from 'query-string';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { createShortLink } from '../../network';
import Tooltip from '../Utils/Tooltip';

class Share extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showTooltipCopiedLink: false,
            shareShortLink: false,
            link: null,
            shortLink: null,
            shortLinkIsLoading: false,
            shortLinkIsFailed: false
        };
    }

    componentDidMount() {
        const link = queryString.parse(this.props.url).response_hash
            ? this.props.url
            : this.props.url + `${this.props.url.indexOf('?') !== -1 ? '&response_hash=' : '?response_hash='}${this.props.response_hash}`;
        this.setState({ link: link });
    }

    componentDidUpdate = prevProps => {
        if (this.props.url !== prevProps.url || this.props.response_hash !== prevProps.response_hash) {
            const link = queryString.parse(this.props.url).response_hash
                ? this.props.url
                : this.props.url + `${this.props.url.indexOf('?') !== -1 ? '&response_hash=' : '?response_hash='}${this.props.response_hash}`;
            this.setState({ link: link, shortLink: null, shareShortLink: false });
        }
    };

    generateShortLink = () => {
        this.setState({ shortLinkIsLoading: true, shortLinkIsFailed: false });
        const link = queryString.parse(this.props.url).response_hash
            ? this.props.url
            : this.props.url + `${this.props.url.indexOf('?') !== -1 ? '&response_hash=' : '?response_hash='}${this.props.response_hash}`;
        createShortLink({
            long_url: link
        })
            .catch(() => {
                this.setState({ shortLink: null, link: link, shortLinkIsLoading: false, shortLinkIsFailed: true });
            })
            .then(data => {
                const shortLink = `${window.location.protocol}//${window.location.host}${window.location.pathname.replace(
                    ROUTES.COMPARISON,
                    ''
                )}${reverse(ROUTES.COMPARISON_SHORTLINK, { shortCode: data.short_code })}`;
                this.setState({ link: shortLink, shortLink: shortLink, shortLinkIsLoading: false, shortLinkIsFailed: false });
            });
    };

    toggleShareShortLink = () => {
        if (!this.state.shareShortLink) {
            if (this.state.shortLink) {
                this.setState({ shareShortLink: true, link: this.state.shortLink });
            } else {
                this.setState({ shareShortLink: true }, () => {
                    this.generateShortLink();
                });
            }
        } else {
            const link = queryString.parse(this.props.url).response_hash
                ? this.props.url
                : this.props.url + `${this.props.url.indexOf('?') !== -1 ? '&response_hash=' : '?response_hash='}${this.props.response_hash}`;
            this.setState({ shareShortLink: false, link: link, shortLinkIsFailed: false });
        }
    };

    toggleTooltip = e => {
        if (e && e.type !== 'mouseover') {
            this.setState({ showTooltipCopiedLink: !this.state.showTooltipCopiedLink });
        }
    };

    render() {
        return (
            <Modal isOpen={this.props.showDialog} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>Publish comparison</ModalHeader>
                <ModalBody>
                    <Alert color="info">
                        A published comparison is made public to other users. The state of the comparison is saved and a persistent link is created.
                    </Alert>

                    <FormGroup>
                        <Label for="exampleUrl">
                            <Tooltip message={'Enter the title of the comparison'}>Title</Tooltip>
                        </Label>
                        <Input type="text" name="title" id="title" />
                    </FormGroup>

                    <FormGroup>
                        <Label for="exampleUrl">
                            <Tooltip message={'Describe the goal and what is being compared'}>Description</Tooltip>
                        </Label>
                        <Input type="textarea" name="description" id="description" />
                    </FormGroup>

                    <InputGroup>
                        <Input value={!this.state.shortLinkIsLoading ? this.state.link : 'Loading...'} disabled />
                        <InputGroupAddon addonType="append">
                            <CopyToClipboard
                                id="copyToClipboardLink"
                                text={!this.state.shortLinkIsLoading ? this.state.link : 'Loading...'}
                                onCopy={() => {
                                    this.setState({ showTooltipCopiedLink: true });
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                    <Icon icon={faClipboard} />
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip
                                placement="top"
                                target="copyToClipboardLink"
                                trigger={'hover'}
                                toggle={this.toggleTooltip}
                                isOpen={this.state.showTooltipCopiedLink}
                            >
                                Copied!
                            </ReactstrapTooltip>
                        </InputGroupAddon>
                    </InputGroup>

                    {/*<CustomInput
                        className="mt-1"
                        type="checkbox"
                        id={'shortLink'}
                        label="Create a persistent short link for this page."
                        onChange={() => this.toggleShareShortLink()}
                        checked={this.state.shareShortLink}
                    />*/}
                    {this.state.shortLinkIsFailed && (
                        <Alert color="light" className="mb-0 mt-1">
                            Failed to create a short link, please try again later
                        </Alert>
                    )}
                </ModalBody>
                <ModalFooter>
                    <div class="text-align-center mt-2">
                        <Button color="primary">Publish</Button>
                    </div>
                </ModalFooter>
            </Modal>
        );
    }
}

Share.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    response_hash: PropTypes.string
};

const mapStateToProps = state => ({
    //viewPaper: state.viewPaper,
});

export default connect(mapStateToProps)(Share);
