import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getStatementsBySubjects } from 'services/backend/statements';
import { Card, CardImg, CardText, CardBody, CardTitle, Button, CardColumns } from 'reactstrap';
import { getRelatedResourcesData } from 'utils';
import { ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';

function RelatedResources() {
    const isLoadingMetadata = useSelector(state => state.comparison.isLoadingMetadata);
    const isFailedLoadingMetadata = useSelector(state => state.comparison.isFailedLoadingMetadata);
    const resources = useSelector(state => state.comparison.comparisonResource.resources);
    const [relatedResources, setRelatedResources] = useState([]);

    // Support for related resources in two different formats:
    // 1) Comparison -[RelatedResource]-> "Literal url"
    // 1) Comparison -[RelatedResource]-> Resource
    //    Resource -[Url]-> "Literal url"
    //    Resource -[Image]-> "Literal, base64 encoded image"
    const loadResources = useCallback(() => {
        if (resources.length > 0) {
            const literalRelatedResources = resources
                .filter(r => r._class === ENTITIES.LITERAL)
                .map(resource => ({
                    url: resource.label,
                }));
            if (literalRelatedResources.length !== resources.length) {
                getStatementsBySubjects({
                    ids: resources.filter(r => r._class !== ENTITIES.LITERAL).map(r => r.id),
                }).then(resourcesStatements => {
                    setRelatedResources([...literalRelatedResources, ...getRelatedResourcesData(resourcesStatements)]);
                });
            } else {
                setRelatedResources(literalRelatedResources);
            }
        }
    }, [resources]);

    useEffect(() => {
        loadResources();
    }, [loadResources]);

    return (
        <div>
            {!isLoadingMetadata && !isFailedLoadingMetadata && resources?.length > 0 && (
                <>
                    <h5 className="mt-5">Related resources</h5>
                    <CardColumns className="d-flex row">
                        {relatedResources.map((resource, index) => {
                            const isLink = new RegExp(REGEX.URL).test(resource.url);
                            return (
                                <div className="col-sm-3" key={`rr${index}`}>
                                    <Card>
                                        {resource.image && <CardImg top width="100%" src={resource.image ?? ''} alt="Related resource image" />}
                                        <CardBody>
                                            {resource.title && <CardTitle>{resource.title}</CardTitle>}
                                            {resource.description && <CardText>{resource.description}</CardText>}
                                            {isLink ? (
                                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                    <Button size="sm" color="secondary">
                                                        Visit resource
                                                    </Button>
                                                </a>
                                            ) : (
                                                resource.url
                                            )}
                                        </CardBody>
                                    </Card>
                                </div>
                            );
                        })}
                    </CardColumns>
                </>
            )}
        </div>
    );
}

export default RelatedResources;
