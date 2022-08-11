import { useEffect, useState } from 'react';
import { flatten, uniqBy } from 'lodash';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { getResourcesByClass } from 'services/backend/resources';
import { useSelector } from 'react-redux';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';

const usePreviouslySelectedResearchField = () => {
    const userId = useSelector(state => state.auth.user.id);
    const [researchFields, setResearchField] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        getResourcesByClass({
            id: CLASSES.PAPER,
            page: 0,
            items: 8,
            sortBy: 'created_at',
            desc: true,
            creator: userId,
        }).then(result => {
            const papers = result.content.map(p =>
                getStatementsBySubjectAndPredicate({ subjectId: p.id, predicateId: PREDICATES.HAS_RESEARCH_FIELD }),
            );
            Promise.all(papers)
                .then(results => {
                    setResearchField(uniqBy(flatten(results.map(r => r.map(s => s.object))), 'id'));
                    setIsLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
                });
        });
    }, [userId]);
    return { userId, isLoading, researchFields };
};

export default usePreviouslySelectedResearchField;
