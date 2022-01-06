import PropTypes from 'prop-types';
import React from 'react';
import { components } from 'react-select';

const Menu = ({ children, ...innerProps }) => {
    return (
        <components.Menu {...innerProps}>
            <div>{children}</div>
            <hr className="my-1" />
            <div className="text-end mb-2 me-2">
                Search supported by{' '}
                <a href="https://www.semanticscholar.org/" target="_blank" rel="noreferrer">
                    Semantic Scholar
                </a>
            </div>
        </components.Menu>
    );
};

Menu.propTypes = {
    children: PropTypes.node.isRequired
};

export default Menu;
