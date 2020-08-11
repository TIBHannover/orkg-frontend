import { useCallback } from 'react';
import { WordTokenizer } from 'natural';
import { uniq } from 'lodash';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';

// A hook to demonstrate the use of smart suggestions, when sufficient training data is available, a modal will be trained
const useSuggestions = () => {
    const { findByType } = useOntology();

    const classesMatchWords = [
        {
            iri: 'Acknowledgements',
            matchWords: ['thank']
        },
        {
            iri: 'Background',
            matchWords: ['currently', 'despite', 'remains', 'background']
        },
        {
            iri: 'Conclusion',
            matchWords: ['conclude', 'conclusion ', 'end', 'presented']
        },
        {
            iri: 'Contribution',
            matchWords: ['contribution', 'present', 'introduce']
        },
        {
            iri: 'Data',
            matchWords: ['data']
        },
        {
            iri: 'DatasetDescription',
            matchWords: ['dataset']
        },
        {
            iri: 'Discussion',
            matchWords: ['concluded', 'indicates', 'findings']
        },
        {
            iri: 'Evaluation',
            matchWords: ['evaluation', 'participants']
        },
        {
            iri: 'FutureWork',
            matchWords: ['future', 'furthermore', 'plan']
        },
        {
            iri: 'Introduction',
            matchWords: ['nowadays', 'current']
        },
        {
            iri: 'Materials',
            matchWords: ['material']
        },
        {
            iri: 'Methods',
            matchWords: ['method']
        },
        {
            iri: 'Model',
            matchWords: ['model']
        },
        {
            iri: 'Motivation',
            matchWords: ['motivation', 'motivate']
        },
        {
            iri: 'ProblemStatement',
            matchWords: ['problem', 'issue', 'challenge']
        },
        {
            iri: 'RelatedWork',
            matchWords: ['related', 'literature', 'example', 'such as', 'initiative']
        },
        {
            iri: 'Results',
            matchWords: ['result', 'results']
        },
        {
            iri: 'Scenario',
            matchWords: ['case']
        }
    ];

    const getSuggestedClasses = useCallback(
        text => {
            const tokenizer = new WordTokenizer();
            const words = tokenizer.tokenize(text);

            let suggestedClassTypes = [];
            for (const classMatch of classesMatchWords) {
                for (const word of words) {
                    const foundWord = classMatch.matchWords.indexOf(word) !== -1;
                    if (foundWord) {
                        suggestedClassTypes.push(classMatch.iri);
                    }
                }
            }
            suggestedClassTypes = uniq(suggestedClassTypes);

            const suggestedClasses = [];
            for (const suggestedClassType of suggestedClassTypes) {
                suggestedClasses.push(findByType(suggestedClassType));
            }

            // only return max 4 results
            suggestedClasses.slice(0, 4);

            return suggestedClasses;
        },
        [classesMatchWords, findByType]
    );

    return { getSuggestedClasses };
};

export default useSuggestions;
