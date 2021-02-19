import Tippy from '@tippyjs/react';
import { useState, useEffect } from 'react';
import { stringifyType } from 'utils';
import PropTypes from 'prop-types';

const FilterWrapper = props => {
    const { rules, disabled } = props.data;
    const [content, setContent] = useState('');

    useEffect(() => {
        if (rules.length !== 0) {
            setContent(
                rules
                    .map(
                        ({ propertyName, type, value }) => `${propertyName} ${stringifyType(type)} ${Array.isArray(value) ? value.join(', ') : value}`
                    )
                    .join(' ; ')
            );
        } else {
            setContent('No different values to filter on');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(rules), disabled]);

    return (
        <Tippy content={content} arrow={true} disabled={rules.length === 0 && !disabled}>
            <span>{props.children}</span>
        </Tippy>
    );
};

FilterWrapper.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired
};

export default FilterWrapper;
