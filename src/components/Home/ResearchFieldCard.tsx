import Link from 'next/link';
import pluralize from 'pluralize';
import { AnchorHTMLAttributes, FC } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import ROUTES from '@/constants/routes';
import { getStatistics, statisticsUrl } from '@/services/backend/statistics';
import { Node } from '@/services/backend/types';
import { reverseWithSlug } from '@/utils';

/* Bootstrap card column is not working correctly working with vertical alignment,
thus used custom styling here */

type CardProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
    disabled?: boolean;
};

export const Card = styled(Link)<CardProps>`
    cursor: pointer;
    background: #e86161 !important;
    color: #fff !important;
    border: 0 !important;
    border-radius: 12px !important;
    min-height: 85px;
    flex: 0 0 calc(20% - 20px) !important;
    margin: 10px;
    transition: opacity 0.2s;
    justify-content: center;
    display: flex;
    flex: 1 1 auto;
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 140px;
    overflow-wrap: anywhere;

    &:hover {
        opacity: 0.8;
    }
    &[disabled] {
        opacity: 0.5;
        cursor: default;
        pointer-events: none;
    }
    &:active {
        top: 4px;
    }

    @media (max-width: 400px) {
        flex: 0 0 80% !important;
    }
`;

const CardTitle = styled.h5`
    color: #fff;
    font-size: 16px;
    padding: 0 5px;
`;

const PaperAmount = styled.div`
    opacity: 0.5;
    font-size: 80%;
    text-align: center;
`;

type ResearchFieldCardProps = {
    field: Node;
};

const ResearchFieldCard: FC<ResearchFieldCardProps> = ({ field }) => {
    const { data: stats, isLoading } = useSWR([field.id, statisticsUrl, 'getStatistics'], ([params]) =>
        Promise.all([
            getStatistics({ researchFieldId: params, group: 'content-types', name: 'paper-count', includeSubfields: true }),
            getStatistics({ researchFieldId: params, group: 'content-types', name: 'comparison-count', includeSubfields: true }),
        ]),
    );

    return (
        <Card
            disabled={stats?.[0]?.value === 0}
            href={reverseWithSlug(ROUTES.HOME_WITH_RESEARCH_FIELD, {
                researchFieldId: field.id,
                slug: field.label,
            })}
        >
            <CardTitle className="card-title m-0 text-center"> {field.label}</CardTitle>
            <PaperAmount>
                {!isLoading ? (
                    <>
                        {pluralize('paper', stats?.[0]?.value ?? 0, true)} - {pluralize('comparison', stats?.[1]?.value ?? 0, true)}
                    </>
                ) : (
                    'Loading...'
                )}
            </PaperAmount>
        </Card>
    );
};
export default ResearchFieldCard;
