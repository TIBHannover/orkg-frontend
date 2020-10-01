import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Input, InputGroup, InputGroupAddon, Button, Alert } from 'reactstrap';
import PropTypes from 'prop-types';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faClipboard } from '@fortawesome/free-regular-svg-icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { createShortLink, getComparison } from 'network';
import { toast } from 'react-toastify';

function Share(props) {
    const [shortLinkIsLoading, setShortLinkIsLoading] = useState(false);
    const [shortLinkIsFailed, setShortLinkIsFailed] = useState(false);

    const generateShortLink = async () => {
        setShortLinkIsLoading(true);
        setShortLinkIsFailed(false);
        if (props.comparisonId && props.responseHash) {
            props.setShortLink(`${props.publicURL}${reverse(ROUTES.COMPARISON, { comparisonId: props.comparisonId })}`);
            setShortLinkIsLoading(false);
            setShortLinkIsFailed(false);
        } else {
            let link = ``;
            if (!props.responseHash) {
                const saveComparison = await getComparison({
                    contributionIds: props.contributionsList,
                    type: props.comparisonType,
                    save_response: true
                });
                link = `${props.publicURL}${reverse(ROUTES.COMPARISON)}${props.comparisonURLConfig}&response_hash=${saveComparison.response_hash}`;
                props.setResponseHash(saveComparison.response_hash);
            } else {
                link = `${props.publicURL}${reverse(ROUTES.COMPARISON)}${props.comparisonURLConfig}`;
            }
            createShortLink({
                long_url: link
            })
                .then(data => {
                    const shortLink = `${props.publicURL}${reverse(ROUTES.COMPARISON_SHORTLINK, { shortCode: data.short_code })}`;
                    props.setShortLink(shortLink);
                    setShortLinkIsLoading(false);
                    setShortLinkIsFailed(false);
                })
                .catch(() => {
                    setShortLinkIsLoading(false);
                    setShortLinkIsFailed(true);
                    props.setShortLink(link);
                });
        }
    };

    return (
        <Modal
            onOpened={() => {
                if (!props.shortLink) {
                    generateShortLink();
                }
            }}
            isOpen={props.showDialog}
            toggle={props.toggle}
        >
            <ModalHeader toggle={props.toggle}>Share link</ModalHeader>
            <ModalBody>
                <p>The created comparison can be shared using the following link: </p>

                <InputGroup>
                    <Input value={!shortLinkIsLoading ? props.shortLink : 'Loading share link...'} disabled />
                    <InputGroupAddon addonType="append">
                        <CopyToClipboard
                            text={!shortLinkIsLoading ? props.shortLink : 'Loading share link...'}
                            onCopy={() => {
                                toast.success('Share link copied!');
                            }}
                        >
                            <Button color="primary" className="pl-3 pr-3" style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                                <Icon icon={faClipboard} />
                            </Button>
                        </CopyToClipboard>
                    </InputGroupAddon>
                </InputGroup>

                {shortLinkIsFailed && (
                    <Alert color="light" className="mb-0 mt-1">
                        Failed to create a short link, please try again later
                    </Alert>
                )}
            </ModalBody>
        </Modal>
    );
}

Share.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    comparisonType: PropTypes.string,
    comparisonURLConfig: PropTypes.string.isRequired,
    publicURL: PropTypes.string.isRequired,
    responseHash: PropTypes.string,
    comparisonId: PropTypes.string,
    contributionsList: PropTypes.array,
    setResponseHash: PropTypes.func.isRequired,
    shortLink: PropTypes.string.isRequired,
    setShortLink: PropTypes.func.isRequired
};

export default Share;
