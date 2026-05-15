import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Chip } from '@heroui/react';
import capitalize from 'capitalize';
import Link from 'next/link';
import { FC } from 'react';

import Tooltip from '@/components/FloatingUI/Tooltip';
import { PropertyStyle, StatementsGroupStyle, ValueItemStyle, ValuesStyle } from '@/components/StatementBrowser/styled';
import ListGroup from '@/components/Ui/List/ListGroup';
import { getConfigByType } from '@/constants/DataTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { EntityType } from '@/services/backend/types';
import { getLinkByEntityType } from '@/utils';

type ListStatementsProps = {
    property: string;
    idToLabel: Record<string, string>;
    idToEntityType: Record<string, EntityType>;
    values: { id: string; label: string; text: string; datatype: string }[];
    validationErrors?: boolean[];
};

const ListStatements: FC<ListStatementsProps> = ({ property, idToLabel, idToEntityType, values, validationErrors = [] }) => (
    <StatementsGroupStyle className="list-group-item" style={{ marginBottom: -1 }}>
        <div className="flex flex-wrap items-stretch gap-x-0">
            <PropertyStyle className="shrink-0 grow-0 w-4/12 basis-4/12 max-w-4/12" tabIndex={0}>
                <div>
                    <span className="propertyLabel">
                        {idToLabel[property] ? (
                            <Link href={reverse(ROUTES.PROPERTY, { id: property })} target="_blank">
                                {idToLabel[property]}
                            </Link>
                        ) : (
                            <Tooltip content="A new property will be created">
                                <span>{property}</span>
                            </Tooltip>
                        )}
                    </span>
                </div>
            </PropertyStyle>
            <ValuesStyle className="shrink-0 grow-0 w-8/12 basis-8/12 max-w-8/12 valuesList">
                <ListGroup flush className="px-4" style={{ listStyle: 'inside' }}>
                    {values.map((value, i) => (
                        <ValueItemStyle style={{ display: 'list-item' }} key={i}>
                            <div className="inline">
                                {'id' in value && idToLabel[value.id] && (
                                    <>
                                        <Link href={getLinkByEntityType(idToEntityType[value.id], value.id)} target="_blank">
                                            {idToLabel[value.id]}
                                        </Link>
                                        <Chip className="ml-2">{capitalize(idToEntityType[value.id])}</Chip>
                                    </>
                                )}
                                {value.label && (
                                    <Tooltip content="A new resource will be created">
                                        <span>
                                            <span className="text-accent">{value.label}</span>
                                            <Chip className="ml-2">Resource</Chip>
                                        </span>
                                    </Tooltip>
                                )}
                                {value.text && (
                                    <>
                                        {value.text}
                                        <Chip className="ml-2">{getConfigByType(value.datatype).name}</Chip>
                                        {validationErrors?.[i] && (
                                            <Tooltip content="The provided datatype does not seem to match the cell value">
                                                <span>
                                                    <Chip color="warning" variant="soft" className="ml-2">
                                                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-white" /> Warning
                                                    </Chip>
                                                </span>
                                            </Tooltip>
                                        )}
                                    </>
                                )}
                            </div>
                        </ValueItemStyle>
                    ))}
                </ListGroup>
            </ValuesStyle>
        </div>
    </StatementsGroupStyle>
);

export default ListStatements;
