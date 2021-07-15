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
import SmartReview from 'pages/SmartReview/SmartReview';
import SmartReviews from 'pages/SmartReview/SmartReviews';
import UserUnpublishedArticles from 'pages/SmartReview/UserUnpublishedArticles';
import SmartReviewNew from 'pages/SmartReview/SmartReviewNew';
import SmartReviewDiff from 'pages/SmartReview/SmartReviewDiff';
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
import ROUTES_CMS from 'constants/routesCms';
import WebinarMay11 from 'pages/WebinarMay11';

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
        // eslint-disable-next-line react/prop-types
        component: ({ match, location }) => (
            <Redirect
                // eslint-disable-next-line react/prop-types
                to={`${reverse(ROUTES.COMPARISON)}?contributions=${match.params[0].split('/').join(',')}${
                    // eslint-disable-next-line react/prop-types
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
        // eslint-disable-next-line react/prop-types
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
        path: ROUTES.SMART_REVIEW_NEW,
        component: requireAuthentication(SmartReviewNew)
    },
    {
        path: ROUTES.SMART_REVIEW_DIFF,
        component: SmartReviewDiff
    },
    {
        path: ROUTES.SMART_REVIEW,
        component: SmartReview
    },
    {
        path: ROUTES.SMART_REVIEWS,
        component: SmartReviews
    },
    {
        path: ROUTES.USER_UNPUBLISHED_REVIEWS,
        component: requireAuthentication(UserUnpublishedArticles)
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
    // redirect legacy route
    {
        path: '/open-call-curation-grant',
        component: () => <Redirect to={{ pathname: reverse(ROUTES.PAGE, { url: ROUTES_CMS.CURATION_CALL }), state: { status: 301 } }} />
    },
    {
        path: ROUTES.HELP_CENTER,
        component: HelpCenter
    },
    {
        path: ROUTES.WEBINAR_MAY_11,
        component: WebinarMay11
    },
    /* Don't add routes below this line */
    {
        component: NotFound
    }
];

export default routes;
