import Link from 'next/link';
import { FC } from 'react';
import { Button } from 'reactstrap';

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

const DiffTitle: FC<DiffTitleProps> = ({ data }) =>
    data ? (
        <div className="d-flex justify-content-between align-items-center">
            <span className="d-flex align-items-center">
                {data.headerText}
                {data.creator && (
                    <span className="ms-2">
                        <UserAvatar userId={data.creator} />
                    </span>
                )}
            </span>{' '}
            <Button color="light" size="sm" tag={Link} href={data.route ?? ''}>
                {data.buttonText}
            </Button>
        </div>
    ) : null;

export default DiffTitle;
