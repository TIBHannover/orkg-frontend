import { Button, Tooltip } from '@heroui/react';
import { truncate } from 'lodash';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import ResearchProblemsModal from '@/components/Conference/ResearchProblemsModal';
import ROUTES from '@/constants/routes';
import { getResearchProblems, researchProblemsUrl } from '@/services/backend/research-problems';
import { reverseWithSlug } from '@/utilsTyped';

const ResearchProblemBox = ({ id }: { id: string }) => {
    const [openModal, setOpenModal] = useState(false);

    const { data, isLoading, error } = useSWR(
        [{ addressedByOrganization: id, page: 0, size: 6 }, researchProblemsUrl, 'getResearchProblems'],
        ([params]) => getResearchProblems(params),
    );
    const problems = data?.content ?? [];

    return (
        <div className="box rounded-lg p-4 grow flex flex-col">
            {!isLoading && error && error.statusCode === 404 && <NotFound />}
            {!isLoading && error && error.statusCode !== 404 && <InternalServerError error={error} />}
            <h5>Research problems</h5>
            {!isLoading && problems.length > 0 && (
                <ul className="pl-4 pt-2">
                    {problems.slice(0, 5).map((rp) => (
                        <li key={`p${rp.id}`}>
                            <Tooltip delay={300} isDisabled={rp.label?.length <= 70}>
                                <Tooltip.Trigger>
                                    <Link href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, { researchProblemId: rp.id, slug: rp.label })}>
                                        {truncate(rp.label, { length: 70 })}
                                    </Link>
                                </Tooltip.Trigger>
                                <Tooltip.Content>{rp.label}</Tooltip.Content>
                            </Tooltip>
                        </li>
                    ))}
                </ul>
            )}
            {isLoading && <div className="text-center mt-6 mb-6">Loading research problems ...</div>}
            {!error && !isLoading && problems.length === 0 && <div className="text-center my-6">No research problems yet</div>}
            {problems.length > 5 && (
                <div className="text-center mt-2">
                    <Button size="sm" variant="tertiary" onPress={() => setOpenModal((v) => !v)}>
                        View more
                    </Button>
                    {openModal && <ResearchProblemsModal openModal={openModal} setOpenModal={setOpenModal} organizationId={id} />}
                </div>
            )}
        </div>
    );
};

export default ResearchProblemBox;
