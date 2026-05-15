'use client';

import { faHome } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Breadcrumbs as HeroBreadcrumbs, Skeleton } from '@heroui/react';
import { useQueryState } from 'nuqs';
import { FC } from 'react';
import useSWR from 'swr';

import Container from '@/components/Ui/Structure/Container';
import { RESOURCES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getResource, resourcesUrl } from '@/services/backend/resources';
import { getParentResearchFields, statementsUrl } from '@/services/backend/statements';
import { Resource } from '@/services/backend/types';
import { reverseWithSlug } from '@/utilsTyped';

type BreadcrumbsProps = {
    backgroundWhite?: boolean;
    researchFieldId: string | null;
    route?: string;
};

const Breadcrumbs: FC<BreadcrumbsProps> = ({ backgroundWhite = false, researchFieldId, route }) => {
    const { data } = useSWR(researchFieldId ? [researchFieldId, resourcesUrl, 'getResource'] : null, ([params]) => getResource(params));

    const [contentType] = useQueryState('contentType');

    const { data: _parentResearchFields, isLoading } = useSWR(
        researchFieldId ? [researchFieldId, statementsUrl, 'getParentResearchFields'] : null,
        ([params]) => getParentResearchFields(params).then((res) => res.reverse()),
    );

    let parentResearchFields = _parentResearchFields || [];

    if (parentResearchFields.length === 0 && data && researchFieldId) {
        parentResearchFields = [
            {
                id: RESOURCES.RESEARCH_FIELD_MAIN,
                label: 'Research Field',
                classes: [],
                shared: 0,
                featured: false,
                unlisted: false,
                verified: false,
                extraction_method: 'UNKNOWN',
                _class: 'resource',
                created_at: '',
                created_by: '',
                observatory_id: '',
                organization_id: '',
                formatted_label: '',
            },
            data,
        ];
    }

    const getItemHref = (field: Resource, index: number): string => {
        if (index === 0) {
            return `${reverse(ROUTES.HOME)}${contentType ? `?contentType=${contentType}` : ''}`;
        }
        return `${reverseWithSlug(route || ROUTES.RESEARCH_FIELD, { researchFieldId: field.id, slug: field.label })}${contentType ? `?contentType=${contentType}` : ''}`;
    };

    if (!researchFieldId) {
        return null;
    }

    const surfaceClass = backgroundWhite ? 'bg-surface' : 'bg-surface-tertiary';

    return (
        <nav aria-label="Breadcrumb">
            <Container>
                <div className={`rounded text-[95%] ${backgroundWhite ? 'p-0' : 'py-2 px-3'} ${surfaceClass}`}>
                    {isLoading ? (
                        <Skeleton className="w-full h-6 rounded" />
                    ) : (
                        <HeroBreadcrumbs className="gap-1 flex-wrap">
                            {parentResearchFields.map((field, index) => {
                                const href = getItemHref(field, index);

                                return (
                                    <HeroBreadcrumbs.Item
                                        key={field.id}
                                        href={href}
                                        // React Aria disables the current crumb’s link by default; keep it a normal link.
                                        isDisabled={false}
                                    >
                                        {index === 0 ? <FontAwesomeIcon className="mr-1" icon={faHome} aria-label="Home" /> : field.label}
                                    </HeroBreadcrumbs.Item>
                                );
                            })}
                        </HeroBreadcrumbs>
                    )}
                </div>
            </Container>
        </nav>
    );
};

export default Breadcrumbs;
