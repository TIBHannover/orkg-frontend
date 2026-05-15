import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown, Label } from '@heroui/react';
import { upperFirst } from 'lodash';
import pluralize from 'pluralize';

import { additionalContentTypes } from '@/components/ContentType/types';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const ContentTypesMenu = () => {
    return (
        <Dropdown.SubmenuTrigger>
            <Dropdown.Item id="content-types-more" textValue="More content types">
                <Label className="flex w-full items-center justify-between gap-2">
                    <span>More</span>
                    <FontAwesomeIcon className="text-muted size-3 shrink-0" icon={faChevronRight} />
                </Label>
            </Dropdown.Item>
            <Dropdown.Popover isNonModal>
                <Dropdown.Menu className="[&_a]:no-underline">
                    {additionalContentTypes.map(({ id, label }) => {
                        const text = upperFirst(pluralize(label || '', 0, false));
                        return (
                            <Dropdown.Item key={id} textValue={text} href={reverse(ROUTES.CONTENT_TYPES, { type: id })}>
                                <Label>{text}</Label>
                            </Dropdown.Item>
                        );
                    })}
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown.SubmenuTrigger>
    );
};

export default ContentTypesMenu;
