import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes.js';
import { match } from 'path-to-regexp';

/* Srolls browser window to top when new page is visited,
but preserves scroll position when previous page is visited */
class ScrollToTop extends Component {
    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            const matchViewPaper = match(ROUTES.VIEW_PAPER);
            const contributionChange = matchViewPaper(this.props.location.pathname) && matchViewPaper(prevProps.location.pathname);

            // don't scroll to top when only the contribution changes on the view paper page
            if (!contributionChange) {
                window.scrollTo(0, 0);
            }
        }
    }

    render() {
        return this.props.children;
    }
}

ScrollToTop.propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.node.isRequired
};

export default withRouter(ScrollToTop);
