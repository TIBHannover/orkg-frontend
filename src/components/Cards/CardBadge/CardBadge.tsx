import { Chip } from '@heroui/react';
import { FC, ReactNode } from 'react';

type CardBadgeProps = {
    children: ReactNode;
};

const CardBadge: FC<CardBadgeProps> = ({ children }) => (
    <Chip color="accent" variant="soft" size="sm">
        {children}
    </Chip>
);

export default CardBadge;
