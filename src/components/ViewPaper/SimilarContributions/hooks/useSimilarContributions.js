import { useEffect, useState } from 'react';
import { getSimilarContribution } from 'services/similarity';
import { getResource } from 'services/backend/resources';

const useSimilarContributions = ({ contributionId }) => {
    const [similarContributions, setSimilarContributions] = useState([]);
    const [isSimilarContributionsLoading, setIsSimilarContributionsLoading] = useState(true);
    const [isSimilarContributionsFailedLoading, setIsSimilarContributionsFailedLoading] = useState(false);

    useEffect(() => {
        setIsSimilarContributionsLoading(true);
        getSimilarContribution({ contributionId })
            .then(sContributions => {
                const sContributionsData = sContributions.map(paper =>
                    // Fetch the data of each paper
                    getResource(paper.paper_id).then(paperResource => ({ ...paper, title: paperResource.label })),
                );
                Promise.all(sContributionsData).then(results => {
                    setSimilarContributions(results);
                    setIsSimilarContributionsLoading(false);
                    setIsSimilarContributionsFailedLoading(false);
                });
            })
            .catch(() => {
                setSimilarContributions([]);
                setIsSimilarContributionsLoading(false);
                setIsSimilarContributionsFailedLoading(true);
            });
    }, [contributionId]);

    return {
        isSimilarContributionsLoading,
        isSimilarContributionsFailedLoading,
        similarContributions,
    };
};

export default useSimilarContributions;
