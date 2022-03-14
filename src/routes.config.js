/* eslint-disable react/prop-types */
import { lazy } from 'react';
import { Redirect } from 'react-router-dom';
import ResourceDetails from 'pages/Resources/Resource';
import AddPaper from 'pages/AddPaper';
import AuthorPage from 'pages/AuthorPage';
import VenuePage from 'pages/VenuePage';
import AddResource from 'pages/Resources/AddResource';
import Comparison from 'pages/Comparisons/Comparison';
import ComparisonDiff from 'pages/Comparisons/ComparisonDiff';
import Home from 'pages/Home';
import Changelog from 'pages/Changelog/Changelog';
import NotFound from 'pages/NotFound';
import Papers from 'pages/Papers';
import Comparisons from 'pages/Comparisons/Comparisons';
import Visualizations from 'pages/Visualizations/Visualizations';
import Visualization from 'pages/Visualizations/Visualization';
import ClassDetails from 'pages/Classes/ClassDetails';
import Classes from 'pages/Classes/Classes';
import AddClass from 'pages/Classes/AddClass';
import Properties from 'pages/Properties/Properties';
import AddProperty from 'pages/Properties/AddProperty';
import PropertyDetails from 'pages/Properties/Property';
import Templates from 'pages/Templates/Templates';
import Template from 'pages/Templates/Template';
import ROUTES from 'constants/routes';
import RedirectShortLinks from 'pages/RedirectShortLinks';
import ResearchField from 'pages/ResearchFields/ResearchField';
import ResearchFields from 'pages/ResearchFields/ResearchFields';
import ResearchProblem from './pages/ResearchProblem';
import Resources from 'pages/Resources/Resources';
import Organizations from 'pages/Organizations/Organizations';
import Observatories from 'pages/Observatories/Observatories';
import OrganizationDetails from 'pages/Organizations/OrganizationDetails';
import AddOrganization from 'pages/Organizations/AddOrganization';
import AddObservatory from 'pages/Observatories/AddObservatory';
import Observatory from 'pages/Observatories/Observatory';
import SearchResults from 'pages/Search';
import ViewPaper from 'pages/ViewPaper';
import Stats from 'pages/Stats';
import UserSettings from 'pages/UserSettings';
import UserProfile from 'pages/UserProfile';
import FeaturedComparisons from 'pages/FeaturedComparisons';
import Data from 'pages/Data';
import Contribution from 'pages/Contribution';
import CsvImport from 'pages/CsvImport';
import Review from 'pages/Reviews/Review';
import Reviews from 'pages/Reviews/Reviews';
import ReviewNew from 'pages/Reviews/ReviewNew';
import ReviewDiff from 'pages/Reviews/ReviewDiff';
import Tools from 'pages/Tools';
import AddComparison from 'pages/AddComparison';
import requireAuthentication from 'requireAuthentication';
import Benchmarks from 'pages/Benchmarks/Benchmarks';
import Benchmark from 'pages/Benchmarks/Benchmark';
import { reverse } from 'named-urls';
import ContributionEditor from 'pages/ContributionEditor';
import Page from 'pages/Page';
import About from 'pages/About';
import HelpCenter from 'pages/HelpCenter/HelpCenter';
import HelpCenterCategory from 'pages/HelpCenter/HelpCenterCategory';
import HelpCenterArticle from 'pages/HelpCenter/HelpCenterArticle';
import HelpCenterSearch from 'pages/HelpCenter/HelpCenterSearch';
import WebinarMay11 from 'pages/WebinarMay11';
import LiteratureLists from 'pages/LiteratureList/LiteratureLists';
import LiteratureListNew from 'pages/LiteratureList/LiteratureListNew';
import LiteratureList from 'pages/LiteratureList/LiteratureList';
import LiteratureListDiff from 'pages/LiteratureList/LiteratureListDiff';

// use lazy loading of pages that contain large dependencies
// run "npm run analyze" to ensure the listed dependencies are not loaded elsewhere and thus end up in the bundle
const PdfTextAnnotation = lazy(() => import('pages/PdfTextAnnotation')); // for dependency "react-pdf-highlighter" ~1.16MB
const PdfAnnotation = lazy(() => import('pages/PdfAnnotation')); // for dependency "handsontable" ~887.4KB

const routes = [
    {
        path: ROUTES.HOME,
        exact: true,
        component: Home
    },
    {
        path: ROUTES.RESOURCES,
        exact: true,
        component: Resources
    },
    {
        path: ROUTES.RESOURCE,
        component: ResourceDetails
    },
    {
        path: ROUTES.ADD_RESOURCE,
        exact: true,
        component: requireAuthentication(AddResource)
    },
    {
        path: ROUTES.PROPERTIES,
        exact: true,
        component: Properties
    },
    {
        path: ROUTES.PROPERTY,
        component: PropertyDetails
    },
    {
        path: ROUTES.ADD_PROPERTY,
        exact: true,
        component: requireAuthentication(AddProperty)
    },
    {
        path: ROUTES.CLASSES,
        exact: true,
        component: Classes
    },
    {
        path: ROUTES.CLASS,
        component: ClassDetails
    },
    {
        path: ROUTES.ADD_CLASS,
        exact: true,
        component: requireAuthentication(AddClass)
    },
    {
        path: ROUTES.TEMPLATES,
        exact: true,
        component: Templates
    },
    {
        path: ROUTES.TEMPLATE,
        exact: true,
        component: Template
    },
    {
        path: ROUTES.USER_SETTINGS,
        exact: true,
        component: requireAuthentication(UserSettings)
    },
    {
        path: ROUTES.USER_PROFILE,
        exact: true,
        component: UserProfile
    },
    {
        path: ROUTES.ADD_PAPER.GENERAL_DATA,
        exact: true,
        component: requireAuthentication(AddPaper)
    },
    {
        /* TODO: slug for the paper title */
        path: ROUTES.VIEW_PAPER,
        exact: true,
        component: ViewPaper
    },
    {
        path: ROUTES.COMPARISON_DIFF,
        component: ComparisonDiff
    },
    {
        path: ROUTES.COMPARISON_SHORTLINK,
        exact: true,
        component: RedirectShortLinks
    },
    {
        path: ROUTES.COMPARISON,
        exact: true,
        component: Comparison
    },
    {
        path: ROUTES.ORGANIZATIONS,
        exact: true,
        component: Organizations
    },
    {
        path: ROUTES.OBSERVATORIES,
        exact: true,
        component: Observatories
    },
    {
        /* TODO: Remove this route (it's temporarily backward compatibility for moving contributions ids from view args to query string) */
        path: ROUTES.COMPARISON + '*',
        exact: true,
        component: ({ match, location }) => (
            <Redirect
                to={`${reverse(ROUTES.COMPARISON)}?contributions=${match.params[0].split('/').join(',')}${
                    location.search ? '&' + (location.search.charAt(0) === '?' ? location.search.substr(1) : location.search) : ''
                }`}
            />
        )
    },
    {
        /* TODO: Remove this route (it's temporarily backward compatibility for moving predicates to properties naming */
        path: ROUTES.PREDICATES,
        exact: true,
        component: () => <Redirect to={{ pathname: reverse(ROUTES.PROPERTIES), state: { status: 301 } }} />
    },
    {
        /* TODO: Remove this route (it's temporarily backward compatibility for moving predicates to properties naming */
        path: ROUTES.PREDICATE + '*',
        exact: true,
        component: ({ match }) => <Redirect to={{ pathname: reverse(ROUTES.PROPERTY, { id: match.params.id }), state: { status: 301 } }} />
    },
    {
        path: ROUTES.PAPERS,
        exact: true,
        component: Papers
    },
    {
        path: ROUTES.COMPARISONS,
        exact: true,
        component: Comparisons
    },

    {
        path: ROUTES.VISUALIZATIONS,
        exact: true,
        component: Visualizations
    },
    {
        path: ROUTES.VISUALIZATION,
        component: Visualization
    },
    {
        path: ROUTES.RESEARCH_PROBLEM,
        component: ResearchProblem
    },
    {
        path: ROUTES.RESEARCH_FIELD,
        component: ResearchField
    },
    {
        path: ROUTES.RESEARCH_FIELDS,
        component: ResearchFields
    },
    {
        path: ROUTES.VENUE_PAGE,
        component: VenuePage
    },
    {
        path: ROUTES.AUTHOR_PAGE,
        component: AuthorPage
    },
    {
        path: ROUTES.CHANGELOG,
        component: Changelog
    },
    {
        path: ROUTES.SEARCH,
        component: SearchResults
    },
    {
        path: ROUTES.STATS,
        component: Stats
    },
    /* Legacy routes, only used for debugging now */
    {
        path: ROUTES.FEATURED_COMPARISONS,
        component: FeaturedComparisons
    },
    {
        path: ROUTES.ORGANIZATION,
        exact: true,
        component: OrganizationDetails
    },
    {
        path: ROUTES.ADD_ORGANIZATION,
        exact: true,
        component: requireAuthentication(AddOrganization)
    },
    {
        path: ROUTES.ADD_OBSERVATORY,
        exact: true,
        component: requireAuthentication(AddObservatory)
    },
    {
        path: ROUTES.OBSERVATORY,
        exact: true,
        component: Observatory
    },
    {
        path: ROUTES.PDF_TEXT_ANNOTATION,
        exact: true,
        component: PdfTextAnnotation
    },
    {
        path: ROUTES.TPDL,
        component: () => <Redirect to="/" />
    },
    {
        path: ROUTES.PDF_ANNOTATION,
        component: requireAuthentication(PdfAnnotation)
    },
    {
        path: ROUTES.CONTRIBUTION,
        component: Contribution
    },
    {
        path: ROUTES.EXPORT_DATA,
        component: () => <Redirect to={{ pathname: reverse(ROUTES.DATA), state: { status: 301 } }} />
    },
    {
        path: ROUTES.DATA,
        component: Data
    },
    {
        path: ROUTES.CSV_IMPORT,
        component: requireAuthentication(CsvImport)
    },
    {
        path: ROUTES.BENCHMARKS,
        exact: true,
        component: Benchmarks
    },
    {
        path: ROUTES.BENCHMARK,
        component: Benchmark
    },
    {
        path: ROUTES.REVIEW_NEW,
        component: requireAuthentication(ReviewNew)
    },
    {
        path: ROUTES.REVIEW_DIFF,
        component: ReviewDiff
    },
    {
        path: ROUTES.REVIEW,
        component: Review
    },
    {
        path: ROUTES.REVIEWS,
        component: Reviews
    },
    {
        path: ROUTES.CONTRIBUTION_EDITOR,
        component: requireAuthentication(ContributionEditor)
    },
    {
        path: ROUTES.ADD_COMPARISON,
        component: AddComparison
    },
    {
        path: ROUTES.TOOLS,
        component: Tools
    },
    {
        path: ROUTES.PAGE,
        component: Page
    },
    {
        path: ROUTES.ABOUT,
        component: About
    },
    {
        path: ROUTES.HELP_CENTER_CATEGORY,
        component: HelpCenterCategory
    },
    {
        path: ROUTES.HELP_CENTER_ARTICLE,
        component: HelpCenterArticle
    },
    {
        path: ROUTES.HELP_CENTER_SEARCH,
        component: HelpCenterSearch
    },
    {
        path: ROUTES.LITERATURE_LISTS,
        component: LiteratureLists
    },
    {
        path: ROUTES.LITERATURE_LIST_NEW,
        component: LiteratureListNew
    },
    {
        path: ROUTES.LITERATURE_LIST_DIFF,
        component: LiteratureListDiff
    },
    {
        path: ROUTES.LITERATURE_LIST,
        component: LiteratureList
    },
    // redirect legacy route
    {
        path: ROUTES.CURATION_CALL,
        component: () => {
            window.location.replace('https://www.orkg.org/orkg/about/28/Curation_Grants');
            return null;
        }
    },
    {
        path: ROUTES.HELP_CENTER,
        component: HelpCenter
    },
    {
        path: ROUTES.WEBINAR_MAY_11,
        component: WebinarMay11
    },
    {
        path: ROUTES.USER_UNPUBLISHED_REVIEWS,
        component: () => <Redirect to={{ pathname: reverse(ROUTES.USER_SETTINGS, { tab: 'draft-reviews' }), state: { status: 301 } }} />
    }
];

const legacyRoutes = [
    {
        path: ROUTES.SMART_REVIEW_NEW,
        component: () => <Redirect to={{ pathname: ROUTES.REVIEW_NEW, state: { status: 301 } }} />
    },
    {
        path: ROUTES.SMART_REVIEW_DIFF,
        component: ({ match }) => (
            <Redirect
                to={{ pathname: reverse(ROUTES.REVIEW_DIFF, { oldId: match.params.oldId, newId: match.params.newId }), state: { status: 301 } }}
            />
        )
    },
    {
        path: ROUTES.SMART_REVIEW,
        component: ({ match }) => <Redirect to={{ pathname: reverse(ROUTES.REVIEW, { id: match.params.id }), state: { status: 301 } }} />
    },
    {
        path: ROUTES.SMART_REVIEWS,
        component: () => <Redirect to={{ pathname: ROUTES.REVIEWS, state: { status: 301 } }} />
    }
];

const allRoutes = [
    ...routes,
    ...legacyRoutes,
    // NotFound must be the last route
    {
        component: NotFound
    }
];

export default allRoutes;
