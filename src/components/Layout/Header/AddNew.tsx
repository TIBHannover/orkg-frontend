'use client';

import { faEllipsisH, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, cn, Popover } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';

import AddPaperWizard from '@/assets/img/tools/add-paper-wizard.png';
import ContributionEditor from '@/assets/img/tools/contribution-editor.png';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const toolLinkClass = cn(
    'flex gap-3 border-b border-default p-3 text-inherit no-underline transition-colors',
    'last:border-b-0',
    'hover:bg-default/40 hover:text-inherit',
);

type AddNewProps = {
    isHomePageStyle: boolean;
    onAdd: (() => void) | null;
};

const AddNew: FC<AddNewProps> = ({ isHomePageStyle, onAdd = null }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClickMenuItem = () => {
        setIsOpen(false);
        onAdd?.();
    };

    return (
        <div className="shrink-0" id="tour-add-paper">
            <Popover isOpen={isOpen} onOpenChange={setIsOpen}>
                <Button variant={!isHomePageStyle ? 'primary' : 'tertiary'} className="w-full px-4 md:w-auto">
                    <FontAwesomeIcon className="mr-1" icon={faPlus} />
                    <span className="inline lg:inline">Add new</span>
                </Button>
                <Popover.Content placement="bottom" className="w-[470px] max-w-[calc(100vw-2rem)] overflow-hidden p-0">
                    <Popover.Dialog className="p-0">
                        <Link onClick={handleClickMenuItem} href={ROUTES.CREATE_COMPARISON} className={toolLinkClass}>
                            <div className="flex flex-1 items-center justify-center">
                                <Image src={ContributionEditor} className="h-auto w-[90%]" alt="Contribution editor preview" />
                            </div>
                            <div className="flex flex-[2] flex-col justify-center px-2 text-left text-foreground">
                                <h3 className="text-lg">Comparison</h3>
                                <p className="m-0 text-sm">
                                    Create an overview of state-of-the-art literature for a particular topic by adding multiple contributions
                                    simultaneously.
                                </p>
                            </div>
                        </Link>
                        <RequireAuthentication onClick={handleClickMenuItem} component={Link} href={ROUTES.CREATE_PAPER} className={toolLinkClass}>
                            <div className="flex flex-1 items-center justify-center">
                                <Image src={AddPaperWizard} className="h-auto w-[90%]" alt="Add paper wizard preview" />
                            </div>
                            <div className="flex flex-[2] flex-col justify-center px-2 text-left text-foreground">
                                <h3 className="text-lg">Paper</h3>
                                <p className="m-0 text-sm">
                                    The add paper form guides you to the process of generating structured data for your paper.
                                </p>
                            </div>
                        </RequireAuthentication>
                        <Link onClick={handleClickMenuItem} href={reverse(ROUTES.CONTENT_TYPE_NEW)} className={toolLinkClass}>
                            <div className="flex flex-1 items-center justify-center">
                                <FontAwesomeIcon className="text-secondary text-4xl" icon={faEllipsisH} />
                            </div>
                            <div className="flex flex-[2] flex-col justify-center px-2 text-left text-foreground">
                                <h3 className="text-lg">More...</h3>
                                <p className="m-0 text-sm">Add more content types, such as reviews, lists, datasets, or software.</p>
                            </div>
                        </Link>
                    </Popover.Dialog>
                </Popover.Content>
            </Popover>
        </div>
    );
};

export default AddNew;
