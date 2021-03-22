import { useState, useEffect } from 'react';
import { Container } from 'reactstrap';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByObservatoryId } from 'services/backend/observatories';
import PaperCard from 'components/PaperCard/PaperCard';
import { getPaperData } from 'utils';
import { find } from 'lodash';
import PropTypes from 'prop-types';

const Papers = ({ observatoryId }) => {
    const [isLoadingPapers, setIsLoadingPapers] = useState(null);
    const [papersList, setPapersList] = useState([]);

    useEffect(() => {
        const loadPapers = () => {
            setIsLoadingPapers(true);
            getResourcesByObservatoryId(observatoryId)
                .then(papers => {
                    // Fetch the data of each comparison
                    return getStatementsBySubjects({
                        ids: papers.map(c => c.id)
                    }).then(resourcesStatements => {
                        const papersData = resourcesStatements.map(resourceStatements => {
                            const paperSubject = find(papers, { id: resourceStatements.id });
                            return getPaperData(paperSubject, resourceStatements.statements);
                        });
                        setPapersList(papersData);
                        setIsLoadingPapers(false);
                    });
                })
                .catch(error => {
                    setIsLoadingPapers(false);
                });
        };

        loadPapers();
    }, [observatoryId]);

    return (
        <>
            <Container className="d-flex align-items-center mt-4 mb-4">
                <div className="d-flex flex-grow-1">
                    <h1 className="h5 flex-shrink-0 mb-0">Papers</h1>
                </div>
            </Container>
            <Container className="box rounded-lg p-4 mt-4">
                {!isLoadingPapers ? (
                    <div className="mb-4 mt-4">
                        {papersList.length > 0 ? (
                            <div>
                                {papersList.map(resource => {
                                    return <PaperCard selectable={false} paper={{ title: resource.label, ...resource }} key={`p${resource.id}`} />;
                                })}
                            </div>
                        ) : (
                            <div className="text-center mt-4 mb-4">No Papers</div>
                        )}
                    </div>
                ) : (
                    <div className="mt-4">Loading papers ...</div>
                )}
            </Container>
        </>
    );
};

Papers.propTypes = {
    observatoryId: PropTypes.string.isRequired
};

export default Papers;
