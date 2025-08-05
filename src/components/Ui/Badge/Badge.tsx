import React, { FC } from 'react';
import { Badge as ReactstrapBadge, BadgeProps } from 'reactstrap';

const Badge: FC<BadgeProps> = ({ children, ...rest }) => {
    return <ReactstrapBadge {...rest}>{children}</ReactstrapBadge>;
};

export default Badge;
