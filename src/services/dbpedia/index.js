import { submitGetRequest } from 'network';

export const dbpediaSparqlUrl = 'https://dbpedia.org/sparql';

export const getAbstractByURI = resourceURI => {
    const query = `SELECT ?abstract 
    WHERE {<${resourceURI}> <http://dbpedia.org/ontology/abstract> ?abstract . 
    FILTER (lang(?abstract) = 'en')} 
    LIMIT 500`;

    return submitGetRequest(`${dbpediaSparqlUrl}?query=${encodeURIComponent(query)}&format=json`).then(data => {
        if (
            data.results &&
            data.results.bindings &&
            data.results.bindings.length > 0 &&
            data.results.bindings[0].abstract &&
            data.results.bindings[0].abstract.value
        ) {
            return data.results.bindings[0].abstract.value;
        }
        return '';
    });
};
