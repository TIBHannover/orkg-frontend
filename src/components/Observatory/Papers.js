import { useState, useEffect } from 'react';
import { Container, ListGroup } from 'reactstrap';
import { getStatementsBySubjects } from 'services/backend/statements';
import { getResourcesByObservatoryId } from 'services/backend/observatories';
import PaperCard from 'components/PaperCard/PaperCard';
import ContentLoader from 'react-content-loader';
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
            <Container className="p-0 box rounded">
                {!isLoadingPapers && (
                    <ListGroup>
                        {papersList.length > 0 ? (
                            <>
                                {papersList.map(resource => {
                                    return <PaperCard selectable={false} paper={{ title: resource.label, ...resource }} key={`p${resource.id}`} />;
                                })}
                            </>
                        ) : (
                            <div className="text-center mt-4 mb-4">No Papers</div>
                        )}
                    </ListGroup>
                )}
                {isLoadingPapers && (
                    <div className="text-center mt-4 mb-4 p-5 container box rounded">
                        <div className="text-left">
                            <ContentLoader
                                speed={2}
                                width={400}
                                height={50}
                                viewBox="0 0 400 50"
                                style={{ width: '100% !important' }}
                                backgroundColor="#f3f3f3"
                                foregroundColor="#ecebeb"
                            >
                                <rect x="0" y="0" rx="3" ry="3" width="400" height="20" />
                                <rect x="0" y="25" rx="3" ry="3" width="300" height="20" />
                            </ContentLoader>
                        </div>
                    </div>
                )}
            </Container>
        </>
    );
};

Papers.propTypes = {
    observatoryId: PropTypes.string.isRequired
};

export default Papers;
