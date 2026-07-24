import useEntity from '@/components/DataBrowser/hooks/useEntity';
import DbpediaAbstract from '@/components/ExternalDescription/DbpediaAbstract';
import GeonameDescription from '@/components/ExternalDescription/GeonameDescription';
import WikidataDescription from '@/components/ExternalDescription/WikidataDescription';
import WikipediaSummary from '@/components/ExternalDescription/WikipediaSummary';
import { ENTITIES, PREDICATES } from '@/constants/graphSettings';

const REG_DPPEDIA = new RegExp(/^(https?:)?\/\/dbpedia\.org(\/resource(\?.*)?)\//);

const REG_WIKIDATA = new RegExp(/^(https?:)?\/\/(www\.)?wikidata\.org(\/entity(\?.*)?)\//);

const REG_WIKIPEDIA = new RegExp(/^(https?:)?\/\/[a-zA-Z.0-9]{0,3}\.wikipedia\.org\/wiki\/([\w%]+)/g);

const REG_GEONAME = new RegExp(/^https:\/\/sws\.geonames\.org\/\d+\/?$/g);

const SameAsStatements = () => {
    const { statements, entity } = useEntity();
    let sameAsStatements = entity && entity._class === ENTITIES.CLASS && 'uri' in entity && entity.uri !== null ? [entity.uri] : [];
    if (entity && sameAsStatements.length === 0) {
        const filteredStatements = statements?.filter((statement) => statement.predicate.id === PREDICATES.SAME_AS) ?? [];
        sameAsStatements = filteredStatements.map((statement) => statement.object.label);
    }
    return (
        <div>
            <div className="mt-6 mb-2">
                {sameAsStatements.map((statementUrl) => {
                    if (statementUrl?.match(REG_DPPEDIA)) {
                        return (
                            <div className="border border-border rounded p-4 mb-4" key={statementUrl}>
                                <DbpediaAbstract externalResource={statementUrl} />
                            </div>
                        );
                    }
                    if (statementUrl?.match(REG_WIKIDATA)) {
                        return (
                            <div className="border border-border rounded p-4 mb-4" key={statementUrl}>
                                <WikidataDescription externalResource={statementUrl} />
                            </div>
                        );
                    }
                    if (statementUrl?.match(REG_GEONAME)) {
                        return (
                            <div className="border border-border rounded p-4 mb-4" key={statementUrl}>
                                <GeonameDescription externalResourceUrl={statementUrl} />
                            </div>
                        );
                    }
                    if (statementUrl?.match(REG_WIKIPEDIA)) {
                        return (
                            <div className="border border-border rounded p-4 mb-4" key={statementUrl}>
                                <WikipediaSummary externalResource={statementUrl} />
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};
export default SameAsStatements;
