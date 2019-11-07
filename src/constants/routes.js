//import { include } from 'named-urls'

export default {
   HOME: '/',
   RESOURCES: '/resources',
   ADD_RESOURCE: '/addResource',
   PREDICATES: '/predicates',
   ADD_PAPER: {
      GENERAL_DATA: '/add-paper'
   },
   VIEW_PAPER: '/paper/:resourceId/:contributionId?',
   COMPARISON_SHORTLINK: '/c/:shortCode',
   COMPARISON: '/comparison/',
   PAPERS: '/papers',
   RESEARCH_PROBLEM: '/problem/:researchProblemId',
   RESEARCH_FIELD: '/field/:researchFieldId',
   AUTHOR_PAGE: '/author/:authorId',
   LICENSE: '/license',
   /* Legacy routes, only used for debugging now */
   RESSOURCE_DETAILS: '/resource/:resourceId',
   PREDICATE_DETAILS: '/predicate/:predicateId',
   SEARCH: '/search/:searchTerm?',
   TPDL: '/tpdl',
   STATS: '/stats',
}