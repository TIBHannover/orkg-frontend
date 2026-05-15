import { faComment } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import { isNaN, parseInt } from 'lodash';
import pluralize from 'pluralize';
import { FC } from 'react';
import useSWR from 'swr';

import Tooltip from '@/components/FloatingUI/Tooltip';
import { getCitationCount, openCitationsUrl } from '@/services/openCitations';

type OpenCitationsProps = {
    doi?: string;
};

const OpenCitations: FC<OpenCitationsProps> = ({ doi }) => {
    const { data: _citationCount } = useSWR(doi ? [doi, openCitationsUrl, 'getCitationCount'] : null, ([params]) => getCitationCount(params));
    const citationCount = _citationCount ? parseInt(_citationCount.toString(), 10) : undefined;
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
                <span className="mr-2 mb-2">
                    <Chip>
                        <FontAwesomeIcon icon={faComment} /> {pluralize('citation', citationCount, true)}
                    </Chip>
                </span>
            </Tooltip>
        )
    );
};

export default OpenCitations;
