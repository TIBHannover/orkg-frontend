'use client';

import { faLink, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { flatten, isString, kebabCase } from 'lodash';
import Link from 'next/link';
import { Fragment, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import FeaturedComparisonsItem from '@/components/FeaturedComparisons/FeaturedComparisonsItem';
import TitleBar from '@/components/TitleBar/TitleBar';
import Alert from '@/components/Ui/Alert/Alert';
import Container from '@/components/Ui/Structure/Container';
import Row from '@/components/Ui/Structure/Row';
import { CLASSES, PREDICATES } from '@/constants/graphSettings';
import ROUTES from '@/constants/routes';
import { comparisonUrl, getComparison } from '@/services/backend/comparisons';
import { getResources, resourcesUrl } from '@/services/backend/resources';
import { getStatements, statementsUrl } from '@/services/backend/statements';
import { Resource } from '@/services/backend/types';

const Header = styled.h2`
    &:hover a {
        visibility: visible !important;
    }
`;

const FeaturedComparisons = () => {
    useEffect(() => {
        document.title = 'Featured comparisons - ORKG';
    }, []);

    const scrollTo = useCallback((header: HTMLHeadingElement | null) => {
        const { hash } = window.location;
        const id = isString(hash) ? hash.replace('#', '') : null;
        if (!header || header.id !== id) {
            return;
        }
        window.scrollTo({
            behavior: 'smooth',
            top: header.offsetTop - 90, // a little space between the select element and the top of the page
        });
    }, []);

    const { data: categories, isLoading: isLoadingCategories } = useSWR(
        [
            {
                include: [CLASSES.FEATURED_COMPARISON_CATEGORY],
                sortBy: [{ property: 'created_at', direction: 'asc' as const }],
                returnContent: true,
            },
            resourcesUrl,
            'getResources',
        ],
        ([params]) => getResources(params),
    );

    const { data: comparisonResources, isLoading: isLoadingComparisonResources } = useSWR(
        [
            {
                include: [CLASSES.FEATURED_COMPARISON],
                sortBy: [{ property: 'created_at', direction: 'asc' as const }],
                returnContent: true,
            },
            resourcesUrl,
            'getResources',
        ],
        ([params]) => getResources(params),
    );

    const { data: comparisons, isLoading: isLoadingComparisons } = useSWR(
        [(comparisonResources as Resource[])?.map((r) => r.id) ?? [], comparisonUrl, 'getComparison'],
        ([params]) => Promise.all(params?.map((id) => getComparison(id)) ?? []),
    );

    const { data: icons, isLoading: isLoadingIcons } = useSWR(
        [(comparisonResources as Resource[])?.map((r) => r.id) ?? [], statementsUrl, 'getIcons'],
        ([params]) => Promise.all(params?.map((id) => getStatements({ subjectId: id, predicateId: PREDICATES.ICON, returnContent: true })) ?? []),
    );

    const { data: types, isLoading: isLoadingTypes } = useSWR(
        [(comparisonResources as Resource[])?.map((r) => r.id) ?? [], statementsUrl, 'getTypes'],
        ([params]) => Promise.all(params?.map((id) => getStatements({ subjectId: id, predicateId: PREDICATES.TYPE, returnContent: true })) ?? []),
    );

    const getIcon = (comparisonId: string) => {
        return flatten(icons)?.find((statement) => statement.subject.id === comparisonId)?.object?.label ?? '';
    };

    const getType = (comparisonId: string) => {
        return flatten(types)?.find((statement) => statement.subject.id === comparisonId)?.object?.id ?? '';
    };

    return (
        <div>
            <TitleBar
                buttonGroup={
                    <Link href={ROUTES.COMPARISONS} className="btn btn-secondary flex-shrink-0 btn-sm">
                        View all comparisons
                    </Link>
                }
            >
                Featured paper comparisons
            </TitleBar>
            <Container className="box rounded pt-4 pb-4 ps-5 pe-5">
                <Alert color="info" fade={false}>
                    With the paper data inside the ORKG, you can build powerful paper comparisons. On this page, we list the featured comparisons that
                    are created using the comparison functionality. The featured comparisons below are organized by category.
                </Alert>

                {isLoadingCategories && (
                    <div className="text-center mt-4 mb-4">
                        <FontAwesomeIcon icon={faSpinner} spin /> Loading
                    </div>
                )}
                {!isLoadingCategories &&
                    categories &&
                    (categories as Resource[])?.map((category: Resource) => {
                        const id = encodeURIComponent(kebabCase(category.label));
                        return (
                            <Fragment key={category.id}>
                                <Header id={id} ref={scrollTo} className="h4 mt-4 mb-3">
                                    {category.label}
                                    <Link href={`#${id}`} scroll={false} className="ms-2 invisible">
                                        <FontAwesomeIcon icon={faLink} />
                                    </Link>
                                </Header>
                                {!isLoadingIcons &&
                                    !isLoadingTypes &&
                                    !isLoadingComparisons &&
                                    !isLoadingComparisonResources &&
                                    !isLoadingCategories && (
                                        <Row>
                                            {comparisons
                                                ?.filter((comparison) => getType(comparison.id) === category.id)
                                                .map((comparison) => (
                                                    <FeaturedComparisonsItem
                                                        key={comparison.id}
                                                        title={comparison.title}
                                                        description={comparison.description}
                                                        icon={getIcon(comparison.id)}
                                                        id={comparison.id}
                                                        contributions={comparisons?.find((c) => c.id === comparison.id)?.contributions ?? []}
                                                    />
                                                ))}
                                        </Row>
                                    )}
                            </Fragment>
                        );
                    })}
            </Container>
        </div>
    );
};

export default FeaturedComparisons;
