import { faLink } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@heroui/react';

type UriLinkProps = {
    uri?: string | null;
    className?: string;
    iconClassName?: string;
};

const UriLink = ({ uri, className, iconClassName }: UriLinkProps) => {
    // the backend hands out the string 'null' for a class that has no URI
    if (!uri || uri === 'null') {
        return null;
    }

    return (
        <span className="inline-flex min-w-0 items-center" title={uri}>
            <FontAwesomeIcon icon={faLink} size="sm" className={cn('me-1', iconClassName)} />
            <span className="sr-only">URI </span>
            <a href={uri} target="_blank" rel="noopener noreferrer" className={cn('min-w-0 break-all hover:underline', className)}>
                {uri}
            </a>
        </span>
    );
};

export default UriLink;
