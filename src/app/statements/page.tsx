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

    return (
        <ListPage
            label="statements"
            fetchFunction={getRSStatements}
            fetchUrl={rosettaStoneUrl}
            fetchFunctionName="getRSStatements"
            fetchExtraParams={{}}
            renderListItem={renderListItem}
            disableSearch
        />
    );
};

export default StatementsPage;
