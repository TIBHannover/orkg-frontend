import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import { FC, Fragment } from 'react';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { ParsedTemplate } from '@/components/Templates/ImportSHACL/hooks/useImportSHACL';
import AccordionBody from '@/components/Ui/Accordion/AccordionBody';
import AccordionHeader from '@/components/Ui/Accordion/AccordionHeader';
import AccordionItem from '@/components/Ui/Accordion/AccordionItem';
import Badge from '@/components/Ui/Badge/Badge';
import Table from '@/components/Ui/Table/Table';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

const ViewShapes: FC<{ data: ParsedTemplate[] }> = ({ data }) => (
    <div>
        {data?.map((nodesShape, index) => (
            <AccordionItem key={index.toString()}>
                <AccordionHeader targetId={index.toString()}>
                    <div className="flex-grow-1 d-flex">
                        <div className="flex-grow-1">
                            {nodesShape.targetClassHasAlreadyTemplate ? (
                                <Tooltip content="This shape will be ignored because there is already a template for the target class">
                                    <span>
                                        <Badge color="secondary" className="me-1 py-1 px-2">
                                            Ignored
                                        </Badge>
                                    </span>
                                </Tooltip>
                            ) : (
                                <Tooltip content="An ORKG Template will be created">
                                    <span>
                                        <Badge color="info" className="me-1 py-1 px-2">
                                            New
                                        </Badge>
                                    </span>
                                </Tooltip>
                            )}
                            {nodesShape.label}
                        </div>
                        <Badge color="light" className="justify-content-end me-2">
                            {pluralize('Property', nodesShape.properties.length, true)}
                        </Badge>
                    </div>
                </AccordionHeader>
                <AccordionBody accordionId={index.toString()} className="bg-white">
                    <Table bordered>
                        <tbody>
                            {nodesShape.targetClassHasAlreadyTemplate && (
                                <tr>
                                    <th scope="row">Existing template</th>
                                    <td>
                                        <Link target="_blank" href={reverse(ROUTES.TEMPLATE, { id: nodesShape.existingTemplateId })}>
                                            {nodesShape.existingTemplateId}
                                        </Link>
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <th scope="row" style={{ width: '20%' }}>
                                    Target class
                                </th>
                                <td>
                                    {'id' in nodesShape.target_class && nodesShape.target_class.id ? (
                                        <DescriptionTooltip id={nodesShape.target_class.id} _class={ENTITIES.CLASS}>
                                            <Link target="_blank" href={reverse(ROUTES.CLASS, { id: nodesShape.target_class.id })}>
                                                {nodesShape.target_class.label}
                                            </Link>
                                        </DescriptionTooltip>
                                    ) : (
                                        nodesShape.target_class.label
                                    )}
                                </td>
                            </tr>
                            {nodesShape.description && (
                                <tr>
                                    <th scope="row">Description</th>
                                    <td>{nodesShape.description}</td>
                                </tr>
                            )}
                            {nodesShape.formatted_label && (
                                <tr>
                                    <th scope="row">Formatted label</th>
                                    <td>{nodesShape.formatted_label}</td>
                                </tr>
                            )}
                            {nodesShape.relations.research_fields && nodesShape.relations.research_fields.length > 0 && (
                                <tr>
                                    <th scope="row">Research fields</th>
                                    <td>
                                        {nodesShape.relations.research_fields.map((researchField, index) => (
                                            <Fragment key={'id' in researchField && researchField.id ? researchField.id : index.toString()}>
                                                {index > 0 && ', '}
                                                {'id' in researchField && researchField.id ? (
                                                    <DescriptionTooltip id={researchField.id} _class={ENTITIES.RESOURCE}>
                                                        <Link target="_blank" href={reverse(ROUTES.RESOURCE, { id: researchField.id })}>
                                                            {researchField.label}
                                                        </Link>
                                                    </DescriptionTooltip>
                                                ) : (
                                                    <>{researchField.label} </>
                                                )}
                                            </Fragment>
                                        ))}
                                    </td>
                                </tr>
                            )}
                            {nodesShape.relations.research_problems && nodesShape.relations.research_problems.length > 0 && (
                                <tr>
                                    <th scope="row">Research problem</th>
                                    <td>
                                        {nodesShape.relations.research_problems.map((researchProblem, index) => (
                                            <Fragment key={'id' in researchProblem && researchProblem.id ? researchProblem.id : index.toString()}>
                                                {index > 0 && ', '}
                                                {'id' in researchProblem && researchProblem.id ? (
                                                    <DescriptionTooltip id={researchProblem.id} _class={ENTITIES.RESOURCE}>
                                                        <Link target="_blank" href={reverse(ROUTES.RESOURCE, { id: researchProblem.id })}>
                                                            {researchProblem.label}
                                                        </Link>
                                                    </DescriptionTooltip>
                                                ) : (
                                                    <>{researchProblem.label} </>
                                                )}
                                            </Fragment>
                                        ))}
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <th scope="row">Closed</th>
                                <td>{nodesShape.is_closed ? 'Yes' : 'No'}</td>
                            </tr>
                        </tbody>
                    </Table>
                    <Table bordered>
                        <thead>
                            <tr>
                                <th>Property</th>
                                <th>Range</th>
                                <th>Cardinality</th>
                                <th>Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nodesShape.properties.map((propertyShape, i) => (
                                <tr key={i.toString()}>
                                    <td>
                                        {propertyShape.path && 'id' in propertyShape.path && propertyShape.path.id ? (
                                            <DescriptionTooltip id={propertyShape.path.id} _class={ENTITIES.PREDICATE}>
                                                <Link target="_blank" href={reverse(ROUTES.PROPERTY, { id: propertyShape.path.id })}>
                                                    {propertyShape.path.label}
                                                </Link>
                                            </DescriptionTooltip>
                                        ) : (
                                            propertyShape.path?.label
                                        )}
                                    </td>
                                    <td>
                                        {propertyShape.range && 'id' in propertyShape.range && propertyShape.range.id && propertyShape.range.id && (
                                            <DescriptionTooltip id={propertyShape.range.id} _class={ENTITIES.CLASS}>
                                                <Link target="_blank" href={reverse(ROUTES.CLASS, { id: propertyShape.range.id })}>
                                                    {propertyShape.range.label}
                                                </Link>
                                            </DescriptionTooltip>
                                        )}
                                        {propertyShape.range && !('id' in propertyShape.range) && propertyShape.range.label}
                                    </td>
                                    <td>
                                        {propertyShape.minCount ?? 0} - {propertyShape.maxCount ?? '*'}
                                    </td>
                                    <td>
                                        {propertyShape.order && (
                                            <>
                                                Order: {propertyShape.order}
                                                <br />
                                            </>
                                        )}
                                        {propertyShape.pattern && (
                                            <>
                                                Pattern: {propertyShape.pattern}
                                                <br />
                                            </>
                                        )}
                                        {propertyShape.min_inclusive && (
                                            <>
                                                min Inclusive: {propertyShape.min_inclusive}
                                                <br />
                                            </>
                                        )}
                                        {propertyShape.max_inclusive && (
                                            <>
                                                max Inclusive: {propertyShape.max_inclusive}
                                                <br />
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </AccordionBody>
            </AccordionItem>
        ))}
    </div>
);

export default ViewShapes;
