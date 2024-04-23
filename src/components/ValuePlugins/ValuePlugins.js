import Boolean from 'components/ValuePlugins/Boolean/Boolean';
import Code from 'components/ValuePlugins/Code/Code';
import Doi from 'components/ValuePlugins/Doi/Doi';
import ImageAsFigure from 'components/ValuePlugins/Images/ImagesAsFigures';
import MathJax from 'components/ValuePlugins/MathJax/MathJax';
import Link from 'components/ValuePlugins/Link/Link';
import Video from 'components/ValuePlugins/Video/Video';
import { ENTITIES } from 'constants/graphSettings';
import PropTypes from 'prop-types';

const ValuePlugins = ({ options = {}, type, children }) => (
    <Boolean>
        <MathJax type={type}>
            <Doi type={type}>
                <Video type={type} options={options}>
                    <Code type={type}>
                        <ImageAsFigure type={type} options={options}>
                            <Link type={type}>{children}</Link>
                        </ImageAsFigure>
                    </Code>
                </Video>
            </Doi>
        </MathJax>
    </Boolean>
);

ValuePlugins.propTypes = {
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.node]).isRequired,
    type: PropTypes.oneOf([ENTITIES.RESOURCE, ENTITIES.LITERAL]),
    options: PropTypes.object,
};

export default ValuePlugins;
