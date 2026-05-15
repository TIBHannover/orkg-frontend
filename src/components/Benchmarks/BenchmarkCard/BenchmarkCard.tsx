import { Card, CardContent } from '@heroui/react';
import Link from 'next/link';
import { FC } from 'react';

import ROUTES from '@/constants/routes';
import { reverseWithSlug } from '@/utilsTyped';

type BenchmarkCardProps = {
    benchmark: {
        research_problem: {
            id: string;
            label: string;
        };
        total_papers: number;
        total_datasets: number;
        total_codes: number;
    };
};

const BenchmarkCard: FC<BenchmarkCardProps> = ({ benchmark }) => {
    return (
        <Link
            href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                researchProblemId: benchmark.research_problem.id,
                slug: benchmark.research_problem.label,
            })}
            className="no-underline h-full block"
        >
            <Card className="h-full border border-default-200 hover:border-primary transition-colors">
                <CardContent className="gap-3 p-4">
                    <div className="font-semibold text-sm leading-snug">{benchmark.research_problem.label}</div>
                    <div className="mt-2 text-xs text-gray-500">
                        Papers: <b>{benchmark.total_papers}</b> <br />
                        Datasets: <b>{benchmark.total_datasets}</b> <br />
                        Code: <b>{benchmark.total_codes}</b>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default BenchmarkCard;
