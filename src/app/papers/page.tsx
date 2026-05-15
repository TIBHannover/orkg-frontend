'use client';

import { faChevronDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown } from '@heroui/react';
import { useQueryState } from 'nuqs';
import { FC, useEffect } from 'react';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import useAuthentication from '@/components/hooks/useAuthentication';
import ListPage from '@/components/PaginatedContent/ListPage';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import VisibilityFilter from '@/components/VisibilityFilter/VisibilityFilter';
import { VISIBILITY_FILTERS } from '@/constants/contentTypes';
import { CLASSES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getPapers, papersUrl } from '@/services/backend/papers';
import { Paper, VisibilityOptions } from '@/services/backend/types';

const Papers: FC = () => {
    const [verified, setVerified] = useQueryState<boolean | null>('verified', {
        defaultValue: null,
        // eslint-disable-next-line no-nested-ternary
        parse: (value) => (value === 'true' ? true : value === 'false' ? false : null),
    });

    const [visibility] = useQueryState<VisibilityOptions>('visibility', {
        defaultValue: VISIBILITY_FILTERS.ALL_LISTED,
        parse: (value) => value as VisibilityOptions,
    });

    useEffect(() => {
        document.title = 'Papers list - ORKG';
    }, []);

    const { user } = useAuthentication();

    const renderListItem = (paper: Paper) => <PaperCard paper={paper} key={paper.id} />;

    const buttons = (
        <>
            <VisibilityFilter />
            {!!user && user.isCurationAllowed && (
                <Dropdown>
                    <Button size="sm" className="button--orkg-secondary">
                        {verified === true && 'Verified'}
                        {verified === false && 'Unverified'}
                        {verified === null && 'All'}
                        <FontAwesomeIcon icon={faChevronDown} className="text-[0.6rem]" />
                    </Button>
                    <Dropdown.Popover>
                        <Dropdown.Menu
                            selectionMode="single"
                            selectedKeys={new Set([String(verified)])}
                            onAction={(key) => {
                                const value = key === 'null' ? null : key === 'true';
                                setVerified(value, { scroll: false, history: 'push' });
                            }}
                        >
                            <Dropdown.Item id="null" textValue="All">
                                All
                            </Dropdown.Item>
                            <Dropdown.Item id="true" textValue="Verified">
                                Verified
                            </Dropdown.Item>
                            <Dropdown.Item id="false" textValue="Unverified">
                                Unverified
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown>
            )}
            <RequireAuthentication component={Button} size="sm" className="button--orkg-secondary" href={ROUTES.CREATE_PAPER}>
                <FontAwesomeIcon icon={faPlus} /> Create paper
            </RequireAuthentication>
        </>
    );

    const infoContainerText = (
        <>
            ORKG papers describe scholarly articles in a structured and semantic manner.{' '}
            <a href="https://orkg.org/about/20/Papers" rel="noreferrer" target="_blank">
                Visit the help center
            </a>{' '}
            or{' '}
            <a href="https://academy.orkg.org/orkg-academy/main/courses/paper-course.html" rel="noreferrer" target="_blank">
                learn more in the academy
            </a>
            .
        </>
    );

    return (
        <ListPage
            label="papers"
            fetchFunction={getPapers}
            fetchFunctionName="getPapers"
            fetchUrl={papersUrl}
            fetchExtraParams={{ verified, visibility }}
            renderListItem={renderListItem}
            resourceClass={CLASSES.PAPER}
            buttons={buttons}
            disableSearch={verified !== null}
            infoContainerText={infoContainerText}
        />
    );
};

export default Papers;
