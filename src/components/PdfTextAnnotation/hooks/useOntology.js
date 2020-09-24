import { filter } from 'lodash';

const useOntology = () => {
    const classes = [
        {
            label: 'acknowledgements',
            iri: 'Acknowledgements',
            comment:
                'Usually part of the preface, or a separate section in its own right, often as part of the back matter, it acknowledges those, including funding agencies, who contributed to the undertaking of a research project described in a publication, or to the creation of the work in some way. In scientific articles, the acknowledgements are usually placed as a separated section immediately following the Discussion or Conclusions.',
            recommendedProperty: false,
            suggestedProperty: false
        },
        /*{
            label: 'author contribution',
            iri: 'AuthorContribution',
            comment: 'A description of the roles played by an author in the publication.',
            recommendedProperty: false,
            suggestedProperty: false
        },*/
        {
            label: 'background',
            iri: 'Background',
            comment:
                'Presentation of information that is essential for understanding the situation or problem that is the subject of the publication. In a journal article, the background is usually part of the Introduction, but may be present as separated section.            ',
            recommendedProperty: true,
            suggestedProperty: true
        },
        /*{
            label: 'bibliographic reference',
            iri: 'BibliographicReference',
            comment:
                'A reference, usually contained in a footnote or a bibliographic reference list, that refer to another publication, such as a journal article, a book, a book chapter or a Web site. The inclusion of the bibliographic reference in a publication constitutes the performative act of bibliographic citation.',
            recommendedProperty: false,
            suggestedProperty: false
        },
        {
            label: 'biography',
            iri: 'Biography',
            comment: 'Information describing a person and his or her life history and contributions.',
            recommendedProperty: false,
            suggestedProperty: false
        },*/
        {
            label: 'caption',
            iri: 'Caption',
            comment: 'Text accompanying another item, such as a picture.',
            recommendedProperty: false,
            suggestedProperty: false
        },
        {
            label: 'conclusion',
            iri: 'Conclusion',
            comment:
                'A reflection on the preceding text, summarizing the evidence, arguments or premises presented in the document and their logical outcomes. Conclusions are a fundamental feature in academic research publications, and may be included in the Discussion section.',
            recommendedProperty: false,
            suggestedProperty: true
        },
        {
            label: 'contribution',
            iri: 'Contribution',
            comment: 'A description of the part that this publication plays in the overall field.',
            recommendedProperty: true,
            color: '#C3AAE3',
            suggestedProperty: true
        },
        {
            label: 'data',
            iri: 'Data',
            comment: 'A textual description of data used or produced in the work which the document describes, or the data themselves.',
            recommendedProperty: false,
            suggestedProperty: true
        },
        {
            label: 'dataset description',
            iri: 'DatasetDescription',
            comment:
                'Information describing a dataset held in an external database or repository and including a reference to it, such as a database ID or an accession number.',
            recommendedProperty: false,
            suggestedProperty: true
        },
        /*{
            label: 'dedication',
            iri: 'Dedication',
            comment:
                'Text in which the author names the person or people for whom he/she has written the document, or to whose memory it is dedicated.',
            recommendedProperty: false,
            suggestedProperty: false
        },*/
        {
            label: 'discussion',
            iri: 'Discussion',
            comment:
                'An interpretation and discussion of the results obtained and an analysis of their significance, in support of conclusions. These conclusions may be part of this discussion or may be included in a separate section of the document.',
            recommendedProperty: false,
            suggestedProperty: true
        },
        {
            label: 'epilogue',
            iri: 'Epilogue',
            comment: 'A piece of writing at the end of a work of literature or drama, usually used to bring closure to the work.',
            recommendedProperty: false,
            suggestedProperty: false
        },
        {
            label: 'evaluation',
            iri: 'Evaluation',
            comment: 'A consideration of the value, meaning and significance of the results obtained.',
            recommendedProperty: false,
            suggestedProperty: true
        },
        {
            label: 'external resource description',
            iri: 'ExternalResourceDescription',
            comment: 'Information describing an external resource and including a reference to that resource.',
            recommendedProperty: false,
            suggestedProperty: false
        },
        {
            label: 'future work',
            iri: 'FutureWork',
            comment: 'A proposal for new investigation to be undertaken in order to continue and advance the work described in the publication.',
            recommendedProperty: false,
            suggestedProperty: true
        },
        {
            label: 'introduction',
            iri: 'Introduction',
            comment:
                'An initial description which states the purpose and goals of the following writing, and, in the case of journal articles, typically includes background information on the research topic and a review of related work in the area.',
            recommendedProperty: false,
            suggestedProperty: true
        },
        {
            label: 'legend',
            iri: 'Legend',
            comment: 'Informative text that explicitly explains another item, such as a figure or a table.',
            recommendedProperty: false,
            suggestedProperty: false
        },
        {
            label: 'materials',
            iri: 'Materials',
            comment:
                "A description in a research paper documenting the specialized materials used in the work described. This description is often combined with a description of the methods used, in a section entitled 'Methods and Materials', 'Experimental' or a related term.",
            recommendedProperty: false,
            color: '#F6ABAB',
            suggestedProperty: true
        },
        {
            label: 'methods',
            iri: 'Methods',
            comment:
                "A description in a research paper documenting the specialized methods used in the work described. This description is often combined with a description of the materials used, in a section entitled 'Methods and Materials', 'Experimental' or a related term",
            recommendedProperty: true,
            color: '#ABF6BF',
            suggestedProperty: true
        },
        {
            label: 'model',
            iri: 'Model',
            comment: 'A description of a model used or produced by the work described in the publication.',
            recommendedProperty: false,
            suggestedProperty: true
        },
        {
            label: 'motivation',
            iri: 'Motivation',
            comment: 'A description of the justification for undertaking the work described in the publication.',
            recommendedProperty: false,
            suggestedProperty: false
        },
        {
            label: 'postscript',
            iri: 'Postscript',
            comment: 'Text added after the signature of a letter, or sometimes after the main body of an essay or book.',
            recommendedProperty: false,
            suggestedProperty: false
        },
        {
            label: 'problem statement',
            iri: 'ProblemStatement',
            comment: 'A concise description of the issues that needed to be addressed by a work described in the document.',
            recommendedProperty: true,
            color: '#ADB3F3',
            suggestedProperty: true
        },
        {
            label: 'prologue',
            iri: 'Prologue',
            comment: 'A piece of writing at the beginning of a work of literature or drama, usually used to set the scene or to introduce the work.',
            recommendedProperty: false,
            suggestedProperty: false
        },
        /*{
            label: 'reference',
            iri: 'Reference',
            comment: 'A reference to a specific part of the document, or to another publication.',
            recommendedProperty: false,
            suggestedProperty: false
        },*/
        {
            label: 'related work',
            iri: 'RelatedWork',
            comment:
                "The authors' critical review of current knowledge by specific reference to others' work, both in terms of substantive findings and theoretical and methodological contributions to a particular topic. This description is often included within the introduction section.",
            recommendedProperty: false,
            suggestedProperty: true
        },
        {
            label: 'results',
            iri: 'Results',
            comment: 'The report of the specific findings of an investigation, given without discussion or conclusion being drawn.',
            recommendedProperty: true,
            color: '#ABF6F3',
            suggestedProperty: true
        },
        {
            label: 'scenario',
            iri: 'Scenario',
            comment:
                'A presentation of a use case or test, based on a real or hypothetical situation, used to help someone think through a complex problem or system.',
            recommendedProperty: false,
            suggestedProperty: true
        },
        {
            label: 'supplementary information description',
            iri: 'SupplementaryInformationDescription',
            comment:
                'Information describing supplementary information relating to the document, including references or links to the relevant supplementary information.',
            recommendedProperty: false,
            suggestedProperty: false
        }
    ];

    const recommendedClasses = filter(classes, { recommendedProperty: true });
    const nonRecommendedClasses = filter(classes, { recommendedProperty: false });

    const findByType = type => classes.find(_class => _class.iri === type);
    const findByLabel = label => classes.find(_class => _class.label === label);

    return { classes, recommendedClasses, nonRecommendedClasses, findByType, findByLabel };
};

export default useOntology;
