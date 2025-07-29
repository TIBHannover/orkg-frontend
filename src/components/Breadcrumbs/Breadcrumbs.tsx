import { faAngleDoubleDown, faAngleDoubleRight, faHome, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { reverse } from 'named-urls';
import Link from 'next/link';
import { FC, ReactNode, useEffect, useState } from 'react';
import { Card, CardFooter, Container } from 'reactstrap';
import styled from 'styled-components';
import useSWR from 'swr';

import ContentLoader from '@/components/ContentLoader/ContentLoader';
import Dropdown from '@/components/Ui/Dropdown/Dropdown';
import DropdownItem from '@/components/Ui/Dropdown/DropdownItem';
import DropdownMenu from '@/components/Ui/Dropdown/DropdownMenu';
import DropdownToggle from '@/components/Ui/Dropdown/DropdownToggle';
import { PREDICATES, RESOURCES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { getResource, resourcesUrl } from '@/services/backend/resources';
import { getParentResearchFields, getStatements, statementsUrl } from '@/services/backend/statements';
import { Literal, Resource } from '@/services/backend/types';
import { reverseWithSlug } from '@/utils';

const StyledDropdownItem = styled(DropdownItem)`
    &:active,
    &:active.text-primary {
        color: #fff !important;
    }
`;

type BreadcrumbsProps = {
    disableLastField?: boolean;
    backgroundWhite?: boolean;
    researchFieldId: string | null;
    onFieldClick?: (field: Resource | Literal) => void;
    route?: string;
};

const Breadcrumbs: FC<BreadcrumbsProps> = ({ disableLastField = false, backgroundWhite = false, researchFieldId, onFieldClick, route }) => {
    const [isOpen, setIsOpen] = useState<boolean[]>([]);
    const [isLoadingSiblings, setIsLoadingSiblings] = useState<boolean[]>([]);
    const [siblings, setSiblings] = useState<(Resource | Literal)[][]>([]);

    const { data } = useSWR(researchFieldId ? [researchFieldId, resourcesUrl, 'getResource'] : null, ([params]) => getResource(params));

    const { data: _parentResearchFields, isLoading } = useSWR(
        researchFieldId ? [researchFieldId, statementsUrl, 'getParentResearchFields'] : null,
        ([params]) => getParentResearchFields(params).then((res) => res.reverse()),
    );

    let parentResearchFields = _parentResearchFields || [];

    if (parentResearchFields.length === 0 && data && researchFieldId) {
        parentResearchFields = [
            {
                id: RESOURCES.RESEARCH_FIELD_MAIN,
                label: 'Research Field',
                classes: [],
                shared: 0,
                featured: false,
                unlisted: false,
                verified: false,
                extraction_method: 'UNKNOWN',
                _class: 'resource',
                created_at: '',
                created_by: '',
                observatory_id: '',
                organization_id: '',
                formatted_label: '',
            },
            data,
        ];
    }

    useEffect(() => {
        setIsOpen(new Array(parentResearchFields.length).fill(false));
        setSiblings(new Array(parentResearchFields.length).fill([]));
        setIsLoadingSiblings(new Array(parentResearchFields.length).fill(false));
    }, [researchFieldId, parentResearchFields.length]);

    const handleClickArrow = (index: number) => {
        setIsLoadingSiblings(isLoadingSiblings.map((el, i) => (i === index ? true : el)));
        setIsOpen(isOpen.map((el, i) => (i === index ? !el : false)));
        if (siblings[index] && !siblings[index].length) {
            // get siblings of parent
            getStatements({
                subjectId: parentResearchFields[index].id,
                predicateId: PREDICATES.HAS_SUB_RESEARCH_FIELD,
            }).then((subRF) => {
                setSiblings(siblings.map((el, i) => (i === index ? subRF.map((s) => s.object) : el)));
                setIsLoadingSiblings(isLoadingSiblings.map((el, i) => (i === index ? false : el)));
            });
        } else {
            setIsLoadingSiblings(isLoadingSiblings.map((el, i) => (i === index ? false : el)));
        }
    };

    const renderLink = (field: Resource, children: ReactNode, index: number) => (
        <Link
            href={
                index === 0 ? reverse(ROUTES.HOME) : reverseWithSlug(route || ROUTES.RESEARCH_FIELD, { researchFieldId: field.id, slug: field.label })
            }
        >
            {children}
        </Link>
    );

    const renderDropdownItem = (field: Resource | Literal, children: ReactNode) => {
        if (onFieldClick) {
            return (
                <StyledDropdownItem key={`rf-${field.id}`} className="text-primary" onClick={() => onFieldClick(field)}>
                    {children}
                </StyledDropdownItem>
            );
        }
        return (
            <StyledDropdownItem
                tag={Link}
                key={`rf-${field.id}`}
                href={reverseWithSlug(ROUTES.RESEARCH_FIELD, { researchFieldId: field.id, slug: field.label })}
                className="text-primary"
            >
                {children}
            </StyledDropdownItem>
        );
    };

    if (!researchFieldId) {
        return null;
    }
    return (
        <nav>
            <Container className="p-0">
                <Card className="border-0">
                    <CardFooter
                        className={`rounded border-top-0 ${backgroundWhite ? 'p-0' : ''}`}
                        style={{ fontSize: '95%', backgroundColor: backgroundWhite ? '#fff' : '#dcdee6' }}
                    >
                        {researchFieldId &&
                            !isLoading &&
                            parentResearchFields?.map((field, index) => (
                                <span key={field.id}>
                                    {index !== parentResearchFields.length - 1 || !disableLastField
                                        ? renderLink(field, index === 0 ? <FontAwesomeIcon className="me-1" icon={faHome} /> : field.label, index)
                                        : field.label}
                                    {index !== parentResearchFields.length - 1 && (
                                        <Dropdown tag="span" isOpen={isOpen[index]} toggle={() => handleClickArrow(index)}>
                                            <DropdownToggle
                                                style={{ cursor: 'pointer', width: '15px', display: 'inline-block' }}
                                                tag="span"
                                                className="flex-1 ms-2 me-2"
                                            >
                                                <FontAwesomeIcon
                                                    className={isOpen[index] ? 'me-1' : ''}
                                                    icon={isOpen[index] ? faAngleDoubleDown : faAngleDoubleRight}
                                                />
                                            </DropdownToggle>
                                            <DropdownMenu>
                                                {!isLoadingSiblings[index] &&
                                                    siblings[index] &&
                                                    siblings[index].length > 0 &&
                                                    siblings[index].map((rf) =>
                                                        rf.id !== parentResearchFields[index + 1].id ? (
                                                            renderDropdownItem(rf, rf.label)
                                                        ) : (
                                                            <DropdownItem key={`rf-${rf.id}`}>{rf.label}</DropdownItem>
                                                        ),
                                                    )}
                                                {!isLoadingSiblings[index] && siblings[index] && siblings[index].length === 0 && (
                                                    <span className="p-2">No siblings found</span>
                                                )}
                                                {isLoadingSiblings[index] && <FontAwesomeIcon className="ms-3" icon={faSpinner} spin />}
                                            </DropdownMenu>
                                        </Dropdown>
                                    )}
                                </span>
                            ))}
                        {isLoading && (
                            <ContentLoader
                                height="100%"
                                width="100%"
                                viewBox="0 0 100 2"
                                style={{ width: '100% !important' }}
                                backgroundColor={backgroundWhite ? '#f3f3f3' : '#dcdee6'}
                                foregroundColor={backgroundWhite ? '#ecebeb' : '#cdced6'}
                            >
                                <rect x="0" y="0" rx="0" ry="0" width="100" height="50" />
                            </ContentLoader>
                        )}
                    </CardFooter>
                </Card>
            </Container>
        </nav>
    );
};

export default Breadcrumbs;
