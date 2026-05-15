import Link from 'next/link';
import { components, SingleValueProps } from 'react-select';

import Gravatar from '@/components/Gravatar/Gravatar';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Contributor } from '@/services/backend/types';

const SingleValue = ({ children, ...props }: SingleValueProps<Contributor>) => {
    const { data } = props;

    return (
        <components.SingleValue {...props}>
            <div>
                <Link className="flex items-center" href={reverse(ROUTES.USER_PROFILE, { userId: data.id })}>
                    <Gravatar
                        className="mr-2 cursor-pointer rounded-full border-2 border-default hover:border-primary"
                        hashedEmail={data.gravatarId ?? 'example@example.com'}
                        size={20}
                    />
                    <div>{data.displayName}</div>
                </Link>
            </div>
        </components.SingleValue>
    );
};

export default SingleValue;
