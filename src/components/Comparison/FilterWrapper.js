import Tippy from '@tippyjs/react';
import React from 'react';
import PropTypes from 'prop-types';

const FilterWrapper = props => {
    const { rules, stringifyType } = props.data;
    return (
        <Tippy
            content={rules
                .map(({ propertyName, type, value }) => `${propertyName} ${stringifyType(type)} ${Array.isArray(value) ? value.join(', ') : value}`)
                .join(' ; ')}
            arrow={true}
            disabled={rules.length === 0}
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
