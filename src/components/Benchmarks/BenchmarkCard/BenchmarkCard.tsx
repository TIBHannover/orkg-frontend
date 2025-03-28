import Link from 'next/link';
import { FC } from 'react';
import { Card, CardBody } from 'reactstrap';
import styled from 'styled-components';

import ROUTES from '@/constants/routes';
import { reverseWithSlug } from '@/utils';

const BenchmarkCardStyled = styled.div`
    cursor: initial;
    .researchProblemStats {
        text-align: left;
        font-size: smaller;
    }

    .orgLogo {
        margin-top: 10px;
        border: 1px;
        padding: 2px;
    }

    .researchProblemName {
        font-weight: bold;
    }
    &:hover {
        .researchProblemName {
            text-decoration: underline;
        }
    }
`;

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
        <BenchmarkCardStyled className="col-md-3 mb-4">
            <Link
                href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                    researchProblemId: benchmark.research_problem.id,
                    slug: benchmark.research_problem.label,
                })}
                style={{ textDecoration: 'none' }}
            >
                <Card className="h-100">
                    <CardBody>
                        <div className="mt-2">
                            <div className="researchProblemName">{benchmark.research_problem.label}</div>

                            <div className="researchProblemStats text-muted">
                                Papers: <b>{benchmark.total_papers}</b> <br />
                                Datasets: <b>{benchmark.total_datasets}</b> <br />
                                Code: <b>{benchmark.total_codes}</b>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Link>
        </BenchmarkCardStyled>
    );
};

export default BenchmarkCard;
