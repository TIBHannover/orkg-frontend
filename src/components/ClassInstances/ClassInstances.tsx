import { debounce } from 'lodash';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { Form, FormGroup, Input, Label, ListGroup } from 'reactstrap';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import usePaginate from '@/components/PaginatedContent/hooks/usePaginate';
import ListPaginatedContent from '@/components/PaginatedContent/ListPaginatedContent';
import { MAX_LENGTH_INPUT } from '@/constants/misc';
import ROUTES from '@/constants/routes';
import { getResources, resourcesUrl } from '@/services/backend/resources';
import { Resource } from '@/services/backend/types';

type ClassInstancesProps = {
    title?: string;
    classId: string;
};

const ClassInstances = ({ title = 'class', classId }: ClassInstancesProps) => {
    const searchParams = useSearchParams();
    const [q, setQ] = useQueryState('q', { defaultValue: '' });

    const [isFormattedLabelEnabled, setIsFormattedLabelEnabled] = useQueryState('isFormattedLabelEnabled', {
        defaultValue: true,
        parse: (value) => value === 'true',
    });

    const renderListItem = (item: Resource) => (
        <div key={item.id} className="tw:grid tw:grid-cols-12 tw:gap-4 tw:p-3 tw:border-b tw:border-gray-200 tw:items-center">
            <div className="tw:col-span-4 tw:break-all">
                <DescriptionTooltip id={item.id} _class={item._class} classes={item.classes}>
                    <Link href={`${reverse(ROUTES.RESOURCE, { id: item.id })}?noRedirect`}>{item.id}</Link>
                </DescriptionTooltip>
            </div>
            <div className="tw:col-span-6">
                <DescriptionTooltip id={item.id} _class={item._class} classes={item.classes}>
                    <Link href={`${reverse(ROUTES.RESOURCE, { id: item.id })}?noRedirect`}>
                        {isFormattedLabelEnabled && item.formatted_label ? item.formatted_label : item.label}
                    </Link>
                </DescriptionTooltip>
            </div>
            <div className="tw:col-span-2">{item.shared}</div>
        </div>
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
        fetchExtraParams: { include: [classId], q, returnFormattedLabels: true },
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
                <FormGroup check>
                    <Label>
                        <Input type="checkbox" checked={isFormattedLabelEnabled} onChange={(e) => setIsFormattedLabelEnabled(e.target.checked)} />{' '}
                        Show formatted label when available
                    </Label>
                </FormGroup>
            </Form>
            <p className="mt-2">Total number of instances: {!isLoading ? <b>{totalElements}</b> : 'Loading...'}</p>

            <div className="mt-3">
                <div className="tw:border tw:border-gray-200 tw:rounded">
                    <div className="tw:grid tw:grid-cols-12 tw:gap-4 tw:p-3 tw:bg-gray-50 tw:border-b tw:border-gray-200">
                        <div className="tw:col-span-4 tw:font-medium">Resource ID</div>
                        <div className="tw:col-span-6 tw:font-medium">Label</div>
                        <div className="tw:col-span-2 tw:font-medium">Shared</div>
                    </div>
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
                        ListGroupComponent={ListGroup}
                        flush={false}
                        listGroupProps={{ className: 'tw:border-0' }}
                        prefixParams={prefixParams}
                    />
                </div>
            </div>
        </div>
    );
};

export default ClassInstances;
