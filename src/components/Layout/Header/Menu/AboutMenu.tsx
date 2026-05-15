import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, Label, Skeleton } from '@heroui/react';
import { get, groupBy } from 'lodash';
import useSWR from 'swr';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getAboutPageCategories, getAboutPages } from '@/services/cms';
import { HelpArticle } from '@/services/cms/types';
import { reverseWithSlug } from '@/utilsTyped';

export type Items = {
    [groupId: string | number]: HelpArticle[];
};

const AboutMenu = () => {
    const { data: items, isLoading: isLoadingPages } = useSWR('aboutPages', async () => {
        const pages = await getAboutPages();
        return groupBy(pages?.data, (item) => get(item, 'attributes.category.data.id', 'main')) ?? {};
    });

    const { data: categories = [], isLoading: isLoadingCategories } = useSWR('aboutPageCategories', async () => {
        const result = await getAboutPageCategories();
        return result?.data ?? [];
    });

    if (isLoadingPages || isLoadingCategories) {
        return (
            <Dropdown.Item id="about-loading" isDisabled textValue="Loading">
                <div className="flex w-full flex-col gap-2">
                    <Skeleton className="h-5 w-full rounded" />
                    <Skeleton className="h-5 w-full rounded" />
                </div>
            </Dropdown.Item>
        );
    }

    return (
        <>
            {categories.map((category) => {
                if (category.attributes.label === 'main') {
                    return (items?.main ?? []).map(({ id, attributes: { title } }) => {
                        const href = reverseWithSlug(ROUTES.ABOUT, { id: id.toString(), slug: title });
                        return (
                            <Dropdown.Item key={id} textValue={title} href={href}>
                                <Label>{title}</Label>
                            </Dropdown.Item>
                        );
                    });
                }
                const subItems = items?.[category.id];
                if (!subItems) {
                    return null;
                }
                if (subItems.length === 0) {
                    return (
                        <Dropdown.Item
                            key={category.attributes.label}
                            textValue={category.attributes.label}
                            href={reverse(ROUTES.ABOUT_NO_SLUG_ID, {})}
                        >
                            <Label>{category.attributes.label}</Label>
                        </Dropdown.Item>
                    );
                }
                return (
                    <Dropdown.SubmenuTrigger key={category.attributes.label}>
                        <Dropdown.Item id={`about-cat-${category.id}`} textValue={category.attributes.label}>
                            <Label className="flex w-full items-center justify-between gap-2">
                                <span>{category.attributes.label}</span>
                                <FontAwesomeIcon className="text-muted size-3 shrink-0" icon={faChevronRight} />
                            </Label>
                        </Dropdown.Item>
                        <Dropdown.Popover>
                            <Dropdown.Menu className="[&_a]:no-underline">
                                {subItems.map(({ id, attributes: { title } }) => {
                                    const href = reverseWithSlug(ROUTES.ABOUT, { id: id.toString(), slug: title });
                                    return (
                                        <Dropdown.Item key={id} textValue={title} href={href}>
                                            <Label>{title}</Label>
                                        </Dropdown.Item>
                                    );
                                })}
                            </Dropdown.Menu>
                        </Dropdown.Popover>
                    </Dropdown.SubmenuTrigger>
                );
            })}
        </>
    );
};

export default AboutMenu;
