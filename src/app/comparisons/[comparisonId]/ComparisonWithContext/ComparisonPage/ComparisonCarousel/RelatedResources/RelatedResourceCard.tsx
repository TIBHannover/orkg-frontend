import { Card } from '@heroui/react';
import { FC } from 'react';

import REGEX from '@/constants/regex';

type RelatedResourceCardProps = {
    url?: string;
    title?: string;
    description?: string;
};

const RelatedResourceCard: FC<RelatedResourceCardProps> = ({ url = '', title = '', description = '' }) => {
    const isLink = new RegExp(REGEX.URL).test(url);

    if (!isLink) {
        return <div className="w-full mx-1 h-[122px]">{url}</div>;
    }

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full mx-1 hover:no-underline">
            <Card className="h-[122px] p-3 overflow-hidden border border-default-200 hover:border-primary transition-colors">
                <Card.Header className="p-0">{title && <Card.Title className="text-sm line-clamp-2">{title}</Card.Title>}</Card.Header>
                {description && (
                    <Card.Content className="p-0 mt-1">
                        <p className="text-xs text-muted line-clamp-3">{description}</p>
                    </Card.Content>
                )}
            </Card>
        </a>
    );
};

export default RelatedResourceCard;
