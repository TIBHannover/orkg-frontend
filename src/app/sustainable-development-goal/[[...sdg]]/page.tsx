'use client';

import NotFound from 'app/not-found';
import Link from 'components/NextJsMigration/Link';
import useParams from 'components/NextJsMigration/useParams';
import IntegratedList from 'components/SustainableDevelopmentGoals/IntegratedList/IntegratedList';
import { getImage } from 'components/SustainableDevelopmentGoals/helpers';
import TitleBar from 'components/TitleBar/TitleBar';
import { SUSTAINABLE_DEVELOPMENT_GOALS } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { motion } from 'framer-motion';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import { Container } from 'reactstrap';

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
            <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                ORKG content can be assigned to{' '}
                <a href="https://sdgs.un.org/goals" target="_blank" rel="noreferrer">
                    Sustainable Development Goals
                </a>{' '}
                defined by the United Nations.
            </Container>
            <Container className="box rounded p-3 d-flex align-items-center justify-content-center">
                {Object.values(SUSTAINABLE_DEVELOPMENT_GOALS).map((sdg) => (
                    <motion.div
                        animate={{
                            opacity: selectedSdg === sdg ? 1 : 0.5,
                        }}
                        style={{ minWidth: 17, width: sdg === selectedSdg ? 167 : 80 }}
                        key={sdg}
                        className="rounded m-1"
                    >
                        {/* @ts-expect-error */}
                        <Link href={reverse(ROUTES.SUSTAINABLE_DEVELOPMENT_GOAL, { sdg })}>
                            <img src={getImage(sdg)} style={{ width: '100%' }} className="rounded m-1" alt={`Sustainable Development Goals ${sdg}`} />
                        </Link>
                    </motion.div>
                ))}
            </Container>
            <IntegratedList key={selectedSdg} sdgId={selectedSdg} />
        </>
    );
};

export default SustainableDevelopmentGoal;
