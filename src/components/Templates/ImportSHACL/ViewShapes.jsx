import { reverse } from 'named-urls';
import Link from 'next/link';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import { Fragment } from 'react';
import { AccordionBody, AccordionHeader, AccordionItem, Badge, Table } from 'reactstrap';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';

const ViewShapes = ({ data }) => (
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
                            {pluralize('Property', nodesShape.propertyShapes.length, true)}
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
                                <th scope="row" width="20%">
                                    Target class
                                </th>
                                <td>
                                    {nodesShape.targetClass.id ? (
                                        <DescriptionTooltip id={nodesShape.targetClass.id} _class={ENTITIES.CLASS}>
                                            <Link target="_blank" href={reverse(ROUTES.CLASS, { id: nodesShape.targetClass.id })}>
                                                {nodesShape.targetClass.label}
                                            </Link>
                                        </DescriptionTooltip>
                                    ) : (
                                        <>{nodesShape.targetClass.label}</>
                                    )}
                                </td>
                            </tr>
                            {nodesShape.description && (
                                <tr>
                                    <th scope="row">Description</th>
                                    <td>{nodesShape.description}</td>
                                </tr>
                            )}
                            {nodesShape.formattedLabel && (
                                <tr>
                                    <th scope="row">Formatted label</th>
                                    <td>{nodesShape.formattedLabel}</td>
                                </tr>
                            )}
                            {nodesShape.templatePredicate && (
                                <tr>
                                    <th scope="row">Template predicate</th>
                                    <td>
                                        {nodesShape.templatePredicate?.id ? (
                                            <DescriptionTooltip id={nodesShape.templatePredicate.id} _class={ENTITIES.PREDICATE}>
                                                <Link target="_blank" href={reverse(ROUTES.PROPERTY, { id: nodesShape.templatePredicate.id })}>
                                                    {nodesShape.templatePredicate.label}
                                                </Link>
                                            </DescriptionTooltip>
                                        ) : (
                                            <>{nodesShape.templatePredicate.label}</>
                                        )}
                                    </td>
                                </tr>
                            )}
                            {nodesShape.researchFields?.length > 0 && (
                                <tr>
                                    <th scope="row">Research fields</th>
                                    <td>
                                        {nodesShape.researchFields
                                            .map((researchField) => (
                                                <Fragment key={researchField.id}>
                                                    {researchField?.id ? (
                                                        <DescriptionTooltip id={researchField.id} _class={ENTITIES.RESOURCE}>
                                                            <Link target="_blank" href={reverse(ROUTES.RESOURCE, { id: researchField.id })}>
                                                                {researchField.label}
                                                            </Link>
                                                        </DescriptionTooltip>
                                                    ) : (
                                                        <>{researchField.label} </>
                                                    )}
                                                </Fragment>
                                            ))
                                            .reduce((prev, curr) => [prev, ', ', curr])}
                                    </td>
                                </tr>
                            )}
                            {nodesShape.researchProblems?.length > 0 && (
                                <tr>
                                    <th scope="row">Research problem</th>
                                    <td>
                                        {nodesShape.researchProblems
                                            .map((researchProblem) => (
                                                <Fragment key={researchProblem.id}>
                                                    {researchProblem?.id ? (
                                                        <DescriptionTooltip id={researchProblem.id} _class={ENTITIES.RESOURCE}>
                                                            <Link target="_blank" href={reverse(ROUTES.RESOURCE, { id: researchProblem.id })}>
                                                                {researchProblem.label}
                                                            </Link>
                                                        </DescriptionTooltip>
                                                    ) : (
                                                        <>{researchProblem.label} </>
                                                    )}
                                                </Fragment>
                                            ))
                                            .reduce((prev, curr) => [prev, ', ', curr])}
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <th scope="row">Closed</th>
                                <td>{nodesShape.closed !== 'false' ? 'Yes' : 'No'}</td>
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
                            {nodesShape.propertyShapes.map((propertyShape, i) => (
                                <tr key={i.toString()}>
                                    <td>
                                        {propertyShape.path?.id ? (
                                            <DescriptionTooltip id={propertyShape.path.id} _class={ENTITIES.PREDICATE}>
                                                <Link target="_blank" href={reverse(ROUTES.PROPERTY, { id: propertyShape.path.id })}>
                                                    {propertyShape.path.label}
                                                </Link>
                                            </DescriptionTooltip>
                                        ) : (
                                            <>{propertyShape.path.label}</>
                                        )}
                                    </td>
                                    <td>
                                        {propertyShape.range && (
                                            <>
                                                {propertyShape.range.id ? (
                                                    <DescriptionTooltip id={propertyShape.range.id} _class={ENTITIES.CLASS}>
                                                        <Link target="_blank" href={reverse(ROUTES.CLASS, { id: propertyShape.range.id })}>
                                                            {propertyShape.range.label}
                                                        </Link>
                                                    </DescriptionTooltip>
                                                ) : (
                                                    <>{propertyShape.range.label}</>
                                                )}
                                            </>
                                        )}
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

ViewShapes.propTypes = { data: PropTypes.array };

export default ViewShapes;
