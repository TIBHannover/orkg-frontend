'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

import NotFound from '@/app/not-found';
import { getImage } from '@/components/SustainableDevelopmentGoals/helpers';
import SgdTabsContainer from '@/components/SustainableDevelopmentGoals/SgdTabsContainer';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import useParams from '@/components/useParams/useParams';
import { SUSTAINABLE_DEVELOPMENT_GOALS } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const SustainableDevelopmentGoal = () => {
    const { sdg: selectedSdg } = useParams();

    useEffect(() => {
        document.title = 'Sustainable Development Goals - ORKG';
    }, []);

    if (!selectedSdg) {
        return <NotFound />;
    }

    return (
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
                <div className="box rounded p-2 sm:p-4 grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 lg:[grid-template-columns:repeat(17,minmax(0,1fr))] gap-1 sm:gap-2 justify-items-center">
                    {Object.values(SUSTAINABLE_DEVELOPMENT_GOALS).map((sdg) => (
                        <motion.div
                            animate={{
                                opacity: selectedSdg === sdg ? 1 : 0.5,
                                scale: selectedSdg === sdg ? 1.08 : 1,
                            }}
                            key={sdg}
                            className="rounded w-full"
                        >
                            <Link href={reverse(ROUTES.SUSTAINABLE_DEVELOPMENT_GOAL, { sdg })} aria-label={`Sustainable Development Goal ${sdg}`}>
                                <Image
                                    src={getImage(sdg)}
                                    style={{ width: '100%', height: 'auto' }}
                                    className="rounded"
                                    alt={`Sustainable Development Goals ${sdg}`}
                                />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </Container>
            <SgdTabsContainer key={selectedSdg.toString()} sdgId={selectedSdg.toString()} />
        </>
    );
};

export default SustainableDevelopmentGoal;
