import Link from 'next/link';
import { Card, Table } from 'reactstrap';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import moment from 'moment';
import { FC } from 'react';
import { Author, UpdateAuthor } from 'services/backend/types';
import PaperTitle from 'components/PaperTitle/PaperTitle';

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
        <Card className="mb-2" body>
            <Table className="mb-0">
                <tbody>
                    <tr className="table-borderless">
                        <td>
                            <strong>Title:</strong>{' '}
                            {id ? (
                                <Tippy content="Entry will be linked to ORKG resource">
                                    <Link target="_blank" href={`${reverse(ROUTES.RESOURCE, { id })}?noRedirect`}>
                                        <PaperTitle title={title} /> <FontAwesomeIcon icon={faExternalLinkAlt} />
                                    </Link>
                                </Tippy>
                            ) : (
                                <Tippy content="Not added to the ORKG yet, a new entry will be created">
                                    <span>{title}</span>
                                </Tippy>
                            )}
                        </td>
                    </tr>
                    {authors.length > 0 && (
                        <tr>
                            <td>
                                <strong>Authors:</strong>{' '}
                                {authors.map((author, index) => (
                                    <span key={index}>{authors.length > index + 1 ? `${author.name}, ` : author.name}</span>
                                ))}
                            </td>
                        </tr>
                    )}
                    {(publicationYear || publicationMonth) && (
                        <tr>
                            <td>
                                <strong>Publication date:</strong> {publicationMonth ? moment(publicationMonth, 'M').format('MMMM') : ''}{' '}
                                {publicationYear} {!publicationMonth && !publicationYear && <i>Not available</i>}
                            </td>
                        </tr>
                    )}
                    {publishedIn && (
                        <tr>
                            <td>
                                <strong>Published in:</strong> {publishedIn}
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Card>
    );
};

export default MetadataTable;
