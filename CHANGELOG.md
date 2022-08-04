All notable changes to the ORKG will be documented in this file. The format is based on [Keep a
Changelog](https://keepachangelog.com/en/1.0.0/) and we adhere to [Semantic
Versioning](https://semver.org/spec/v2.0.0.html).

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
