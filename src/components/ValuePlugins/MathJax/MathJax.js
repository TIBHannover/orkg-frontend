import { Component } from 'react';
import PropTypes from 'prop-types';
import Latex from '../Latex/Latex';
import AsciiMath from '../AsciiMath/AsciiMath';

/* This component works in similar way as ValuePlugins but only for MathJax */
class MathJax extends Component {
    render() {
        return (
            <Latex type={this.props.type}>
                <AsciiMath type={this.props.type}>{this.props.children}</AsciiMath>
            </Latex>
        );
    }
}

MathJax.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]).isRequired,
    type: PropTypes.oneOf(['resource', 'literal']),
    options: PropTypes.object.isRequired
};

MathJax.defaultProps = {
    options: {}
};

export default MathJax;
