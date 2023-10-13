import envOriginal from '@beam-australia/react-env';

// CRA-CODE
const env = name => envOriginal(name);

export default env;

// NEXT-CODE
// const env = name => {
//     const envs = {
//         BROWSER: 'none',
//         FAST_REFRESH: 'false',
//         ESLINT_NO_DEV_ERRORS: 'false',
//         PUBLIC_URL: '/',
//         URL: 'https://www.orkg.org',
//         BACKEND_URL: 'https://sandbox.orkg.org/',
//         SIMILARITY_SERVICE_URL: 'https://sandbox.orkg.org/simcomp/',
//         ANNOTATION_SERVICE_URL: 'http://localhost:7000/',
//         NLP_SERVICE_URL: 'https://sandbox.orkg.org/nlp/api/',
//         DATACITE_URL: 'https://api.test.datacite.org/dois',
//         GROBID_URL: 'https://orkg.org/grobid/',
//         CMS_URL: 'https://orkg.org/strapi/api/',
//         OPEN_CITATIONS_URL: 'https://opencitations.net/',
//         ORCID_API_URL: 'https://pub.orcid.org/v2.0/',
//         SEMANTIC_SCHOLAR_URL: 'https://api.semanticscholar.org/',
//         ALTMETRIC_URL: 'https://api.altmetric.com/v1/',
//         AUTHENTICATION_CLIENT_ID: 'orkg-client',
//         CHATWOOT_WEBSITE_TOKEN: 't8TSL5F2GtBLgbr5pEVsXjX7',
//         GEONAMES_API_SEARCH_URL: 'https://secure.geonames.org/search',
//         GEONAMES_API_USERNAME: 'reddine',
//         OLS_BASE_URL: 'https://service.tib.eu/ts4tib/api/',
//         WIKIDATA_URL: 'https://www.wikidata.org/w/api.php',
//         UNPAYWALL_URL: 'https://api.unpaywall.org/v2/',
//         UNPAYWALL_EMAIL: '',
//         WIKIDATA_SPARQL: 'https://query.wikidata.org/sparql',
//         MASTODON_URL: 'https://mastodon.social/api/v1/',
//         MASTODON_ACCOUNT_ID: '110587359897866750',
//         IS_TESTING_SERVER: 'false',
//         MATOMO_TRACKER: 'false',
//         MATOMO_TRACKER_URL: '//support.tib.eu/piwik/',
//         MATOMO_TRACKER_SITE_ID: '29',
//         PWC_USER_ID: '491f3ea5-548d-487d-9498-96d5deae1d50',
//         DATACITE_DOI_PREFIX: '10.7484',
//         IS_NEXT: 'true',
//     };
//     return envs[name];
// };

// export default env;
