import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { isString } from 'lodash';

export function RendererComponent(props) {
    const cachedLabels = useSelector(state => state.pdfAnnotation.cachedLabels);
    let { value } = props;

    // properties
    if (props.row === 0) {
        if (value && isString(value) && value.startsWith('orkg:')) {
            value = value.replace(/^(orkg:)/, '');
            const label = cachedLabels[value];
            return <strong>{label}</strong>;
        }
        return (
            <div style={{ color: 'grey', fontStyle: 'italic', background: '#e6e6e6' }}>
                <Icon icon={faExclamationTriangle} /> {value}
            </div>
        );
    }

    // resources
    if (value && isString(value) && value.startsWith('orkg:')) {
        value = value.replace(/^(orkg:)/, '');
        const label = cachedLabels[value];
        return <span className="text-primary">{label}</span>;
    }

    return <>{value}</>;
}

RendererComponent.propTypes = {
    value: PropTypes.string.isRequired,
    row: PropTypes.number.isRequired
};
