import { useCallback, useState } from 'react';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import { classifySentence } from 'network';

const SCORE_THRESHOLD = 0.05;

const useSuggestions = () => {
    const { classes, findByLabel } = useOntology();
    const [isLoading, setIsLoading] = useState(false);
    const [sentence, setSentence] = useState('');
    const [suggestedClasses, setSuggestedClasses] = useState([]);

    const getSuggestedClasses = useCallback(
        async _sentence => {
            if (isLoading || _sentence === sentence) {
                return;
            }

            setIsLoading(true);
            setSentence(_sentence);

            const labels = classes.filter(_class => _class.suggestedProperty).map(_class => _class.label);
            classifySentence({
                sentence: _sentence,
                labels
            })
                .then(result => {
                    let _suggestedClasses = result.labels
                        .filter((_, index) => {
                            return result.scores[index] > SCORE_THRESHOLD;
                        })
                        .map((label, index) => {
                            return findByLabel(label);
                        });

                    // only return max 5 results
                    _suggestedClasses = _suggestedClasses.slice(0, 5);

                    setSuggestedClasses(_suggestedClasses);
                    setIsLoading(false);
                })
                .catch(e => {
                    setSuggestedClasses([]);
                    setIsLoading(false);
                });
        },
        [classes, isLoading, sentence, findByLabel]
    );

    return { getSuggestedClasses, isLoading, suggestedClasses };
};

export default useSuggestions;
