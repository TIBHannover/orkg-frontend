import useEntity from 'components/DataBrowser/hooks/useEntity';
import DbpediaAbstract from 'components/ExternalDescription/DbpediaAbstract';
import GeonameDescription from 'components/ExternalDescription/GeonameDescription';
import WikidataDescription from 'components/ExternalDescription/WikidataDescription';
import WikipediaSummary from 'components/ExternalDescription/WikipediaSummary';
import { PREDICATES } from 'constants/graphSettings';

// eslint-disable-next-line prefer-regex-literals
const REG_DPPEDIA = new RegExp(/^(https?:)?\/\/dbpedia\.org(\/resource(\?.*)?)\//);
// eslint-disable-next-line prefer-regex-literals
const REG_WIKIDATA = new RegExp(/^(https?:)?\/\/(www\.)?wikidata\.org(\/entity(\?.*)?)\//);
// eslint-disable-next-line prefer-regex-literals
const REG_WIKIPEDIA = new RegExp(/^(https?:)?\/\/[a-zA-Z.0-9]{0,3}\.wikipedia\.org\/wiki\/([\w%]+)/g);
// eslint-disable-next-line prefer-regex-literals
const REG_GEONAME = new RegExp(/^https:\/\/sws\.geonames\.org\/\d+\//g);

const SameAsStatements = () => {
    const { statements } = useEntity();
    const sameAsStatements = statements?.filter((statement) => statement.predicate.id === PREDICATES.SAME_AS) ?? [];
    return (
        <div>
            <div className="mt-4 mb-2">
                {sameAsStatements.map((statementUrl) => {
                    if (statementUrl.object.label.match(REG_DPPEDIA)) {
                        return (
                            <div className="list-group-item mb-3" key={statementUrl.id}>
                                <DbpediaAbstract externalResource={statementUrl.object.label} />
                            </div>
                        );
                    }
                    if (statementUrl.object.label.match(REG_WIKIDATA)) {
                        return (
                            <div className="border rounded p-3 mb-3" key={statementUrl.id}>
                                <WikidataDescription externalResource={statementUrl.object.label} />
                            </div>
                        );
                    }
                    if (statementUrl.object.label.match(REG_GEONAME)) {
                        return (
                            <div className="border rounded p-3 mb-3" key={statementUrl.id}>
                                <GeonameDescription externalResourceUrl={statementUrl.object.label} />
                            </div>
                        );
                    }
                    if (statementUrl.object.label.match(REG_WIKIPEDIA)) {
                        return (
                            <div className="list-group-item mb-3" key={statementUrl.id}>
                                <WikipediaSummary externalResource={statementUrl.object.label} />
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
