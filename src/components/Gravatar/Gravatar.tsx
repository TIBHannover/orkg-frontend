import classNames from 'classnames';
import Image, { ImageProps } from 'next/image';
import { ComponentPropsWithRef, FC } from 'react';

type GravatarProps = {
    hashedEmail: string;
    size?: number;
    className?: string;
    alt?: string;
    style?: React.CSSProperties;
} & Omit<ComponentPropsWithRef<'img'>, keyof ImageProps>;

const Gravatar: FC<GravatarProps> = ({ hashedEmail, size = 80, className, alt = 'Avatar', style, ...props }) => {
    // Generate Gravatar URL
    const gravatarUrl = `https://gravatar.com/avatar/${hashedEmail}?s=${size}&d=retro&r=g`;
    return (
        <Image className={classNames('rounded-circle', className)} src={gravatarUrl} alt={alt} width={size} height={size} style={style} {...props} />
    );
};

export default Gravatar;
