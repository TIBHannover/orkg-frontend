import React, { Component } from 'react';
import { Modal, ModalHeader, ModalBody, Input, InputGroup, InputGroupAddon, Button, Tooltip as ReactstrapTooltip, Alert } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import queryString from 'query-string';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { createShortLink, getComparison } from 'network';
import { getContributionIdsFromUrl } from 'utils';

class Share extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showTooltipCopiedLink: false,
            shortLink: null,
            shortLinkIsLoading: false,
            shortLinkIsFailed: false
        };
    }

    componentDidMount() {
        if (this.props.showDialog) {
            this.generateShortLink();
        }
    }

    componentDidUpdate = prevProps => {
        if (
            (this.props.url !== prevProps.url && this.props.showDialog) ||
            (!this.state.shortLinkIsLoading && this.props.showDialog && !this.state.shortLink)
        ) {
            this.generateShortLink();
        }
    };

    generateShortLink = () => {
        this.setState({ shortLinkIsLoading: true, shortLinkIsFailed: false });
        const contributionIds = getContributionIdsFromUrl(this.props.url.substring(this.props.url.indexOf('?')));
        getComparison({ contributionIds: contributionIds, save_response: true }).then(comparisonData => {
            const link =
                queryString.parse(this.props.url).response_hash || this.props.comparisonId
                    ? this.props.url
                    : this.props.url + `${this.props.url.indexOf('?') !== -1 ? '&response_hash=' : '?response_hash='}${comparisonData.response_hash}`;
            createShortLink({
                long_url: link
            })
                .catch(() => {
                    this.setState({ shortLink: link, shortLinkIsLoading: false, shortLinkIsFailed: true });
                })
                .then(data => {
                    const shortLink = `${window.location.protocol}//${window.location.host}${window.location.pathname
                        .replace(reverse(ROUTES.COMPARISON, { comparisonId: this.props.comparisonId }), '')
                        .replace(/\/$/, '')}${reverse(ROUTES.COMPARISON_SHORTLINK, { shortCode: data.short_code })}`;
                    this.setState({ shortLink: shortLink, shortLinkIsLoading: false, shortLinkIsFailed: false });
                });
        });
    };

    toggleTooltip = e => {
        if (e && e.type !== 'mouseover') {
            this.setState({ showTooltipCopiedLink: !this.state.showTooltipCopiedLink });
        }
    };

    render() {
        return (
            <Modal isOpen={this.props.showDialog} toggle={this.props.toggle}>
                <ModalHeader toggle={this.props.toggle}>Share link</ModalHeader>
                <ModalBody>
                    <p>The created comparison can be shared using the following link: </p>

                    <InputGroup>
                        <Input value={!this.state.shortLinkIsLoading ? this.state.shortLink : 'Loading share link...'} disabled />
                        <InputGroupAddon addonType="append">
                            <CopyToClipboard
                                id="copyToClipboardLink"
                                text={!this.state.shortLinkIsLoading ? this.state.shortLink : 'Loading share link...'}
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

                    {this.state.shortLinkIsFailed && (
                        <Alert color="light" className="mb-0 mt-1">
                            Failed to create a short link, please try again later
                        </Alert>
                    )}
                </ModalBody>
            </Modal>
        );
    }
}

Share.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    response_hash: PropTypes.string,
    comparisonId: PropTypes.string,
    locationSearch: PropTypes.string
};

const mapStateToProps = state => ({
    //viewPaper: state.viewPaper,
});

export default connect(mapStateToProps)(Share);
