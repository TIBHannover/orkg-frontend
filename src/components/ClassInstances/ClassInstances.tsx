import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import Link from 'components/NextJsMigration/Link';
import useRouter from 'components/NextJsMigration/useRouter';
import useSearchParams from 'components/NextJsMigration/useSearchParams';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import { debounce } from 'lodash';
import { reverse } from 'named-urls';
import { Form, FormGroup, Input, Label, Table } from 'reactstrap';
import { getResources, getResourcesParams, resourcesUrl } from 'services/backend/resources';
import { PaginatedResponse, Resource } from 'services/backend/types';
import useSWRInfinite from 'swr/infinite';

type ClassInstancesProps = {
    title?: string;
    classId: string;
};

const ClassInstances = ({ title = 'class', classId }: ClassInstancesProps) => {
    const pageSize = 25;
    const searchParams = useSearchParams();
    const router = useRouter();

    const getKey = (pageIndex: number): getResourcesParams => ({
        include: [classId],
        page: pageIndex,
        size: pageSize,
        q: searchParams.get('q'),
    });

    const { data, isLoading, isValidating, size, setSize } = useSWRInfinite(
        (pageIndex) => [getKey(pageIndex), resourcesUrl, 'getResources'],
        ([params]) => getResources(params),
    );

    const totalElements = data?.[0] && 'totalElements' in data?.[0] ? data?.[0]?.totalElements : undefined;
    const isEmpty = totalElements === 0;
    const isLastPageReached = isEmpty || (data && (data[data.length - 1] as PaginatedResponse<Resource>))?.last;
    const hasNextPage = !isLastPageReached;
    const isLoadingInstances = isLoading || isValidating;
    const handleLoadMore = () => setSize(size + 1);

    const loadingIndicator = (
        <div className="text-center mt-3 mb-4">
            <Icon icon={faSpinner} spin /> Loading
        </div>
    );

    const handleSearch = debounce((term) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set('q', term);
        } else {
            params.delete('q');
        }
        router.push(`?${params.toString()}`);
    }, 500);

    return (
        <div className="py-2 px-4">
            <Form className="mt-3">
                <FormGroup>
                    <Label for="searchInputField">Search</Label>
                    <Input
                        id="searchInputField"
                        type="text"
                        className="ms-2"
                        placeholder="Enter a label"
                        bsSize="sm"
                        maxLength={MAX_LENGTH_INPUT}
                        onChange={(e) => handleSearch(e.target.value)}
                        defaultValue={searchParams.get('q')?.toString()}
                    />
                </FormGroup>
            </Form>
            <p className="mt-2">Total number of instances: {!isLoadingInstances ? <b>{totalElements}</b> : 'Loading...'}</p>
            {data && data?.length > 0 && totalElements !== 0 && (
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
                            {(data as PaginatedResponse<Resource>[])?.map((_instances) =>
                                _instances.content.map((instance) => (
                                    <tr key={instance.id}>
                                        <td>
                                            <DescriptionTooltip id={instance.id} _class={instance._class} classes={instance.classes}>
                                                {/* @ts-expect-error */}
                                                <Link href={`${reverse(ROUTES.RESOURCE, { id: instance.id })}?noRedirect`}>{instance.id}</Link>
                                            </DescriptionTooltip>
                                        </td>
                                        <td>
                                            <DescriptionTooltip id={instance.id} _class={instance._class} classes={instance.classes}>
                                                {/* @ts-expect-error */}
                                                <Link href={`${reverse(ROUTES.RESOURCE, { id: instance.id })}?noRedirect`}>{instance.label}</Link>
                                            </DescriptionTooltip>
                                        </td>
                                        <td>{instance.shared}</td>
                                    </tr>
                                )),
                            )}
                            {!isLoadingInstances && hasNextPage && (
                                <tr style={{ cursor: 'pointer' }} className="text-center" onClick={!isLoadingInstances ? handleLoadMore : undefined}>
                                    <td colSpan={3}>{`View more ${title} instances`}</td>
                                </tr>
                            )}
                            {!hasNextPage && isLastPageReached && size !== 1 && (
                                <tr className="text-center mt-3">
                                    <td colSpan={3}>You have reached the last page</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
            {isLoadingInstances && loadingIndicator}
            {totalElements === 0 && !isLoadingInstances && (
                <div className="text-center mb-2">
                    {searchParams.get('q') ? (
                        <>
                            No result found for the term: <i>{searchParams.get('q')}</i>.
                        </>
                    ) : (
                        `This ${title} has no instances yet`
                    )}
                </div>
            )}
        </div>
    );
};

export default ClassInstances;
