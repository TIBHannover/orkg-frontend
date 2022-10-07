import { Component } from 'react';
import PropTypes from 'prop-types';
import { ENTITIES } from 'constants/graphSettings';
import Boolean from './Boolean/Boolean';
import Link from './Link/Link';
import Latex from './Latex/Latex';
import AsciiMath from './AsciiMath/AsciiMath';
import Video from './Video/Video';
import Doi from './Doi/Doi';
import ImageAsFigure from './Images/ImagesAsFiguers';

class ValuePlugins extends Component {
    render() {
        // Link exclude videos and images pattern
        return (
            <Boolean>
                <Latex type={this.props.type}>
                    <AsciiMath type={this.props.type}>
                        <Doi type={this.props.type}>
                            <Video type={this.props.type} options={this.props.options}>
                                <ImageAsFigure type={this.props.type} options={this.props.options}>
                                    <Link type={this.props.type}>{this.props.children}</Link>
                                </ImageAsFigure>
                            </Video>
                        </Doi>
                    </AsciiMath>
                </Latex>
            </Boolean>
        );
    }
}

ValuePlugins.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
    options: PropTypes.object.isRequired,
};

ValuePlugins.defaultProps = {
    options: {},
};

export default ValuePlugins;
