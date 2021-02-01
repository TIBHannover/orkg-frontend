import { lazy } from 'react';
import { Redirect } from 'react-router-dom';
import ResourceDetails from 'pages/Resources/Resource';
import AddPaper from 'pages/AddPaper';
import AuthorPage from 'pages/AuthorPage';
import VenuePage from 'pages/VenuePage';
import AddResource from 'pages/Resources/AddResource';
import Comparison from 'pages/Comparison';
import Home from 'pages/Home';
import License from 'pages/License';
import DataProtection from 'pages/DataProtection';
import TermsOfUse from 'pages/TermsOfUse';
import Changelog from 'pages/Changelog/Changelog';
import NotFound from 'pages/NotFound';
import Papers from 'pages/Papers';
import Comparisons from 'pages/Comparisons';
import Classes from 'pages/Classes/Classes';
import ClassDetails from 'pages/Classes/ClassDetails';
import AddClass from 'pages/Classes/AddClass';
import Properties from 'pages/Properties/Properties';
import AddProperty from 'pages/Properties/AddProperty';
import PropertyDetails from 'pages/Properties/Property';
import ContributionTemplates from 'pages/ContributionTemplates/ContributionTemplates';
import ContributionTemplate from 'pages/ContributionTemplates/ContributionTemplate';
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
import OrganizationObservatories from 'pages/Observatories/OrganizationObservatories';
import SearchResults from 'pages/Search';
import ViewPaper from 'pages/ViewPaper';
import Stats from 'pages/Stats';
import UserSettings from 'pages/UserSettings';
import UserProfile from 'pages/UserProfile';
import FeaturedComparisons from 'pages/FeaturedComparisons';
import ExportData from 'pages/ExportData';
import Contribution from 'pages/Contribution';
import CsvImport from 'pages/CsvImport';
import requireAuthentication from 'requireAuthentication';
import { reverse } from 'named-urls';

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
        path: ROUTES.CONTRIBUTION_TEMPLATES,
        exact: true,
        component: ContributionTemplates
    },
    {
        path: ROUTES.CONTRIBUTION_TEMPLATE,
        exact: true,
        component: ContributionTemplate
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
        path: ROUTES.LICENSE,
        component: License
    },
    {
        path: ROUTES.DATA_PROTECTION,
        component: DataProtection
    },
    {
        path: ROUTES.TERMS_OF_USE,
        component: TermsOfUse
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
        path: ROUTES.ORGANIZATION_OBSERVATORIES,
        exact: true,
        component: OrganizationObservatories
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
        component: ExportData
    },
    {
        path: ROUTES.CSV_IMPORT,
        component: requireAuthentication(CsvImport)
    },
    /* Don't add routes below this line */
    {
        component: NotFound
    }
];

export default routes;
