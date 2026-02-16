import { truncate } from 'lodash';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import ResearchProblemsModal from '@/components/Conference/ResearchProblemsModal';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Button from '@/components/Ui/Button/Button';
import ROUTES from '@/constants/routes';
import { getResearchProblems, researchProblemsUrl } from '@/services/backend/research-problems';
import { reverseWithSlug } from '@/utils';

const ResearchProblemBox = ({ id }: { id: string }) => {
    const [openModal, setOpenModal] = useState(false);

    const { data, isLoading, error } = useSWR(
        [{ addressedByOrganization: id, page: 0, size: 6 }, researchProblemsUrl, 'getResearchProblems'],
        ([params]) => getResearchProblems(params),
    );
    const problems = data?.content ?? [];

    return (
        <div className="box rounded-3 p-3 flex-grow-1">
            {!isLoading && error && error.statusCode === 404 && <NotFound />}
            {!isLoading && error && error.statusCode !== 404 && <InternalServerError error={error} />}
            <h5>Research problems</h5>
            {!isLoading && problems.length > 0 && (
                <ul className="ps-3 pt-2">
                    {problems.slice(0, 5).map((rp) => (
                        <li key={`p${rp.id}`}>
                            <Tooltip content={rp.label} disabled={rp.label?.length <= 70}>
                                <Link href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}>
                                    {truncate(rp.label, { length: 70 })}
                                </Link>
                            </Tooltip>
                        </li>
                    ))}
                </ul>
            )}
            {isLoading && <div className="text-center mt-4 mb-4">Loading research problems ...</div>}
            {!error && !isLoading && problems.length === 0 && <div className="text-center my-4">No research problems yet</div>}
            {problems.length > 5 && (
                <div className="text-center mt-2">
                    <Button size="sm" onClick={() => setOpenModal((v) => !v)} color="light">
                        View more
                    </Button>
                    {openModal && <ResearchProblemsModal openModal={openModal} setOpenModal={setOpenModal} organizationId={id} />}
                </div>
            )}
        </div>
    );
};

export default ResearchProblemBox;
