import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

import { stringifyType } from '@/components/Comparison/Filters/helpers';
import Tooltip from '@/components/FloatingUI/Tooltip';

const FilterWrapper = (props) => {
    const { rules, disabled } = props.data;
    const [content, setContent] = useState('');

    useEffect(() => {
        if (rules.length !== 0) {
            setContent(
                rules
                    .map(
                        ({ propertyName, type, value }) =>
                            `${propertyName} ${stringifyType(type)} ${Array.isArray(value) ? value.join(', ') : value}`,
                    )
                    .join(' ; '),
            );
        } else {
            setContent('No different values to filter on');
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(rules), disabled]);

    return (
        <Tooltip content={content} disabled={rules.length === 0 && !disabled}>
            <span>{props.children}</span>
        </Tooltip>
    );
};

FilterWrapper.propTypes = {
    data: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
};

export default FilterWrapper;
