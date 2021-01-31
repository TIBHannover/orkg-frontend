import Tippy from '@tippy.js/react';
import React from 'react';
import PropTypes from 'prop-types';

const FilterWrapper = props => {
    const { rules, strignifyType } = props.data;
    return (
        <Tippy
            content={rules
                .map(({ propertyName, type, value }) => `${propertyName} ${strignifyType(type)} ${Array.isArray(value) ? value.join(', ') : value}`)
                .join(' ; ')}
            arrow={true}
            enabled={rules.length > 0}
        >
            <span>{props.children}</span>
        </Tippy>
    );
};

FilterWrapper.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired
};

export default FilterWrapper;
