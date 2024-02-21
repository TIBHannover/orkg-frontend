'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PaperCard from 'components/Cards/PaperCard/PaperCard';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import ListPage from 'components/ListPage/ListPage';
import Link from 'components/NextJsMigration/Link';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from 'constants/graphSettings';
import ROUTES from 'constants/routes';
import { FC, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import { getPapers } from 'services/backend/papers';
import { Paper } from 'services/backend/types';
import { RootStore } from 'slices/types';

const Papers: FC = () => {
    const [verified, setVerified] = useState<boolean | null>(null);
    const [reset, setReset] = useState(false);
    const user = useSelector((state: RootStore) => state.auth.user);

    useEffect(() => {
        document.title = 'Papers list - ORKG';
    });

    const renderListItem = (paper: Paper) => <PaperCard paper={paper} key={paper.id} />;

    const fetchItems = async ({ page, pageSize }: { page: number; pageSize: number }) => {
        const {
            content: items,
            last,
            totalElements,
        } = await getPapers({
            page,
            size: pageSize,
            sortBy: [{ property: 'created_at', direction: 'desc' }],
            verified,
        });

        return {
            items,
            last,
            totalElements,
        };
    };

    const changeFilter = (filter: boolean | null) => {
        setVerified(filter);
        setReset(true);
    };

    const buttons = (
        <>
            {!!user && user.isCurationAllowed && (
                <UncontrolledButtonDropdown size="sm" style={{ marginRight: 2 }}>
                    <DropdownToggle caret color="secondary">
                        {verified === true && 'Verified'}
                        {verified === false && 'Unverified'}
                        {verified === null && 'All'}
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem onClick={() => changeFilter(null)}>All</DropdownItem>
                        <DropdownItem onClick={() => changeFilter(true)}>Verified</DropdownItem>
                        <DropdownItem onClick={() => changeFilter(false)}>Unverified</DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            )}
            <RequireAuthentication
                component={Link}
                color="secondary"
                size="sm"
                className="btn btn-secondary btn-sm flex-shrink-0"
                href={ROUTES.ADD_PAPER}
            >
                <Icon icon={faPlus} /> Create paper
            </RequireAuthentication>
        </>
    );

    const infoContainerText = (
        <>
            ORKG papers describe scholarly articles in a structured and semantic manner.{' '}
            <a href="https://orkg.org/about/20/Papers" rel="noreferrer" target="_blank">
                Learn more in the help center
            </a>
            .
        </>
    );

    return (
        <>
            <ListPage
                label="papers"
                resourceClass={CLASSES.PAPER}
                renderListItem={renderListItem}
                fetchItems={fetchItems}
                /* @ts-expect-error */
                buttons={buttons}
                disableSearch={verified !== null}
                reset={reset}
                /* @ts-expect-error */
                setReset={setReset}
                /* @ts-expect-error */
                infoContainerText={infoContainerText}
            />

            <ComparisonPopup />
        </>
    );
};

export default Papers;
