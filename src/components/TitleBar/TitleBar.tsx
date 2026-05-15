'use client';

import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, cn } from '@heroui/react';
import { FC, ReactNode, useState } from 'react';

import Container from '@/components/Ui/Structure/Container';

type TitleBarProps = {
    buttonGroup?: ReactNode | string;
    titleAddition?: ReactNode | string;
    children?: ReactNode | string;
    titleSize?: string;
    wrap?: boolean;
};

const TitleBar: FC<TitleBarProps> = ({ buttonGroup = null, titleAddition = null, children = '', wrap = true, titleSize = 'h4' }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <Container className={cn('flex mt-6 mb-6 items-center', wrap && 'flex-wrap', 'max-sm:mt-4 max-sm:flex-wrap')}>
            <h1 className={cn('max-w-[70%] truncate m-0 mr-4', titleSize, !wrap && 'shrink-0')}>{children}</h1>
            {titleAddition && <div className="bg-secondary w-0.5 h-6 my-0.5 mr-4 max-sm:hidden" />}
            {titleAddition}

            {/* Mobile menu toggle */}
            {buttonGroup && (
                <Button
                    aria-label="Open action menu"
                    size="sm"
                    variant={isMenuOpen ? 'primary' : 'secondary'}
                    isIconOnly
                    className="ml-auto hidden max-sm:inline-flex"
                    onPress={() => setIsMenuOpen((v) => !v)}
                >
                    <FontAwesomeIcon icon={faEllipsisV} />
                </Button>
            )}

            {/* Action bar — connected buttons via CSS (.action-bar in globals.css) */}
            {buttonGroup && (
                <div
                    className={cn(
                        'action-bar inline-flex shrink-0 ml-auto',
                        'max-sm:hidden max-sm:w-full max-sm:mt-1',
                        isMenuOpen && 'max-sm:!inline-flex',
                    )}
                >
                    {buttonGroup}
                </div>
            )}
        </Container>
    );
};

export default TitleBar;
