import React from 'react';
import ROUTES from './constants/routes.js';
import { Redirect } from 'react-router-dom';
import ResourceDetails, { descriptionSection } from './pages/ResourceDetails'
import PredicateDetails from './pages/PredicateDetails'
import ResearchProblem from './components/ResearchProblem/ResearchProblem'
import ResearchField from './components/ResearchField/ResearchField'
import Resources from './pages/Resources'
import SearchResults from './pages/SearchResults'
import AddResource from './pages/AddResource';
import Predicates from './pages/Predicates';
import Papers from './pages/Papers';
import AddPaper from './components/AddPaper/AddPaper'
import Home from './components/Home/Home';
import ViewPaper from './components/ViewPaper/ViewPaper';
import License from './components/StaticPages/License';
import NotFound from './components/StaticPages/NotFound';
import Comparison from './components/Comparison/Comparison';


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
        path: ROUTES.ADD_RESOURCE,
        exact: true,
        component: AddResource
    },
    {
        path: ROUTES.PREDICATES,
        exact: true,
        component: Predicates
    },
    {
        path: ROUTES.ADD_PAPER.GENERAL_DATA,
        exact: true,
        component: AddPaper
    },
    {
        path: ROUTES.VIEW_PAPER_CONTRIBUTION,
        exact: true,
        component: ViewPaper
    },
    {
        /* TODO: slug for the paper title */
        path: ROUTES.VIEW_PAPER,
        exact: true,
        component: ViewPaper
    },
    {
        path: ROUTES.COMPARISON,
        exact: true,
        component: Comparison
    },
    {
        path: ROUTES.PAPERS,
        exact: true,
        component: Papers
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
        path: ROUTES.LICENSE,
        component: License
    },
    /* Legacy routes, only used for debugging now */
    {
        path: ROUTES.RESSOURCE_DETAILS,
        component: ResourceDetails
    },
    {
        path: ROUTES.PREDICATE_DETAILS,
        component: PredicateDetails
    },
    {
        path: ROUTES.SEARCH,
        component: SearchResults
    },
    {
        path: '/resource/:resourceId',
        exact: true,
        // eslint-disable-next-line react/prop-types
        component: ({ match }) => <Redirect to={`/resource/${match.params.resourceId}/${descriptionSection}`} />
    },
    /* Don't add routes below this line */
    {
        component: NotFound
    }
]

export default routes