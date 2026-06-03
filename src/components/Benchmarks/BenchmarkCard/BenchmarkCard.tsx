import { Card, CardContent } from '@heroui/react';
import { BenchmarkSummaryRepresentation } from '@orkg/orkg-client';
import Link from 'next/link';
import { FC } from 'react';

import ROUTES from '@/constants/routes';
import { reverseWithSlug } from '@/utilsTyped';

type BenchmarkCardProps = {
    benchmark: BenchmarkSummaryRepresentation;
};

const BenchmarkCard: FC<BenchmarkCardProps> = ({ benchmark }) => {
    return (
        <Link
            href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                researchProblemId: benchmark.researchProblem.id,
                slug: benchmark.researchProblem.label,
            })}
            className="no-underline h-full block"
        >
            <Card className="h-full border border-default-200 hover:border-primary transition-colors">
                <CardContent className="gap-3 p-4">
                    <div className="font-semibold text-sm leading-snug">{benchmark.researchProblem.label}</div>
                    <div className="mt-2 text-xs text-gray-500">
                        Papers: <b>{benchmark.totalPapers}</b> <br />
                        Datasets: <b>{benchmark.totalDatasets}</b> <br />
                        Code: <b>{benchmark.totalCodes}</b>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default BenchmarkCard;
