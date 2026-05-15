'use client';

import { cn, Dropdown, Label, Separator } from '@heroui/react';

import { MenuChevron, MenuProps, navTriggerClass } from '@/components/Layout/Header/Menu/menuUtils';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import ROUTES from '@/constants/routes';

const ToolsDropdown = ({ isTransparentNavbar, fullWidthMobile }: MenuProps) => {
    return (
        <Dropdown>
            <Dropdown.Trigger className={cn('inline-flex items-center outline-none', navTriggerClass(isTransparentNavbar, fullWidthMobile))}>
                Tools
                <MenuChevron transparent={isTransparentNavbar} />
            </Dropdown.Trigger>
            <Dropdown.Popover>
                <Dropdown.Menu className="[&_a]:no-underline">
                    <Dropdown.Item textValue="Tools overview" href={ROUTES.TOOLS}>
                        <Label>Tools overview</Label>
                    </Dropdown.Item>
                    <Separator className="my-1" />
                    <Dropdown.Item id="tools-data-entry-h" isDisabled textValue="Data entry" className="cursor-default opacity-100">
                        <Label className="text-muted text-xs font-semibold uppercase tracking-wide">Data entry</Label>
                    </Dropdown.Item>
                    <RequireAuthentication component={Dropdown.Item} textValue="Grid editor" href={ROUTES.GRID_EDITOR}>
                        <Label>Grid editor</Label>
                    </RequireAuthentication>
                    <RequireAuthentication component={Dropdown.Item} textValue="CSV import" href={ROUTES.CSV_IMPORT}>
                        <Label>CSV import</Label>
                    </RequireAuthentication>
                    <RequireAuthentication component={Dropdown.Item} textValue="PDF annotator" href={ROUTES.PDF_ANNOTATION}>
                        <Label>PDF annotator</Label>
                    </RequireAuthentication>
                    <Dropdown.Item textValue="Templates" href={ROUTES.TEMPLATES}>
                        <Label>Templates</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Statement templates" href={ROUTES.RS_TEMPLATES}>
                        <Label>Statement templates</Label>
                    </Dropdown.Item>
                    <Separator className="my-1" />
                    <Dropdown.Item id="tools-data-export-h" isDisabled textValue="Data export" className="cursor-default opacity-100">
                        <Label className="text-muted text-xs font-semibold uppercase tracking-wide">Data export</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Data access" href={ROUTES.DATA}>
                        <Label>Data access</Label>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
};

export default ToolsDropdown;
