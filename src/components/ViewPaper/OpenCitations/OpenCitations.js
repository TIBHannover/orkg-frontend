import { Badge } from 'reactstrap';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import { useEffect, useState } from 'react';
import { getCitationCount } from 'services/openCitations';
import pluralize from 'pluralize';

function OpenCitations({ doi }) {
    const [citationCount, setCitationCount] = useState(null);

    useEffect(() => {
        const getCount = async () => {
            setCitationCount(parseInt(await getCitationCount(doi), 10));
        };
        getCount();
    }, [doi]);

    return (
        typeof citationCount === 'number' && (
            <Tippy
                interactive
                content={
                    <span>
                        Citation count provided by{' '}
                        <a href="http://opencitations.net/" target="_blank" rel="noreferrer">
                            OpenCitations
                        </a>
                    </span>
                }
            >
                <span className="me-2 mb-2">
                    <Badge color="light">
                        <Icon icon={faComment} className="text-secondary" /> {pluralize('citation', citationCount, true)}
                    </Badge>
                </span>
            </Tippy>
        )
    );
}

OpenCitations.propTypes = {
    doi: PropTypes.string,
};

export default OpenCitations;
