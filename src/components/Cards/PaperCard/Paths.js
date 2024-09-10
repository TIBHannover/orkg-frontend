import Link from 'next/link';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import { faRoute, faAnglesRight, faChevronCircleUp, faChevronCircleDown } from '@fortawesome/free-solid-svg-icons';
import { ENTITIES } from 'constants/graphSettings';
import { Fragment, useState } from 'react';
import { getLinkByEntityType } from 'utils';
import styled from 'styled-components';

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

function Paths({ paths }) {
    const [data, setData] = useState(paths?.slice(0, MAX_ITEMS));
    const [isExpanded, setIsExpanded] = useState(false);

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
            <ul className="list-unstyled">
                {data.map((path, index) => (
                    <li key={`${index}-${data.length}`}>
                        <Icon size="sm" icon={faRoute} className="me-1" />
                        Path: Paper <Icon icon={faAnglesRight} />
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
                                {i !== path.length - 2 && <Icon icon={faAnglesRight} className="mx-1" />}
                            </Fragment>
                        ))}
                        {index + 1 < data.length && <hr className="my-1" />}
                    </li>
                ))}
            </ul>
            {paths?.length > MAX_ITEMS && (
                <Button color="secondary" outline size="sm" className="mt-1 border-0" onClick={toggleExpand}>
                    {isExpanded ? 'Hide more' : `Show ${paths.length - MAX_ITEMS} more`}{' '}
                    <Icon icon={isExpanded ? faChevronCircleUp : faChevronCircleDown} />
                </Button>
            )}
        </StyledPaths>
    );
}

Paths.propTypes = {
    paths: PropTypes.array,
};

export default Paths;
