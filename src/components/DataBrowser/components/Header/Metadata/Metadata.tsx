import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
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
import UriLink from '@/components/UriLink/UriLink';

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
                'py-4 px-4 border-b border-border',
                isHighlighted && 'bg-accent animate-[blinkAnimation_0.7s_3] [&_a.text-accent]:text-white!',
            )}
            onAnimationEnd={() => setIsHighlighted(false)}
        >
            <Label />
            <div className="flex flex-wrap">
                <Classes />
                <Templates />
                {entity && 'uri' in entity && entity.uri && entity.uri !== 'null' && (
                    <BadgeTag>
                        <UriLink uri={entity.uri} className="ml-1" />
                    </BadgeTag>
                )}
                {entity && 'shared' in entity && entity.shared > 1 && (
                    <BadgeTag>
                        <FontAwesomeIcon icon={faArrowRight} className="mr-1" /> {`Referred: ${pluralize('time', entity.shared, true)}`}
                    </BadgeTag>
                )}
            </div>
        </div>
    );
};

export default Metadata;
