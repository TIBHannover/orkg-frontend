'use client';

import { faExternalLinkAlt, faGlobe, faPen, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, Card, Separator, Skeleton } from '@heroui/react';
import { upperFirst } from 'lodash';
import Link from 'next/link';
import { AnchorHTMLAttributes, useEffect, useState } from 'react';
import useSWR from 'swr';

import InternalServerError from '@/app/error';
import NotFound from '@/app/not-found';
import ConferenceEvents from '@/components/ConferenceEvents/ConferenceEvents';
import useAuthentication from '@/components/hooks/useAuthentication';
import EditOrganization from '@/components/Organization/EditOrganization';
import Members from '@/components/Organization/Members';
import Observatories from '@/components/Organization/Observatories';
import TitleBar from '@/components/TitleBar/TitleBar';
import useParams from '@/components/useParams/useParams';
import { ORGANIZATIONS_MISC, ORGANIZATIONS_TYPES } from '@/constants/organizationsTypes';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { getOrganization, getOrganizationLogoUrl, organizationsUrl } from '@/services/backend/organizations';

type OrganizationError = Error & { statusCode?: number };

const Organization = () => {
    const { id, type: orgType } = useParams<{ id: string; type: string }>();
    const { user } = useAuthentication();
    const [showEditDialog, setShowEditDialog] = useState(false);

    const orgTypeEntry = ORGANIZATIONS_TYPES.find((t) => t.label.toLowerCase() === orgType?.toLowerCase());
    const typeName = orgTypeEntry?.alternateLabel ?? 'organization';
    const orgTypeId = orgTypeEntry?.id;

    const {
        data: organization,
        error,
        isLoading,
        mutate,
    } = useSWR<Awaited<ReturnType<typeof getOrganization>>, OrganizationError>(id ? [id, organizationsUrl, 'getOrganization'] : null, ([params]) =>
        getOrganization(params as string),
    );

    const [logoOverride, setLogoOverride] = useState<string | null>(null);
    const logo = logoOverride ?? (organization?.id ? getOrganizationLogoUrl(organization.id) : null);

    useEffect(() => {
        if (organization?.name) {
            document.title = `${organization.name} - ${typeName} - ORKG`;
        }
    }, [organization?.name, typeName]);

    const updateOrganizationMetadata = (newLabel: string, newUrl: string, newLogo: string) => {
        setLogoOverride(newLogo);
        if (organization) {
            mutate({ ...organization, name: newLabel, homepage: newUrl }, { revalidate: false });
        }
    };

    const canEdit = !!user && (user.id === organization?.created_by || user.isCurationAllowed);
    const isGeneral = orgTypeId === ORGANIZATIONS_MISC.GENERAL;
    const isEvent = orgTypeId === ORGANIZATIONS_MISC.EVENT;

    if (isLoading) {
        return (
            <div className="mx-auto px-3 max-w-container mt-12">
                <Card>
                    <Card.Content className="p-6 flex flex-col gap-3">
                        <Skeleton className="h-8 w-1/3 rounded" />
                        <Skeleton className="h-4 w-1/2 rounded" />
                        <Skeleton className="h-4 w-1/4 rounded" />
                    </Card.Content>
                </Card>
            </div>
        );
    }

    if (error) {
        return error.statusCode === 404 ? <NotFound /> : <InternalServerError error={error} />;
    }

    if (!organization) {
        return null;
    }

    const { homepage } = organization;

    return (
        <>
            <TitleBar
                titleAddition={
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis text-muted ms-3 self-center text-base">
                        {upperFirst(typeName)}
                    </span>
                }
                buttonGroup={
                    canEdit && (
                        <ButtonGroup size="sm">
                            <Button
                                className="button--orkg-secondary"
                                render={(props) => (
                                    <Link
                                        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
                                        href={
                                            isGeneral
                                                ? `${ROUTES.ADD_OBSERVATORY}?organizationId=${organization.id}`
                                                : reverse(ROUTES.ADD_EVENT, { id: organization.id })
                                        }
                                    />
                                )}
                            >
                                <FontAwesomeIcon icon={faPlus} className="me-1" />
                                Create {isGeneral ? 'observatory' : 'conference event'}
                            </Button>
                            <Button className="button--orkg-secondary" onPress={() => setShowEditDialog((v) => !v)}>
                                <FontAwesomeIcon icon={faPen} className="me-1" />
                                Edit
                            </Button>
                        </ButtonGroup>
                    )
                }
                wrap={false}
            >
                {organization.name}
            </TitleBar>

            <div className="mx-auto px-3 max-w-container">
                <Card>
                    <Card.Content className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                            <div className="md:col-span-2 order-2 md:order-1 flex flex-col gap-2">
                                {homepage ? (
                                    <a
                                        className="inline-flex items-center gap-2 text-accent hover:underline break-all"
                                        href={homepage}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <FontAwesomeIcon icon={faGlobe} />
                                        <span>{homepage}</span>
                                        <FontAwesomeIcon size="sm" icon={faExternalLinkAlt} />
                                    </a>
                                ) : (
                                    <span className="text-muted text-sm">No homepage provided</span>
                                )}
                            </div>
                            {logo && (
                                <div className="order-1 md:order-2">
                                    <a className="p-0 block relative" href={homepage || undefined} target="_blank" rel="noopener noreferrer">
                                        <div className="relative block before:content-[''] before:block before:pb-32.5">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                className="absolute max-w-full max-h-32.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                                src={logo}
                                                alt={`${organization.name} logo`}
                                            />
                                        </div>
                                    </a>
                                </div>
                            )}
                        </div>

                        {isGeneral && (
                            <>
                                <Separator className="my-6" />
                                <Members organizationsId={organization.id} />
                            </>
                        )}
                    </Card.Content>
                </Card>
            </div>

            {isEvent && <ConferenceEvents conferenceId={organization.id} conferenceName={organization.name} />}
            {isGeneral && <Observatories organizationsId={organization.id} />}

            <EditOrganization
                showDialog={showEditDialog}
                toggle={() => setShowEditDialog((v) => !v)}
                label={organization.name}
                id={organization.id}
                url={homepage}
                previewSrc={logo ?? ''}
                updateOrganizationMetadata={updateOrganizationMetadata}
                typeName={typeName}
            />
        </>
    );
};

export default Organization;
