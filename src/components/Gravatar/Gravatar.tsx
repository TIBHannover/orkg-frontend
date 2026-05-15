import { Avatar } from '@heroui/react';
import { FC } from 'react';

type GravatarProps = {
    hashedEmail: string;
    size?: number;
    className?: string;
};

const Gravatar: FC<GravatarProps> = ({ hashedEmail, size = 80, className }) => {
    const gravatarUrl = `https://gravatar.com/avatar/${hashedEmail}?s=${size}&d=retro&r=g`;

    return (
        <Avatar className={className} style={{ width: size, height: size }}>
            <Avatar.Image alt="Avatar" src={gravatarUrl} />
            <Avatar.Fallback>??</Avatar.Fallback>
        </Avatar>
    );
};

export default Gravatar;
