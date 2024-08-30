import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import WIKIDATA_LOGO from 'assets/img/sameas/wikidatawiki.png';
import { wikidataSparql } from 'services/wikidata/index';
import { PropertyStyle, StatementsGroupStyle, ValuesStyle } from 'components/StatementBrowser/styled';
import { groupBy } from 'lodash';
import { useEffect, useState, FC } from 'react';
import { Row } from 'reactstrap';
import Image from 'next/image';
import ValuePlugins from 'components/ValuePlugins/ValuePlugins';
import { ENTITIES } from 'constants/graphSettings';

type WikidataDescriptionProp = {
    externalResource: string;
};

type WikidataStatement = {
    property: {
        value: string;
        type: string;
    };
    propertyLabel: {
        value: string;
    };
    object: {
        value: string;
        type: string;
    };
    objectLabel: {
        value: string;
    };
};

const WikidataDescription: FC<WikidataDescriptionProp> = ({ externalResource }) => {
    const [statementsByProperty, setStatementsByProperty] = useState<Record<string, WikidataStatement[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [hasFailed, setHasFailed] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const wikidataID = externalResource.substr(externalResource.indexOf('Q'));
                const query = `
                SELECT ?property ?propertyLabel ?object ?objectLabel
                WHERE
                {
                wd:${wikidataID} ?pred ?object.

                SERVICE wikibase:label { bd:serviceParam wikibase:language "en". } 
                ?property wikibase:directClaim ?pred .
                }

                LIMIT 500
                `;

                const url = `${wikidataSparql}?query=${encodeURIComponent(query)}&format=json`;
                const response = await fetch(url);
                const statements = await response.json();
                setStatementsByProperty(groupBy(statements.results.bindings, 'property.value'));
            } catch (e) {
                setHasFailed(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [externalResource]);

    return (
        <div>
            <div className="d-flex justify-content-between">
                <h2 className="h5">Statements from Wikidata</h2>
                <a href={externalResource} target="_blank" rel="noopener noreferrer">
                    <Image alt="Wikidata logo" src={WIKIDATA_LOGO} style={{ height: 40 }} />
                </a>
            </div>

            {isLoading && (
                <div className="text-center">
                    <Icon icon={faSpinner} spin /> Loading
                </div>
            )}
            {hasFailed && <p className="text-center">Failed loading Wikidata statements</p>}

            {Object.keys(statementsByProperty).map((propertyUri) => (
                <StatementsGroupStyle key={propertyUri} className="noTemplate list-group-item">
                    <Row className="row gx-0">
                        <PropertyStyle className="col-4">
                            <div>
                                <a
                                    href={statementsByProperty[propertyUri]?.[0]?.property?.value}
                                    className="text-dark text-break"
                                    style={{ fontWeight: 500 }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {statementsByProperty[propertyUri]?.[0]?.propertyLabel?.value}
                                </a>
                            </div>
                        </PropertyStyle>
                        <ValuesStyle className="col-8 valuesList">
                            {statementsByProperty[propertyUri].map((value) => (
                                <div key={value?.object?.value}>
                                    {value?.object?.type === 'uri' ? (
                                        <a href={value?.object?.value} className="text-break" target="_blank" rel="noopener noreferrer">
                                            {value.objectLabel?.value}
                                        </a>
                                    ) : (
                                        <ValuePlugins type={ENTITIES.LITERAL}>{value?.object?.value}</ValuePlugins>
                                    )}
                                </div>
                            ))}
                        </ValuesStyle>
                    </Row>
                </StatementsGroupStyle>
            ))}
        </div>
    );
};

export default WikidataDescription;
