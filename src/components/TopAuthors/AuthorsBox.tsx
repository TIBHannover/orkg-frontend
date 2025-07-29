import { faAward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import pluralize from 'pluralize';
import { useState } from 'react';

import AuthorCard from '@/components/Cards/AuthorCard/AuthorCard';
import ContentLoader from '@/components/ContentLoader/ContentLoader';
import useResearchProblemAuthors from '@/components/TopAuthors/hooks/useTopAuthors';
import ResearchProblemAuthorsModal from '@/components/TopAuthors/ResearchProblemAuthorsModal';
import Button from '@/components/Ui/Button/Button';
import { ResearchProblemTopAuthor } from '@/services/backend/problems';

type AuthorsBoxProps = {
    researchProblemId: string;
};

const AuthorsBox = ({ researchProblemId }: AuthorsBoxProps) => {
    const { authors, isLoading } = useResearchProblemAuthors({ researchProblemId, pageSize: 4 });
    const [openModal, setOpenModal] = useState(false);

    return (
        <div className="box rounded-3 p-3 flex-grow-1 d-flex flex-column">
            <h5>
                <FontAwesomeIcon icon={faAward} className="text-primary" /> Top authors
            </h5>
            <div className="flex-grow-1">
                {!isLoading && authors && authors.length > 0 && (
                    <div className="mt-2">
                        {authors.slice(0, 3).map((author, index) => (
                            <div className="pt-1 ps-2 pe-2" key={`rp${index}`}>
                                <AuthorCard
                                    author={author.author.value}
                                    // @ts-expect-error
                                    paperAmount={pluralize('paper', (author as ResearchProblemTopAuthor).papers, true)}
                                />
                                {authors.slice(0, 3).length - 1 !== index && <hr className="mb-0 mt-1" />}
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && authors?.length === 0 && <div className="mt-4 mb-4">No authors in this research problem yet</div>}
                {!isLoading && authors?.length > 3 && (
                    <div className="text-center mt-3">
                        <Button size="sm" onClick={() => setOpenModal((v) => !v)} color="light">
                            View more
                        </Button>
                        {openModal && (
                            <ResearchProblemAuthorsModal openModal={openModal} setOpenModal={setOpenModal} researchProblemId={researchProblemId} />
                        )}
                    </div>
                )}
                {isLoading && (
                    <div className="mt-4 mb-4">
                        <ContentLoader height={130} width={200} foregroundColor="#d9d9d9" backgroundColor="#ecebeb">
                            <rect x="90" y="12" rx="3" ry="3" width="123" height="7" />
                            <rect x="90" y="30" rx="3" ry="3" width="171" height="6" />
                            <circle cx="44" cy="30" r="30" />
                            <circle cx="44" cy="100" r="30" />
                            <rect x="90" y="82" rx="3" ry="3" width="123" height="7" />
                            <rect x="90" y="100" rx="3" ry="3" width="171" height="6" />
                        </ContentLoader>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthorsBox;
