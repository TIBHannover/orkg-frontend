import React from 'react';
import { components } from 'react-select';
import PropTypes from 'prop-types';

const PaperOption = ({ children, ...innerProps }) => {
    const firstAuthor = innerProps?.data?.authors?.[0]?.name;
    const shouldShowEtAl = innerProps?.data?.authors?.length > 1;

    return (
        <components.Option {...innerProps}>
            <div className="d-flex">
                <div className="text-truncate">{children}</div>
                {firstAuthor && (
                    <div className="text-muted fst-italic flex-shrink-0 ms-2">
                        {firstAuthor} {shouldShowEtAl && 'et al.'} {innerProps?.data?.year}
                    </div>
                )}
            </div>
        </components.Option>
    );
};

PaperOption.propTypes = {
    children: PropTypes.node.isRequired
};

export default PaperOption;
