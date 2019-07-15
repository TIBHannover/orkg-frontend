//import { include } from 'named-urls'

export default {
   HOME: '/',
   RESOURCES: '/resources',
   ADD_RESOURCE: '/addResource',
   PREDICATES: '/predicates',
   ADD_PAPER: {
      GENERAL_DATA: '/add-paper'
   },
   VIEW_PAPER_CONTRIBUTION: '/paper/:resourceId/:contributionId',
   VIEW_PAPER: '/paper/:resourceId',
   COMPARISON: '/comparison/*',
   PAPERS: '/papers',
   RESEARCH_PROBLEM: '/problem/:researchProblemId',
   RESEARCH_FIELD: '/field/:researchFieldId',
   LICENSE: '/license',
   /* Legacy routes, only used for debugging now */
   RESSOURCE_DETAILS: '/resource/:resourceId/:sectionName',
   PREDICATE_DETAILS: '/predicate/:predicateId',
   SEARCH: '/search/:searchTerm',
}