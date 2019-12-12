import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

/* Srolls browser window to top when new page is visited,
but preserves scroll position when previous page is visited */
class ScrollToTop extends Component {
    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) {
            window.scrollTo(0, 0);
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
