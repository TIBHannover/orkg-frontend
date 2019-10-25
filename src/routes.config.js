import React from 'react';
import { Redirect } from 'react-router-dom';
import ResourceDetails from './pages/ResourceDetails'
import AddPaper from './components/AddPaper/AddPaper'
import AddResource from './pages/AddResource';
import Comparison from './components/Comparison/Comparison';
import Home from './components/Home/Home';
import License from './components/StaticPages/License';
import NotFound from './components/StaticPages/NotFound';
import Papers from './pages/Papers';
import PredicateDetails from './pages/PredicateDetails';
import Predicates from './pages/Predicates';
import ROUTES from './constants/routes';
import RedirectShortLinks from './components/Comparison/RedirectShortLinks';
import ResearchField from './components/ResearchField/ResearchField'
import ResearchProblem from './components/ResearchProblem/ResearchProblem'
import Resources from './pages/Resources'
import SearchResults from './components/Search/Search'
import ViewPaper from './components/ViewPaper/ViewPaper';
import Stats from './components/Stats/Stats';
import UserSettings from './components/UserSettings/UserSettings';
import UserProfile from './components/UserProfile/UserProfile';


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
  /*{
    path: ROUTES.SIGNOUT,
    exact: true,
    component: () => <Redirect to={{ pathname: '/', state: { signedOut: true } }} />,
  },*/
  {
    path: ROUTES.USER_SETTINGS,
    exact: true,
    component: UserSettings,
  },
  {
    path: ROUTES.USER_PROFILE,
    exact: true,
    component: UserProfile,
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
    /* TODO: Remove this route (it's temporarily backward compatibility for moving contributions ids from view args to query string) */
    path: ROUTES.COMPARISON + '*',
    exact: true,
    // eslint-disable-next-line react/prop-types
    component: ({ match, location }) => <Redirect to={`${ROUTES.COMPARISON}?contributions=${match.params[0].split('/').join(',')}${location.search ? '&' + (location.search.charAt(0) === '?' ? location.search.substr(1) : location.search) : ''}`} />
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
    path: ROUTES.RESSOURCE_DETAILS,
    component: ResourceDetails
  },
  {
    path: ROUTES.PREDICATE_DETAILS,
    component: PredicateDetails
  },
  {
    path: ROUTES.TPDL,
    component: () => <Redirect to={'/'} />
  },
  /* Don't add routes below this line */
  {
    component: NotFound
  }
]

export default routes;
