'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { useEffect } from 'react';

import ListPage from '@/components/PaginatedContent/ListPage';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import ShortRecord from '@/components/ShortRecord/ShortRecord';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { classesUrl, getClasses } from '@/services/backend/classes';
import { Class } from '@/services/backend/types';

const Classes = () => {
    useEffect(() => {
        document.title = 'Classes list - ORKG';
    });

    const renderListItem = (classItem: Class) => (
        <ShortRecord key={classItem.id} header={classItem.label} href={reverse(ROUTES.CLASS, { id: classItem.id })}>
            {classItem.id}
        </ShortRecord>
    );

    const buttons = (
        <RequireAuthentication component={Button} size="sm" className="button--orkg-secondary" href={ROUTES.CREATE_CLASS}>
            <FontAwesomeIcon icon={faPlus} /> Create class
        </RequireAuthentication>
    );

    return (
        <ListPage
            label="classes"
            resourceClass="Class"
            renderListItem={renderListItem}
            fetchFunction={getClasses}
            fetchFunctionName="getClasses"
            fetchUrl={classesUrl}
            fetchExtraParams={{}}
            buttons={buttons}
        />
    );
};

export default Classes;
