import PropTypes from 'prop-types';
import { components } from 'react-select';

const Menu = ({ children, ...innerProps }) => (
    <components.Menu {...innerProps}>
        <div>{children}</div>
        {innerProps?.selectProps?.performSemanticScholarLookup && (
            <>
                <hr className="my-1" />
                <div className="text-end mb-2 me-2">
                    Search supported by{' '}
                    <a href="https://www.semanticscholar.org/" target="_blank" rel="noreferrer">
                        Semantic Scholar
                    </a>
                </div>
            </>
        )}
    </components.Menu>
);

Menu.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Menu;
