import { FC } from 'react';

import Card from '@/components/Ui/Card/Card';
import CardBody from '@/components/Ui/Card/CardBody';
import CardText from '@/components/Ui/Card/CardText';
import CardTitle from '@/components/Ui/Card/CardTitle';
import REGEX from '@/constants/regex';

type RelatedResourceCardProps = {
    url?: string;
    title?: string;
    description?: string;
};

const RelatedResourceCard: FC<RelatedResourceCardProps> = ({ url = '', title = '', description = '' }) => {
    const isLink = new RegExp(REGEX.URL).test(url);

    return (
        <div className="w-100 mx-1">
            {isLink ? (
                <a href={url} target="_blank" rel="noopener noreferrer">
                    <Card>
                        <CardBody style={{ height: '120px' }}>
                            {title && <CardTitle>{title}</CardTitle>}
                            {description && <CardText>{description}</CardText>}
                        </CardBody>
                    </Card>
                </a>
            ) : (
                url
            )}
        </div>
    );
};

export default RelatedResourceCard;
