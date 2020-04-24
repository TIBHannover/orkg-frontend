import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { getStatementsBySubject } from 'network';
import { Card, CardImg, CardText, CardBody, CardTitle, Button, CardColumns } from 'reactstrap';

class RelatedResources extends Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line no-useless-escape
        this.urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gi;

        this.state = {
            relatedResources: []
        };
    }

    componentDidMount() {
        this.loadResources();
    }

    componentDidUpdate(prevProps) {
        if (this.props.resourcesStatements !== prevProps.resourcesStatements) {
            this.loadResources();
        }
    }

    // Support for related resources in two different formats:
    // 1) Comparison -[RelatedResource]-> "Literal url"
    // 1) Comparison -[RelatedResource]-> Resource
    //    Resource -[Url]-> "Literal url"
    //    Resource -[Image]-> "Literal, base64 encoded image"
    loadResources = async () => {
        if (this.props.resourcesStatements.length > 0) {
            const relatedResources = [];

            for (const resource of this.props.resourcesStatements) {
                if (resource.object._class === 'literal') {
                    relatedResources.push({
                        url: resource.object.label
                    });
                } else {
                    await getStatementsBySubject({ id: resource.object.id }).then(statements => {
                        const imageStatement = statements.find(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_IMAGE);
                        const urlStatement = statements.find(statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_URL);
                        const descriptionStatement = statements.find(
                            statement => statement.predicate.id === process.env.REACT_APP_PREDICATES_DESCRIPTION
                        );

                        relatedResources.push({
                            url: urlStatement ? urlStatement.object.label : '',
                            image: imageStatement ? imageStatement.object.label : '',
                            title: resource.object.label,
                            description: descriptionStatement ? descriptionStatement.object.label : ''
                        });
                    });
                }
            }

            this.setState(prevState => ({
                relatedResources: [...prevState.relatedResources, ...relatedResources]
            }));
        }
    };

    render() {
        return (
            this.state.relatedResources.length > 0 && (
                <>
                    <h3 className="mt-5 h5">Related resources</h3>
                    <CardColumns>
                        {this.state.relatedResources.map((resource, index) => {
                            const isLink = new RegExp(this.urlRegex).test(resource.url);

                            return (
                                <Card key={`rr${index}`}>
                                    {resource.image && <CardImg top width="100%" src={resource.image ? resource.image : ''} alt="Card image cap" />}
                                    <CardBody>
                                        {resource.title && <CardTitle>{resource.title}</CardTitle>}
                                        {resource.description && <CardText>{resource.description}</CardText>}
                                        {isLink ? (
                                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" color="darkblue">
                                                    Visit resource
                                                </Button>
                                            </a>
                                        ) : (
                                            resource.url
                                        )}
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </CardColumns>
                </>
            )
        );
    }
}

RelatedResources.propTypes = {
    resourcesStatements: PropTypes.array.isRequired
};

export default RelatedResources;
