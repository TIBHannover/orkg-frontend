import { linkVariants } from '@heroui/styles';
import NextLink from 'next/link';
import { FC } from 'react';

import UserAvatar from '@/components/UserAvatar/UserAvatar';

export type TitleData = {
    creator: string | null;
    route: string;
    headerText: React.ReactNode;
    buttonText: string;
} | null;

type DiffTitleProps = {
    data: TitleData;
};

const DiffTitle: FC<DiffTitleProps> = ({ data }) => {
    if (!data) return null;
    const link = linkVariants();
    return (
        <div className="flex items-center justify-between gap-4 py-2 px-2">
            <span className="flex items-center gap-2 min-w-0">
                <span className="truncate">{data.headerText}</span>
                {data.creator && <UserAvatar userId={data.creator} />}
            </span>
            <NextLink href={data.route ?? ''} className={`${link.base()} shrink-0 text-sm`}>
                {data.buttonText}
            </NextLink>
        </div>
    );
};

export default DiffTitle;
