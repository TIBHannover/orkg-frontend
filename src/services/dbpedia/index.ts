import ky from 'ky';

export const dbpediaSparqlUrl = 'https://dbpedia.org/sparql';
const dbpediaSparqlApi = ky.create({ prefixUrl: dbpediaSparqlUrl });

export const getAbstractByURI = (resourceURI: string): Promise<string> => {
    const query = `SELECT ?abstract 
    WHERE {<${resourceURI}> <http://dbpedia.org/ontology/abstract> ?abstract . 
    FILTER (lang(?abstract) = 'en')} 
    LIMIT 500`;

    return dbpediaSparqlApi
        .get('', {
            searchParams: `?query=${encodeURIComponent(query)}&format=json`,
            headers: {
                Accept: '*/*',
            },
        })
        .json()
        .then((data: any) => {
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
