import React from 'react';
import PropTypes from 'prop-types';

const RelatedResources = props => {
    // eslint-disable-next-line no-useless-escape
    const urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gi;

    return (
        props.resources.length > 0 && (
            <>
                <h3 className="mt-5 h5">Related resources</h3>
                <ul>
                    {props.resources.map(resource => {
                        const isLink = new RegExp(urlRegex).test(resource);

                        return (
                            <li key={resource}>
                                {isLink ? (
                                    <a href={resource} target="_blank" rel="noopener noreferrer">
                                        {resource}
                                    </a>
                                ) : (
                                    resource
                                )}
                            </li>
                        );
                    })}
                </ul>
            </>
        )
    );
};

RelatedResources.propTypes = {
    resources: PropTypes.array.isRequired
};

export default RelatedResources;
