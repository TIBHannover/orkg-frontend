# ORKG frontend

This is the repository for the frontend of the Open Research Knowledge Graph (ORKG), which is running live at: https://orkg.org.
Detailed user documentation can be found in the Wiki at: https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/home

## Frontend installation

### Prerequisites

In order to run the frontend, ensure that Node.js is installed (version >=24.0.0). Check whether you have the right version installed using your command prompt or terminal, run: `node --version`. For more information about installing or upgrading Node.js, see: https://nodejs.org/en/download/.

### Installation

Clone this repository:

    git clone https://gitlab.com/TIBHannover/orkg/orkg-frontend.git

Go to the frontend directory:

    cd orkg-frontend

Install the dependencies by running:

    npm install

Copy the file `default.env` to `.env`:

    cp default.env .env

By default, the `.env` file uses the [ORKG Sandbox](https://sandbox.orkg.org) APIs. Read the wiki in case you want to [quickly switch between environments](https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/Switch-between-environments).

The **environment variables** descriptions:

| Variable                            | Development | Production  | Description                                                                                                                                     |
| ----------------------------------- | ----------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_PUBLIC_URL              | ✅ Used     | ✅ Used     | The directory from which the frontend is served (set to "/" for running in the root directory)                                                  |
| NEXT_PUBLIC_KEYCLOAK_URL            | ✅ Used     | ✅ Used     | Specifies the base URL for the Keycloak authentication server.                                                                                  |
| NEXT_PUBLIC_KEYCLOAK_REALM          | ✅ Used     | ✅ Used     | Defines the realm within Keycloak, which is a namespace that manages users, roles, and client configurations.                                   |
| NEXT_PUBLIC_KEYCLOAK_CLIENT_ID      | ✅ Used     | ✅ Used     | Represents the Keycloak client ID for the application                                                                                           |
| KEYCLOAK_CLIENT_SECRET              | ✅ Used     | ✅ Used     | Represents the Keycloak Client authentication secret                                                                                            |
| NEXTAUTH_URL                        | ✅ Used     | ✅ Used     | Same as NEXT_PUBLIC_URL + /auth                                                                                                                 |
| NEXTAUTH_SECRET                     | ✅ Used     | ✅ Used     | Used to encrypt the NextAuth.js JWT                                                                                                             |
| NEXT_PUBLIC_BACKEND_URL             | ✅ Used     | ✅ Used     | ORKG backend endpoint (use http://localhost:8080/ when running the backend locally)                                                             |
| NEXT_PUBLIC_SIMILARITY_SERVICE_URL  | ✅ Used     | ✅ Used     | ORKG similarity service endpoint (use http://localhost:5000/ when running the service locally)                                                  |
| NEXT_PUBLIC_SIMILAR_PAPER_URL       | ✅ Used     | ✅ Used     | ORKG [similar papers](https://gitlab.com/TIBHannover/orkg/orkg-simpaper-api) service endpoint                                                   |
| NEXT_PUBLIC_NLP_SERVICE_URL         | ✅ Used     | ✅ Used     | ORKG [NLP service](https://gitlab.com/TIBHannover/orkg/nlp/orkg-nlp-api) endpoint                                                               |
| NEXT_PUBLIC_SMART_FILTERS_URL       | ✅ Used     | ✅ Used     | ORKG [Smart Filters](https://gitlab.com/TIBHannover/orkg/smart-filters) api endpoint                                                            |
| NEXT_PUBLIC_GROBID_URL              | ✅ Used     | ✅ Used     | GROBID service endpoint (More details in ORKG annotation repository)                                                                            |
| NEXT_PUBLIC_SEMANTIC_SCHOLAR_URL    | ✅ Used     | ✅ Used     | semanticscholar.org API. Used to fetch the abstract of papers                                                                                   |
| NEXT_PUBLIC_GEONAMES_API_URL        | ✅ Used     | ✅ Used     | GeoNames API base URL                                                                                                                           |
| NEXT_PUBLIC_GEONAMES_API_USERNAME   | ✅ Used     | ✅ Used     | Username to access [GeoNames](https://www.geonames.org/export/) API (20'000 credits daily limit per application -identified by this parameter-) |
| NEXT_PUBLIC_IS_TESTING_SERVER       | ✅ Used     | ✅ Used     | Used to show a top banner indicating that it a testing environment. Accepted values : true or false                                             |
| NEXT_PUBLIC_MATOMO_TRACKER          | ✅ Used     | ✅ Used     | Tracking visitors using Matomo Tracker. Accepted values : true or false                                                                         |
| NEXT_PUBLIC_MATOMO_TRACKER_URL      | ✅ Optional | ✅ Optional | Tracker URL of Matomo configuration                                                                                                             |
| NEXT_PUBLIC_MATOMO_TRACKER_SITE_ID  | ✅ Optional | ✅ Optional | Site ID of Matomo configuration                                                                                                                 |
| NEXT_PUBLIC_PWC_USER_ID             | ✅ Optional | ✅ Optional | ID of the user used to import Papers with code data                                                                                             |
| NEXT_PUBLIC_OLS_BASE_URL            | ✅ Used     | ✅ Used     | [Ontology Lookup Service](https://www.ebi.ac.uk/ols/) API                                                                                       |
| NEXT_PUBLIC_CMS_URL                 | ✅ Used     | ✅ Used     | CMS URL of [Strapi](https://gitlab.com/TIBHannover/orkg/strapi)                                                                                 |
| NEXT_PUBLIC_ALTMETRIC_URL           | ✅ Used     | ✅ Used     | URL of [Altmetric](https://www.altmetric.com/) API                                                                                              |
| NEXT_PUBLIC_DATACITE_URL            | ✅ Used     | ✅ Used     | URL [Datacite api](https://support.datacite.org/docs/api) URL                                                                                   |
| NEXT_PUBLIC_DATACITE_DOI_PREFIX     | ✅ Used     | ✅ Used     | DOI prefix issued via DataCite — used to detect ORKG-minted DOIs on papers                                                                      |
| NEXT_PUBLIC_ORCID_API_URL           | ✅ Used     | ✅ Used     | URL of [ORCID](https://info.orcid.org/documentation/api-tutorials/api-tutorial-searching-the-orcid-registry) API URL                            |
| NEXT_PUBLIC_URL                     | ✅ Used     | ✅ Used     | The full URL of the frontend, without trailing slash. E.g., `https://orkg.org`                                                                  |
| NEXT_PUBLIC_OPEN_CITATIONS_URL      | ✅ Used     | ✅ Used     | URL [OpenCitations](https://opencitations.net/)                                                                                                 |
| NEXT_PUBLIC_WIKIDATA_URL            | ✅ Used     | ✅ Used     | URL of the [Wikidata](https://www.wikidata.org/w/api.php) API                                                                                   |
| NEXT_PUBLIC_UNPAYWALL_URL           | ✅ Used     | ✅ Used     | URL of the [Unpaywall](https://unpaywall.org/products/api) API                                                                                  |
| NEXT_PUBLIC_UNPAYWALL_EMAIL         | ✅ Used     | ✅ Used     | Email used for authentication on the [Unpaywall](https://unpaywall.org/products/api) API                                                        |
| NEXT_PUBLIC_WIKIDATA_SPARQL         | ✅ Used     | ✅ Used     | URL of the [Wikidata SPARQL](https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service) endpoint                                              |
| NEXT_PUBLIC_MASTODON_URL            | ✅ Used     | ✅ Used     | URL of the [Mastodon](https://mastodon.social) API                                                                                              |
| NEXT_PUBLIC_MASTODON_ACCOUNT_ID     | ✅ Used     | ✅ Used     | Account ID on [Mastodon](https://mastodon.social)                                                                                               |

_PLEASE MAKE SURE YOU USE HTTPS INSTEAD OF HTTP URLS._

### Backend service

In order to run the frontend, the backend needs to be running as well. Please refer to the [ORKG backend repository](https://gitlab.com/TIBHannover/orkg/orkg-backend) for instructions on how to run the backend. Easiest is to run the backend within a docker container.

Make sure that your backend instance contains the default classes and properties, the list is defined in the file `src/constants/graphSettings.ts`, you can run this [python snippet](https://gitlab.com/TIBHannover/orkg/orkg-backend/-/snippets/1959376) to create them in your backend.

An additional service is used in the frontend. This service is: [ORKG NLP API](https://gitlab.com/TIBHannover/orkg/nlp/orkg-nlp-api). It is not critical for the frontend to operate, but some functionalities the message `Couldn't connect to service ...` appears. This message can be ignored, or can be fixed by running the respective service locally.

## Running

Run the following command:

    npm run dev

Open the browser and enter the URL of the application: http://localhost:3000/.

### Useful scripts

| Command              | What it does                                                          |
| -------------------- | --------------------------------------------------------------------- |
| `npm run dev`        | Start the Next.js dev server on http://localhost:3000                 |
| `npm run build`      | Production build                                                      |
| `npm start`          | Start the production server (after `npm run build`)                   |
| `npm test`           | Run the [Vitest](https://vitest.dev/) test suite in watch mode        |
| `npm run test:ci`    | Run all tests once and write a JUnit report (used by CI)              |
| `npm run lint`       | ESLint check                                                          |
| `npm run lint:fix`   | ESLint auto-fix                                                       |
| `npm run type-check` | TypeScript type-check (`tsc --noEmit`)                                |
| `npm run storybook`  | Start [Storybook](https://storybook.js.org/) on http://localhost:6006 |
| `npm run commit`     | Interactive [Commitizen](https://commitizen-tools.github.io/) prompt  |

### Running in Docker

It is also possible to run the frontend in Docker. It is easiest to use Docker Compose.

Make sure you have a configured .env file:

Copy the file `default.env` to `.env`:

    cp default.env .env

Start the application

    docker compose up -d

Open the browser and enter the URL of the application: http://localhost:3000/.

# Contributing

Please feel free to contribute to our code. In case you found any bugs, please [raise an issue](https://gitlab.com/TIBHannover/orkg/orkg-frontend/issues). In case you want to contribute code, [open a merge request](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests).

We use [Next.js](https://nextjs.org/) (App Router) with [React 19](https://react.dev/) as the frontend framework. State is mostly local; we use [SWR](https://swr.vercel.app/) for data fetching, [nuqs](https://nuqs.47ng.com/) for URL search-param state, and [Redux Toolkit](https://redux-toolkit.js.org/) for the few legacy globally-shared slices. Authentication is handled via [NextAuth](https://next-auth.js.org/) + [Keycloak](https://www.keycloak.org/). For styling we use [Tailwind CSS v4](https://tailwindcss.com/) with [HeroUI v3](https://heroui.com/) — import components from `@heroui/react` directly (the legacy wrappers under `src/components/Ui/` are being phased out). We maintain the following code conventions:

- Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), and use [Angular commit types](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type). Linting is applied on the commit message (i.e., you cannot commit if the message is not correctly formatted). You can use the [Commitizen](https://commitizen-tools.github.io/commitizen/) CLI to create a correctly formatted message via: `npm run commit`
- Running lint on commit (you cannot commit when your code contains lint errors)
- Run Prettier rules on commit for coding style consistency
- The [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format is used to automatically generate [our changelog](https://gitlab.com/TIBHannover/orkg/orkg-frontend/blob/master/CHANGELOG.md)
- We lint JavaScript and TypeScript with [ESLint](https://eslint.org/) using the [Next.js ESLint setup](https://nextjs.org/docs/app/api-reference/config/eslint) (`eslint-config-next`, Core Web Vitals), extended in `eslint.config.mjs` with TypeScript and project-specific rules. Please ensure your code passes lint before committing.
- We are transitioning to TypeScript. When creating new components, consider doing this in TypeScript.

Happy coding! 😁☕️

## Storybook component library

Please have a look at the [Storybook component library](https://tibhannover.gitlab.io/orkg/orkg-frontend/storybook/) for React components that can be easily reused throughout the code base. To run it locally:

    npm run storybook

Storybook is then available at http://localhost:6006.

## Value plugins

An easy start for contributing is to take a look at [value plugins](https://gitlab.com/TIBHannover/orkg/orkg-frontend/blob/master/src/components/ValuePlugins). These plugins allow for converting data into a appropriate visualization. Currently, we support plugins for the following visualizations: `Boolean checkmarks`, `LaTeX preview`, `External links`. The [boolean checkmarks plugin](https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/blob/master/src/components/ValuePlugins/Boolean/Boolean.tsx) provides an easy example on how to create your own value plugins.
