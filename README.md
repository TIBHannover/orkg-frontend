# ORKG frontend

This is the repository for the frontend of the Open Research Knowledge Grapph (ORKG), which is running live at: https://orkg.org.
Detailed user documentation can be found in the Wiki at: https://gitlab.com/TIBHannover/orkg/orkg-frontend/-/wikis/home

## Frontend installation

### Prerequisites

In order to run the frontend, ensure that Node.js is installed (version ^12.20.0 || ^14.13.1 || >=16.0.0). Check whether you have the right version installed using your command prompt or terminal, run: `node --version`. For more information about installing or upgrading Node.js, see: https://nodejs.org/en/download/.

### Installation

Clone this repository:

    git clone https://gitlab.com/TIBHannover/orkg/orkg-frontend.git

Go to the frontend directory:

    cd orkg-frontend

Install the dependencies by running:

    npm install

Copy the file `default.env` to `.env`:

    cp default.env .env

The **environment variables** descriptions:

| Variable                           | Development | Production  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | ----------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REACT_APP_PUBLIC_URL               | ✅ Used     | ✅ Used     | The directory from which the frontend is served (set to "/" for running in the root directory)                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| BROWSER                            | ✅ Used     | 🚫 Ignored  | By default, Create React App will open the default system browser, favoring Chrome on macOS. Specify a [browser](https://github.com/sindresorhus/open#app) to override this behavior, or set it to `none` to disable it completely. If you need to customize the way the browser is launched, you can specify a node script instead. Any arguments passed to `npm start` will also be passed to this script, and the url where your app is served will be the last argument. Your script's file name must have the `.js` extension. |
| FAST_REFRESH                       | ✅ Used     | 🚫 Ignored  | When set to `false`, disables experimental support for Fast Refresh to allow you to tweak your components in real time without reloading the page.                                                                                                                                                                                                                                                                                                                                                                                  |
| GENERATE_SOURCEMAP                 | 🚫 Ignored  | ✅ Used     | When set to false, source maps are not generated for a production build. This solves out of memory (OOM) issues on some smaller machines. (since we updated react-scripts to 5 this parameter is required to skip the errors)                                                                                                                                                                                                                                                                                                       |
| ESLINT_NO_DEV_ERRORS               | ✅ Used     | 🚫 Ignored  | When set to `true`, ESLint errors are converted to warnings during development. As a result, ESLint output will no longer appear in the error overlay.                                                                                                                                                                                                                                                                                                                                                                              |
| REACT_APP_BACKEND_URL              | ✅ Used     | ✅ Used     | ORKG backend endpoint                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| REACT_APP_SIMILARITY_SERVICE_URL   | ✅ Used     | ✅ Used     | ORKG similarity service endpoint                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| REACT_APP_ANNOTATION_SERVICE_URL   | ✅ Used     | ✅ Used     | ORKG anontation service endpoint                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| REACT_APP_GROBID_URL               | ✅ Used     | ✅ Used     | GROBID service endpoint (More details in ORKG annotation repository)                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| REACT_APP_SEMANTIC_SCHOLAR_URL     | ✅ Used     | ✅ Used     | semanticscholar.org API. Used to fetch the abstract of papers                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| REACT_APP_AUTHENTICATION_CLIENT_ID | ✅ Used     | ✅ Used     | ORKG Authentication client ID                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| REACT_APP_CHATWOOT_WEBSITE_TOKEN   | ✅ Used     | ✅ Used     | (Optional) CHATWOOT Token. Used to show a floating button to provide chat support for users.                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| REACT_APP_GEONAMES_API_SEARCH_URL  | ✅ Used     | ✅ Used     | GeoNames Search Webservice Url                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| REACT_APP_GEONAMES_API_USERNAME    | ✅ Used     | ✅ Used     | Username to access [GeoNames](https://www.geonames.org/export/) API (20'000 credits daily limit per application -identified by this parameter-)                                                                                                                                                                                                                                                                                                                                                                                     |
| REACT_APP_IS_TESTING_SERVER        | ✅ Used     | ✅ Used     | Used to show a top banner indicating that it a testing environment. Accepted values : true or false                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| REACT_APP_MATOMO_TRACKER           | ✅ Used     | ✅ Used     | Tracking visitors using Matomo Tracker. Accepted values : true or false                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| REACT_APP_MATOMO_TRACKER_URL       | ✅ Optional | ✅ Optional | Tracker URL of Matomo configuration                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| REACT_APP_MATOMO_TRACKER_SITE_ID   | ✅ Optional | ✅ Optional | Site ID of Matomo configuration                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| REACT_APP_PWC_USER_ID              | ✅ Optional | ✅ Optional | ID of the user used to import Papers with code data                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| REACT_APP_OLS_BASE_URL             | ✅ Used     | ✅ Used     | [Ontology Lookup Service](https://www.ebi.ac.uk/ols/) API                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| REACT_APP_CMS_URL                  | ✅ Used     | ✅ Used     | CMS URL of [Strapi](https://gitlab.com/TIBHannover/orkg/strapi)                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| REACT_APP_ALTMETRIC_URL            | ✅ Used     | ✅ Used     | URL of [Altmetric](https://www.altmetric.com/) API                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| REACT_APP_DATACITE_URL             | ✅ Used     | ✅ Used     | URL [Datacite api](https://support.datacite.org/docs/api) URL                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| REACT_APP_ORCID_API_URL            | ✅ Used     | ✅ Used     | URL of [ORCID](https://info.orcid.org/documentation/api-tutorials/api-tutorial-searching-the-orcid-registry) API URL                                                                                                                                                                                                                                                                                                                                                                                                                |
| REACT_APP_URL                      | ✅ Used     | ✅ Used     | The full URL of the frontend, including the path. E.g., `https://www.orkg.org/orkg/`                                                                                                                                                                                                                                                                                                                                                                                                                                                |

_PLEASE MAKE SURE YOU USE HTTPS INSTEAD OF HTTP URLS._

### Backend service

In order to run the frontend, the backend needs to be running as well. Please refer to the [ORKG backend repository](https://gitlab.com/TIBHannover/orkg/orkg-backend) for instructions on how to run the backend. Easiest is to run the backend within a docker container.

Make sure that your backend instance contains the default classes and properties, the list is defined in the file `constants/graphSettings.js`, you can run this [python snippet](https://gitlab.com/TIBHannover/orkg/orkg-backend/-/snippets/1959376) to create them in your backend.

Two additional services are used in the frontend. These services are: [ORKG similarity](https://gitlab.com/TIBHannover/orkg/orkg-similarity) and [ORKG annotation](https://gitlab.com/TIBHannover/orkg/annotation). These services are not critical for the frontend to operate, but some for functionalities the message `Couldn't connect to service ...` appears. This message can be ignored, or can be fixed by running the respective service locally.

## Running

Run the following command:

    npm run start

Open the browser and enter the URL of the application: http://localhost:3000/.

### Running in Docker

It is also possible to run the frontend in Docker. It is easiest to use Docker Compose.

Make sure you have a configured .env file:

Copy the file `default.env` to `.env`:

    cp default.env .env

Start the application

    docker-compose up -d

Open the browser and enter the URL of the application: http://localhost:3000/.

# Contributing

Please feel free to contribute to our code. In case you found any bugs, please [raise an issue](https://gitlab.com/TIBHannover/orkg/orkg-frontend/issues). In case you want to contribute code, [open a merge request](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests).

We use [React](https://reactjs.org/) as frontend framework. Additionally, we use [Redux](https://redux.js.org/) for state management (but we prefer a local state when possible). For styling we use [Bootstrap](https://getbootstrap.com/) with the package [Reactstrap](https://reactstrap.github.io/). We maintain the following code conventions:

-   Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), and use [Angular commit types](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#type)
-   Running lint on commit (you cannot commit when your code contains lint errors)
-   Run Prettier rules on commit for coding style consistency
-   The [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format is used to automatically generate [our changelog](https://gitlab.com/TIBHannover/orkg/orkg-frontend/blob/master/CHANGELOG.md)
-   In the future, we will adhere to the [Airbnb JavaScript style guide](https://github.com/airbnb/javascript)

Happy coding! 😁☕️

## Value plugins

An easy start for contributing is to take a look at [value plugins](https://gitlab.com/TIBHannover/orkg/orkg-frontend/blob/master/src/components/ValuePlugins). These plugins allow for converting data into a appropriate visualization. Currently, we support plugins for the following visualizations: `Boolean checkmarks`, `LaTeX preview`, `External links`. The [boolean checkmarks plugin](https://gitlab.com/TIBHannover/orkg/orkg-frontend/blob/master/src/components/ValuePlugins/Boolean/Boolean.js) provides an easy example on how to create your own value plugins.
