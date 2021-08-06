import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ListPage from 'components/ListPage/ListPage';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { CLASSES } from 'constants/graphSettings';
import PaperCard from 'components/PaperCard/PaperCard';
import { getPaperData } from 'utils';
import ROUTES from 'constants/routes';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown } from 'reactstrap';
import { getResourcesByClass } from 'services/backend/resources';
import { getStatementsBySubjects } from 'services/backend/statements';

const Papers = () => {
    const [verified, setVerified] = useState(null);
    const [reset, setReset] = useState(false);
    const [statements, setStatements] = useState([]);
    const user = useSelector(state => state.auth.user);

    const renderListItem = paper => {
        const paperCardData = statements.find(({ id }) => id === paper.id);
        return (
            <PaperCard
                paper={{
                    title: paper.label,
                    ...paper,
                    ...(!paperCardData ? { isLoading: true } : getPaperData(paper, paperCardData?.statements))
                }}
                key={paper.id}
            />
        );
    };

    const fetchItems = async ({ page, pageSize }) => {
        const { content: items, last, totalElements } = await getResourcesByClass({
            id: CLASSES.PAPER,
            page,
            items: pageSize,
            sortBy: 'created_at',
            desc: true,
            verified
        });

        // promise to prevent blocking loading of the additional paper data
        if (items.length > 0) {
            getStatementsBySubjects({ ids: items.map(p => p.id) }).then(_statements =>
                setStatements(prevStatements => [...prevStatements, ..._statements])
            );
        }

        return {
            items,
            last,
            totalElements
        };
    };

    const changeFilter = filter => {
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
                to={ROUTES.ADD_PAPER.GENERAL_DATA}
            >
                <Icon icon={faPlus} /> Create paper
            </RequireAuthentication>
        </>
    );

    return (
        <ListPage
            label="papers"
            resourceClass={CLASSES.PAPER}
            renderListItem={renderListItem}
            fetchItems={fetchItems}
            buttons={buttons}
            disableSearch={verified !== null}
            reset={reset}
            setReset={setReset}
        />
    );
};

export default Papers;
