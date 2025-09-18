import { reverse } from 'named-urls';
import Link from 'next/link';
import { components, SingleValueProps } from 'react-select';

import { StyledGravatar } from '@/components/UserAvatar/UserAvatar';
import ROUTES from '@/constants/routes';
import { Contributor } from '@/services/backend/types';

const SingleValue = ({ children, ...props }: SingleValueProps<Contributor>) => {
    const { data } = props;

    return (
        <components.SingleValue {...props}>
            <div>
                <Link className="d-flex align-items-center" href={reverse(ROUTES.USER_PROFILE, { userId: data.id })}>
                    <StyledGravatar className="rounded-circle me-2" hashedEmail={data.gravatar_id ?? 'example@example.com'} size={20} />
                    <div>{data.display_name}</div>
                </Link>
            </div>
        </components.SingleValue>
    );
};

export default SingleValue;
