/* eslint-disable react/prop-types */
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import useParams from 'components/NextJsMigration/useParams';
import ResourceDetails from 'app/resource/[id]/[[...activeTab]]/page';
import AddPaper from 'app/add-paper/page';
import AuthorPage from 'app/author/[authorId]/page';
import VenuePage from 'app/venue/[venueId]/page';
import AddResource from 'app/addResource/page';
import Comparison from 'app/comparison/[[...comparisonId]]/page';
import ComparisonDiff from 'app/comparison/diff/[oldId]/[newId]/page';
import Home from 'app/page';
import Changelog from 'app/changelog/page';
import NotFound from 'app/not-found';
import Papers from 'app/papers/page';
import Comparisons from 'app/comparisons/page';
import Visualizations from 'app/visualizations/page';
import Visualization from 'app/visualization/[id]/page';
import ClassDetails from 'app/class/[id]/[[...activeTab]]/page';
import Classes from 'app/classes/page';
import AddClass from 'app/addClass/page';
import Properties from 'app/properties/page';
import AddProperty from 'app/addProperty/page';
import PropertyDetails from 'app/property/[id]/page';
import Templates from 'app/templates/page';
import ImportSHACL from 'app/template/ImportSHACL/page';
import Template from 'app/template/[id]/[[...activeTab]]/page';
import ROUTES from 'constants/routes';
import RedirectShortLinks from 'app/c/[shortCode]/page';
import ResearchField from 'app/field/[researchFieldId]/[[...slug]]/page';
import ResearchFields from 'app/fields/page';
import Resources from 'app/resources/page';
import Organizations from 'app/organizations/[id]/page';
import Observatories from 'app/observatories/[[...researchFieldId]]/page';
import Organization from 'app/organization/[type]/[id]/page';
import AddOrganization from 'app/addOrganization/[type]/page';
import AddObservatory from 'app/organizations/[id]/addObservatory/page';
import Observatory from 'app/observatory/[id]/page';
import SearchResults from 'app/search/[searchTerm]/page';
import Stats from 'app/stats/page';
import UserSettings from 'app/settings/[[...tab]]/page';
import UserProfile from 'app/u/[userId]/[[...activeTab]]/page';
import Data from 'app/data/page';
import Contribution from 'app/contribution/[id]/page';
import CsvImport from 'app/csv-import/page';
import Review from 'app/review/[id]/page';
import Reviews from 'app/reviews/page';
import ReviewNew from 'app/review/new/page';
import ReviewDiff from 'app/review/diff/[oldId]/[newId]/page';
import Tools from 'app/tools/page';
import AddComparison from 'app/add-comparison/page';
import requireAuthentication from 'requireAuthentication';
import Benchmarks from 'app/benchmarks/page';
import Benchmark from 'app/benchmark/[datasetId]/problem/[problemId]/page';
import { reverse } from 'named-urls';
import ContributionEditor from 'app/contribution-editor/page';
import Page from 'app/page/[url]/page';
import About from 'app/about/[id]/[[...slug]]/page';
import HelpCenter from 'app/help-center/page';
import HelpCenterCategory from 'app/help-center/category/[id]/page';
import HelpCenterArticle from 'app/help-center/article/[id]/[slug]/page';
import HelpCenterSearch from 'app/help-center/search/[searchQuery]/page';
import WebinarMay11 from 'app/webinar-may-11/page';
import CheckPaperVersion from 'app/paper/[resourceId]/[[...contributionId]]/page';
import Lists from 'app/lists/page';
import ListNew from 'app/list/new/page';
import List from 'app/list/[id]/[[...embed]]/page';
import ListDiff from 'app/list/diff/[oldId]/[newId]/page';
import ContentTypeNew from 'app/content-type/[type]/new/page';
import ContentType from 'app/content-type/[type]/[id]/page';
import ContentTypes from 'app/content-type/[type]/page';
import Diagrams from 'app/diagrams/page';
import Diagram from 'app/diagram/[[...id]]/page';
import ConferenceDetails from 'app/event-series/[id]/page';
import AddConference from 'app/organizations/[id]/addEvent/page';
import ResearchProblem from 'app/problem/[researchProblemId]/[[...slug]]/page';
import AuthorLiteral from 'app/author-literal/[authorString]/page';
import TemplateNew from 'app/template/page';

// use lazy loading of pages that contain large dependencies
// run "npm run analyze" to ensure the listed dependencies are not loaded elsewhere and thus end up in the bundle
const PdfTextAnnotation = lazy(() => import('app/pdf-text-annotation/page')); // for dependency "react-pdf-highlighter" ~1.16MB
const PdfAnnotation = lazy(() => import('app/pdf-annotation/page')); // for dependency "handsontable" ~887.4KB
const FeaturedComparisons = lazy(() => import('app/featured-comparisons/page')); // for dependency @fontawesome/free-solid-svg-icons used to show icons

const routes = [
    {
        path: ROUTES.HOME,
        element: Home,
    },
    {
        path: ROUTES.HOME_WITH_RESEARCH_FIELD,
        element: Home,
    },
    {
        path: ROUTES.RESOURCES,
        element: Resources,
    },
    {
        path: ROUTES.RESOURCE,
        element: ResourceDetails,
    },
    {
        path: ROUTES.RESOURCE_TABS,
        element: ResourceDetails,
    },
    {
        path: ROUTES.ADD_RESOURCE,
        element: requireAuthentication(AddResource),
    },
    {
        path: ROUTES.PROPERTIES,
        element: Properties,
    },
    {
        path: ROUTES.PROPERTY,
        element: PropertyDetails,
    },
    {
        path: ROUTES.ADD_PROPERTY,
        element: requireAuthentication(AddProperty),
    },
    {
        path: ROUTES.CLASSES,
        element: Classes,
    },
    {
        path: ROUTES.CLASS,
        element: ClassDetails,
    },
    {
        path: ROUTES.CLASS_TABS,
        element: ClassDetails,
    },
    {
        path: ROUTES.ADD_CLASS,
        element: requireAuthentication(AddClass),
    },
    {
        path: ROUTES.TEMPLATES,
        element: Templates,
    },
    {
        path: ROUTES.IMPORT_SHACL,
        element: requireAuthentication(ImportSHACL),
    },
    {
        path: ROUTES.TEMPLATE,
        element: Template,
    },
    {
        path: ROUTES.TEMPLATE_TABS,
        element: Template,
    },
    {
        path: ROUTES.ADD_TEMPLATE,
        element: TemplateNew,
    },
    {
        path: ROUTES.USER_SETTINGS,
        element: requireAuthentication(UserSettings),
    },
    {
        path: ROUTES.USER_SETTINGS_DEFAULT,
        element: requireAuthentication(UserSettings),
    },
    {
        path: ROUTES.USER_PROFILE,
        element: UserProfile,
    },
    {
        path: ROUTES.USER_PROFILE_TABS,
        element: UserProfile,
    },
    {
        path: ROUTES.ADD_PAPER,
        element: AddPaper,
    },
    {
        /* TODO: slug for the paper title */
        path: ROUTES.VIEW_PAPER_CONTRIBUTION,
        element: CheckPaperVersion,
    },
    {
        path: ROUTES.VIEW_PAPER,
        element: CheckPaperVersion,
    },
    {
        path: ROUTES.COMPARISON_DIFF,
        element: ComparisonDiff,
    },
    {
        path: ROUTES.COMPARISON_SHORTLINK,
        element: RedirectShortLinks,
    },
    {
        path: ROUTES.COMPARISON,
        element: Comparison,
    },
    {
        path: ROUTES.COMPARISON_NOT_PUBLISHED,
        element: Comparison,
    },
    {
        path: ROUTES.ORGANIZATIONS,
        element: Organizations,
    },
    {
        path: ROUTES.OBSERVATORIES,
        element: Observatories,
    },
    {
        path: ROUTES.OBSERVATORIES_RESEARCH_FIELD,
        element: Observatories,
    },
    {
        path: ROUTES.PAPERS,
        element: Papers,
    },
    {
        path: ROUTES.COMPARISONS,
        element: Comparisons,
    },

    {
        path: ROUTES.VISUALIZATIONS,
        element: Visualizations,
    },
    {
        path: ROUTES.VISUALIZATION,
        element: Visualization,
    },
    {
        path: ROUTES.RESEARCH_PROBLEM,
        element: ResearchProblem,
    },
    {
        path: ROUTES.RESEARCH_PROBLEM_NO_SLUG,
        element: ResearchProblem,
    },
    {
        path: ROUTES.RESEARCH_FIELD,
        element: ResearchField,
    },
    {
        path: ROUTES.RESEARCH_FIELD_NO_SLUG,
        element: ResearchField,
    },

    {
        path: ROUTES.RESEARCH_FIELDS,
        element: ResearchFields,
    },
    {
        path: ROUTES.VENUE_PAGE,
        element: VenuePage,
    },
    {
        path: ROUTES.AUTHOR_PAGE,
        element: AuthorPage,
    },
    {
        path: ROUTES.AUTHOR_LITERAL,
        element: AuthorLiteral,
    },
    {
        path: ROUTES.CHANGELOG,
        element: Changelog,
    },
    {
        path: ROUTES.SEARCH,
        element: SearchResults,
    },
    {
        path: ROUTES.STATS,
        element: Stats,
    },
    /* Legacy routes, only used for debugging now */
    {
        path: ROUTES.FEATURED_COMPARISONS,
        element: FeaturedComparisons,
    },
    {
        path: ROUTES.ORGANIZATION,
        element: Organization,
    },
    {
        path: ROUTES.ADD_ORGANIZATION,
        element: requireAuthentication(AddOrganization),
    },
    {
        path: ROUTES.ADD_OBSERVATORY,
        element: requireAuthentication(AddObservatory),
    },
    {
        path: ROUTES.OBSERVATORY,
        element: Observatory,
    },
    {
        path: ROUTES.PDF_TEXT_ANNOTATION,
        element: PdfTextAnnotation,
    },
    {
        path: ROUTES.TPDL,
        element: () => <Navigate to="/" />,
    },
    {
        path: ROUTES.PDF_ANNOTATION,
        element: requireAuthentication(PdfAnnotation),
    },
    {
        path: ROUTES.CONTRIBUTION,
        element: Contribution,
    },
    {
        path: ROUTES.EXPORT_DATA,
        element: () => <Navigate to={{ pathname: reverse(ROUTES.DATA), state: { status: 301 } }} />,
    },
    {
        path: ROUTES.DATA,
        element: Data,
    },
    {
        path: ROUTES.CSV_IMPORT,
        element: requireAuthentication(CsvImport),
    },
    {
        path: ROUTES.BENCHMARKS,
        element: Benchmarks,
    },
    {
        path: ROUTES.BENCHMARK,
        element: Benchmark,
    },
    {
        path: ROUTES.REVIEW_NEW,
        element: requireAuthentication(ReviewNew),
    },
    {
        path: ROUTES.REVIEW_DIFF,
        element: ReviewDiff,
    },
    {
        path: ROUTES.REVIEW,
        element: Review,
    },
    {
        path: ROUTES.REVIEWS,
        element: Reviews,
    },
    {
        path: ROUTES.CONTRIBUTION_EDITOR,
        element: requireAuthentication(ContributionEditor),
    },
    {
        path: ROUTES.ADD_COMPARISON,
        element: AddComparison,
    },
    {
        path: ROUTES.TOOLS,
        element: Tools,
    },
    {
        path: ROUTES.PAGE,
        element: Page,
    },
    {
        path: ROUTES.ABOUT,
        element: About,
    },
    {
        path: ROUTES.ABOUT_NO_SLUG,
        element: About,
    },
    {
        path: ROUTES.ABOUT_NO_SLUG_ID,
        element: About,
    },
    {
        path: ROUTES.HELP_CENTER_CATEGORY,
        element: HelpCenterCategory,
    },
    {
        path: ROUTES.HELP_CENTER_ARTICLE,
        element: HelpCenterArticle,
    },
    {
        path: ROUTES.HELP_CENTER_SEARCH,
        element: HelpCenterSearch,
    },
    {
        path: ROUTES.LISTS,
        element: Lists,
    },
    {
        path: ROUTES.LIST_NEW,
        element: ListNew,
    },
    {
        path: ROUTES.LIST_DIFF,
        element: ListDiff,
    },
    {
        path: ROUTES.LIST,
        element: List,
    },
    {
        path: ROUTES.LIST_EMBED,
        element: List,
    },
    // redirect legacy route
    {
        path: ROUTES.CURATION_CALL,
        element: () => {
            window.location.replace('https://www.orkg.org/about/28/Curation_Grants');
            return null;
        },
    },
    {
        path: ROUTES.HELP_CENTER,
        element: HelpCenter,
    },
    {
        path: ROUTES.WEBINAR_MAY_11,
        element: WebinarMay11,
    },
    {
        path: ROUTES.USER_UNPUBLISHED_REVIEWS,
        element: () => <Navigate to={{ pathname: reverse(ROUTES.USER_SETTINGS, { tab: 'draft-reviews' }), state: { status: 301 } }} />,
    },
    {
        path: ROUTES.CONTENT_TYPE_NEW,
        element: ContentTypeNew,
    },
    {
        path: ROUTES.CONTENT_TYPE_NEW_NO_TYPE,
        element: ContentTypeNew,
    },
    {
        path: ROUTES.CONTENT_TYPE,
        element: ContentType,
    },
    {
        path: ROUTES.CONTENT_TYPES,
        element: ContentTypes,
    },
    {
        path: ROUTES.DIAGRAMS,
        element: Diagrams,
    },
    {
        path: ROUTES.DIAGRAM,
        element: Diagram,
    },
    {
        path: ROUTES.NEW_DIAGRAM,
        element: Diagram,
    },
    {
        path: ROUTES.ADD_EVENT,
        element: requireAuthentication(AddConference),
    },
    {
        path: ROUTES.EVENT_SERIES,
        element: ConferenceDetails,
    },
];

const legacyRoutes = [
    {
        path: ROUTES.SMART_REVIEW_NEW,
        element: () => <Navigate to={ROUTES.REVIEW_NEW} replace />,
    },
    {
        path: ROUTES.SMART_REVIEW_DIFF,
        element: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { oldId, newId } = useParams();
            return <Navigate to={reverse(ROUTES.REVIEW_DIFF, { oldId, newId })} replace />;
        },
    },
    {
        path: ROUTES.SMART_REVIEW,
        element: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { id } = useParams();
            return <Navigate to={reverse(ROUTES.REVIEW, { id })} replace />;
        },
    },
    {
        path: ROUTES.SMART_REVIEWS,
        element: () => <Navigate to={ROUTES.REVIEWS} replace />,
    },
    {
        path: ROUTES.LITERATURE_LISTS,
        element: () => <Navigate to={ROUTES.LISTS} replace />,
    },
    {
        path: ROUTES.LITERATURE_LIST,
        element: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { id } = useParams();
            return <Navigate to={reverse(ROUTES.LIST, { id })} replace />;
        },
    },
    {
        path: ROUTES.LITERATURE_LIST_EMBED,
        element: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { id, embed } = useParams();
            return <Navigate to={reverse(ROUTES.LIST_EMBED, { id, embed })} replace />;
        },
    },
    {
        path: ROUTES.LITERATURE_LIST_NEW,
        element: () => <Navigate to={ROUTES.LIST_NEW} replace />,
    },
    {
        path: ROUTES.LITERATURE_LIST_DIFF,
        element: () => {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { oldId, newId } = useParams();
            return <Navigate to={reverse(ROUTES.LIST_DIFF, { oldId, newId })} replace />;
        },
    },
];

const allRoutes = [
    ...routes,
    ...legacyRoutes,
    // NotFound must be the last route
    {
        path: '*',
        element: NotFound,
    },
];

export default allRoutes;
