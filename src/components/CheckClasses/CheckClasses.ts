import { redirect } from 'next/navigation';
import { FC } from 'react';

import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type ClassRedirectProps = {
    classes?: string[];
    targetClass: string;
    resourceId: string;
};

const ClassRedirect: FC<ClassRedirectProps> = ({ classes = [], targetClass, resourceId }) => {
    if (classes && !classes.includes(targetClass) && targetClass) {
        redirect(`${reverse(ROUTES.RESOURCE, { id: resourceId })}?noRedirect`);
    }

    return null;
};

export default ClassRedirect;
