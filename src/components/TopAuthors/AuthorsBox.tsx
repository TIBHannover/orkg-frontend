import { faAward } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Skeleton } from '@heroui/react';
import { useState } from 'react';

import AuthorCard from '@/components/Cards/AuthorCard/AuthorCard';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ResearchProblemAuthorsModal from '@/components/TopAuthors/ResearchProblemAuthorsModal';
import { getAuthorStatisticsByResearchProblemId, researchProblemsUrl } from '@/services/backend/research-problems';

type AuthorsBoxProps = {
    researchProblemId: string;
};

const AuthorsBox = ({ researchProblemId }: AuthorsBoxProps) => {
    const [openModal, setOpenModal] = useState(false);
    const {
        data: authors,
        isLoading,
        totalElements,
    } = usePaginate({
        fetchFunction: getAuthorStatisticsByResearchProblemId,
        fetchUrl: researchProblemsUrl,
        fetchFunctionName: 'getAuthorStatisticsByResearchProblemId',
        prefixParams: 'authorsBox_',
        fetchExtraParams: {
            id: researchProblemId,
            sort: ['paper_count,desc'],
        },
        defaultPageSize: 4,
    });
    return (
        <div className="box rounded-lg p-4 grow flex flex-col">
            <h5>
                <FontAwesomeIcon icon={faAward} className="text-accent" /> Top authors
            </h5>
            <div className="grow">
                {!isLoading && authors && authors.length > 0 && (
                    <div className="mt-2">
                        {authors.slice(0, 3).map((author, index) => (
                            <div className="pt-1 pl-2 pr-2" key={`rp${index}`}>
                                <AuthorCard author={author.authorName} paperAmount={author.paperCount} />
                                {authors.slice(0, 3).length - 1 !== index && <hr className="mb-0 mt-1" />}
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && totalElements === 0 && <div className="mt-6 mb-6">No authors in this research problem yet</div>}
                {!isLoading && totalElements && totalElements > 3 && (
                    <div className="text-center mt-4">
                        <Button size="sm" variant="tertiary" onClick={() => setOpenModal((v) => !v)}>
                            View more
                        </Button>
                        {openModal && (
                            <ResearchProblemAuthorsModal openModal={openModal} setOpenModal={setOpenModal} researchProblemId={researchProblemId} />
                        )}
                    </div>
                )}
                {isLoading && (
                    <div className="mt-6 mb-6 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-14 rounded-full shrink-0" />
                            <div className="flex flex-col gap-2 grow">
                                <Skeleton className="w-3/4 h-2 rounded" />
                                <Skeleton className="w-full h-1.5 rounded" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Skeleton className="size-14 rounded-full shrink-0" />
                            <div className="flex flex-col gap-2 grow">
                                <Skeleton className="w-3/4 h-2 rounded" />
                                <Skeleton className="w-full h-1.5 rounded" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthorsBox;
