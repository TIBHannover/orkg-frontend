'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { FC, useEffect } from 'react';

import PaperCard from '@/components/Cards/PaperCard/PaperCard';
import useAuthentication from '@/components/hooks/useAuthentication';
import ListPage from '@/components/PaginatedContent/ListPage';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import UncontrolledButtonDropdown from '@/components/Ui/Button/UncontrolledButtonDropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
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
                <UncontrolledButtonDropdown size="sm" style={{ marginRight: 2 }}>
                    <DropdownToggle caret color="secondary">
                        {verified === true && 'Verified'}
                        {verified === false && 'Unverified'}
                        {verified === null && 'All'}
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={() => setVerified(null, { scroll: false, history: 'push' })}>All</DropdownItem>
                        <DropdownItem onClick={() => setVerified(true, { scroll: false, history: 'push' })}>Verified</DropdownItem>
                        <DropdownItem onClick={() => setVerified(false, { scroll: false, history: 'push' })}>Unverified</DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            )}
            <RequireAuthentication
                component={Link}
                color="secondary"
                size="sm"
                className="btn btn-secondary btn-sm flex-shrink-0"
                href={ROUTES.CREATE_PAPER}
            >
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
