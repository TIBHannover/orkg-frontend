import { Accordion, Chip } from '@heroui/react';
import Link from 'next/link';
import pluralize from 'pluralize';
import { FC, Fragment } from 'react';

import DescriptionTooltip from '@/components/DescriptionTooltip/DescriptionTooltip';
import Tooltip from '@/components/FloatingUI/Tooltip';
import { ParsedTemplate } from '@/components/Templates/ImportSHACL/hooks/useImportSHACL';
import { ENTITIES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

const thClass = 'border border-separator bg-surface-secondary text-surface-secondary-foreground px-4 py-2.5 text-start align-top font-medium';
const tdClass = 'border border-separator bg-surface text-surface-foreground px-4 py-2.5 align-top';
const tableClass = 'w-full text-sm border-collapse rounded-[var(--radius)] overflow-hidden';

const ViewShapes: FC<{ data: ParsedTemplate[] }> = ({ data }) => (
    <div className="flex flex-col gap-2">
        {data?.map((nodesShape, index) => (
            <Accordion.Item key={index.toString()} id={index.toString()}>
                <Accordion.Heading>
                    <Accordion.Trigger className="bg-surface-secondary text-surface-secondary-foreground hover:bg-surface-tertiary data-[expanded]:bg-surface-tertiary px-4 py-3">
                        <div className="grow flex items-center gap-2">
                            <div className="grow flex items-center gap-2">
                                {nodesShape.targetClassHasAlreadyTemplate ? (
                                    <Tooltip content="This shape will be ignored because there is already a template for the target class">
                                        <span>
                                            <Chip color="default" size="sm">
                                                Ignored
                                            </Chip>
                                        </span>
                                    </Tooltip>
                                ) : (
                                    <Tooltip content="An ORKG Template will be created">
                                        <span>
                                            <Chip color="accent" size="sm">
                                                New
                                            </Chip>
                                        </span>
                                    </Tooltip>
                                )}
                                <span className="font-medium">{nodesShape.label}</span>
                            </div>
                            <Chip color="default" size="sm" variant="soft">
                                {pluralize('Property', nodesShape.properties.length, true)}
                            </Chip>
                        </div>
                        <Accordion.Indicator />
                    </Accordion.Trigger>
                </Accordion.Heading>
                <Accordion.Panel>
                    <Accordion.Body className="bg-surface text-surface-foreground p-4 flex flex-col gap-4">
                        <table className={tableClass}>
                            <tbody>
                                {nodesShape.targetClassHasAlreadyTemplate && (
                                    <tr>
                                        <th scope="row" className={thClass}>
                                            Existing template
                                        </th>
                                        <td className={tdClass}>
                                            <Link target="_blank" href={reverse(ROUTES.TEMPLATE, { id: nodesShape.existingTemplateId })}>
                                                {nodesShape.existingTemplateId}
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <th scope="row" className={thClass} style={{ width: '20%' }}>
                                        Target class
                                    </th>
                                    <td className={tdClass}>
                                        {nodesShape.target_class && 'id' in nodesShape.target_class && nodesShape.target_class.id ? (
                                            <DescriptionTooltip id={nodesShape.target_class.id} _class={ENTITIES.CLASS}>
                                                <Link target="_blank" href={reverse(ROUTES.CLASS, { id: nodesShape.target_class.id })}>
                                                    {nodesShape.target_class.label}
                                                </Link>
                                            </DescriptionTooltip>
                                        ) : (
                                            nodesShape.target_class?.label || 'N/A (Target class will be created)'
                                        )}
                                    </td>
                                </tr>
                                {nodesShape.description && (
                                    <tr>
                                        <th scope="row" className={thClass}>
                                            Description
                                        </th>
                                        <td className={tdClass}>{nodesShape.description}</td>
                                    </tr>
                                )}
                                {nodesShape.formatted_label && (
                                    <tr>
                                        <th scope="row" className={thClass}>
                                            Formatted label
                                        </th>
                                        <td className={tdClass}>{nodesShape.formatted_label}</td>
                                    </tr>
                                )}
                                {nodesShape.relations.research_fields && nodesShape.relations.research_fields.length > 0 && (
                                    <tr>
                                        <th scope="row" className={thClass}>
                                            Research fields
                                        </th>
                                        <td className={tdClass}>
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
                                        <th scope="row" className={thClass}>
                                            Research problem
                                        </th>
                                        <td className={tdClass}>
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
                                    <th scope="row" className={thClass}>
                                        Closed
                                    </th>
                                    <td className={tdClass}>{nodesShape.is_closed ? 'Yes' : 'No'}</td>
                                </tr>
                            </tbody>
                        </table>
                        <table className={tableClass}>
                            <thead>
                                <tr>
                                    <th className={thClass}>Property</th>
                                    <th className={thClass}>Range</th>
                                    <th className={thClass}>Cardinality</th>
                                    <th className={thClass}>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {nodesShape.properties.map((propertyShape, i) => (
                                    <tr key={i.toString()}>
                                        <td className={tdClass}>
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
                                        <td className={tdClass}>
                                            {propertyShape.range &&
                                                'id' in propertyShape.range &&
                                                propertyShape.range.id &&
                                                propertyShape.range.id && (
                                                    <DescriptionTooltip id={propertyShape.range.id} _class={ENTITIES.CLASS}>
                                                        <Link target="_blank" href={reverse(ROUTES.CLASS, { id: propertyShape.range.id })}>
                                                            {propertyShape.range.label}
                                                        </Link>
                                                    </DescriptionTooltip>
                                                )}
                                            {propertyShape.range && !('id' in propertyShape.range) && propertyShape.range.label}
                                        </td>
                                        <td className={tdClass}>
                                            {propertyShape.minCount ?? 0} - {propertyShape.maxCount ?? '*'}
                                        </td>
                                        <td className={tdClass}>
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
                        </table>
                    </Accordion.Body>
                </Accordion.Panel>
            </Accordion.Item>
        ))}
    </div>
);

export default ViewShapes;
