import { useState, useEffect } from 'react';
import DbpediaAbstract from 'components/ExternalDescription/DbpediaAbstract';
import WikidataDescription from 'components/ExternalDescription/WikidataDescription';
import WikipediaSummary from 'components/ExternalDescription/WikipediaSummary';
import { PREDICATES } from 'constants/graphSettings';
import { useSelector } from 'react-redux';

const REG_DPPEDIA = new RegExp(/^(https?:)?\/\/dbpedia\.org(\/resource(\?.*)?)\//);
const REG_WIKIDATA = new RegExp(/^(https?:)?\/\/(www\.)?wikidata\.org(\/entity(\?.*)?)\//);
const REG_WIKIPEDIA = new RegExp(/^(https?:)?\/\/[a-zA-Z.0-9]{0,3}\.wikipedia\.org\/wiki\/([\w%]+)/g);

const SameAsStatements = () => {
    const [externalResources, setExternalResources] = useState([]);
    const resources = useSelector(state => state.statementBrowser.resources);
    const properties = useSelector(state => state.statementBrowser.properties);
    const values = useSelector(state => state.statementBrowser.values);
    const selectedResource = useSelector(state => state.statementBrowser.selectedResource);
    const resource = useSelector(state => selectedResource && state.statementBrowser.resources.byId[selectedResource]);

    useEffect(() => {
        const getSameAsResources = () => {
            const internalSameAsIds =
                resource?.propertyIds?.length > 0
                    ? resource.propertyIds.filter(property => properties.byId[property].existingPredicateId === PREDICATES.SAME_AS)
                    : [];

            let valueIds = internalSameAsIds.length > 0 ? internalSameAsIds.map(propertyId => properties.byId[propertyId].valueIds) : [];
            valueIds = valueIds.flat();

            const _values = values ? valueIds.map(valueId => values.byId[valueId].label) : [];

            setExternalResources(_values);
        };
        getSameAsResources();
    }, [resources, properties, selectedResource, resource.propertyIds, values]);

    if (externalResources.length > 0) {
        return (
            <div className="mt-4 mb-2">
                {externalResources.map((resourceUrl, index) => {
                    if (resourceUrl.match(REG_DPPEDIA)) {
                        return (
                            <div className="list-group-item">
                                <DbpediaAbstract externalResource={resourceUrl} key={`db${index}`} />
                            </div>
                        );
                    }
                    if (resourceUrl.match(REG_WIKIDATA)) {
                        return (
                            <div className="list-group-item">
                                <WikidataDescription externalResource={resourceUrl} key={`wiki${index}`} />
                            </div>
                        );
                    }
                    if (resourceUrl.match(REG_WIKIPEDIA)) {
                        return (
                            <div className="list-group-item">
                                <WikipediaSummary externalResource={resourceUrl} key={`wiki${index}`} />
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        );
    }
    return <></>;
};

export default SameAsStatements;
