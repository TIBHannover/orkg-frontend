All notable changes to the ORKG will be documented in this file. The format is based on [Keep a
Changelog](https://keepachangelog.com/en/1.0.0/) and we adhere to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

---
## [v0.163.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.162.5...v0.163.0) - 2025-05-14

### Changes

- fix: authors in edit paper modal lost when rerendered [`#1544`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1544)
- fix: correct the titles of organization and conference pages [`#1535`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1535)
- fix: papers all have "January" as publication month [`#1543`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1543)
- refactor: semantify button in csv table with modal [`#1428`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1428)

---
## [v0.162.5](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.162.4...v0.162.5) - 2025-05-06

### Changes

- fix: omit credentials to prevent sending cookies to backend API [`#1542`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1542)

---
## [v0.162.4](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.162.3...v0.162.4) - 2025-04-14

### Changes

- fix(AbstractAnnotator): last character of each field is missing [`#1537`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1537)

---
## [v0.162.3](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.162.2...v0.162.3) - 2025-04-11

### Changes

- chore: add link verification of mastodon in the header [`#1536`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1536)
- chore: update compose file [`#1534`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1534)

---
## [v0.162.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.162.1...v0.162.2) - 2025-03-28

### Changes

- refactor: add @ path alias pointing to src directory [`#1531`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1531)
- fix(DataBrowser): enable auto-focus on the autocomplete [`#1527`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1527)
- fix(DataBrowser): add Paper class to collapsed classes [`#1525`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1525)
- refactor: convert header component to typescript [`#1521`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1521)
- chore: sync with backend by migrating to snake_case query parameters [`#1530`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1530)
- fix: observatory filters config initial value [`#1533`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1533)
- fix: comparison page server component [`#1529`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1529)

---
## [v0.162.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.162.0...v0.162.1) - 2025-03-24

### Changes

- fix: increase the timeout for SimComp, NLP and SimPaper calls [`#1528`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1528)

---
## [v0.162.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.161.0...v0.162.0) - 2025-03-24

### Changes

- chore: update nextjs to 14.2.25 [`#1526`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1526)
- refactor: upgrade to nuqs 2 and migrate to Vitest [`#1523`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1523)
- feat(Review): add go to resource page in the resource section [`#1522`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1522)
- fix: disable Image optimization in case of error [`#1520`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1520)
- fix: update class request method [`#1524`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1524)
- feat: use server component for paper page [`#1519`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1519)

---
## [v0.161.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.160.7...v0.161.0) - 2025-03-10

### Changes

- feat: display the number of content types on tabs [`#1516`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1516)
- refactor: replace tippy with floating-ui [`#1512`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1512)
- feat: render COinS metadata [`#1505`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1505)
- fix: hide Add new paper on falsy allowCreate [`#1517`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1517)
- refactor: migrate to new page fields [`#1502`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1502)
- feat: display formatted labels outside contribution view [`#1500`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1500)
- feat: install Tailwind [`#1518`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1518)
- fix: use useHash instead of useLocation from react-use [`#1513`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1513)
- feat: add content types to research fields taxonomy page [`#1514`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1514)
- fix: clearing the DOI field using the paper metadata input form [`#1515`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1515)
- fix: papers on front-page are not sorted by descending creation date [`#1511`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1511)
- fix(Autocomplete): added props to align the autocomplete menu to right [`#1510`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1510)
- fix: converting the data type of an already stored literal [`#1509`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1509)
- fix: redirection page for papers [`#1508`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1508)
- refactor: replace momentjs with dayjs [`#1499`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1499)
- chore: update widgets dependencies [`#1497`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1497)

---
## [v0.160.7](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.160.6...v0.160.7) - 2025-02-21

### Changes

- fix: update refreshAccessToken to return expires_at in seconds and revert !1504 [`#1506`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1506)
- fix: correct typos in README [`#1507`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1507)

---
## [v0.160.6](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.160.5...v0.160.6) - 2025-02-18

### Changes

- fix: signout if getUserInformation returns 401 [`#1504`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1504)

---
## [v0.160.5](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.160.4...v0.160.5) - 2025-02-18

### Changes

- fix: assume no forward slash in Keycloak URL endpoints [`#1503`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1503)

---
## [v0.160.4](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.160.3...v0.160.4) - 2025-02-17

### Changes

- refactor: replace keycloak-js with NextAuth + keycloak adapter [`#1490`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1490)

---
## [v0.160.3](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.160.2...v0.160.3) - 2025-02-12

### Changes

- fix: return service.tib.eu to CORS config [`#1498`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1498)

---
## [v0.160.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.160.1...v0.160.2) - 2025-02-11

### Changes

- fix: merge conflict of !1495 with master [`#1496`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1496)
- chore: update storybook [`#1495`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1495)
- refactor: ols service and use openapi-typescript [`#1492`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1492)
- fix: update the list of predicates for abstract annotation [`#1494`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1494)
- perf: skip filter content-types by research field on front page [`#1493`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1493)
- fix: use tabs in research problem page [`#1489`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1489)
- fix: allow new lines in property descriptions (revert !1471) [`#1477`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1477)

---
## [v0.160.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.160.0...v0.160.1) - 2025-01-27

### Changes

- refactor(Review): migrate to TypeScript, integrate new backend endpoints, use SWR [`#1412`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1412)
- fix: useAddPaper hooks and autocomplete helpers [`#1488`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1488)
- fix: resource relationship loops seem to loop infinitely [`#1487`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1487)
- refactor: value plugins change loading method, use typescript [`#1486`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1486)

---
## [v0.160.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.159.0...v0.160.0) - 2025-01-24

### Changes

- feat(Statement): add edit mode to rosetta statement page [`#1474`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1474)
- fix: set correct parameters for Autocomplete in TableCellForm of the contribution editor [`#1482`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1482)
- chore: update husky [`#1485`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1485)
- fix: update the heuristic approach to display the CategoricalFilter and fix the TextFilter [`#1484`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1484)

---
## [v0.159.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.158.0...v0.159.0) - 2025-01-17

### Changes

- fix(Databrowser): literal constraints [`#1483`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1483)
- fix(StatementBrowser): adding and deleting items from lists [`#1469`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1469)
- feat: redirection page for papers [`#1470`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1470)
- refactor: convert some files to typescript [`#1475`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1475)
- chore: remove handsontable from the dependencies [`#1481`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1481)
- fix: pdf sentence annotator tool [`#1480`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1480)
- fix: add additional data to the autocomplete [`#1479`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1479)
- fix: validation of integer in validationSchema [`#1478`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1478)
- fix: truncate rosetta statement context badge [`#1476`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1476)
- feat: add visibility selector to content type pages [`#1473`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1473)
- fix: search field breaks with small horizontal resolution [`#1472`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1472)

---
## [v0.158.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.157.0...v0.158.0) - 2025-01-14

### Changes

- fix(Template): remove new lines from the description input fields [`#1471`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1471)
- feat: add support for additional literal types (time and duration) [`#1425`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1425)

---
## [v0.157.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.156.0...v0.157.0) - 2025-01-13

### Changes

- chore: remove support for discussions [`#1463`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1463)
- fix: hide content on 500 error [`#1465`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1465)
- feat: update the statistics page to display the number of comparison versions and lists [`#1462`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1462)
- fix: disable the dots placeholder for pagination [`#1464`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1464)
- refactor: convert ErrorBoundary to typescript [`#1466`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1466)
- feat(PaperView): paginate rosetta statements and add noDataComponent prop to PaginatedContent [`#1461`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1461)
- fix: sort observatories alphabetically by label [`#1467`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1467)
- fix: adding a new resources in the contributing editor [`#1468`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1468)
- refactor(Lists): use publish endpoint [`#1453`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1453)

---
## [v0.156.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.155.0...v0.156.0) - 2024-12-20

### Changes

- feat(Search): add ORKG Ask example questions [`#1454`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1454)

---
## [v0.155.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.154.5...v0.155.0) - 2024-12-20

### Changes

- feat: use content type tables endpoint for Table instance preview [`#1401`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1401)
- fix: remove document title update from the InternalServerError component [`#1460`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1460)
- fix(ContributionEditor): properly handle ConfirmCreatePropertyModal usage [`#1459`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1459)
- fix(DataBrowser): correct URL on the entity label [`#1458`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1458)
- feat(Observatory): display urls in the description as clickable links [`#1457`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1457)
- feat: display the value as the first option in autocomplete [`#1451`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1451)
- fix: delete rosetta statement [`#1448`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1448)
- feat: list Statements and statement types in the observatory page [`#1444`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1444)
- refactor: use backend endpoint for listing author works [`#1446`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1446)
- fix: pagination for class instances [`#1445`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1445)

---
## [v0.154.5](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.154.4...v0.154.5) - 2024-12-17

### Changes

- fix: update the comparison when a contribution is added or removed from the contribution editor [`#1455`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1455)

---
## [v0.154.4](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.154.3...v0.154.4) - 2024-12-16

### Changes

- fix: set correct prefixUrl for objects endpoint [`#1456`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1456)
- fix(Resource): add missing 'Comparison view' link for published comparisons [`#1452`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1452)

---
## [v0.154.3](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.154.2...v0.154.3) - 2024-12-13

### Changes

- fix: get paper by doi [`#1450`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1450)
- refactor: prevent mounting modals when not needed [`#1449`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1449)

---
## [v0.154.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.154.1...v0.154.2) - 2024-12-12

### Changes

- fix: export citation modal [`#1447`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1447)
- refactor: use ky for network requests [`#1418`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1418)

---
## [v0.154.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.154.0...v0.154.1) - 2024-12-10

### Changes

- test: mock things endpoint [`#1443`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1443)

---
## [v0.154.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.153.0...v0.154.0) - 2024-12-09

### Changes

- refactor: use endpoint for fetching things by id [`#1440`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1440)
- feat: redirection after sign-in to the same page [`#1439`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1439)
- refactor: use new backend endpoints for the research fields taxonomy [`#1441`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1441)
- fix: multiple loading texts when viewing rosetta statements of a paper [`#1442`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1442)
- feat: consolidate comparison editing and publishing [`#1402`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1402)

---
## [v0.153.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.152.0...v0.153.0) - 2024-12-03

### Changes

- feat: Quick action button to create a statement of the same type, using a resource as the subject [`#1405`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1405)
- refactor: top contributors dialog [`#1438`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1438)
- fix: responsiveness of pagination control [`#1436`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1436)
- fix: set 'view' as the text for the target class link [`#1435`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1435)
- fix: inconsistent URL highlighting in data browser [`#1437`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1437)
- feat: allow curators to create new observatories through the UI [`#1433`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1433)
- fix: smart suggestion icon shown for add value button that cannot be added [`#1434`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1434)
- feat: add pagination to the templates pages [`#1432`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1432)
- refactor: replace annotation service with nlp service [`#1427`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1427)
- feat: allow associating Rosetta Statement Types with observatories [`#1429`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1429)
- chore: set the env variable's default value for the public URL to localhost [`#1430`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1430)
- fix: hide "No Data" component in predicate DataBrowser [`#1431`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1431)

---
## [v0.152.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.151.1...v0.152.0) - 2024-11-21

### Changes

- feat: Pagination instead of "Load More" buttons [`#1403`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1403)

---
## [v0.151.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.151.0...v0.151.1) - 2024-11-21

### Changes

- fix: add frame-ancestors CSP rule for accounts.orkg.org [`#1426`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1426)

---
## [v0.151.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.150.1...v0.151.0) - 2024-11-20

### Changes

- feat: migrate to Keycloak [`#1415`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1415)
- fix(widget): support encoded doi and update dependencies [`#1416`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1416)
- feat(DataBrowser): trim values when making suggestions and migrate from Joi to Zod for validation [`#1424`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1424)
- feat: display slot details when hovering over Rosetta statement type placeholders [`#1421`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1421)
- chore: remove files related to Create React App [`#1422`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1422)
- fix: ensure there is a space after the verb in a Rosetta statement [`#1420`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1420)
- feat: make descriptions easier to fill and always display them at the top [`#1419`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1419)
- fix: embedding videos [`#1417`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1417)
- feat(Header): add link to ORKG Ask [`#1423`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1423)

---
## [v0.150.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.150.0...v0.150.1) - 2024-11-13

### Changes

- fix(DataBrowser): remove duplicate statements in the paper version snapshot [`#1413`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1413)
- fix: adapt LinkButton component to backend _class values [`#1414`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1414)

---
## [v0.150.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.149.0...v0.150.0) - 2024-11-07

### Changes

- feat: Compare Rosetta statement versions [`#1404`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1404)
- fix(Rosetta statement editor): placeholder not displayed for multiple literals [`#1407`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1407)
- refactor: use list section endpoints for creation, updating and deletion of sections [`#1406`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1406)
- refactor: consolidate metadata editing of Lists [`#1411`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1411)
- chore: lint commit message and install Commitizen [`#1409`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1409)
- fix: issue with loading changelog for dev server [`#1410`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1410)
- refactor: remove alias for FontAwesomeIcon import [`#1408`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1408)

---
## [v0.149.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.148.0...v0.149.0) - 2024-10-30

### Changes

- use Turbopack for Development [`#1399`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1399)
- feat: use dedicated import endpoints for external ontologies [`#1395`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1395)
- refactor: improve statement browser with new features and enhancements [`#1393`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1393)
- chore: update NextJs [`#1398`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1398)

---
## [v0.148.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.147.0...v0.148.0) - 2024-10-17

### Changes

- fix: Adding users should not require an email address [`#1397`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1397)

---
## [v0.147.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.146.3...v0.147.0) - 2024-10-17

### Changes

- fix(Routing): use custom useParams instead next/navigation [`#1394`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1394)
- fix(Routing): use custom useParams instead next/navigation [`#1390`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1390)
- feat: add links to ORKG academy [`#1396`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1396)
- refactor: useContributor [`#1392`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1392)
- Observatory/EditObservatory =&gt; converted class component into functional component [`#1340`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1340)

---
## [v0.146.3](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.146.2...v0.146.3) - 2024-10-10

### Changes

- fix(StatementBrowser): Clicking on smart suggestion for adding property [`#1391`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1391)

---
## [v0.146.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.146.1...v0.146.2) - 2024-09-20

### Changes

- fix(Comparison): show citations of top authors [`#1386`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1386)
- fix(Routing): use custom useParams instead next/navigation [`#1389`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1389)
- fix(Comparison): column minimum width [`#1388`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1388)
- fix(StatementType): Display descriptions in the UI [`#1387`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1387)
- fix: move infosheet-data-protection to the root of public folder [`#1385`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1385)

---
## [v0.146.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.146.0...v0.146.1) - 2024-09-13

### Changes

- refactor: use new publish comparison endpoints [`#1377`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1377)
- fix: use useSearchParams instead of useParams in search page [`#1376`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1376)
- refactor: rename default exports for constants files [`#1384`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1384)

---
## [v0.146.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.145.0...v0.146.0) - 2024-09-12

### Changes

- feat(ClassPage): show statement type [`#1381`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1381)
- fix(Template diagram): wrong cardinality [`#1383`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1383)
- fix(StatementType): Edit buttons display '0' when permission is falsy [`#1382`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1382)
- fix: Page of a missing property shows internal server error [`#1375`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1375)
- fix: Button label on user page "more load" instead of "load more" [`#1380`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1380)
- fix(Review): blacklist research fields when publishing [`#1379`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1379)
- feat: activate the search for resources (individuals) in getExternalData [`#1378`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1378)
- fix: Pluralize header on benchmarks page [`#1374`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1374)
- Contributions =&gt; AddedMentionings component, called getResource Api to fetcha single resource, AddItem component [`#1371`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1371)
- refactor: remove Next.js migration components [`#1373`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1373)
- fix(LiteratureList): blacklist research fields when publishing [`#1372`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1372)

---
## [v0.145.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.144.0...v0.145.0) - 2024-08-08

### Changes

- fix: data access page of incubating point to main ORKG [`#1370`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1370)
- feat: prototype Rosetta Stone [`#1355`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1355)

---
## [v0.144.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.143.1...v0.144.0) - 2024-08-02

### Changes

- fix(ContentType): redirection after create and editing failures [`#1368`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1368)
- fix: user feedback tab of quality report for comparison [`#1369`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1369)
- feat: Visualizing geo-data with openstreetmap [`#1341`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1341)
- ux: Reduce edge size in graph view [`#1364`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1364)
- remove the deprecated annotation from getStatementsBundleBySubject [`#1359`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1359)
- ux(StatementBrowser): auto-focus on input field while adding a new value [`#1361`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1361)
- fix: Empty related figure would break the UI [`#1366`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1366)
- fix: Allow creators to edit their comparison [`#1365`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1365)

---
## [v0.143.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.143.0...v0.143.1) - 2024-07-04

### Changes

- fix: issues while importing SHACL file [`#1360`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1360)

---
## [v0.143.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.142.1...v0.143.0) - 2024-06-25

### Changes

- refactor: use new literature list endpoints, rewrite to TypeScript [`#1326`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1326)
- show default changelog tooltip when no changelog was provided [`#1358`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1358)
- refactor: Autocomplete component [`#1350`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1350)
- feat: handle rendering of face markups, LaTeX, MathML in orkg paper titles [`#1357`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1357)
- Observatory/EditObservatory =&gt; converted class component into functional component [`#1332`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1332)
- ContributionTabs/ContributionTabs =&gt; imported ValuePlugins with prop type ENTITIES.LITERAL to wrap contribution.label [`#1351`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1351)
- DescriptivePropertySuggestion [`#1321`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1321)
- Observatory/EditObservatory =&gt; converted class component into functional component [`#1338`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1338)

---
## [v0.142.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.142.0...v0.142.1) - 2024-06-21

### Changes

- fix(ContributionEditor): cannot create new resources [`#1356`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1356)

---
## [v0.142.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.141.2...v0.142.0) - 2024-06-18

### Changes

- refactor: Autocomplete component [`#1343`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1343)
- fix: bundle analyzer, replace source-map-explorer with @next/bundle-analyzer [`#1349`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1349)
- fix(review): use route handlers to generate references [`#1347`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1347)
- ux: disable scroll to the top while changing filters or sorting on observatory page [`#1336`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1336)
- fix(Statement browser): Preferences are not well persisted [`#1348`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1348)
- fix(Resource): sign out when in edit mode [`#1346`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1346)
- fix: prevent editing of published comparisons [`#1345`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1345)
- feat: replace underline with strikethrough in markdown editor toolbar [`#1344`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1344)
- feat(AddPaper): support adding title via query parameter [`#1342`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1342)
- lint: update react/jsx-wrap-multilines [`#1337`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1337)

---
## [v0.141.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.141.1...v0.141.2) - 2024-05-30

### Changes

- fix(Comparison): decoding predicates list [`#1335`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1335)
- fix: check if research field is provided from SciKGTeX extraction [`#1339`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1339)

---
## [v0.141.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.141.0...v0.141.1) - 2024-05-24

### Changes

- fix(AddPaper): add extracted SciKGTeX contribution data [`#1333`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1333)
- style(Observatory): allow description text to get a large space [`#1334`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1334)

---
## [v0.141.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.140.0...v0.141.0) - 2024-05-11

### Changes

- refactor: migrate multiple components to TypeScript [`#1289`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1289)
- observatories(EditObservatories)=&gt; updated endpoint to updateObservatory [`#1307`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1307)
- feat(Resource): support setting the extraction method  [`#1312`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1312)
- Comparison(RelatedPaperCarousal)=&gt; added slidesToshow = 4, [`#1306`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1306)
- fix: redirect to resource page if the visualization is not linked to any comparison [`#1314`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1314)
- fix: applying template to all contributions in the contribution editor [`#1315`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1315)
- fix: Warning after editing contribution label [`#1322`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1322)
- Enable environment variables in storybook [`#1323`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1323)
- fix: unlisted badge missing in paper view [`#1324`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1324)
- fix: Paper url is not displayed under the "Access Paper" button [`#1327`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1327)
- fix: decode values of useParams and fix redirection in CheckSlug [`#1329`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1329)
- fix: Error in accessing templates from profile [`#1325`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1325)
- fix(TemplateEditor): switching tab reloads the template [`#1330`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1330)
- fix(ContributionEditor): listing suggested properties [`#1331`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1331)
- feat(Header): add ORKG birthday logo [`#1328`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1328)
- refactor: remove react-image-lightbox and update react-diff-viewer [`#1320`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1320)
- fix(Mastodon): solve hydration error by using next-client-cookies [`#1318`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1318)
- Layout(Footer): added a new L3S logo [`#1316`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1316)
- chore: Console error about Header component [`#1317`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1317)
- style: always have parentheses for arrow function arguments [`#1302`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1302)

---
## [v0.140.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.139.1...v0.140.0) - 2024-04-25

### Changes

- fix: storybook building [`#1313`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1313)
- refactor: migrate to Next.js [`#1198`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1198)

---
## [v0.139.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.139.0...v0.139.1) - 2024-04-23

### Changes

- fix: listing instances [`#1311`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1311)

---
## [v0.139.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.138.2...v0.139.0) - 2024-04-22

### Changes

- feat(Comparison): support customizable column width [`#1305`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1305)
- fix(LinkValuePlugin): exclude text without protocol [`#1308`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1308)
- feat(UploadPdfModal): disable Grobid extraction when SciKGTeX annotations are present [`#1309`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1309)
- feat(Property): support deletion of own unused properties [`#1310`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1310)
- Templates: use new backend endpoints [`#1297`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1297)

---
## [v0.138.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.138.1...v0.138.2) - 2024-04-04

### Changes

- fix(ResearchField): wrong dependency check [`#1303`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1303)

---
## [v0.138.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.138.0...v0.138.1) - 2024-04-04

### Changes

- tools/page =&gt; corrected the sentence [`#1301`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1301)
- fix tests, fix(StatementBrowser): filter list of help articles [`#1300`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1300)

---
## [v0.138.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.137.0...v0.138.0) - 2024-04-04

### Changes

- wip [`#1299`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1299)
- HelpCenter=&gt; typescript conversion [`#1282`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1282)

---
## [v0.137.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.136.0...v0.137.0) - 2024-04-03

### Changes

- Acknowledgements =&gt; changed the smart review methadology link and added The before orkg [`#1295`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1295)
- feat(Observatory): Faceted browsing of papers [`#1175`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1175)
- chore: Browserslist package update [`#1298`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1298)
- useQualityReport =&gt; changed entity.type into entity._class to fetch count of literals and resources [`#1288`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1288)
- EditableHeader=&gt; added check if id===wikidata then hide the editable icon of the resouce label [`#1274`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1274)
- chore: update twitter icon [`#1292`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1292)
- fix: Adding papers via List are missing metadata (publicationMonth, publicationYear) [`#1294`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1294)
- fix(Template): Set default cardinality for select input field according to the current value [`#1293`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1293)
- fix(LinkValuePlugin): skip renderToString if props.children is already a string [`#1291`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1291)
- fix(ValuePlugin): support URLs with trailing non-link characters [`#1290`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1290)
- feat(Resource): support deletion of own unused resources [`#1287`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1287)

---
## [v0.136.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.135.2...v0.136.0) - 2024-03-19

### Changes

- Display Table for persistent paper versions [`#1278`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1278)
- app(page) =&gt; converted to typescript [`#1280`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1280)
- fix(Template): Show error if loading fails [`#1285`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1285)
- fix(Paper): Add property button in template box is misaligned [`#1286`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1286)
- fix(Home): Fetching literature lists and smart reviews [`#1284`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1284)
- chore: require parentheses for arrow function arguments [`#1276`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1276)
- refactor: use new paper endpoints [`#1263`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1263)

---
## [v0.135.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.135.1...v0.135.2) - 2024-03-07

### Changes

- fix: Authors are missing from Review and List cards [`#1283`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1283)

---
## [v0.135.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.135.0...v0.135.1) - 2024-03-04

### Changes

- refactor: change predicate of published lists [`#1281`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1281)

---
## [v0.135.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.134.0...v0.135.0) - 2024-02-29

### Changes

- comparisons:similarPaperScreen-structure [`#1246`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1246)
- fix: missing title in CSV export of comparisons [`#1279`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1279)
- fix issue #1415 [`#1264`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1264)
- Fix issues #1528 [`#1261`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1261)
- ObservatoriesCarousel =&gt; limit the observatories till 15 [`#1270`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1270)
- feat(template): Add support for placeholder & description [`#1248`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1248)

---
## [v0.134.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.133.2...v0.134.0) - 2024-02-21

### Changes

- fix: benchmarks duplicate datasets in summary [`#1271`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1271)
- Resolved issue #1630: Fix bug task [`#1262`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1262)
- chore: migrate list page papers, visualization and comparisons to new endpoints [`#1269`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1269)
- refactor(services): Consolidate data fetching to use getResources endpoint [`#1257`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1257)
- fix(PaperVersion): display no label for resources without label [`#1267`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1267)
- feat(Template): Prominent display of SHACL export [`#1265`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1265)

---
## [v0.133.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.133.1...v0.133.2) - 2024-02-08

### Changes

- fix(Comparison): Sync with backend for publishing a doi [`#1266`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1266)
- fix: hide draft help articles from list [`#1259`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1259)
- fix: remove indexing of contributions after adding a paper [`#1260`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1260)

---
## [v0.133.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.133.0...v0.133.1) - 2024-01-24

### Changes

- Resolved issue #1621: fixed chore task [`#1258`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1258)
- Fix: Adding curators while publishing papers [`#1254`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1254)
- chore(PublishComparison): migrate to new publish DOI endpoint [`#1253`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1253)

---
## [v0.133.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.132.0...v0.133.0) - 2024-01-15

### Changes

- fix: Ensure that only valid sorting parameters are used for /api/resources/ [`#1242`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1242)
- feat(Class): Show the creator and creation date [`#1249`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1249)
- fix: escape paper title when fetching paper by title [`#1252`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1252)
- fix: make heading labels consistent [`#1251`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1251)
- fix(DraftComparisons): show error message on failed deletion [`#1250`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1250)

---
## [v0.132.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.131.0...v0.132.0) - 2023-12-19

### Changes

- feat: Support extraction method for CSV import [`#1234`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1234)
- fix: make sure that tokenExpire cookie exist before auto logout [`#1247`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1247)

---
## [v0.131.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.130.2...v0.131.0) - 2023-12-15

### Changes

- feat(CodeValuePlugin): support TIB LDM URLs [`#1245`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1245)

---
## [v0.130.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.130.1...v0.130.2) - 2023-12-11

### Changes

- fix: editing of properties and classes [`#1244`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1244)
- fix: Datasets and Software cannot be edited [`#1243`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1243)

---
## [v0.130.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.130.0...v0.130.1) - 2023-12-11

### Changes

- fix: Deprecated type field used in object endpoint requests [`#1241`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1241)

---
## [v0.130.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.129.4...v0.130.0) - 2023-12-04

### Changes

- fix(StatementBrowser): show external descriptions for 'same as' links [`#1240`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1240)
- feat(TemplateEditor): Persist the edit mode after creating a new template [`#1225`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1225)

---
## [v0.129.4](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.129.3...v0.129.4) - 2023-11-28

### Changes

- fix(ViewPaper): Contributions are not loaded if they are not instance of Contribution class [`#1239`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1239)
- fix(Review): ensure only Review authors are displayed [`#1238`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1238)

---
## [v0.129.3](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.129.2...v0.129.3) - 2023-11-23

### Changes

- refactor(Comparison): Sync with the new SimComp API [`#1078`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1078)

---
## [v0.129.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.129.1...v0.129.2) - 2023-11-17

### Changes

- fix: Add redirection for the legacy predicate/id route [`#1237`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1237)
- fix(StatementBrowser): defaults props of Statements component [`#1236`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1236)
- fix(StatementBrowser): defaults props of Statements component [`#1235`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1235)

---
## [v0.129.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.129.0...v0.129.1) - 2023-11-15

### Changes

- fix: wrong transition of createClass function from JavaScript to TypeScript [`#1232`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1232)
- feat: support typescript [`#1157`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1157)

---
## [v0.129.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.128.0...v0.129.0) - 2023-11-08

### Changes

- StatementBrowser(Statement):removed default props and renamed syncBackend =&gt; syncBackendValue and propertySuggestionsComponent =&gt;  propertySuggestionsComponentStore [`#1217`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1217)
- fix(ResearchFieldCards): ensure words are correctly pluralized [`#1230`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1230)
- docs: update CONTRIBUTING and remove docs folder [`#1231`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1231)
- feat(AbstractModal): show warning for fetching abstract by title [`#1228`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1228)
- feat(Diff): show link to compare to latest version [`#1229`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1229)

---
## [v0.128.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.127.0...v0.128.0) - 2023-11-01

### Changes

- feat(Home): use new research field hierarchy endpoints for the front-page [`#1218`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1218)
- fix(CI/CD): Failing tests [`#1227`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1227)
- feat(HelpCenterSearch): make Strapi search case insensitive [`#1226`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1226)
- fix: Top contributors 'all time' is empty [`#1221`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1221)
- fix(ViewPaper): publishing a paper doesn't work [`#1224`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1224)
- fix(Search): Clicking search button with empty search string [`#1223`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1223)
- fix(Header): sometimes missing correct style (transparent) [`#1222`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1222)
- feat(Home): replace 'react-responsive-tabs' with custom tabs [`#1190`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1190)

---
## [v0.127.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.126.1...v0.127.0) - 2023-10-24

### Changes

- Resolve "Integrate the Sck-KG-Tex endpoint in frontend" [`#1212`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1212)
- fix: Remove sorting for research field changelog endpoint [`#1220`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1220)
- legal: update license to CC0 [`#1219`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1219)

---
## [v0.126.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.126.0...v0.126.1) - 2023-10-17

### Changes

- style(Tippy): Text in hover popup is difficult to read [`#1216`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1216)

---
## [v0.126.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.125.0...v0.126.0) - 2023-10-16

### Changes

- feat: integrate ChatGPT Smart suggestions for six use cases [`#1205`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1205)
- fix: broken CSS pseudo class selector [`#1213`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1213)
- fix(PaperForm): store venue when automatically fetched [`#1214`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1214)
- Resolve "Publishing comparison tables" [`#1211`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1211)
- feat(Home): connect research fields homepage to browser [`#1187`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1187)
- Use the entrypoint mechanism provided by Nginx [`#1209`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1209)

---
## [v0.125.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.124.0...v0.125.0) - 2023-10-11

### Changes

- refactor: prepare file structure for NextJS, create wrapper components [`#1197`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1197)
- Fix delivery of enviroment variables file [`#1210`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1210)

---
## [v0.124.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.123.0...v0.124.0) - 2023-10-05

### Changes

- feat(Review): show DOI on top of review [`#1204`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1204)
- fix: provide null instead of empty string for author ORCIDs [`#1207`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1207)

---
## [v0.123.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.122.0...v0.123.0) - 2023-09-22

### Changes

- Revert "Merge branch '1496-remove-id-sorting-parameter-for-class-resource-search' into 'master'" [`#1206`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1206)
- feat(GraphView): support blacklisting of classes, show the full label of properties [`#1194`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1194)

---
## [v0.122.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.121.0...v0.122.0) - 2023-09-19

### Changes

- feat: "Disable metadata editing of papers when paper is verified" [`#1193`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1193)
- feat(Widget): add support for comparisons [`#1178`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1178)
- chore(Publish): Update doi response [`#1199`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1199)
- fix(ViewPaper): maintain the edit mode after creating a new contribution [`#1196`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1196)
- fix: remove sorting parameter from class resources search [`#1185`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1185)
- Fix: "Replace term 'Toots' with 'Posts' for Mastodon widget" [`#1200`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1200)
- ux(Autocomplete): copy the id of selected item instead of label [`#1184`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1184)

---
## [v0.121.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.120.0...v0.121.0) - 2023-09-08

### Changes

- fix(List): list items were not deleted [`#1195`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1195)
- feat(Home): integrate Mastodon timeline [`#1191`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1191)

---
## [v0.120.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.119.0...v0.120.0) - 2023-09-07

### Changes

- feat(StatementBrowser): support ordered lists [`#1150`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1150)
- fix(Review): outline links not working and comparisons break on link click [`#1192`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1192)
- fix(QualityReport): correctly evaluate DOI and property descriptions [`#1189`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1189)

---
## [v0.119.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.118.0...v0.119.0) - 2023-08-30

### Changes

- fix(useIsEditMode): Ensure user is signed in before enabling edit mode [`#1181`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1181)
- feat(Class): support updating class labels for curators or in case of unused class [`#1182`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1182)
- fix(Property): Changing the label of a property clears the statements browser [`#1183`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1183)
- ux: persist edit mode via URL for entities pages [`#1180`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1180)
- fix(StatementBrowser): validation for large integer and decimal values [`#1179`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1179)
- feat(Review): show link to comparison [`#1177`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1177)
- ux(Resource): display loading indicator instead of '0' instances before loading [`#1176`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1176)
- feat(AddPaperModal): support BibTeX and PDF upload [`#1174`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1174)
- feat(Template): add description and export citation of resource in latex format [`#1171`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1171)

---
## [v0.118.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.117.0...v0.118.0) - 2023-08-17

### Changes

- feat(Template): show the list of instances [`#1172`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1172)
- fix(ViewPaper): add template to contribution is not synced with backend [`#1173`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1173)

---
## [v0.117.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.116.0...v0.117.0) - 2023-08-17

### Changes

- feat(ResearchFields): support smart suggestions [`#1159`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1159)

---
## [v0.116.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.115.0...v0.116.0) - 2023-08-15

### Changes

- feat(AddPaper): replace wizard with single form [`#1154`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1154)
- feat: Debounce autocomplete [`#1170`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1170)

---
## [v0.115.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.114.1...v0.115.0) - 2023-08-10

### Changes

- fix(AuthorProfile): add missing ampersand in Google scholar url [`#1169`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1169)
- Fix(Feedback/FeedbackQuestions/WriteFeedback) [`#1163`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1163)
- fix(Home): overlapping of tour guide button and chat box button [`#1167`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1167)
- feat(GraphVisualization): implement Reagraph for graph visualizations [`#1160`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1160)
- fix(Search): catch decodeURIComponent failure [`#1168`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1168)

---
## [v0.114.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.114.0...v0.114.1) - 2023-08-01

### Changes

- fix(Home): hide broken Twitter timeline widget [`#1165`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1165)
- fix: Encode dois for widget endpoint [`#1164`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1164)
- HelpCenter:added title in browser [`#1162`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1162)

---
## [v0.114.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.113.0...v0.114.0) - 2023-07-27

### Changes

- fix(Review): remove unpublished while loading [`#1161`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1161)
- feat(Home): intro for new visitors [`#1136`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1136)
- feat(Template): Import SHACL [`#1152`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1152)

---
## [v0.113.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.112.0...v0.113.0) - 2023-07-14

### Changes

- feat(Home): add ORKG stories box [`#1156`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1156)

---
## [v0.112.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.111.0...v0.112.0) - 2023-07-06

### Changes

- fix(ViewPaper): ORCIDs not displayed after updating authors [`#1155`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1155)
- chore: allow console.error [`#1153`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1153)
- fix: sync with backend change on getStatementsByPredicateAndLiteral endpoint [`#1137`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1137)
- feat(Contributors): hide contributors with a contribution less than 3 percent [`#1151`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1151)

---
## [v0.111.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.110.0...v0.111.0) - 2023-06-21

### Changes

- feat(Observatories): paginate observatories and use complimentary observatory endpoints [`#1149`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1149)
- fix(ResearchField): alternation between feature and no featured items on research field page [`#1144`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1144)
- feat(AddPaper): only support SciKGTeX in compatibility mode [`#1147`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1147)
- feat(Paper): hide low score unpaywall results [`#1146`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1146)
- chore: async jspdf for code splitting, remove immutability-helper and use array-move instead [`#1145`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1145)
- feat(EntityRecognition): show DescriptionTooltip for recommendations [`#1141`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1141)
- fix(Breadcrumbs): fix flickering on hover [`#1142`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1142)
- fix(ResearchFieldSelector): hide fields while loading [`#1143`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1143)

---
## [v0.110.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.109.0...v0.110.0) - 2023-06-12

### Changes

- feat(Template): export as SHACL shape [`#1138`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1138)
- feat(TemplateDiagram): display number of instances [`#1139`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1139)
- fix(AuthorInput): adding an ORCID to a literal author freezes the paper editor [`#1140`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1140)
- feat(uploadPdf):metadata compatibility [`#1128`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1128)

---
## [v0.109.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.108.0...v0.109.0) - 2023-06-08

### Changes

- CD(Netlify): add redirection rule for index.html [`#1135`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1135)
- chore: replace 'featured' and 'unlisted' flags with 'visibility' parameter [`#1129`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1129)
- feat(Template): download template diagram as image [`#1134`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1134)
- fix(Visualization): problems with tables width [`#1131`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1131)
- style(Class): overflowing content of instances table [`#1133`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1133)
- fix(StatementBrowser): template properties vanish once saved [`#1132`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1132)
- fix(Observatory): show message when no description is provided [`#1130`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1130)

---
## [v0.108.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.107.1...v0.108.0) - 2023-06-02

### Changes

- feat(ResearchField): Show unlisted filter option publicly [`#1124`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1124)
- fix(TemplateEditor): Redux state cleared on location change [`#1120`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1120)
- chore: Sync with the backend refactoring of observatories endpoints [`#1089`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1089)

---
## [v0.107.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.107.0...v0.107.1) - 2023-05-30

### Changes

- set the height of the contentloader in templateModal [`#1122`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1122)
- fix: Data loss when reordering authors [`#1121`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1121)
- fix: class editor typo [`#1123`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1123)
- Revert fuzzy search string optimization [`#1114`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1114)

---
## [v0.107.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.106.0...v0.107.0) - 2023-05-24

### Changes

- remove unused file [`#1119`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1119)
- feat(Class): view and edit class hierarchy [`#1011`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1011)
- feat(UserProfile): show lists [`#1117`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1117)
- feat(Benchmarks): render resource page links on PwC Models [`#1112`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1112)
- fix: Duplicate Timeline entries [`#1116`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1116)
- feat(Observatories): Show unlisted filter option publicly [`#1118`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1118)
- feat(Template): diagram view (UML Class like) [`#1105`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1105)
- feat(Observatory): edit mode [`#1104`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1104)
- feat(AddPaperWizard): support PDF upload for metadata extraction [`#976`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/976)

---
## [v0.106.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.105.0...v0.106.0) - 2023-05-16

### Changes

- ux:added links for add reviews and add lists in ContentTypeNew [`#1109`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1109)
- fix(Template): Show error if a template doesn't exist [`#1113`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1113)
- chore: Remove sort order parameter for search queries [`#1090`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1090)
- fix(Comparison): Slow processing time when there are multiple MathJax instances [`#1099`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1099)
- docs: Provide more information for unlisted badge for authored resources for non-curators [`#1100`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1100)
- feat(StatementBrowser): Indicate and link the used templates in the selected resource [`#1101`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1101)
- chore: Migrate to new organization update endpoint [`#1102`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1102)
- fix(Comparison): description doesn't render clickable urls [`#1106`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1106)
- fix(StatementBrowser): Add property is activated in the template box even if it's strict [`#1111`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1111)
- feat(Benchmark): dropdown for Datasets on a particular Research Problem [`#1110`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1110)
- fix(Visualization): Missing axis labels on view mode [`#1107`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1107)
- fix(StatementBrowser): Breadcrumbs navigation for resources in comparisons [`#1108`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1108)

---
## [v0.105.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.104.1...v0.105.0) - 2023-05-10

### Changes

- feat(Comparison): Hide the authors and curator when the property "is anonymized" set to true [`#1103`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1103)

---
## [v0.104.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.104.0...v0.104.1) - 2023-05-05

### Changes

- fix(Comparison): disable row groups when sorting [`#1098`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1098)

---
## [v0.104.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.103.1...v0.104.0) - 2023-05-05

### Changes

- fix(Sidebar): Template suggestions only on top-level contribution [`#1094`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1094)
- fix(Template): Show correct creation time [`#1095`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1095)
- chore: update browsers list db [`#1096`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1096)
- ux: Increase the page size of research problem items [`#1097`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1097)
- feat(Comparison): preserve metadata when publishing new version [`#1093`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1093)
- fix(AboutPage): responsive images [`#1092`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1092)

---
## [v0.103.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.103.0...v0.103.1) - 2023-04-27

### Changes

- fix(Storybook): list docs for components [`#1091`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1091)

---
## [v0.103.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.102.2...v0.103.0) - 2023-04-26

### Changes

- chore: Sync with the backend refactoring of top contributor endpoints [`#1067`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1067)
- fix(ComparisonCard): Small discrepancy in count of contributions for a comparison [`#1086`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1086)
- docs: implement Storybook for frequently used components [`#1071`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1071)
- feat(UserTooltip): improve animation [`#1088`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1088)
- fix(ResearchFieldsCards): fix word wrap, feat: change limit max displayed items [`#1087`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1087)

---
## [v0.102.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.102.1...v0.102.2) - 2023-04-21

### Changes

- fix: Do not allow setting unlisted and featured flag for non-content type resources [`#1085`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1085)
- fix(Template): make templates publicly accessible [`#1084`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1084)
- fix(CodeValuePlugin): show non-code links as anchors [`#1083`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1083)
- internal: Update dependencies [`#1081`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1081)

---
## [v0.102.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.102.0...v0.102.1) - 2023-04-20

### Changes

- fix(StatementBrowser): Load templates recommendation [`#1082`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1082)

---
## [v0.102.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.101.1...v0.102.0) - 2023-04-20

### Changes

- feat(suggestions):added Recommendations  in view paper-edit mode [`#1062`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1062)
- feat(Template): use SHACL vocab [`#1060`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1060)
- ux: Show unlisted badge for authored resources for non-curators [`#1077`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1077)

---
## [v0.101.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.101.0...v0.101.1) - 2023-04-11

### Changes

- fix(CI): use cjs path instead of esm in Code component [`#1080`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1080)

---
## [v0.101.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.100.0...v0.101.0) - 2023-04-11

### Changes

- fix(UserProfile): ensure organization logo is displayed [`#1079`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1079)
- feat(StatementBrowser): support syntax highlighting for Github URLs [`#1070`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1070)
- ux(Observatory): Increase the page size of observatory items [`#1073`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1073)
- fix(Comparison): Multiple API calls to invalid resource [`#1076`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1076)
- chore(Paper): rename 'View paper' to 'Access paper' [`#1074`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1074)
- feat(GeneratePdf): add loading indicator [`#1075`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1075)

---
## [v0.100.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.99.0...v0.100.0) - 2023-04-04

### Changes

- fix(Comparison): fix export comparison as PDF [`#1072`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1072)
- feat(Footer): add report content link [`#1069`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1069)
- chore: make env switching easier [`#1068`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1068)

---
## [v0.99.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.98.1...v0.99.0) - 2023-03-29

### Changes

- fix(Style): Long URLs overflows into the provenance column [`#1064`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1064)
- fix(style): Markdown table out of container [`#1066`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1066)
- fix(ViewPaper): Verified Metadata Icon is only visible for curators [`#1065`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1065)
- feat(Discussion): support discussions on papers [`#1040`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1040)

---
## [v0.98.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.98.0...v0.98.1) - 2023-03-28

### Changes

- fix(TemplateEditor): losing statements while saving template [`#1063`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1063)

---
## [v0.98.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.97.1...v0.98.0) - 2023-03-27

### Changes

- feat(Observatory): set maximum length for observatory description [`#1061`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1061)
- enhancement(Benchmarks): paginate the list and refactor ListPage [`#1051`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1051)

---
## [v0.97.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.97.0...v0.97.1) - 2023-03-23

### Changes

- refactor: Sync with the backend changes and use the timline endpoint [`#1054`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1054)

---
## [v0.97.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.96.0...v0.97.0) - 2023-03-20

### Changes

- feat(QualityReport): count related figures in the quality modal [`#1058`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1058)
- chore(Footer): add link to data protection info sheet [`#1059`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1059)
- feat:change tabs with url [`#1057`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1057)
- feat: Delete property [`#1055`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1055)
- fix(TemplateEditor): Delete statements of orphan nodes while editing a template [`#1056`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1056)
- feat(Author): support listing works and searching for authors without ORCID [`#1053`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1053)
- feat(UserProfile): add user related statistics to profile [`#1052`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1052)

---
## [v0.96.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.95.1...v0.96.0) - 2023-03-15

### Changes

- feat: Support CSVW model for table view [`#970`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/970)

---
## [v0.95.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.95.0...v0.95.1) - 2023-03-14

### Changes

- enhancement(HomePage): Group versions after alternating the featured and no-featured comparisons [`#1049`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1049)
- fix(ViewPaper): loading paper contributors if a user doesn't exist in the database [`#1047`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1047)
- style: hide scroll-bars for visualization preview of tables [`#1045`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1045)
- chore(Comaprison): Order of elements in the carousel [`#1050`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1050)
- chore(Review): change content section to text section [`#1044`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1044)
- ux: Truncate long contribution labels for better readability [`#1046`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1046)
- fix(Review): prevent recreation of existing references [`#1048`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1048)
- refactor: create separate component for button with loading state [`#1041`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1041)
- fix(About): blank page for about, fix issue with missing title [`#1043`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1043)

---
## [v0.95.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.94.0...v0.95.0) - 2023-03-10

### Changes

- refactor: Replace query-string with qs [`#1042`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1042)
- fix(Resource): usage in papers doesn't support url encoding [`#1037`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1037)
- fix(Comparison): Missing data when requesting a DOI for a published comparison [`#1038`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1038)
- feat(UserProfile): Show the created reviews and templates [`#1028`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1028)
- fix(Comparison): make carousel visible when only related figures/resources are available [`#1039`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1039)
- doc: add explainer videos to comparison and review list [`#1036`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1036)

---
## [v0.94.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.93.0...v0.94.0) - 2023-03-06

### Changes

- fix(Header): show all about menu items by increasing pageSize [`#1035`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1035)
- feat(Resource): Add usage tab that list papers referring to a resource [`#1032`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1032)
- refactor(Resource): use tabs ui pattern and move all components cards to its own directory [`#960`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/960)
- sync(Benchmarks): list all benchmarks [`#805`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/805)
- feat(Comparison): move related resources and figures to the virtualization carousel [`#1024`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1024)
- feat(AddPaper): Integration of the Agri-NER service [`#1030`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1030)
- fix(SmartReview): incorrect reference key for references [`#1034`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1034)
- Resolve "Migrate to new organization logo endpoint" [`#1022`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1022)
- fix(Header): prevent issue with wrong CMS env var [`#1033`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1033)

---
## [v0.93.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.92.0...v0.93.0) - 2023-03-01

### Changes

- feat(Comparison): quality report modal (i.e. maturity modal) [`#1012`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1012)
- feat(Comparison): show top authors for comparisons [`#995`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/995)
- fix(Header): solve issue with sorting of about pages and categories [`#1031`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1031)

---
## [v0.92.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.91.2...v0.92.0) - 2023-02-27

### Changes

- refactor(Timeline): sync with backend changes on the contributors endpoint [`#1013`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1013)
- fix(Review): Ontology section [`#1029`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1029)
- Resolved: Resolve "Text on homepage is not clearly visible" [`#1026`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1026)
- fix: Broken edit mode in content type page [`#1023`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1023)
- ux: Show disabled selector when templates are used [`#1025`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1025)

---
## [v0.91.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.91.1...v0.91.2) - 2023-02-21

### Changes

- chore: support Strapi V4 API [`#1000`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1000)

---
## [v0.91.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.91.0...v0.91.1) - 2023-02-10

### Changes

- internal(SEO): Activate Search Console [`#1021`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1021)
- docs(Readme): add missing force flag [`#1019`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1019)
- fix(Visualization): fix broken comparisons and add error boundary [`#1018`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1018)

---
## [v0.91.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.90.0...v0.91.0) - 2023-02-03

### Changes

- feat(AddPaper): Templates recommendation service [`#1001`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1001)
- fix(StatementBrowser): do not apply the changes on update classes if the api request fails [`#1006`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1006)
- fix(Widget): use English as default language [`#1010`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1010)
- fix: prevent showing home page banner with rubber band scrolling [`#1009`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1009)
- feat(Comparison): show tooltip for collapsed long literals [`#1008`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1008)
- fix(Observatories): logos moving after loading [`#1007`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1007)

---
## [v0.90.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.89.0...v0.90.0) - 2023-01-24

### Changes

- feat(Comparison): support drag and drop, new design, edit mode [`#998`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/998)
- ux(AddPaper): Show backend error message [`#1002`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1002)
- fix(CORS): Loading dbpedia abstract [`#1005`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1005)
- feat(ResearchFields): add input to copy field ID without leaving the page [`#999`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/999)

---
## [v0.89.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.88.0...v0.89.0) - 2023-01-09

### Changes

- feat: Manage conference event for each series [`#974`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/974)
- feat(StatementBrowser): replace circle with tooltip to indicate clickability [`#997`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/997)
- fix(AddPaperWizard): contribution tabs missing styling [`#996`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/996)

---
## [v0.88.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.87.0...v0.88.0) - 2022-12-13

### Changes

- fix(Comparison): Disable saving selected properties on path comparison method [`#994`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/994)
- feat(CsvImport): add additional label for newly imported papers [`#991`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/991)
- feat(Comparison): make full width if there are more than three contributions [`#992`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/992)
- feat(AuthorBadges): collapse authors when there are more than 15 entries [`#993`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/993)

---
## [v0.87.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.86.2...v0.87.0) - 2022-12-08

### Changes

- fix(StatementBrowser): make default properties follow the style guidelines [`#990`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/990)
- feat(Comparison): improve horizontal scrolling by always showing scrollbar [`#988`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/988)
- refactor(ViewPaper): Prevent getting similar contributions without an ID [`#982`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/982)
- Optimize(Home): Prevent reloading content while switching between tabs [`#983`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/983)
- internal: Update dependencies [`#980`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/980)

---
## [v0.86.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.86.1...v0.86.2) - 2022-11-24

### Changes

- Disable similar contribution temporarily [`#987`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/987)

---
## [v0.86.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.86.0...v0.86.1) - 2022-11-21

### Changes

- fix(CsvImport): remove prefix and suffix from header labels [`#986`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/986)
- fix(Comparison): scrolling with buttons and shadow not working [`#984`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/984)
- fix(Outline): prevent rerender of parent component [`#985`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/985)
- NLP: update the api calls [`#981`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/981)
- fix(Comparison): hide the outline when the comparison is fullscreen [`#978`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/978)

---
## [v0.86.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.85.0...v0.86.0) - 2022-11-09

### Changes

- feat(AddPaper): Predicates recommendation service [`#948`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/948)
- UX: Paper with no contributions [`#977`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/977)

---
## [v0.85.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.84.0...v0.85.0) - 2022-11-03

### Changes

- feat(List): add info message on top of list pages [`#973`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/973)
- fix(Review): losing selected comparison for newly creation sections [`#972`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/972)
- feat: Description tooltip on all entities [`#965`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/965)
- ux(Comparison): Add a table of contents to a comparison page [`#953`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/953)
- feat(Resource): Change the provenance of a resource [`#964`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/964)
- CSP: add 127.0.0.1 for local development [`#966`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/966)
- fix: Incorrectly identified error message for Valid DOI [`#967`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/967)
- fix(Template): wrong property description is displayed [`#971`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/971)
- feat(Author): Show author's DBLP id [`#968`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/968)
- fix(Review): catch loading error and show message [`#969`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/969)

---
## [v0.84.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.83.0...v0.84.0) - 2022-10-12

### Changes

- fix readme table [`#963`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/963)
- feat(AddPaper): don't require authentication for the first step [`#962`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/962)
- fix(LiteratureList): embed list [`#961`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/961)

---
## [v0.83.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.82.1...v0.83.0) - 2022-10-06

### Changes

- internal: update prettier and eslint-plugin-prettier [`#951`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/951)
- fix(ViewPaper): link to TIB portal via exact match paper titles [`#958`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/958)
- fix(Widget): remove www from public URLs [`#959`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/959)
- fix(AddPaper): replace reactour with intro.js [`#949`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/949)
- fix(Page): add support tib domain to CSP [`#957`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/957)
- Style: show the container of items in Venue page [`#956`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/956)
- feat(Resource): Automate the redirection to the dedicated page [`#941`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/941)
- fix: Redirects broken of legacy pages with params [`#955`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/955)
- fix(Search): Ignore draft comparisons in search result of resources [`#954`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/954)
- Benchmarks: Head title change and link dataset resource in benchmark page to content type page [`#952`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/952)
- fix(StatementBrowser): copy the correct value ID [`#943`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/943)
- fix: make ComparisonPopup visible on the research problem and observatory pages [`#942`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/942)

---
## [v0.82.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.82.0...v0.82.1) - 2022-09-22

### Changes

- fix(TemplateEditor): Saving a template with use cases [`#950`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/950)
- refactor(Comparison): use redux to manage the state [`#947`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/947)

---
## [v0.82.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.81.0...v0.82.0) - 2022-09-13

### Changes

- fix(CSP): Twitter timeline [`#944`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/944)

---
## [v0.81.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.80.1...v0.81.0) - 2022-09-12

### Changes

- fix(ViewPaper): Verify citations count before showing it [`#940`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/940)
- fix(AuthorsInput): Disable selecting authors from wikidata in add paper wizard [`#939`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/939)
- feat: Diagrams [`#915`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/915)
- fix: use regular expression to validate uri [`#938`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/938)
- Help video modal issue fixed [`#937`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/937)
- fix(CSP): Loading description from Wikipedia [`#934`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/934)

---
## [v0.80.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.80.0...v0.80.1) - 2022-09-09

### Changes

- fix(CSP): Lookup by doi [`#936`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/936)

---
## [v0.80.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.79.1...v0.80.0) - 2022-09-05

### Changes

- feat(ViewPaper): link to TIB portal [`#932`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/932)
- feat(ViewPaper): update link to survey for CS papers [`#931`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/931)
- chore(Comparison): Ditch /orkg/ from export comparison as RDF [`#930`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/930)
- fix(Search): Error on leaving search page [`#929`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/929)
- test: Mock resource update [`#928`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/928)
- npm: update matomo-tracker-react [`#924`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/924)
- ux: catch JavaScript errors and display a fallback UI [`#922`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/922)
- optimization: lazy-loading of Featured comparisons page [`#920`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/920)
- ux: Add copy to clipboard button to description tooltip and ID tooltip [`#923`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/923)
- fix(AddPaper): Changes on existing resources are ignored [`#919`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/919)
- fix(ContributionEditor): selecting the ontology sources for resources [`#918`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/918)

---
## [v0.79.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.79.0...v0.79.1) - 2022-09-01

### Changes

- fix(ViewPaper): Broken DOI link in provenance box [`#927`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/927)

---
## [v0.79.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.78.1...v0.79.0) - 2022-08-31

### Changes

- feat(paper): Persistent identification of ORKG papers [`#693`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/693)
- ux(Template): Show an overlay loading and saving indicator [`#925`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/925)
- fix(CSP): Support loading fonts from data: [`#926`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/926)
- style(Author): Responsive AuthorHeader component [`#921`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/921)
- feat(CS-NER): activate for Computational Linguistics research field [`#917`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/917)

---
## [v0.78.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.78.0...v0.78.1) - 2022-08-30

### Changes

- ux(ViewPaper): Redirect to newly created contribution [`#914`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/914)
- feat: include CSP in meta tag [`#912`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/912)

---
## [v0.78.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.77.1...v0.78.0) - 2022-08-16

### Changes

- fix(Stats): update benchmarks class [`#916`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/916)
- chore: integrate recommended react rules [`#913`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/913)
- ui(AddPaperWizard): disable annotator for CS, separate abstract entry modal [`#911`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/911)
- feat(AddPaperWizard): add Bioassays Semantification tool [`#907`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/907)
- fix(StatementBrowser): Dataset table doesn't show horizontal scroll bar [`#910`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/910)
- fix(Author): filter deleted papers [`#909`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/909)

---
## [v0.77.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.77.0...v0.77.1) - 2022-08-11

### Changes

- fix(PdfTextAnnotation): use package instead of CDN for loading pdfjs worker [`#908`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/908)

---
## [v0.77.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.76.0...v0.77.0) - 2022-08-10

### Changes

- feat(AddPaperWizard): implement NER-CS tool [`#734`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/734)
- internal: update dependencies [`#898`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/898)
- config(CI/CD): Set homepage to / in package.json [`#904`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/904)
- feat(ViewPaper): integrate unpaywall [`#903`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/903)
- ux(ContributionEditor): remember last selected data type [`#902`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/902)
- ux(ResearchFieldSelector): improved loading indicator [`#901`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/901)
- feat(ExistingPaperModal): disallow duplicate DOIs [`#900`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/900)

---
## [v0.76.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.75.1...v0.76.0) - 2022-08-04

### Changes

- CD(pre-release): Show the long format of tag name [`#897`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/897)
- feat(Autocomplete): support for Wikidata and external ontologies [`#890`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/890)
- fix(StatementBrowser): Submitting autocomplete field using Keyboard [`#896`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/896)

---
## [v0.75.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.75.0...v0.75.1) - 2022-07-25

### Changes

- fix(CsvImport): broken validation solved [`#895`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/895)
- CI: Send ref name when release is triggered [`#894`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/894)
- feat(Search): support DOI lookup by full URL, fix loading indicator [`#893`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/893)

---
## [v0.75.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.74.1...v0.75.0) - 2022-07-20

### Changes

- ux(Search): Run the search query when clicking Enter [`#892`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/892)
- feat(ContributionEditor): support for 'empty' resource [`#891`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/891)
- fix(StatementBrowser): Applying a template to contribution doesn't update the classes [`#889`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/889)

---
## [v0.74.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.74.0...v0.74.1) - 2022-07-13

### Changes

- Change production pipeline trigger to tag pipeline [`#888`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/888)

---
## [v0.74.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.73.0...v0.74.0) - 2022-07-12

### Changes

- feat(Class): ability to provide a description when creating a class [`#886`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/886)
- Add pipeline trigger for deploying to production [`#887`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/887)

---
## [v0.73.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.72.0...v0.73.0) - 2022-07-11

### Changes

- fix(StatementBrowser): cannot edit new resources [`#885`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/885)
- feat(Observatory): Allowing deleting research problems [`#884`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/884)
- feat(Property): ability to provide a description when creating a property [`#875`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/875)
- ui: Switch main and sub-title for organizations and observatories [`#881`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/881)

---
## [v0.72.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.71.1...v0.72.0) - 2022-07-06

### Changes

- feat(DatatypeSelector): support for 'empty' resource [`#869`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/869)
- feat(Property): support updating property labels for curators [`#870`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/870)
- SimilarContributions: hide on error and no results; News: hide when no recent news is available [`#874`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/874)
- chore: replace react-meta-tags with helmet [`#876`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/876)
- fix(Comparison): disable save draft for published comparisons [`#877`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/877)
- docs: update API documentation url [`#868`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/868)
- fix: follow DOI display guidelines [`#865`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/865)
- fix(Comparison): tooltip is displayed behind comparison header [`#864`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/864)
- refactor(Comparison): remove setTimeout for checking window size [`#866`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/866)
- feat(ViewPaper): show citation count [`#855`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/855)
- fix: use replace for navigation actions with redirect [`#860`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/860)
- fix(AddPaper): show new resources in autocomplete [`#862`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/862)
- Use sandbox in default.env [`#861`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/861)

---
## [v0.71.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/v0.71.0...v0.71.1) - 2022-06-16

### Changes

- fix(Comparison): publish with property IDs starting with 'R' [`#863`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/863)

---
## [v0.71.0](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.70.1...v0.71.0) - 2022-06-15

### Changes

- feat(Search): support research field filter [`#859`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/859)
- fix(StatementBrowser): Hide input on stop edit [`#856`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/856)
- fix(Autocomplete): Prevent selecting template components [`#857`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/857)
- chore: update version command, set package.json version [`#854`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/854)
- fix(ContentType): statement browser keeps loading on edit mode [`#851`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/851)
- fix: pre-commit hook [`#852`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/852)
- chore: allow building with lint errors [`#853`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/853)
- fix(Observatory): Problem with URLs [`#848`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/848)
- ux: consolidate UI components [`#849`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/849)
- style: adopt Airbnb lint rules [`#850`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/850)
- feat(Home): add Twitter timeline [`#846`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/846)
- Review: add link to SmartReview methodology [`#847`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/847)

---
## [V0.70.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.70...V0.70.1) - 2022-05-20

### Changes

- fix: circular store dependency [`#845`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/845)

---
## [V0.70](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.69.2...V0.70) - 2022-05-20

### Changes

- Resolve "Issue with reset redux state on location change" [`#844`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/844)
- refactor(Templates): type resources of “TemplateComponentClass” [`#841`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/841)
- feat(Observatories): Combined lists and paginate content [`#804`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/804)
- feat(HelpArticle): support articles without category [`#842`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/842)
- feat(Observatory): link contributors and organizations with observatories from the UI [`#549`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/549)

---
## [V0.69.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.69.1...V0.69.2) - 2022-05-16

### Changes

- fix(Search): infinite loop after changing search query [`#840`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/840)
- fix(Redirect): research problem/field slug redirection leads to 404 [`#839`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/839)
- fix: Broken links in Search and Dataset pages [`#836`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/836)
- fix: broken slug redirect [`#837`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/837)

---
## [V0.69.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.69...V0.69.1) - 2022-05-03

### Changes

- fix(ContributionEditor): "view comparison" button not working [`#835`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/835)
- fix: add url prefix for links [`#834`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/834)
- Add GitLab CI configuration for deployment to test system [`#833`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/833)

---
## [V0.69](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.68.1...V0.69) - 2022-05-02

### Changes

- feat(Header): NFDI4DS widget integration [`#829`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/829)
- ux: make text selectable for buttons containing graph labels [`#832`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/832)
- chore: remove unused dependencies [`#830`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/830)
- fix(DiffView): page not loading, paper entries undefined [`#831`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/831)
- internal: Update dependencies [`#828`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/828)
- feat(Observatory): support description line breaks [`#827`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/827)

---
## [V0.68.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.68...V0.68.1) - 2022-04-19

### Changes

- ux(Search ): hide message "There are no results..." in results [`#822`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/822)
- ux(AddPaper): go to next step on field click [`#821`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/821)
- fix: Template save button keeps saving state [`#824`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/824)
- fix(Comparison): Error when publishing comparison DOI without creators [`#825`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/825)
- fix(Review): duplicate publishing notification after publishing [`#826`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/826)
- fix: Contributions Help Tour issue [`#823`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/823)

---
## [V0.68](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.67.2...V0.68) - 2022-04-13

### Changes

- feat(Review): publish reviews with DOI [`#638`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/638)
- Comparison: improve navigation [`#809`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/809)
- feat(List): generic list of ORKG content [`#769`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/769)
- fix(ContributionEditor): fix updating property [`#820`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/820)
- fix: Non-existing resource: no error message displayed [`#819`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/819)
- refactor: move global CSS code to respective components [`#818`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/818)
- feat: integrate event tracking [`#816`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/816)
- refactor: Transition to Redux Toolkit [`#807`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/807)
- Resource: show metadata [`#813`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/813)
- Tooltip: use Tippy instead of Reactstrap [`#817`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/817)
- CsvImport: static backdrop, rename research problem column [`#815`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/815)
- CI: use https explicitly to install aoelen/react-pdf-highlighter-dist [`#814`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/814)

---
## [V0.67.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.67.1...V0.67.2) - 2022-03-21

### Changes

- fix(Comparison): metadata not showing [`#812`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/812)

---
## [V0.67.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.67...V0.67.1) - 2022-03-18

### Changes

- fix(Comparison): failed loading comparisons without an organization [`#811`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/811)

---
## [V0.67](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.66...V0.67) - 2022-03-18

### Changes

- ResearchField: Sync with backend changes [`#810`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/810)

---
## [V0.66](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.65.2...V0.66) - 2022-03-17

### Changes

- feat(Comparison): Anonymize authors while publishing [`#770`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/770)

---
## [V0.65.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.65.1...V0.65.2) - 2022-03-14

### Changes

- fix(ContributionEditor): creating resources with existing label not possible, error on select option with enter key [`#808`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/808)

---
## [V0.65.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.65...V0.65.1) - 2022-03-14

### Changes

- fix(Autocomplete): doesn't show value [`#806`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/806)

---
## [V0.65](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.64...V0.65) - 2022-03-08

### Changes

- style: Contributions tabs [`#800`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/800)
- refactor: replace usePrevious with onClose of StatementBrowserDialog [`#802`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/802)
- fix(StatementBrowser): formatted labels after 3 hierarchy level [`#801`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/801)
- fix(Templates): used templates [`#797`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/797)
- routes: Redirect old curation call URL to new help center page [`#803`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/803)
- feat(CsvImport): show warning if specified datatype is conflicting with cell value [`#798`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/798)
- feat(Review): show comparison link for print view [`#799`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/799)

---
## [V0.64](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.63...V0.64) - 2022-03-03

### Changes

- Review: remove reading time estimation [`#793`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/793)
- feat(CsvImport): support data types for literals [`#794`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/794)
- fix: Combined lists pagination [`#795`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/795)
- internal: Rename env var for backend API [`#792`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/792)

---
## [V0.63](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.62.1...V0.63) - 2022-03-01

### Changes

- fix(CSVImport): title required when using DOI [`#791`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/791)
- style: remove auto capitalization property labels [`#790`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/790)
- feat(ContributionEditor): Support template [`#783`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/783)
- fix(TemplateEditor): Updating a template for a class [`#782`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/782)
- fix(CombinedLists): alternate between featured and unfeatured items [`#785`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/785)
- style: Research field page title bar [`#786`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/786)
- fix(EditPaperDialog): default blank value for Month and Year in paper metadata [`#787`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/787)
- feat(AddPaper): Show previously selected for research field selection [`#784`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/784)
- feat(Header): support for multiple about categories [`#788`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/788)
- docs(CsvImport): link to help center instead of modal [`#789`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/789)

---
## [V0.62.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.62...V0.62.1) - 2022-02-15

### Changes

- ux(EditModeHeader): animate show and hide [`#781`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/781)
- fix(Auth): fix non-serializable tokenExpire [`#779`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/779)
- fix(Autocomplete): String exact match for instances of a class [`#775`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/775)
- fix(CombinedList): Sort comparison versions correctly [`#780`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/780)
- fix(LiteratureList): hide curation buttons [`#778`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/778)
- fix: no options in paper title input field [`#776`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/776)
- fix: Contributor tooltip doesn't show the number of papers [`#774`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/774)
- fix(StatementBrowser): Toast message of updating a label [`#773`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/773)
- ui(Comparison): move position 'add contribution' button [`#777`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/777)
- refactor(Reviews): rename SmartReviews to reviews [`#758`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/758)

---
## [V0.62](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.61...V0.62) - 2022-02-07

### Changes

- feat: Content curation features and show combined list of all content in research field/problem pages [`#632`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/632)
- feat(Search): Add filter for content created by a user [`#754`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/754)
- fix(SmartReview): Title doesn't remove line breaks from the label [`#772`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/772)
- fix: Catch error if indexing contributions fail [`#767`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/767)
- seo(UserProfile): set document title [`#760`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/760)
- fix(LatestNews): Carousel indicators are not correctly displayed [`#762`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/762)
- doc: Display a link to the help center to add Benchmark [`#763`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/763)
- fix(SmartReview): set images in Markdown editor to max-width 100% [`#771`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/771)
- fix(ContributionEditor): literal conversion tooltip not visible [`#765`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/765)
- fix(Template): Property range field doesn't show the class name [`#766`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/766)
- chore: Replace contact page link with helpdesk email in 503 page [`#768`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/768)
- feat(LiteratureList): make list embeddable [`#744`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/744)

---
## [V0.61](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.60...V0.61) - 2022-01-26

### Changes

- fix(Comparison): view a resource within a context [`#761`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/761)
- feat(Visualization): view visualization modal [`#739`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/739)

---
## [V0.60](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.59...V0.60) - 2022-01-24

### Changes

- feat: lookup paper metadata by title via Semantic Scholar [`#746`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/746)
- fix: videos, replace bootstrap classes [`#759`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/759)
- feat(Comparison): support showing single result when filtering [`#720`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/720)
- feat(LiteratureList): support BibTeX export [`#748`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/748)

---
## [V0.59](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.58...V0.59) - 2022-01-17

### Changes

- fix: issue with running ORKG in Safari (update citation-js) [`#753`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/753)
- fix: Some issues in textbox width of autocomplete [`#752`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/752)
- style: PWC box spacing issue [`#750`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/750)
- feat(MarkdownEditor): support for video embedding [`#747`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/747)

---
## [V0.58](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.57.2...V0.58) - 2022-01-10

### Changes

- Comparison: support embedding videos [`#749`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/749)
- fix(PaperView): Reversed order of authors [`#742`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/742)
- style: Responsive benchmarks page [`#741`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/741)
- fix: Plural words with zero items [`#745`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/745)
- fix(AbstractAnnotator): text wrapping issue [`#743`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/743)
- docs: add Architecture section [`#740`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/740)
- internal: Update dependencies [`#731`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/731)

---
## [V0.57.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.57.1...V0.57.2) - 2021-12-20

### Changes

- fix: Same as abstract not displayed [`#726`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/726)
- fix(StatementBrowser): Double tooltip on research problem resources [`#735`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/735)
- fix(Resource): Updating the label [`#737`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/737)
- fix(StatementBrowser): Infinit loop on fetch statements for resource [`#738`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/738)
- fix(SmartReview): allow deletion of duplicate authors [`#736`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/736)

---
## [V0.57.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.57...V0.57.1) - 2021-12-07

### Changes

- fix(SmartReview): fix issue with adding resources/properties in the ontology table [`#733`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/733)
- fix(Search): paper links do not show correctly [`#732`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/732)

---
## [V0.57](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.56...V0.57) - 2021-12-03

### Changes

- fix(Search): link to SmartReview directly, refactor switch statement [`#730`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/730)
- feat: literature list [`#712`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/712)

---
## [V0.56](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.55.1...V0.56) - 2021-12-02

### Changes

- feat(StatementBrowser): Optimisation and enhancement of templates, autocomplete and user interaction [`#624`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/624)
- docs: add contributing file [`#729`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/729)

---
## [V0.55.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.55...V0.55.1) - 2021-11-19

### Changes

- fix(Comparison): Contribution data doesn't show in case no properties are selected [`#725`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/725)

---
## [V0.55](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.54.1...V0.55) - 2021-11-16

### Changes

- Comparison: rename 'more' to 'actions' button header [`#724`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/724)
- fix(Comparison): loading indicator prevent overflowing [`#723`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/723)
- fix: top contributors [`#574`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/574)
- fix(Contribution editor): Bibtex reader does not catch the url entry [`#711`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/711)
- Style(ContributionEditor): Make dropdown box of types visible [`#716`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/716)
- fix(Contribution Editor): Select datatypes dropdown in the popup [`#717`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/717)
- fix(Comparison): Applied filters are not visible at the first time applied [`#719`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/719)
- fix: Bibtex are saved in "has doi" statement [`#721`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/721)

---
## [V0.54.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.54...V0.54.1) - 2021-11-10

### Changes

- fix(ContributionEditor): infinite loop when adding a paper [`#722`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/722)

---
## [V0.54](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.53...V0.54) - 2021-11-08

### Changes

- fix(ContributionEditor): Saving the boolean value [`#718`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/718)
- fix(Comparison): Publishing a new version of a comparison doesn't show the labels of existing references [`#710`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/710)
- fix(SmartReview): fix author order list page, fix invalid formatted reference [`#714`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/714)
- fix(SmartReview): scrollbars for overflowing outline items [`#713`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/713)
- feature: support for draft comparisons, consolidate draft entity design [`#707`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/707)
- refactor: transition to Redux Toolkit, starting with the contribution editor [`#706`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/706)

---
## [V0.53](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.52.1...V0.53) - 2021-11-02

### Changes

- fix(Comparison): Disable extend property ids when using exact match approach [`#708`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/708)
- feat(DataAccess): add link to visual SPARQL editor [`#709`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/709)

---
## [V0.52.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.52...V0.52.1) - 2021-10-21

### Changes

- fix(ContributionEditor): reset datatype on close, support for creating duplicate resources [`#705`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/705)

---
## [V0.52](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.51...V0.52) - 2021-10-18

### Changes

- fix(AddPaper): Check the existence of paper after lookup [`#703`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/703)
- fix: Unpublished comparisons have `undefined` in their title [`#702`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/702)
- ux: Open a new window for "Go to resource page" link [`#704`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/704)
- feat(Contributions editor): Add the new selector of datatype [`#666`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/666)
- fix(EditPaperDialog): preserve author order, prevent duplicate statements [`#701`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/701)
- feat(Comparison): Show a header row in case of shared path of properties [`#700`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/700)
- ux(TemplateEditor): Show the property id and the description in a tooltip [`#699`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/699)
- enhancement(SEO): use schema.org JSON-LD to describe ScholarlyArticle [`#695`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/695)
- fix: Inconsistent behavior between search fields on search results page [`#694`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/694)
- fix: URLs as Literals in Comparison Editor [`#677`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/677)
- feat(Header): list about pages in submenu [`#697`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/697)
- fix(EditPaperDialog): prevent duplication of fields and venues [`#689`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/689)
- ux: Remove visual feedback on list item hover [`#690`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/690)
- fix: add margin for view paper button [`#698`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/698)
- fix: adjust the regular expression of Link value plugin [`#691`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/691)
- fix: Latex formulas wrapping [`#692`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/692)
- fix(AddPaper): Dismiss the modal of "DOI already in ORKG" only by using the buttons [`#696`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/696)
- feat(Homepage): support for news article cards [`#687`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/687)

---
## [V0.51](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.50.1...V0.51) - 2021-10-07

### Changes

- fix(Autocomplete): Loading external classes [`#688`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/688)
- feat(Autocomplete): use TIB Terminology Service for class lookup [`#686`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/686)
- feat(ViewPaper): support for Altmetric [`#685`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/685)
- fix(Comparison): fix overflowing property values [`#684`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/684)
- feat(Search): support class label lookup [`#683`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/683)
- fix(DatatypeSelector): preserve selected value on rerender [`#680`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/680)
- fix(Autocomplete): resolve issue with selecting an existing class from external ontologies [`#679`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/679)

---
## [V0.50.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.50...V0.50.1) - 2021-09-10

### Changes

- fix: Preview for visualization shows error message [`#678`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/678)

---
## [V0.50](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.49...V0.50) - 2021-09-10

### Changes

- fix: Links to terms of use and data protection [`#676`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/676)
- feat(CSV import): Add paper venue column and fix fetching publication month and year [`#675`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/675)

---
## [V0.49](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.48...V0.49) - 2021-09-08

### Changes

- ux(Comparison popup): Replace delete confirmation with tooltip [`#674`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/674)
- fix(Stats): improve responsiveness of stats boxes [`#672`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/672)
- feat(Author): Show ORCID/Google Scholar profiles for authors and refactor Cards [`#667`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/667)
- feat(Home): support alerts via the CMS [`#658`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/658)
- feat(Comparison): load live data, only allow editing when live data is fetched [`#662`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/662)

---
## [V0.48](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.47...V0.48) - 2021-08-09

### Changes

- fix(ContributionEditor): make property column always visible [`#668`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/668)
- fix: add missing return instruction in getLabel [`#670`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/670)
- fix(Comparison): correct color for transposed first table cell [`#669`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/669)
- refactor(ListPage): use ListPage component for all pages listing entities [`#661`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/661)
- Style: Section titles in research field page needs a margin right [`#665`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/665)
- fix(Paper): fix styling is listed comparisons [`#663`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/663)
- feat(SmartReview): mention ORKG in acknowledgements [`#660`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/660)
- style(Comparison): make contribution labels better visible [`#659`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/659)

---
## [V0.47](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.46...V0.47) - 2021-08-03

### Changes

- Replace title about page [`#655`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/655)
- fix: wrap top menu to prevent horizontal scrolling on small screens [`#654`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/654)
- feat(SB): Select datatype of literal [`#647`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/647)
- fix(Header): improve responsiveness [`#657`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/657)
- feat(ValuePlugins): support inline Latex and AsciiMath [`#646`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/646)
- UX(Comparison popup): Start comparison only if two contributions are selected [`#652`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/652)
- style: Enhance similar contributions elements in small screens [`#653`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/653)
- fix: Exclude videos and images patterns from link ValuePlugin [`#651`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/651)
- chore: remove unused packages [`#650`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/650)

---
## [V0.46](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.45...V0.46) - 2021-07-26

### Changes

- feat: Integration of Strapi CMS [`#564`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/564)

---
## [V0.45](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.44.1...V0.45) - 2021-07-21

### Changes

- fix: Issue with fetch statements for resource [`#648`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/648)
- enhancement(Benchmark): Show benchmark of a research problem on dataset [`#628`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/628)
- feat(Stats): add additional statistics [`#625`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/625)
- fix(SmartReview): save authors without change [`#645`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/645)
- feat(Observatories): human-readable URLs [`#507`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/507)
- fix(Comparison): Remove decoding before parsing comparison configuration [`#643`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/643)
- fix(SmartReview): preserve order of ontology items, rely on backend default sorting [`#612`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/612)

---
## [V0.44.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.44...V0.44.1) - 2021-07-15

### Changes

- fix(CSV import): Validation schema [`#642`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/642)

---
## [V0.44](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.43...V0.44) - 2021-07-13

### Changes

- fix: make several UI components more accessible [`#636`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/636)
- fix: Paper cannot be edited when no research field is provided [`#641`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/641)
- feat(CSV import): Fetch metadata if DOI is provided [`#640`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/640)
- fix(CSV Import): Research field validation [`#639`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/639)
- feat(ValuePlugins): support inline clickable links [`#635`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/635)

---
## [V0.43](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.42.1...V0.43) - 2021-07-07

### Changes

- fix: add Comparison pop-up to ResearchFields page [`#634`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/634)
- feat(SmartReview): show selection box when adding a reference [`#626`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/626)
- fix: some contribution editor and comparison issues [`#630`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/630)
- feat(CSV import): support for resources with header prefix [`#633`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/633)
- internal: Update dependencies [`#629`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/629)
- fix(Comparison): display references [`#631`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/631)

---
## [V0.42.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.42...V0.42.1) - 2021-06-24

### Changes

- feat(SmartReview): support value plugins in ontology table [`#618`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/618)
- ux: Add loading indicator for benchmarks and fix plotting issues [`#622`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/622)
- fix: Broken pagination in templates page [`#623`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/623)
- fix(SmartReview): incorrect reference key for automatically generated references [`#621`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/621)

---
## [V0.42](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.41...V0.42) - 2021-06-22

### Changes

- fix(SmartReview): set max length for content sections [`#619`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/619)
- feat(Stats): add additional statistics [`#620`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/620)
- feat(SmartReview): section outline, section move buttons, publish reminder, scrolling on move [`#616`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/616)
- ux: Add to comparison button [`#609`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/609)
- curation: Make only admins can edit research field resource [`#601`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/601)
- feat(AuthorInput): decode html entities of crossref reponse [`#613`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/613)
- chore: remove organizations/id/Observatories endpoint [`#614`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/614)
- fix: Current user tooltip appears on the user profile [`#615`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/615)
- ux(ContributionEditor): list animations when automatically sorted [`#591`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/591)
- fix(SmartReview): show correct property labels in ontology entity suggestion [`#611`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/611)
- refactor(Visualization): Store the customization state [`#599`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/599)

---
## [V0.41](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.40.2...V0.41) - 2021-06-15

### Changes

- feat: Add benchmarks related pages [`#526`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/526)

---
## [V0.40.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.40.1...V0.40.2) - 2021-06-10

### Changes

- fix: Showing doi in ExistingDoiModal [`#610`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/610)

---
## [V0.40.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.40...V0.40.1) - 2021-06-08

### Changes

- fix(Visualizations): Loading while switching between comparison versions [`#607`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/607)

---
## [V0.40](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.39.1...V0.40) - 2021-06-08

### Changes

- feat(Observatories): remove a resource from an observatory [`#606`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/606)
- Comparison: Show history and enhancements on comparison cards [`#597`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/597)

---
## [V0.39.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.39...V0.39.1) - 2021-06-08

### Changes

- fix(Comparison): Publishing a comparison with a old response [`#605`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/605)

---
## [V0.39](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.38.1...V0.39) - 2021-06-07

### Changes

- UX: auto resize input fields for literals [`#595`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/595)
- feat(SmartReview): support for new entity table section type [`#596`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/596)
- fix: Edit property in the statement browser [`#603`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/603)
- feat(SmartReview): support in-text citations [`#590`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/590)
- Comparison: storing parameters in the simcom database [`#589`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/589)
- fix: Guided tour to add a paper manually [`#598`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/598)
- fix(Template): Loading empty list of components [`#600`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/600)
- fix: Access to resources listed in the property page [`#586`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/586)
- feat(Comparison): Clickable labels in tooltip of cells [`#592`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/592)
- feat: Show always provenance and timeline box [`#594`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/594)
- fix: scrolling on add paper page [`#587`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/587)
- fix(Template): Property range field doesn't show the class name [`#593`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/593)

---
## [V0.38.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.38...V0.38.1) - 2021-05-20

### Changes

- fix: Error when components of a templates don't have a range [`#588`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/588)

---
## [V0.38](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.37.3...V0.38) - 2021-05-19

### Changes

- fix: Error on PropertySuggestions component [`#585`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/585)
- fix: loading comparison components [`#576`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/576)
- fix: loading observatory and organization in user profile [`#575`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/575)
- fix: load more button in add contribution modal and prevent comparing the same contribution [`#577`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/577)
- feat(Resources): allow curators to edit published comparison [`#584`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/584)
- feat(Comparisons): change default comparison method to 'path' [`#568`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/568)
- fix(Comparisons): encode predicates when URL is generated [`#578`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/578)
- feat(FeaturedComparison): make featured comparison for home page only [`#579`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/579)
- SmartReview: fix link after publishing, fix Markdown syntax, fix history after publishing [`#582`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/582)
- feat: sort contributors and show contribution percentage in tooltip [`#580`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/580)

---
## [V0.37.3](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.37.2...V0.37.3) - 2021-05-12

### Changes

- Add webinar recording [`#581`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/581)
- fix(RelativeBreadcrumbs): fix alignment of list items [`#571`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/571)

---
## [V0.37.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.37.1...V0.37.2) - 2021-05-04

### Changes

- Resolve "Update webinar page" [`#572`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/572)
- fix: Sort top contributors and top changes [`#542`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/542)

---
## [V0.37.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.37...V0.37.1) - 2021-05-03

### Changes

- Update curation call page [`#570`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/570)

---
## [V0.37](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.36...V0.37) - 2021-04-30

### Changes

- feat: add webinar page [`#566`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/566)
- fix: Creating account with non-matching passwords doesn't display error [`#565`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/565)
- fix: temporary fix of top contributors [`#567`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/567)

---
## [V0.36](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.35...V0.36) - 2021-04-26

### Changes

- fix: contributions order and rediction after delete [`#560`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/560)
- style: increase z-index of the comparison menu [`#562`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/562)
- style: alignment of checkboxes in 'select properties' modal [`#563`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/563)
- feat: smart survey article writer [`#477`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/477)
- fix: use value id instead of index as a key in StatementItemTemplate [`#558`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/558)
- fix: Add properties if there is no template predicate [`#559`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/559)
- fix: Edit author in AuthorsInput [`#561`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/561)

---
## [V0.35](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.34...V0.35) - 2021-04-21

### Changes

- page: Add video to curation grant call [`#557`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/557)

---
## [V0.34](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.33...V0.34) - 2021-04-16

### Changes

- help: Add a link to how to embed a video wiki page [`#555`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/555)
- feat: add page Curation Grant [`#556`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/556)
- fix: force LF line endings for Windows users [`#552`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/552)

---
## [V0.33](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.32...V0.33) - 2021-04-14

### Changes

- fix: List comparisons for a contribution [`#554`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/554)
- fix: Mobile menu breaks on homepage [`#553`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/553)
- ui: Observatory page improvements [`#545`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/545)
- refactor: update theme variables [`#551`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/551)
- update dependencies [`#547`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/547)
- enhancement: improve mobile support is some views [`#543`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/543)
- ui: Show all time contributors by default [`#544`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/544)
- data: Add API to Data Access Page [`#546`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/546)
- fix: Sorting comparisons on the home page [`#548`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/548)
- geonames: use the property "same as" instead of "url" for the linking [`#541`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/541)

---
## [V0.32](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.31...V0.32) - 2021-03-30

### Changes

- fix: show creators in papers page, get top contributors, loading comparisons, research field taxonomy browser [`#539`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/539)
- header: Add new content button [`#534`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/534)
- ux: Set a default value of a research field while publishing a new version of comparison [`#536`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/536)
- ux: Show "Create resource" on top of the search results [`#538`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/538)
- feat(ContributionEditor): multiple UX improvements [`#537`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/537)
- feat: Add share link marker [`#535`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/535)
- ui: new home page and new research field/problem/organization/observatory layouts [`#515`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/515)
- help: Self visualization service instruction video [`#533`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/533)
- feat: add video to comparisons page [`#531`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/531)
- feat: use slugs in URL for research fields and problems [`#518`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/518)
- fix: Comparison view density and property cell when the method path is used [`#529`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/529)
- fix: Unlogged user can edit a paper and removing token cookie on logout [`#530`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/530)
- feat(ContributionEditor): scale container based on contribution amount [`#520`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/520)
- feat(Search): support search for paper by DOI [`#528`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/528)
- fix: consistent labels for list pages [`#527`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/527)
- fix: show error message when invalid contribution IDs are provided [`#521`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/521)
- feat: Show the statements of a property [`#495`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/495)
- feat: tools overview page [`#445`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/445)
- feat(AddContribution): include DOI in input label [`#522`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/522)
- feat(ContributionEditor): always show research problem row [`#523`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/523)
- ci: integrate junit test reports [`#524`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/524)
- refactor: support new backend pagination requests and responses [`#438`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/438)

---
## [V0.31](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.30.1...V0.31) - 2021-03-08

### Changes

- feat: contribution editor [`#490`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/490)
- feat: Add tooltip showing the description of properties/classes [`#494`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/494)
- update colors [`#517`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/517)
- style: Comparison filter icon [`#511`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/511)
- refactor: Paper card, max number of authors [`#512`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/512)

---
## [V0.30.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.30...V0.30.1) - 2021-02-25

### Changes

- fix: Deleting property statement browser results in error [`#514`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/514)

---
## [V0.30](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.29...V0.30) - 2021-02-19

### Changes

- fix: Downgrade react-select-async-paginate [`#510`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/510)
- feat: Add faceted search on comparison page [`#492`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/492)
- feat: Add export to jupyter notebook button [`#499`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/499)
- fix: Too many re-renders. [`#508`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/508)
- feat: Add SPARQL endpoint [`#509`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/509)
- fix: Self-Vis-Service feedback and smaller issues [`#502`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/502)
- fix(eslint): remove eslint for jsx files [`#506`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/506)
- update: react scripts [`#501`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/501)
- docs: add readme PDF annotation tool [`#505`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/505)
- fix: Comparison creators are missing from Publish metadata [`#503`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/503)
- ci: Add cache control headers for static files nginx config [`#402`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/402)

---
## [V0.29](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.28...V0.29) - 2021-02-05

### Changes

- fix: Deleting property from statement browser [`#500`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/500)

---
## [V0.28](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.27...V0.28) - 2021-02-05

### Changes

- fix: logos in footer are not center aligned [`#498`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/498)
- lint: Support Windows as development environment [`#496`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/496)

---
## [V0.27](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.26...V0.27) - 2021-02-03

### Changes

- fix: Chatbot covers cookie banner button [`#480`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/480)
- fix: Add value component and add paper request [`#493`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/493)
- feat: Add visualizations page [`#487`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/487)
- feat: Research field pages improvements [`#435`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/435)
- ux: Enhance observatory selector [`#483`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/483)
- fix: Assign comparison to an observatory [`#489`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/489)
- partners: Add EOSC and EU flag logos in footer [`#485`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/485)
- feat: New pages: add property and add class [`#482`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/482)
- fix: Latest papers on home page shows oldest papers [`#481`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/481)
- feat(ResearchFields): new page to browse the research field taxonomy [`#486`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/486)
- refactor(ContributionItemList): use correct HTML semantics for interactive elements [`#479`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/479)
- feat: Comparison visualization service [`#353`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/353)
- Update dependencies [`#462`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/462)
- feat(Comparison): scrolling by click on shadow, refactoring of ComparisonTable [`#478`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/478)
- refactor: move store creation to statement browser component [`#461`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/461)
- feat: search button on list pages [`#476`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/476)

---
## [V0.26](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.25...V0.26) - 2021-01-13

### Changes

- fix(CsvImport): new properties with new resources [`#474`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/474)
- ux(homePage): Improve observatoryCarousel [`#475`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/475)
- fix(CsvImport): Trimming values [`#473`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/473)
- style(Comparison): move publication year to the front in comparison header [`#471`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/471)
- style(Header): reorganize menu items [`#472`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/472)
- style(Resource): add button to create resource [`#470`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/470)
- style(Comparison): max-width for content loader for full page comparisons [`#468`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/468)
- fix(SimilarPapers): index contributions after adding new paper [`#467`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/467)
- style(ResearchFieldCards): add a button to visit research field page [`#469`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/469)
- feat(ResearchFields): tree selector for research fields [`#466`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/466)
- feat(CsvImport): support reusing new resources [`#465`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/465)
- feat(CsvImport): support URLs in CSV import [`#464`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/464)
- feat(CsvImport): import CSV file with DOIs [`#463`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/463)
- feat(Breadcrumbs): make last field clickable [`#460`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/460)
- chore: update dependencies of ORKG widget [`#459`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/459)
- feat: make properties clickable throughout the UI [`#455`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/455)
- fix : Issue with display provenance box when the paper is added by an unknown user [`#456`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/456)
- fix: Add creators when publishing comparison [`#457`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/457)

---
## [V0.25](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.24...V0.25) - 2020-12-16

### Changes

- ui: Home page improvements [`#425`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/425)
- feat: Autocomplete in authors input fields [`#450`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/450)
- fix: Filtering templates [`#454`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/454)
- feat(Comparisons): show observatory logo in comparison header [`#452`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/452)
- help: Links to wiki pages [`#453`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/453)
- ux: Hint text for publishing comparisons Component [`#451`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/451)
- design(BreadCrumbs): update background color [`#448`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/448)
- fix: slow comparison re-renders [`#442`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/442)
- fix: Comparison method option [`#447`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/447)
- fix(CsvImport): require authentication [`#446`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/446)

---
## [V0.24](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.23...V0.24) - 2020-12-10

### Changes

- feat: redirect user to page after authentication [`#441`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/441)
- fix(Comparison): hide 'view resource' link if resource is not available [`#443`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/443)
- feat: Mark paper metadata as manually verified [`#436`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/436)
- ux: Add breadcrumbs on paper, research field and comparison pages [`#433`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/433)
- enhancement: Comparison card [`#423`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/423)
- enhancement: Delete a contribution without calling the comparison API [`#399`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/399)
- enhancement (Add paper):  Search research field [`#428`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/428)
- chore: update packages [`#440`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/440)
- legal: update data protection [`#437`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/437)
- fix: Save research problem when using  the CSV import tool [`#432`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/432)
- fix: skip null values on stringifying queries [`#434`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/434)
- feat(FeaturedComparisons): support anchors to category headers [`#431`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/431)
- fix: Changing display name [`#430`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/430)
- Add accessibility linter rules [`#429`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/429)

---
## [V0.23](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.22...V0.23) - 2020-11-17

### Changes

- optimization: Support code splitting to reduce bundle size [`#419`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/419)
- ux: Observatory card as a link [`#424`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/424)
- fix: Save research field when creating a new observatory [`#426`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/426)
- feat: CSV import page [`#416`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/416)
- ux: add button to view more papers for research field cards [`#421`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/421)
- feat: delete buttons for curators [`#337`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/337)
- chore: move getResourcesByClass to resources network file [`#422`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/422)

---
## [V0.22](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.21...V0.22) - 2020-11-10

### Changes

- enhancement: Research field and observatory pages [`#408`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/408)
- feat: Comparisons related figures carousel in observatory page [`#417`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/417)
- autocomplete: fix duplicate result when searching by ID [`#410`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/410)
- fix: Use a unique key to render TemplateComponent [`#413`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/413)
- fix: Check if the user is authenticated on the first load [`#414`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/414)
- fix: Search page issue [`#418`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/418)
- ux: improve autocomplete component [`#415`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/415)

---
## [V0.21](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.20...V0.21) - 2020-10-28

### Changes

- feat: Support for existing ontologies using Ontology Lookup Service (EMBL-EBI) [`#363`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/363)
- feat: Curating observatories [`#373`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/373)
- fix: Keep tooltip open on click for disabled buttons [`#403`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/403)
- fix: Missing parameter id for the resource page [`#404`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/404)
- fix: Features link [`#409`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/409)
- style: consolidate design across platform [`#406`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/406)
- feat: links to resource page and vice versa [`#396`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/396)

---
## [V0.20](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.19...V0.20) - 2020-10-21

### Changes

- fix: create env.js on build (run react-env on build) [`#401`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/401)
- legal: new paragraph in terms of use [`#400`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/400)
- feat: Disable edit button on resource page for published comparisons with DOI [`#397`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/397)
- legal: Accept terms checkboxes during registration [`#398`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/398)
- ux: Add template help modal [`#381`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/381)
- Runtime env variables and Docker compose support [`#393`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/393)
- legal: update terms of use [`#395`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/395)
- refactor: introduce services folder for structuring network requests [`#385`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/385)
- feat: Figures as links [`#384`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/384)
- feat: add terms of use page [`#394`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/394)

---
## [V0.19](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.18.2...V0.19) - 2020-10-14

### Changes

- analytics: Use Matomo tracker react package [`#392`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/392)
- fix(RelatedFigures): default white background for transparent images [`#390`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/390)
- fix(TrendingProblems): dynamic row height for multiline problems [`#391`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/391)
- analytics: Add Matomo tracking code [`#389`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/389)
- ux: Breadcrumbs: long labels [`#387`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/387)
- ux(Changelog): make the changelog more understandable [`#388`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/388)
- feat: Add dynamic filter in search page [`#380`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/380)
- ux: add documentation link to header for more visibility [`#382`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/382)
- feat: Require authentication in edit options [`#376`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/376)
- ux: Gravatar message in user settings [`#378`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/378)
- ux: Validate paper URL [`#379`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/379)
- fix: Change user page header [`#375`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/375)
- feat: Setting the uri of the class [`#359`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/359)
- enhancement: Use fetch statement by predicate and literal value [`#365`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/365)
- page: Export data page [`#372`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/372)

---
## [V0.18.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.18.1...V0.18.2) - 2020-09-30

### Changes

- fix: Disable add a reference button when the comparison is published without a DOI [`#370`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/370)
- fix: overlapping buttons pdf text annotator [`#371`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/371)

---
## [V0.18.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.18...V0.18.1) - 2020-09-29

### Changes

- fix: Initialize the hash response when the method change [`#369`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/369)
- Regex fallback [`#368`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/368)

---
## [V0.18](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.17.1...V0.18) - 2020-09-28

### Changes

- feat: Pdf annotation text [`#366`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/366)
- feat(Comparison): New method, assign DOI, simple versioning, provenance box, UI enhancement [`#333`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/333)
- ui: Add cookie banner [`#358`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/358)
- feat: Statement Browser Extensions [`#354`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/354)
- fix: Filter out deleted papers from Browse by research field [`#356`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/356)
- fix: Use a unique key to render StatementItem [`#357`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/357)
- fix: Number of occurrences in contribution level [`#364`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/364)
- fix: Make the resource link visible in the breadcrumbs if the label is long [`#361`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/361)
- style: replace 'predicate' with 'property' throughout the UI [`#360`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/360)

---
## [V0.17.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.17...V0.17.1) - 2020-08-21

### Changes

- style(Observatory): change design to three column layout [`#352`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/352)
- fix: Loading the template of predicates and Geonames CORS issues [`#351`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/351)

---
## [V0.17](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.16...V0.17) - 2020-08-19

### Changes

- fix: AddValue Template addes two items [`#350`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/350)
- feat(Homepage): show trending research problems [`#342`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/342)
- fix: "Add filtering of deleted papers on profile page" [`#339`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/339)
- fix: Showing formatted label while showing a Pulse indicator [`#349`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/349)
- fix: Change Predicate class ID constant [`#348`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/348)
- Autocomplete improvements [`#346`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/346)
- fix:  Prevent Scrolling on contribution selection change (ViewPaper) [`#341`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/341)
- fix: editing issue with Edge [`#347`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/347)
- fix: shifting page when modal opens/closes [`#345`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/345)
- feat: PDF survey table extractor [`#314`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/314)
- fix: Hashtag Search does not work in search page [`#338`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/338)
- ux: change label of 'published in' [`#335`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/335)
- fix: empty venue in add paper wizard [`#334`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/334)
- style(ResearchProblem): show contribution label in papers list [`#340`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/340)
- fix(GraphView): never automatically expand research fields [`#336`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/336)
- refactor: move fixed IDs out of .env file to separate config file [`#332`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/332)

---
## [V0.16](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.15...V0.16) - 2020-07-22

### Changes

- ux: change term object to resource [`#331`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/331)
- style(StatementBrowser): replace colon by arrow [`#330`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/330)
- fix: Load more papers in research problem page [`#321`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/321)
- fix: Observatory link typo [`#329`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/329)
- ux : Update tooltip content of the dropdown menu [`#322`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/322)
- fix: Export comparison as PDF [`#327`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/327)
- refactor: change file structure, use pages directory [`#325`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/325)

---
## [V0.15](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.14...V0.15) - 2020-07-10

### Changes

- improvement: Show linked research fields to research problem [`#316`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/316)
- fix: fetching classes in add resource page [`#320`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/320)

---
## [V0.14](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.13...V0.14) - 2020-07-09

### Changes

- enhancement: Create page for classes [`#318`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/318)
- feat: Improve Observatory Overview page [`#294`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/294)
- feat: Normalization of research problem names [`#310`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/310)
- feat: Add the possibility to use templates in existing contributions [`#312`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/312)
- style: replace text labels featured comparisons [`#317`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/317)
- ux: Comparison table with sticky header [`#307`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/307)
- Add warning message for testing server [`#315`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/315)
- feat: Add meta information node for graph visualizations [`#311`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/311)
- fix: Literal linked to contribution [`#309`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/309)

---
## [V0.13](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.12...V0.13) - 2020-06-24

### Changes

- enhancement: Loading templates after updating classes in Resource details page [`#304`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/304)
- Fix: Visiting the same predicate [`#301`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/301)
- fix: Bug in skipping the help tour [`#302`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/302)
- ux: Save button for templates header [`#305`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/305)
- fix: Creating new properties not working [`#306`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/306)
- fix(Search): character encoding, refactoring search form [`#303`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/303)
- chore(lint): disallow unnecessary curly braces in JSX props [`#300`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/300)

---
## [V0.12](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.11...V0.12) - 2020-06-19

### Changes

- feat: Add observatories page [`#298`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/298)
- style: Use rounded css class where box class is used [`#297`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/297)
- feat: Improve the predicate landing pages [`#296`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/296)
- fix: Show loading indicator if the template of the object is still loading [`#295`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/295)
- enhancement: Use a select input field to specify the cardinality [`#293`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/293)
- feat: Support pagination in the autocomplete component [`#292`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/292)
- style(menu): Add features link to top header menu [`#290`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/290)
- fix: add polyfill for TextEncoder [`#289`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/289)
- feat: save correct datatype of literals [`#281`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/281)
- feat: cherry picking, PaperCardPreviews from #215 ( Caching ) [`#287`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/287)
- chore(package): update Fontawesome [`#288`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/288)
- fix: Editing paper meta data: doi and url [`#275`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/275)
- enhancement: Support pagination in listing the statements where the resource is an object [`#279`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/279)
- refactor: SelectProperties component [`#284`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/284)
- fix: DeletedPaper doesn't take into account fetching papers of a research problem/field [`#286`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/286)
- fix: Duplicated labels of mapped comparison properties [`#285`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/285)
- style(UX): Close alert of horizontal scrolling comparison by cookie [`#278`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/278)
- feat: support deleting papers, refactor code, upgrade packages [`#272`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/272)
- Resolve "editing publication month does not provide expectedtype" [`#273`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/273)

---
## [V0.11](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.10.1...V0.11) - 2020-06-03

### Changes

- feat: Many to many relationship between Organization and Observatory entities [`#260`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/260)
- Generete latex export only when the model is open [`#268`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/268)
- Support suggestion of templates based on research problems [`#267`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/267)
- feat: Indicate mapped comparison properties [`#265`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/265)
- Fix: Paper venue [`#261`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/261)
- fix: Template editor issues [`#262`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/262)
- feat: make resources and research problem selectable [`#264`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/264)
- fix(Changelog): issue with wrong tag order [`#263`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/263)

---
## [V0.10.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.10...V0.10.1) - 2020-05-19

### Changes

- Fix the issue if the paper is not part of an observatory [`#259`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/259)

---
## [V0.10](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.9...V0.10) - 2020-05-19

### Changes

- fix: Add value if the resource has a formated label [`#257`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/257)
- fix: Logout user when the token expires [`#258`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/258)
- style: Fix z-index for comparison popup and page header bar [`#256`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/256)
- fix: Rendering statements component in resource details page [`#255`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/255)
- feat(Resource): show statements with resource in object [`#237`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/237)
- Resolve "Creating organization and observatories" [`#248`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/248)
- feat: support image resources for comparisons [`#254`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/254)
- feat: Feedback/Support Chat for the ORKG Frontend [`#253`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/253)
- feat: Template improvements [`#242`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/242)
- design: change position of contribution amount [`#252`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/252)
- fix: Use localstorage instead of cookie to collect contributions for a comparison [`#247`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/247)
- feat(AddPaper): Show existing paper if the doi already exists [`#250`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/250)
- feat: Show the resource and predicate id in the autocomplete options [`#251`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/251)
- feat: Make the option edit a paper visible along the page [`#246`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/246)
- fix: Comparison with same property label, but different IDs [`#249`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/249)
- feat: Display the number of compared contributions [`#244`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/244)
- fix Console Error from the Jumbotron component [`#245`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/245)
- feat: Listing all published comparisons [`#243`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/243)
- fix: Fix existing tests [`#240`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/240)

---
## [V0.9](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.8...V0.9) - 2020-05-05

### Changes

- feat: support thumbnails for related comparison resources [`#239`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/239)
- Resolve "Fix double line edit mode" [`#234`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/234)
- Single node collapse [`#230`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/230)
- Resolve "Bug: publishing a comparison" [`#236`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/236)
- Change position "Add contribution" for a comparison [`#233`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/233)

---
## [V0.8](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.7.1...V0.8) - 2020-04-15

### Changes

- Change comparison menu [`#227`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/227)
- feat: edit the classes of a resource [`#226`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/226)
- fix inserting data from abstract annotator to contribution data [`#231`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/231)
- fix create a shareable link for published comparisons [`#229`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/229)
- feat: Support ordering for featured comparisons and papers on homepage [`#225`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/225)

---
## [V0.7.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.7...V0.7.1) - 2020-04-02

### Changes

- fix: delete property of template [`#224`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/224)

---
## [V0.7](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.6.2...V0.7) - 2020-04-02

### Changes

- Add a contribution option [`#222`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/222)
- feat: support for paper PDF url [`#220`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/220)
- Resolve "Edit the research field of a paper" [`#215`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/215)
- make the similar paper box responsive #45 [`#219`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/219)
- Resolve "Add additional resources to comparisons" [`#223`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/223)
- refactor: Statement Browser and Save the template used to create a resource [`#216`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/216)
- Custom 503 error page [`#218`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/218)
- ViewPaper design update [`#217`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/217)
- Resolve "Responsive site" [`#214`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/214)
- Update regular expression of ORCID Identifier [`#211`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/211)
- Better mobile support in some views [`#212`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/212)
- Replace Findable with FAIR on the home page header. [`#213`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/213)

---
## [V0.6.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.6.1...V0.6.2) - 2020-03-11

### Commits

- Remove unuseful comments and variables [`e2d3a62`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/commit/e2d3a623eeadc964772d57fcfa58fc00d711c859)
- Update changelog [`ae2c3b2`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/commit/ae2c3b22165152168275ef1c9ba68a0ed1d6ca20)
- Fix RDF datacube vocabulary tabular view [`dd6a28b`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/commit/dd6a28b9c9299fbbe94e639244a2f3138a3ab90f)
---
## [V0.6.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.6...V0.6.1) - 2020-03-10

### Commits

- Fix datacube vocabulary tabular view [`1e770d8`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/commit/1e770d8a25143736794893550ea3d869c1efed5a)
---
## [V0.6](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.5.8...V0.6) - 2020-03-10

### Changes

- fix: RDF DataCube tabular view [`#208`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/208)
- fix: Export to Latex [`#207`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/207)
- Widget [`#192`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/192)
- feat(UX): Pre-fill general data using a query paramater [`#205`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/205)
- Locate button fix [`#206`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/206)
- feat: provide input templates to users and many small UX changes throughout the UI [`#210`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/210)

---
## [V0.5.8](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.5.7...V0.5.8) - 2020-03-03

### Changes

- Search in graph [`#196`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/196)

---
## [V0.5.7](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.5.6...V0.5.7) - 2020-03-03

### Changes

- refactor(Comparison): save comparison response only on share and publish actions [`#202`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/202)
- feat(Home): add ORKG marketing video to the homepage [`#203`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/203)
- Resolve "Improvements to sign in / account settings / user profile" [`#179`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/179)
- style: fix problem of autocomplete width with long texts [`#204`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/204)
- feat: Add paper venue #115 [`#182`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/182)
- feat(Comparison): Add reference to contribution comparison [`#185`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/185)
- improvement(UX): Auto focus on author input field [`#197`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/197)
- improvement(UX): research field input [`#198`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/198)
- improvement(UX): Edit paper [`#199`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/199)
- feat(ResearchProblemInput): Suggest newly added research problems from other contributions [`#200`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/200)
- style(UX): Show a keyboard shortcut to navigate horizontally in comparison results [`#201`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/201)
- fix(EditPaper): fix link to research problem after editing [`#194`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/194)
- fix(AddPaper): use existing research problems [`#193`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/193)
- feat(ValuePlugin): Add Doi value plugin [`#186`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/186)
- improvement(Comparison) : LaTeX/BibTeX Export [`#187`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/187)
- feat(Paper): Share paper in social media [`#188`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/188)
- improvement(ResearchProblem) : show description of research problem [`#190`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/190)
- Close the comparison popup when the user clicks ouside of it [`#189`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/189)
- fix(HelpTour): remove updateTourCurrentStep action [`#191`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/191)
- feat(Graph visualization): Add expand all nodes option and improve the performance for getting new data [`#184`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/184)
- fixed rendering animation group remove [`#183`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/183)
- feat(Resource): show DBpedia/Wikipedia/WikiData abstract when a resource is sameAs wiki's resource [`#177`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/177)
- Visualization module [`#178`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/178)
- feat(ResearchFields): grey out empty fields, better UX with animations [`#176`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/176)
- fix: User logout [`#181`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/181)
- feat(Footer): add more partner logos [`#180`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/180)

---
## [V0.5.6](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.5.5...V0.5.6) - 2020-01-21

### Changes

- style(footer): Add TIB logo [`#175`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/175)
- fix(Comparison): Export PDF [`#170`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/170)
- fix(Comparison): Short and Publish links [`#171`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/171)
- style(SimilarContribution): show contribution label [`#173`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/173)
- style: break words comparison box + add calendar icon paper card [`#174`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/174)
- fix(Comparison): wrap long text in headers [`#172`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/172)

---
## [V0.5.5](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.5.4...V0.5.5) - 2020-01-17

### Commits

- fix(Comparison): Export as RDF [`c6abbd6`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/commit/c6abbd667fac2bcb441360dac68925ff12bd1674)
- fix(Comparison): Comparison url [`27f3e7b`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/commit/27f3e7b7966de5fb28bdb197919a3fd5e49015de)
---
## [V0.5.4](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.5.3...V0.5.4) - 2020-01-17

### Changes

- feat(Comparison): Export as RDF [`#169`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/169)
- fix(Comparison): improve general UX [`#164`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/164)
- fix(Comparison): fix links to published comparison, fix wrapping long comparison title [`#168`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/168)
- feat(Comparison): ability to publish a comparison [`#166`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/166)
- feat(License): add license for published data [`#167`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/167)
- feat(StatementBrowser): video previews for multiple platforms including the TIB AV portal [`#165`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/165)
- fix(Search): hide no found message of not selected filter types, fix loading indicator [`#162`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/162)
- style: eslint rules for better coding, prefer const over let as warning, disallow var [`#163`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/163)
- feat: Sortable authors input [`#159`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/159)
- fix: similar contributions [`#148`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/148)
- fix: check if headers exist before calling headers function [`#149`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/149)
- fix: load paper and statement browser data from the previous props on componenetDidUpdate [`#150`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/150)
- fix: Set classes of newly created contributions and research problems [`#151`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/151)
- Make the autocomplete case unsensitive [`#152`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/152)
- fix: Show no result message if the search query is empty [`#153`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/153)
- style: Fix problem with long strings of search results [`#154`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/154)
- fix: exclude authors from resources search result [`#155`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/155)
- fix: Open property on create [`#156`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/156)
- fix: define a custom method to sort elements of an array [`#157`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/157)
- feat: show a link of the dedicated page of selected resource in statement browser [`#158`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/158)
- add links to imprint and data protection regulation [`#160`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/160)
- remove unused css files [`#161`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/161)

---
## [V0.5.3](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.5.2...V0.5.3) - 2019-12-17

### Changes

- Show featured papers by default [`#144`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/144)
- fix: Use react router link for internal link [`#146`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/146)
- fix: Add FeaturedPaper class to default environment variables [`#147`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/147)

---
## [V0.5.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.5.1...V0.5.2) - 2019-12-16

### Changes

- fix: featured papers component [`#143`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/143)
- refactor : Get paper data function [`#142`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/142)
- style: update home page components [`#139`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/139)
- added stopForce function (called when graph is closed [stopBackgroundProcesses]) [`#140`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/140)
- style: fix statment browser issue in firefox [`#141`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/141)
- fix: replace urls with constants [`#137`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/137)
- style: add margin top to body class [`#138`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/138)
- style(Homepage): set multiple mottos in the homepage [`#136`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/136)
- fix: typos on homepage and license page [`#135`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/135)

---
## [V0.5.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.5...V0.5.1) - 2019-12-13

### Changes

- fix: remove the token cookie if it's expired [`#134`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/134)

---
## [V0.5](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.4.1...V0.5) - 2019-12-13

### Changes

- style: change the about banner on the home page [`#132`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/132)
- fix: disable send token by default on get requests [`#133`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/133)
- Ensure that  no duplicate labels are in the new properties [`#117`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/117)
- refator: Separated component for contribution help tour [`#120`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/120)
- feat: User settings [`#128`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/128)
- feat: featured comparisons page and show slider on homepage [`#126`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/126)
- feat: add Github issue tracker link to footer [`#131`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/131)
- fix : Adding wrapping option to resources/literals in StatementBrowser [`#129`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/129)
- fix: Updating a resource/literal labels [`#130`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/130)
- fix: scrolling to browser window top and page transition [`#127`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/127)
- Visualization module [`#122`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/122)
- replace some HTTP requests with bulk actions [`#119`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/119)
- Integration of ORCID  and Author Class [`#115`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/115)
- fix: Misleading error message on comparison [`#121`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/121)
- Add Gitlab template issue for Bugs [`#116`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/116)
- style(header, footer): small style changes [`#114`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/114)
- style: prettier on all files [`#94`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/94)
- Author page #94 [`#109`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/109)
- feat(authentication): support for user accounts in the UI [`#96`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/96)
- Keep the interface interactive during the guided tour #84 [`#85`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/85)
- Filtering the resources based on the classes [`#95`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/95)
- feat: show path of values in the contribution comparison [`#100`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/100)
- fix: Sort resources/predicates/statements by created at property [`#105`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/105)
- fix: set the classes of resources on autocomplete [`#106`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/106)
- refactor: move abstract annotation to a dialog [`#112`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/112)
- Resolve "Edit paper: don't save when there are not changes" [`#113`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/113)
- feat(changelog): include changelog page in the UI [`#102`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/102)
- Show save button when editing resource label [`#111`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/111)
- style(home): add a banner that links to project page [`#104`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/104)
- fix : edit the label of a resource [`#110`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/110)
- feat: keep selected property on the resource history [`#107`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/107)
- style(footer):  new footer design that shows the current version [`#101`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/101)
- feat(addpaper, viewpaper): support paper edit [`#92`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/92)
- docs(readme): more information and include contributors information [`#103`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/103)
- style(header): include new ORKG logo in the header [`#99`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/99)
- Fix latex preview [`#97`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/97)
- docs(changelog): auto generate change log on pre-commit [`#98`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/98)
- Annotation tooltip position [`#71`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/71)
- Async Research problem selection [`#68`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/68)
- Some fixes in tools pages [`#91`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/91)
- Add edit label for not existing resources [`#84`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/84)
- Include pagination paramaters in network functions [`#89`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/89)
- Save full paper using one api call [`#81`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/81)
- Add paper : Show paper title after the first step [`#83`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/83)
- Get annotations via post HTTP method [`#86`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/86)
- Support latex entry in the input fields #53 [`#88`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/88)
- Added stats page, change name of debug menu to: tools [`#90`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/90)
- Feat/improved search results page [`#82`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/82)
- Remove MouseFlow and TPDL Experiment [`#80`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/80)
- Pre-commit lint check [`#78`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/78)
- Package updates [`#70`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/70)
- Fix missing label abstract annotator [`#77`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/77)
- Add confirmation box when the user leave the page 'add paper' without saving #76 [`#72`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/72)
- Fix contribution deletion #88 [`#73`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/73)
- Fix the size of view graph button #90 [`#74`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/74)
- Render the publication DOI as a link #91 [`#75`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/75)
- Parse the full title from crossref #89 [`#76`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/76)

---
## [V0.4.1](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.4...V0.4.1) - 2019-09-06

### Commits

- add missing slashes [`766a1af`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/commit/766a1afd40258265015f741e520138f8e40d042f)
---
## [V0.4](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.3...V0.4) - 2019-09-06

### Changes

- RDF data cube vocabulary tabular visualization [`#67`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/67)
- Paper wizard abstract step [`#65`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/65)
- TPDL experiment info page [`#66`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/66)
- Unregister the service worker [`#64`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/64)
- Init share short link option to false if long url change [`#63`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/63)
- Add clear comparison popup [`#62`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/62)
- Fix statement browser style [`#61`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/61)
- Add support to get general paper data from bibtex [`#58`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/58)
- Improve autocomplete [`#57`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/57)
- Graph visualization [`#60`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/60)
- Set pages title [`#59`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/59)
- Comparison fixes [`#55`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/55)
- Index each contribution separately [`#54`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/54)
- Include citation to ORKG in LaTeX exports [`#52`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/52)
- Fix some links in view paper page [`#53`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/53)
- config routes [`#50`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/50)
- Add explanation for the meaning of research contributions #56 [`#51`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/51)
- add a link to orkg in exported latex [`#49`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/49)

---
## [V0.3](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.2...V0.3) - 2019-06-27

### Changes

- Move scss styles of Contributions.module into styled components #52 [`#44`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/44)
- add bibtex generator [`#48`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/48)
- load comparison from cookie each second [`#46`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/46)
- add transpose option to compraison table [`#47`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/47)
- show message if property label already exists #49 [`#42`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/42)
- prevent page reload on enter research problem fix #51 [`#41`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/41)
- fix the link of compare contributions [`#45`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/45)
- check if there at least a paper for a contribution [`#43`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/43)
- Add no title when a paper title is missing [`#40`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/40)
- Similarity styling fix [`#39`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/39)
- run setupSimilarity async after adding a paper [`#38`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/38)
- add separated loading indicator for similaire contributions [`#37`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/37)
- Keep input value when switching data type - fix #48 [`#36`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/36)
- Fix statement browser bugs [`#35`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/35)
- Research problem [`#34`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/34)
- Add research problem input [`#33`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/33)

---
## [V0.2](https://gitlab.com/TIBHannover/orkg/orkg-frontend/compare/V0.1...V0.2) - 2019-06-27

### Changes

- Fix typos in tooltips [`#31`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/31)
- New ui design [`#30`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/30)

---
## V0.1 - 2019-06-27

### Changes

- Resolve "Deployment deletes documentation" [`#27`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/27)
- Extracted popup delay to the configuration file. [`#29`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/29)
- Resolve "Rewrite networking to use promises" [`#28`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/28)
- Resolve "Type error" in Chrome, when trying to add a new predicate [`#26`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/26)
- Minor changes before dils [`#25`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/25)
- Resolve "Make the changes in UI to Neo4J implementation in backend" [`#24`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/24)
- UI cleanup before DILS [`#23`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/23)
- Hid navigation buttons. Commented the corresponding code, so that they can be brought back easily. [`#22`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/22)
- Added tooltips to the buttons. [`#21`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/21)
- Resolve "Show a new value selection row in the dropdown box" [`#19`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/19)
- Resolve "Add DOI as a property when creating a new resource from DOI" [`#20`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/20)
- Resolve "Make addition of property possible" [`#18`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/18)
- Resolve "Warnings when building" [`#17`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/17)
- Resolve "Fix network error problem in Firefox" [`#16`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/16)
- Added a fix to redirects. [`#15`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/15)
- search working again [`#13`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/13)
- Build for /orkg URL prefix [`#14`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/14)
- Deployment changes [`#8`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/8)
- fix merge issues from master into search [`#12`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/12)
- Search functionality [`#10`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/10)
- Refactoring helpers [`#9`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/9)
- Gitlab CI [`#7`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/7)
- Resolve "Implement 'add statement' functionality" [`#6`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/6)
- Bootstrap wikidata routing [`#5`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/5)
- Resolve "Implement data addition" [`#4`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/4)
- Using visjs [`#3`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/3)
- Using orkg prototype [`#2`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/2)
- Implemented basic data fetch from the new backend. [`#1`](https://gitlab.com/TIBHannover/orkg/orkg-frontend/merge_requests/1)
