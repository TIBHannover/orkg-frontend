import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { getImage } from '@/components/SustainableDevelopmentGoals/helpers';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import { SUSTAINABLE_DEVELOPMENT_GOALS } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

export const metadata: Metadata = {
    title: 'Sustainable Development Goals - ORKG',
};

const SustainableDevelopmentGoals = () => (
    <>
        <TitleBar>Sustainable Development Goals</TitleBar>
        <div className="mx-auto mb-4 max-w-container px-3">
            <div className="rounded bg-surface-tertiary p-4">
                ORKG content can be assigned to{' '}
                <a href="https://sdgs.un.org/goals" target="_blank" rel="noreferrer">
                    Sustainable Development Goals
                </a>{' '}
                defined by the United Nations.
            </div>
        </div>
        <Container>
            <div className="box rounded p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Object.values(SUSTAINABLE_DEVELOPMENT_GOALS).map((sdg) => (
                        <Link href={reverse(ROUTES.SUSTAINABLE_DEVELOPMENT_GOAL, { sdg })} key={sdg}>
                            <Image src={getImage(sdg)} className="rounded w-full h-auto" alt={`Sustainable Development Goal ${sdg}`} />
                        </Link>
                    ))}
                </div>
            </div>
        </Container>
    </>
);

export default SustainableDevelopmentGoals;
