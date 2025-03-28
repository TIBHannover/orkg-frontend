import { faAnglesRight, faChevronCircleDown, faChevronCircleUp, faRoute } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { FC, Fragment, useState } from 'react';
import { Button } from 'reactstrap';
import styled from 'styled-components';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import { ENTITIES } from '@/constants/graphSettings';
import { Resource } from '@/services/backend/types';
import { getLinkByEntityType } from '@/utils';

const StyledPaths = styled.div`
    & .typeCircle {
        width: 18px;
        height: 18px;
        line-height: 15px;
        text-align: center;
        color: white;
        display: inline-block;
        border: 1px ${(props) => props.theme.secondaryDarker} solid;
        border-radius: 100%;
        font-size: 9px;
        font-weight: bold;
        background: ${(props) => props.theme.secondary};
    }

    & a:hover .typeCircle {
        background: ${(props) => props.theme.primary};
    }
`;

const MAX_ITEMS = 3;

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
        <StyledPaths>
            <ul className="list-unstyled d-flex flex-column justify-content-center align-items-center">
                {data.map((path, index) => (
                    <li key={`${index}-${data.length}`}>
                        <FontAwesomeIcon size="sm" icon={faRoute} className="me-1 " />
                        Path: Paper <FontAwesomeIcon icon={faAnglesRight} className="me-1" />
                        {path.slice(1).map((entity, i) => (
                            <Fragment key={i}>
                                <DescriptionTooltip classes={entity.classes} id={entity.id} _class={entity._class}>
                                    <Link
                                        href={getLinkByEntityType(entity._class, entity.id)}
                                        className={entity._class === ENTITIES.PREDICATE ? 'position-relative ps-1' : 'position-relative'}
                                    >
                                        {entity._class === ENTITIES.PREDICATE && <div className="typeCircle position-absolute">P</div>}
                                        <div className={entity._class === ENTITIES.PREDICATE ? 'd-inline-block ms-4' : 'd-inline-block'}>
                                            {entity.label}
                                        </div>
                                    </Link>
                                </DescriptionTooltip>
                                {i !== path.length - 2 && <FontAwesomeIcon icon={faAnglesRight} className="mx-1" />}
                            </Fragment>
                        ))}
                        {index + 1 < data.length && <hr className="my-1" />}
                    </li>
                ))}
            </ul>
            {paths.length > MAX_ITEMS && (
                <Button color="secondary" outline size="sm" className="mt-1 border-0" onClick={toggleExpand}>
                    {isExpanded ? 'Hide more' : `Show ${paths.length - MAX_ITEMS} more`}{' '}
                    <FontAwesomeIcon icon={isExpanded ? faChevronCircleUp : faChevronCircleDown} />
                </Button>
            )}
        </StyledPaths>
    );
};

export default Paths;
