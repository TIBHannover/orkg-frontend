import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC, ReactNode } from 'react';
import { Button } from 'reactstrap';

type ButtonWithLoadingProps = {
    children: ReactNode;
    isLoading?: boolean;
    isDisabled?: boolean;
    loadingMessage?: string;
} & React.ComponentProps<typeof Button>;

/**
 * Wrapper for Reactstrap Button component that adds a loading state
 */
const ButtonWithLoading: FC<ButtonWithLoadingProps> = ({ children, isLoading = false, loadingMessage = 'Loading', isDisabled = false, ...props }) => (
    <Button disabled={isLoading || isDisabled} {...props}>
        {!isLoading ? (
            children
        ) : (
            <span>
                <FontAwesomeIcon icon={faSpinner} spin /> {loadingMessage}
            </span>
        )}
    </Button>
);

export default ButtonWithLoading;
