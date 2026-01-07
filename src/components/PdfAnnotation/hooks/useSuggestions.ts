import useSWR from 'swr';

import useOntology from '@/components/PdfAnnotation/hooks/useOntology';
import { classifySentence, nlpServiceUrl } from '@/services/orkgNlp';

const SCORE_THRESHOLD = 0.05;

const useSuggestions = ({ sentence }: { sentence?: string }) => {
    const { classes, findByLabel } = useOntology();

    const labels = classes.filter((_class) => _class.suggestedProperty).map((_class) => _class.label);

    const {
        data: suggestedClasses,
        error,
        isLoading,
    } = useSWR(
        sentence
            ? [
                  {
                      sentence,
                      labels,
                  },
                  nlpServiceUrl,
                  'classifySentence',
              ]
            : null,
        ([params]) => classifySentence(params),
    );

    let _suggestedClasses = suggestedClasses?.labels
        .filter((_, index) => suggestedClasses.scores[index] > SCORE_THRESHOLD)
        .map((label) => findByLabel(label))
        .filter((_class) => _class !== undefined);

    // only return max 5 results
    _suggestedClasses = _suggestedClasses?.slice(0, 5);

    return { error, isLoading, suggestedClasses: _suggestedClasses };
};

export default useSuggestions;
