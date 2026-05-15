import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { groupBy } from 'lodash';
import Image from 'next/image';
import { FC, useEffect, useState } from 'react';

import WIKIDATA_LOGO from '@/assets/img/sameas/wikidatawiki.png';
import { PropertyStyle, StatementsGroupStyle, ValuesStyle } from '@/components/StatementBrowser/styled';
import Row from '@/components/Ui/Structure/Row';
import ValuePlugins from '@/components/ValuePlugins/ValuePlugins';
import { ENTITIES } from '@/constants/graphSettings';
import { wikidataSparql } from '@/services/wikidata/index';

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
            <div className="flex justify-between">
                <h2 className="text-xl">Statements from Wikidata</h2>
                <a href={externalResource} target="_blank" rel="noopener noreferrer">
                    <Image alt="Wikidata logo" src={WIKIDATA_LOGO} style={{ height: 40 }} />
                </a>
            </div>
            {isLoading && (
                <div className="text-center">
                    <FontAwesomeIcon icon={faSpinner} spin /> Loading
                </div>
            )}
            {hasFailed && <p className="text-center">Failed loading Wikidata statements</p>}
            {Object.keys(statementsByProperty).map((propertyUri) => (
                <StatementsGroupStyle key={propertyUri} className="noTemplate list-group-item">
                    <Row className="flex flex-wrap items-stretch gap-x-0">
                        <PropertyStyle className="shrink-0 grow-0 w-4/12 basis-4/12 max-w-4/12">
                            <div>
                                <a
                                    href={statementsByProperty[propertyUri]?.[0]?.property?.value}
                                    className="text-dark break-all"
                                    style={{ fontWeight: 500 }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {statementsByProperty[propertyUri]?.[0]?.propertyLabel?.value}
                                </a>
                            </div>
                        </PropertyStyle>
                        <ValuesStyle className="shrink-0 grow-0 w-8/12 basis-8/12 max-w-8/12 valuesList">
                            {statementsByProperty[propertyUri].map((value) => (
                                <div key={value?.object?.value}>
                                    {value?.object?.type === 'uri' ? (
                                        <a href={value?.object?.value} className="break-all" target="_blank" rel="noopener noreferrer">
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
