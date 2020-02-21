import React from 'react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter } from '@fortawesome/free-brands-svg-icons';
import PropTypes from 'prop-types';

const SharePaper = ({ title }) => (
    <div className={'mb-4 text-right'}>
        <small>Share this paper:</small>
        <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.protocol}//${window.location.host}${window.location.pathname}`}
            target="_blank"
            className={'text-secondary'}
            title={'Share this paper on Facebook'}
            rel="noopener noreferrer"
        >
            <Icon icon={faFacebook} className={'icon ml-2 mr-2'} />
        </a>
        <a
            href={`https://twitter.com/share?url=${window.location.protocol}//${window.location.host}${window.location.pathname}&via=orkg_org&text=${title}`}
            target="_blank"
            className={'text-secondary'}
            title={'Share this paper on Twitter'}
            rel="noopener noreferrer"
        >
            <Icon icon={faTwitter} />
        </a>
    </div>
);

SharePaper.propTypes = {
    title: PropTypes.string.isRequired
};

export default SharePaper;
