import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import ROUTES from 'constants/routes.js';
import { match } from 'path-to-regexp';

/* Scrolls browser window to top when new page is visited,
but preserves scroll position when previous page is visited */
class ScrollToTop extends Component {
    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            const excludePages = [ROUTES.VIEW_PAPER, ROUTES.FEATURED_COMPARISONS, ROUTES.REVIEW, ROUTES.LITERATURE_LIST];
            let preventScrollTop = false;

            for (const page of excludePages) {
                const matchPage = match(page);
                if (matchPage(this.props.location.pathname) && matchPage(prevProps.location.pathname)) {
                    preventScrollTop = true;
                    break;
                }
            }
            if (!preventScrollTop) {
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
