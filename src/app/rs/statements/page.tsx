'use client';

import { useEffect } from 'react';

import ListPage from '@/components/PaginatedContent/ListPage';
import SingleStatement from '@/components/RosettaStone/SingleStatement/SingleStatement';
import { CLASSES } from '@/constants/graphSettings';
import { getRSStatements, rosettaStoneUrl } from '@/services/backend/rosettaStone';
import { RosettaStoneStatement } from '@/services/backend/types';

const StatementsPage = () => {
    useEffect(() => {
        document.title = 'Statements list - ORKG';
    });

    const renderListItem = (s: RosettaStoneStatement) => <SingleStatement showContext key={s.id} statement={s} />;

    const infoContainerText = (
        <>
            Statements are a new method to describe knowledge in the ORKG, they are currently in beta.{' '}
            <a href="https://orkg.org/help-center/article/59/Statements" rel="noreferrer" target="_blank">
                Visit the help center
            </a>
            .
        </>
    );

    return (
        <ListPage
            label="statements"
            resourceClass={CLASSES.ROSETTA_STONE_STATEMENT}
            fetchFunction={getRSStatements}
            fetchUrl={rosettaStoneUrl}
            fetchFunctionName="getRSStatements"
            fetchExtraParams={{}}
            renderListItem={renderListItem}
            infoContainerText={infoContainerText}
        />
    );
};

export default StatementsPage;
