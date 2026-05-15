import { ButtonGroup as HeroUIButtonGroup, type ButtonGroupProps as HeroUIButtonGroupProps } from '@heroui/react';
import { type CSSProperties, forwardRef } from 'react';

export type ButtonGroupProps = Omit<HeroUIButtonGroupProps, 'orientation'> & {
    vertical?: boolean;
    orientation?: HeroUIButtonGroupProps['orientation'];
    tabIndex?: number;
    style?: CSSProperties;
};

const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(({ vertical, orientation, ...rest }, ref) => {
    return <HeroUIButtonGroup ref={ref} orientation={orientation ?? (vertical ? 'vertical' : undefined)} {...rest} />;
});

ButtonGroup.displayName = 'ButtonGroup';

export default ButtonGroup;
