import PropTypes from 'prop-types';
import React from 'react';
import { Card, Table } from 'reactstrap';
import { Link } from 'react-router-dom';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippyjs/react';
import moment from 'moment';

function MetadataTable({ title = '', authors = [], publicationMonth = null, publicationYear = null, venue = '', contentTypeId = null }) {
    return (
        <Card className="mb-2" body>
            <Table className="mb-0">
                <tbody>
                    <tr className="table-borderless">
                        <td>
                            <strong>Title:</strong>{' '}
                            {contentTypeId ? (
                                <Tippy content="Entry will be linked to ORKG resource">
                                    <Link target="_blank" to={reverse(ROUTES.RESOURCE, { id: contentTypeId })}>
                                        {title} <Icon icon={faExternalLinkAlt} />
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
                                    <span key={index}>{authors.length > index + 1 ? author.label + ', ' : author.label}</span>
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
                    {venue && (
                        <tr>
                            <td>
                                <strong>Published in:</strong> {venue}
                            </td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Card>
    );
}

MetadataTable.propTypes = {
    title: PropTypes.string,
    authors: PropTypes.array,
    publicationMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    publicationYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    venue: PropTypes.string,
    contentTypeId: PropTypes.string
};

export default MetadataTable;
