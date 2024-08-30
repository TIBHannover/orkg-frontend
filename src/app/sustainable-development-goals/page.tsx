'use client';

import Image from 'next/image';
import Link from 'next/link';
import { getImage } from 'components/SustainableDevelopmentGoals/helpers';
import TitleBar from 'components/TitleBar/TitleBar';
import { SUSTAINABLE_DEVELOPMENT_GOALS } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import { Container } from 'reactstrap';

const SustainableDevelopmentGoals = () => {
    useEffect(() => {
        document.title = 'Sustainable Development Goals - ORKG';
    }, []);

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
            <Container className="box rounded p-3">
                {Object.values(SUSTAINABLE_DEVELOPMENT_GOALS).map((sdg) => (
                    <Link href={reverse(ROUTES.SUSTAINABLE_DEVELOPMENT_GOAL, { sdg })} key={sdg}>
                        <Image
                            src={getImage(sdg)}
                            style={{ maxWidth: 167, width: '100%', height: 'auto' }}
                            className="rounded m-2"
                            alt={`Sustainable Development Goals ${sdg}`}
                        />
                    </Link>
                ))}
            </Container>
        </>
    );
};

export default SustainableDevelopmentGoals;
