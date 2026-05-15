import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card } from '@heroui/react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { FC } from 'react';

import Tooltip from '@/components/FloatingUI/Tooltip';
import PaperTitle from '@/components/PaperTitle/PaperTitle';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { Author, UpdateAuthor } from '@/services/backend/types';

type MetadataTableProps = {
    title?: string;
    authors?: (Author | UpdateAuthor)[];
    publicationMonth?: number | null;
    publicationYear?: number | null;
    publishedIn?: string | null;
    id?: string | null;
};

const MetadataTable: FC<MetadataTableProps> = ({
    title = '',
    authors = [],
    publicationMonth = null,
    publicationYear = null,
    publishedIn = '',
    id = null,
}) => {
    return (
        <Card className="mb-2">
            <Card.Content className="flex flex-col gap-2">
                <div>
                    <strong>Title:</strong>{' '}
                    {id ? (
                        <Tooltip content="Entry will be linked to ORKG resource">
                            <Link target="_blank" href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`}>
                                <PaperTitle title={title} /> <FontAwesomeIcon icon={faExternalLinkAlt} />
                            </Link>
                        </Tooltip>
                    ) : (
                        <Tooltip content="Not added to the ORKG yet, a new entry will be created">
                            <span>{title}</span>
                        </Tooltip>
                    )}
                </div>
                {authors.length > 0 && (
                    <div>
                        <strong>Authors:</strong>{' '}
                        {authors.map((author, index) => (
                            <span key={index}>{authors.length > index + 1 ? `${author.name}, ` : author.name}</span>
                        ))}
                    </div>
                )}
                {(publicationYear || publicationMonth) && (
                    <div>
                        <strong>Publication date:</strong>{' '}
                        {publicationMonth
                            ? dayjs()
                                  .month(publicationMonth - 1)
                                  .format('MMMM')
                            : ''}{' '}
                        {publicationYear} {!publicationMonth && !publicationYear && <i>Not available</i>}
                    </div>
                )}
                {publishedIn && (
                    <div>
                        <strong>Published in:</strong> {publishedIn}
                    </div>
                )}
            </Card.Content>
        </Card>
    );
};

export default MetadataTable;
