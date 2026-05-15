import { faArrowRight, faExternalLink, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@heroui/react';
import pluralize from 'pluralize';
import { useEffect, useState } from 'react';
import { useHash } from 'react-use';

import BadgeTag from '@/components/DataBrowser/components/Header/Metadata/BadgeTag';
import Classes from '@/components/DataBrowser/components/Header/Metadata/Classes';
import Label from '@/components/DataBrowser/components/Header/Metadata/Label';
import Templates from '@/components/DataBrowser/components/Header/Metadata/Templates';
import useEntity from '@/components/DataBrowser/hooks/useEntity';
import { ENTITIES } from '@/constants/graphSettings';

const Metadata = () => {
    const { entity } = useEntity();
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [hash] = useHash();

    useEffect(() => {
        if (hash === `#${entity?.id}`) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsHighlighted(true);
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
    }, [entity?.id, hash]);

    return (
        <div
            id={entity?.id}
            className={cn(
                'py-4 px-4 border-b border-zinc-200',
                isHighlighted && 'bg-accent animate-[blinkAnimation_0.7s_3] [&_a.text-accent]:!text-white',
            )}
            onAnimationEnd={() => setIsHighlighted(false)}
        >
            <Label />
            <div className="flex flex-wrap">
                <Classes />
                <Templates />
                {entity && 'shared' in entity && entity.shared > 1 && (
                    <BadgeTag>
                        <FontAwesomeIcon icon={faArrowRight} className="mr-1" /> {`Referred: ${pluralize('time', entity.shared, true)}`}
                    </BadgeTag>
                )}
                {entity && entity._class === ENTITIES.CLASS && 'uri' in entity && entity.uri !== null && (
                    <BadgeTag>
                        <FontAwesomeIcon icon={faHashtag} className="mr-1" />
                        URI:{' '}
                        <a href={entity.uri} target="_blank" rel="noopener noreferrer" className="ml-1">
                            {entity.uri} <FontAwesomeIcon icon={faExternalLink} className="mr-1" />
                        </a>
                    </BadgeTag>
                )}
            </div>
        </div>
    );
};

export default Metadata;
