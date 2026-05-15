'use client';

import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn, Dropdown, Label, Separator } from '@heroui/react';

import AboutMenu from '@/components/Layout/Header/Menu/AboutMenu';
import { MenuChevron, MenuProps, navTriggerClass } from '@/components/Layout/Header/Menu/menuUtils';
import ROUTES from '@/constants/routes';

const AboutDropdown = ({ isTransparentNavbar, fullWidthMobile }: MenuProps) => {
    return (
        <Dropdown>
            <Dropdown.Trigger className={cn('inline-flex items-center outline-none', navTriggerClass(isTransparentNavbar, fullWidthMobile))}>
                About
                <MenuChevron transparent={isTransparentNavbar} />
            </Dropdown.Trigger>
            <Dropdown.Popover className="max-h-[min(70vh,520px)]">
                <Dropdown.Menu className="[&_a]:no-underline">
                    <AboutMenu />
                    <Separator className="my-1" />
                    <Dropdown.Item textValue="Help center" href={ROUTES.HELP_CENTER}>
                        <Label>Help center</Label>
                    </Dropdown.Item>
                    <Dropdown.Item textValue="Academy" href="https://academy.orkg.org" target="_blank" rel="noopener noreferrer">
                        <Label>Academy</Label>
                    </Dropdown.Item>
                    <Dropdown.Item
                        textValue="GitLab"
                        href="https://gitlab.com/TIBHannover/orkg/orkg-frontend/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Label className="flex items-center gap-2">
                            GitLab
                            <FontAwesomeIcon className="size-3 opacity-70" icon={faExternalLinkAlt} />
                        </Label>
                    </Dropdown.Item>
                    <Separator className="my-1" />
                    <Dropdown.Item textValue="Statistics" href={ROUTES.STATS}>
                        <Label>Statistics</Label>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown>
    );
};

export default AboutDropdown;
