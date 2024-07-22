import DbpediaAbstract from 'components/ExternalDescription/DbpediaAbstract';
import GeonameDescription from 'components/ExternalDescription/GeonameDescription';
import WikidataDescription from 'components/ExternalDescription/WikidataDescription';
import WikipediaSummary from 'components/ExternalDescription/WikipediaSummary';
import { PREDICATES } from 'constants/graphSettings';
import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const REG_DPPEDIA = new RegExp(/^(https?:)?\/\/dbpedia\.org(\/resource(\?.*)?)\//);
const REG_WIKIDATA = new RegExp(/^(https?:)?\/\/(www\.)?wikidata\.org(\/entity(\?.*)?)\//);
const REG_WIKIPEDIA = new RegExp(/^(https?:)?\/\/[a-zA-Z.0-9]{0,3}\.wikipedia\.org\/wiki\/([\w%]+)/g);
const REG_GEONAME = new RegExp(/^https:\/\/sws\.geonames\.org\/\d+\//g);

const SameAsStatements: FC = () => {
    const [externalResources, setExternalResources] = useState<string[]>([]);

    const resources = useSelector((state: any) => state.statementBrowser.resources);
    const properties = useSelector((state: any) => state.statementBrowser.properties);
    const values = useSelector((state: any) => state.statementBrowser.values);
    const selectedResource = useSelector((state: any) => state.statementBrowser.selectedResource);
    const resource = useSelector((state: any) => (selectedResource ? state.statementBrowser.resources.byId[selectedResource] : null));
    useEffect(() => {
        const getSameAsResources = () => {
            const internalSameAsIds: string[] =
                resource && resource.propertyIds?.length > 0
                    ? resource.propertyIds.filter((property: string) => properties.byId[property].existingPredicateId === PREDICATES.SAME_AS)
                    : [];

            const valueIds: string[] =
                internalSameAsIds.length > 0 ? internalSameAsIds.flatMap((propertyId: string) => properties.byId[propertyId].valueIds) : [];
            const _values: string[] = values ? valueIds.map((valueId: string) => values.byId[valueId].label) : [];
            setExternalResources(_values);
        };
        getSameAsResources();
    }, [resources, properties, selectedResource, resource?.propertyIds, values]);

    if (externalResources.length > 0) {
        return (
            <div className="mt-4 mb-2">
                {externalResources.map((resourceUrl: string, index: number) => {
                    if (resourceUrl.match(REG_DPPEDIA)) {
                        return (
                            <div className="list-group-item mb-3" key={`db${index}`}>
                                <DbpediaAbstract externalResource={resourceUrl} />
                            </div>
                        );
                    }
                    if (resourceUrl.match(REG_WIKIDATA)) {
                        return (
                            <div className="border rounded p-3 mb-3" key={`wiki${index}`}>
                                <WikidataDescription externalResource={resourceUrl} />
                            </div>
                        );
                    }
                    if (resourceUrl.match(REG_GEONAME)) {
                        return (
                            <div className="border rounded p-3 mb-3" key={`geo${index}`}>
                                <GeonameDescription externalResourceUrl={resourceUrl} />
                            </div>
                        );
                    }
                    if (resourceUrl.match(REG_WIKIPEDIA)) {
                        return (
                            <div className="list-group-item mb-3" key={`wiki${index}`}>
                                <WikipediaSummary externalResource={resourceUrl} />
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
