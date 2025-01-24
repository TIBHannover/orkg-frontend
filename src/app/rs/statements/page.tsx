'use client';

import ListPage from 'components/PaginatedContent/ListPage';
import SingleStatement from 'components/RosettaStone/SingleStatement/SingleStatement';
import { useEffect } from 'react';
import { getRSStatements, rosettaStoneUrl } from 'services/backend/rosettaStone';
import { RosettaStoneStatement } from 'services/backend/types';

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
            fetchFunction={getRSStatements}
            fetchUrl={rosettaStoneUrl}
            fetchFunctionName="getRSStatements"
            fetchExtraParams={{}}
            renderListItem={renderListItem}
            disableSearch
            infoContainerText={infoContainerText}
        />
    );
};

export default StatementsPage;
