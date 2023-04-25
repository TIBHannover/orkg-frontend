import AsciiMath from 'components/ValuePlugins/AsciiMath/AsciiMath';
import Boolean from 'components/ValuePlugins/Boolean/Boolean';
import Code from 'components/ValuePlugins/Code/Code';
import Doi from 'components/ValuePlugins/Doi/Doi';
import ImageAsFigure from 'components/ValuePlugins/Images/ImagesAsFigures';
import Latex from 'components/ValuePlugins/Latex/Latex';
import Link from 'components/ValuePlugins/Link/Link';
import Video from 'components/ValuePlugins/Video/Video';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

const ValuePlugins = props => (
    // Link exclude videos and images pattern
    <Boolean>
        <Latex type={props.type}>
            <AsciiMath type={props.type}>
                <Doi type={props.type}>
                    <Video type={props.type} options={props.options}>
                        <Code type={props.type}>
                            <ImageAsFigure type={props.type} options={props.options}>
                                <Link type={props.type}>{props.children}</Link>
                            </ImageAsFigure>
                        </Code>
                    </Video>
                </Doi>
            </AsciiMath>
        </Latex>
    </Boolean>
);

ValuePlugins.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
    options: PropTypes.object.isRequired,
};

ValuePlugins.defaultProps = {
    options: {},
};

export default ValuePlugins;
