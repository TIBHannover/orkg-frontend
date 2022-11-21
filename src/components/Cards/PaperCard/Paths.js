import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faRoute } from '@fortawesome/free-solid-svg-icons';
import { ENTITIES } from 'constants/graphSettings';
import { Fragment } from 'react';

function Paths({ paths }) {
    return (
        <>
            <ul className="list-unstyled">
                {paths.map((path, index) => (
                    <li key={index}>
                        <Icon size="sm" icon={faRoute} className="me-1" />
                        Paper &#8212;
                        {path.slice(1).map((entity, i) => (
                            <Fragment key={i}>
                                {' '}
                                {entity.label} {i !== path.length - 2 && <> &#8212;{entity._class === ENTITIES.PREDICATE && '> '}</>}{' '}
                            </Fragment>
                        ))}
                    </li>
                ))}
            </ul>
        </>
    );
}

Paths.propTypes = {
    paths: PropTypes.array,
};

export default Paths;
