import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import usePaginate from 'components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from 'components/PaginatedContent/ListPaginatedContent';
import { MAX_LENGTH_INPUT } from 'constants/misc';
import ROUTES from 'constants/routes';
import { debounce } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { Form, FormGroup, Input, Label, Table } from 'reactstrap';
import { getResources, resourcesUrl } from 'services/backend/resources';
import { Resource } from 'services/backend/types';

type ClassInstancesProps = {
    title?: string;
    classId: string;
};

const ClassInstances = ({ title = 'class', classId }: ClassInstancesProps) => {
    const searchParams = useSearchParams();
    const [q, setQ] = useQueryState('q', { defaultValue: '' });

    const renderListItem = (item: Resource) => (
        <tr key={item.id}>
            <td className="col-4">
                <DescriptionTooltip id={item.id} _class={item._class} classes={item.classes}>
                    <Link href={`${reverse(ROUTES.RESOURCE, { id: item.id })}?noRedirect`}>{item.id}</Link>
                </DescriptionTooltip>
            </td>
            <td>
                <DescriptionTooltip id={item.id} _class={item._class} classes={item.classes}>
                    <Link href={`${reverse(ROUTES.RESOURCE, { id: item.id })}?noRedirect`}>{item.label}</Link>
                </DescriptionTooltip>
            </td>
            <td className="col-2">{item.shared}</td>
        </tr>
    );

    const prefixParams = 'instances';

    const {
        data: items,
        isLoading,
        totalElements,
        hasNextPage,
        page,
        pageSize,
        setPage,
        setPageSize,
        error,
        totalPages,
    } = usePaginate({
        fetchFunction: getResources,
        fetchFunctionName: 'getResources',
        fetchUrl: resourcesUrl,
        fetchExtraParams: { include: [classId], q },
        prefixParams,
    });

    const handleSearch = debounce((term) => {
        setQ(term);
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
            <p className="mt-2">Total number of instances: {!isLoading ? <b>{totalElements}</b> : 'Loading...'}</p>

            <div className="mt-3">
                <Table size="sm" bordered className="text-break">
                    <thead>
                        <tr>
                            <th className="col-4">Resource ID</th>
                            <th>Label</th>
                            <th className="col-2">Shared</th>
                        </tr>
                    </thead>
                </Table>
                <ListPaginatedContent<Resource>
                    renderListItem={renderListItem}
                    pageSize={pageSize}
                    label={title}
                    isLoading={isLoading}
                    items={items ?? []}
                    hasNextPage={hasNextPage}
                    page={page}
                    setPage={setPage}
                    setPageSize={setPageSize}
                    totalElements={totalElements}
                    error={error}
                    totalPages={totalPages}
                    boxShadow={false}
                    ListGroupComponent={Table}
                    flush={false}
                    listGroupProps={{ size: 'sm', bordered: true, className: 'text-break' }}
                    prefixParams={prefixParams}
                />
            </div>
        </div>
    );
};

export default ClassInstances;
