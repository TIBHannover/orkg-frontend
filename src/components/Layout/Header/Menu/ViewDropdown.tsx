'use client';

import { Chip, cn, Dropdown, Label, Separator } from '@heroui/react';

import ContentTypesMenu from '@/components/Layout/Header/Menu/ContentTypesMenu';
import { MenuChevron, MenuProps, navTriggerClass } from '@/components/Layout/Header/Menu/menuUtils';
import { ORGANIZATIONS_MISC, ORGANIZATIONS_TYPES } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const beta = (
    <Chip className="ml-2 shrink-0" size="sm" variant="soft">
        Beta
    </Chip>
);

const ViewDropdown = ({ isTransparentNavbar, fullWidthMobile }: MenuProps) => {
    const orgGeneralLabel = ORGANIZATIONS_TYPES.find((o) => o.id === ORGANIZATIONS_MISC.GENERAL)?.label;
    const orgEventLabel = ORGANIZATIONS_TYPES.find((o) => o.id === ORGANIZATIONS_MISC.EVENT)?.label;
    const organizationsHref = orgGeneralLabel ? reverse(ROUTES.ORGANIZATIONS, { id: orgGeneralLabel }) : ROUTES.HOME;
    const conferencesHref = orgEventLabel ? reverse(ROUTES.ORGANIZATIONS, { id: orgEventLabel }) : ROUTES.HOME;

    return (
        <Dropdown>
            <Dropdown.Trigger className={cn('inline-flex items-center outline-none', navTriggerClass(isTransparentNavbar, fullWidthMobile))}>
                View
                <MenuChevron transparent={isTransparentNavbar} />
            </Dropdown.Trigger>
            <Dropdown.Popover className="max-h-[min(70vh,520px)]">
                <Dropdown.Menu className="[&_a]:no-underline">
                    <Dropdown.Item textValue="Comparisons" href={ROUTES.COMPARISONS}>
                        <Label>Comparisons</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Papers" href={ROUTES.PAPERS}>
                        <Label>Papers</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Visualizations" href={ROUTES.VISUALIZATIONS}>
                        <Label>Visualizations</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Reviews" href={ROUTES.REVIEWS}>
                        <Label className="flex items-center justify-between gap-2">
                            <span>Reviews</span>
                            {beta}
                        </Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Lists" href={ROUTES.LISTS}>
                        <Label className="flex items-center justify-between gap-2">
                            <span>Lists</span>
                            {beta}
                        </Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Benchmarks" href={ROUTES.BENCHMARKS}>
                        <Label>Benchmarks</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Research fields" href={ROUTES.RESEARCH_FIELDS}>
                        <Label>Research fields</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Sustainable development goals" href={ROUTES.SUSTAINABLE_DEVELOPMENT_GOALS}>
                        <Label>
                            Sustainable <br />
                            development goals
                        </Label>
                    </Dropdown.Item>
                    <ContentTypesMenu />
                    <Separator className="my-1" />
                    <Dropdown.Item textValue="Observatories" href={ROUTES.OBSERVATORIES}>
                        <Label className="flex items-center justify-between gap-2">
                            <span>Observatories</span>
                            {beta}
                        </Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Organizations" href={organizationsHref}>
                        <Label>Organizations</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Conferences" href={conferencesHref}>
                        <Label>Conferences</Label>
                    </Dropdown.Item>
                    <Separator className="my-1" />
                    <Dropdown.Item id="view-advanced-h" isDisabled textValue="Advanced views" className="cursor-default opacity-100">
                        <Label className="text-muted text-xs font-semibold uppercase tracking-wide">Advanced views</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Resources" href={ROUTES.RESOURCES}>
                        <Label>Resources</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Properties" href={ROUTES.PROPERTIES}>
                        <Label>Properties</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Classes" href={ROUTES.CLASSES}>
                        <Label>Classes</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Statements" href={ROUTES.RS_STATEMENTS}>
                        <Label className="flex items-center justify-between gap-2">
                            <span>Statements</span>
                            {beta}
                        </Label>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
};

export default ViewDropdown;
