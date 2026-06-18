import { faAnglesRight, faChevronCircleDown, faChevronCircleUp, faRoute } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import Link from 'next/link';
import { FC, Fragment, useState } from 'react';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import { Resource } from '@/services/backend/types';
import { getLinkByEntityType } from '@/utils';

const MAX_ITEMS = 3;

const TYPE_CIRCLE_CLASS =
    'inline-block size-[18px] rounded-full border border-secondary-darker bg-secondary text-center text-[9px] font-bold leading-[15px] text-white group-hover:bg-accent';

type PathsProps = {
    paths: Resource[][];
};

const Paths: FC<PathsProps> = ({ paths }) => {
    const [data, setData] = useState<Resource[][]>(paths.slice(0, MAX_ITEMS));
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const toggleExpand = () => {
        if (isExpanded) {
            setData(paths?.slice(0, MAX_ITEMS));
            setIsExpanded(false);
        } else {
            setData([...paths]);
            setIsExpanded(true);
        }
    };

    return (
        <div>
            <ul className="list-unstyled">
                {data.map((path, index) => (
                    <li key={`${index}-${data.length}`}>
                        <FontAwesomeIcon size="sm" icon={faRoute} className="mr-1 text-muted" />
                        Path: Paper <FontAwesomeIcon icon={faAnglesRight} className="mr-1 text-muted" />
                        {path.slice(1).map((entity, i) => (
                            <Fragment key={i}>
                                <DescriptionTooltip classes={entity.classes} id={entity.id} _class={entity._class}>
                                    <Link
                                        href={getLinkByEntityType(entity._class, entity.id)}
                                        className={`group ${entity._class === ENTITIES.PREDICATE ? 'relative pl-1' : 'relative'}`}
                                    >
                                        {entity._class === ENTITIES.PREDICATE && <div className={`absolute ${TYPE_CIRCLE_CLASS}`}>P</div>}
                                        <div className={entity._class === ENTITIES.PREDICATE ? 'ml-6 inline-block' : 'inline-block'}>
                                            {entity.label}
                                        </div>
                                    </Link>
                                </DescriptionTooltip>
                                {i !== path.length - 2 && <FontAwesomeIcon icon={faAnglesRight} className="mx-1 text-muted" />}
                            </Fragment>
                        ))}
                        {index + 1 < data.length && <hr className="my-1" />}
                    </li>
                ))}
            </ul>
            {paths.length > MAX_ITEMS && (
                <Button variant="ghost" size="sm" className="mt-1 border-0" onPress={toggleExpand}>
                    {isExpanded ? 'Show less' : `Show ${paths.length - MAX_ITEMS} more`}{' '}
                    <FontAwesomeIcon icon={isExpanded ? faChevronCircleUp : faChevronCircleDown} />
                </Button>
            )}
        </div>
    );
};

export default Paths;
