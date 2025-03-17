import { faComment } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Tooltip from 'components/FloatingUI/Tooltip';
import { isNaN } from 'lodash';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Badge } from 'reactstrap';
import { getCitationCount } from 'services/openCitations';

function OpenCitations({ doi }) {
    const [citationCount, setCitationCount] = useState(null);

    useEffect(() => {
        const getCount = async () => {
            setCitationCount(parseInt(await getCitationCount(doi), 10));
        };
        getCount();
    }, [doi]);

    return (
        typeof citationCount === 'number' &&
        !isNaN(citationCount) && (
            <Tooltip
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
                        <FontAwesomeIcon icon={faComment} /> {pluralize('citation', citationCount, true)}
                    </Badge>
                </span>
            </Tooltip>
        )
    );
}

OpenCitations.propTypes = {
    doi: PropTypes.string,
};

export default OpenCitations;
