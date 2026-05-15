import { Button, type ButtonProps, Spinner } from '@heroui/react';
import { FC, ReactNode } from 'react';

type ButtonWithLoadingProps = {
    children: ReactNode;
    isLoading?: boolean;
    isDisabled?: boolean;
    loadingMessage?: string;
} & ButtonProps;

const ButtonWithLoading: FC<ButtonWithLoadingProps> = ({ children, isLoading = false, loadingMessage = 'Loading', isDisabled = false, ...props }) => (
    <Button isPending={isLoading} isDisabled={isLoading || isDisabled} {...props}>
        {isLoading ? (
            <>
                <Spinner color="current" size="sm" />
                {loadingMessage}
            </>
        ) : (
            children
        )}
    </Button>
);

export default ButtonWithLoading;
