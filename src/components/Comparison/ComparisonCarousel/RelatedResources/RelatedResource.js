import REGEX from 'constants/regex';
import PropTypes from 'prop-types';
import { Card, CardBody, CardText, CardTitle } from 'reactstrap';

const RelatedResource = ({ url = '', title = '', description = '' }) => {
    const isLink = new RegExp(REGEX.URL).test(url);

    return (
        <div className="w-100 mx-1">
            {isLink ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <Card>
                        <CardBody style={{ height: '120px' }}>
                            {title && <CardTitle>{title}</CardTitle>}
                            {description && <CardText>{description}</CardText>}
                        </CardBody>
                    </Card>
                </a>
            ) : (
                url
            )}
        </div>
    );
};

RelatedResource.propTypes = {
    url: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
};

export default RelatedResource;
