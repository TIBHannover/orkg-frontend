import Link from 'components/NextJsMigration/Link';
import { useState, useEffect, useCallback } from 'react';
import { getResourcesByClass } from 'services/backend/resources';
import { Table, Input, FormGroup, Label, Form } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { reverse } from 'named-urls';
import { debounce } from 'lodash';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';

const ClassInstances = ({ title = 'class', classId }) => {
    const pageSize = 25;
    const [isLoading, setIsLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [isLastPageReached, setIsLastPageReached] = useState(false);
    const [page, setPage] = useState(0);
    const [instances, setInstances] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [totalElements, setTotalElements] = useState(0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadInstances = useCallback(
        debounce((_page, _searchQuery) => {
            setIsLoading(true);

            getResourcesByClass({
                id: classId,
                page: _page,
                items: pageSize,
                q: _searchQuery,
            }).then(result => {
                // Resources
                setInstances(prevResources => [...prevResources, ...result.content]);
                setIsLoading(false);
                setPage(page + 1);
                setHasNextPage(!result.last);
                setTotalElements(result.totalElements);
                setIsLastPageReached(result.last);
            });
        }, 500),
        [classId],
    );

    // reset resources when the id has changed
    useEffect(() => {
        setInstances([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setPage(0);
    }, [classId]);

    useEffect(() => {
        loadInstances(0, searchQuery);
    }, [loadInstances, searchQuery]);

    const handleLoadMore = () => {
        if (!isLoading) {
            loadInstances(page, searchQuery);
        }
    };

    const loadingIndicator = (
        <div className="text-center mt-3 mb-4">
            <Icon icon={faSpinner} spin /> Loading
        </div>
    );

    useEffect(() => {
        setInstances([]);
        setHasNextPage(false);
        setIsLastPageReached(false);
        setIsLoading(true);
        loadInstances(0, searchQuery);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    return (
        <div className="py-2 px-4">
            <Form className="mt-3">
                <FormGroup>
                    <Label for="searchInputField">Search</Label>
                    <Input
                        id="searchInputField"
                        className="ms-2"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Enter a label"
                        bsSize="sm"
                    />
                </FormGroup>
            </Form>
            <p className="mt-2">Total number of instances: {!isLoading ? <b>{totalElements}</b> : 'Loading...'}</p>
            {instances.length > 0 && (
                <div className="mt-3">
                    <Table size="sm" bordered className="text-break">
                        <thead>
                            <tr>
                                <th className="col-4">Resource ID</th>
                                <th>Label</th>
                                <th className="col-2">Shared</th>
                            </tr>
                        </thead>
                        <tbody>
                            {instances.map(instance => (
                                <tr key={instance.id}>
                                    <td>
                                        <DescriptionTooltip id={instance.id} _class={instance._class} classes={instance.classes}>
                                            <Link href={`${reverse(ROUTES.RESOURCE, { id: instance.id })}?noRedirect`}>{instance.id}</Link>
                                        </DescriptionTooltip>
                                    </td>
                                    <td>
                                        <DescriptionTooltip id={instance.id} _class={instance._class} classes={instance.classes}>
                                            <Link href={`${reverse(ROUTES.RESOURCE, { id: instance.id })}?noRedirect`}>{instance.label}</Link>
                                        </DescriptionTooltip>
                                    </td>
                                    <td>{instance.shared}</td>
                                </tr>
                            ))}
                            {!isLoading && hasNextPage && (
                                <tr style={{ cursor: 'pointer' }} className="text-center" onClick={!isLoading ? handleLoadMore : undefined}>
                                    <td colSpan="3">{`View more ${title} instances`}</td>
                                </tr>
                            )}
                            {!hasNextPage && isLastPageReached && page !== 0 && (
                                <tr className="text-center mt-3">
                                    <td colSpan="3">You have reached the last page</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
            {isLoading && loadingIndicator}
            {totalElements === 0 && !isLoading && (
                <div className="text-center mb-2">
                    {searchQuery ? (
                        <>
                            No result found for the term: <i>{searchQuery}</i>.
                        </>
                    ) : (
                        `This ${title} has no instances yet`
                    )}
                </div>
            )}
        </div>
    );
};

ClassInstances.propTypes = {
    classId: PropTypes.string.isRequired,
    title: PropTypes.string,
};

export default ClassInstances;
