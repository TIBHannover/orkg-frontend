'use client';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import ResearchFieldObservatories from 'components/Observatory/ResearchFieldObservatories/ResearchFieldObservatories';
import usePaginate from 'components/hooks/usePaginate';
import { getResearchFieldOfObservatories } from 'services/backend/observatories';
import Tabs from 'components/Tabs/Tabs';
import TitleBar from 'components/TitleBar/TitleBar';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import Tippy from '@tippyjs/react';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useParams from 'components/useParams/useParams';
import { Container } from 'reactstrap';

const Observatories = () => {
    useEffect(() => {
        document.title = 'Observatories - ORKG';
    }, []);

    const { researchFieldId } = useParams();

    const router = useRouter();

    const fetchItems = async ({ page, pageSize }) => {
        const { content: items, last, totalElements } = await getResearchFieldOfObservatories({ page, size: pageSize });
        return {
            items,
            last,
            totalElements,
        };
    };

    const {
        results: researchFields,
        isLoading,
        isLastPageReached,
        hasNextPage,
        page,
        loadNextPage,
    } = usePaginate({
        fetchItems,
        pageSize: 20,
    });

    const _researchFields = [{ id: 'all', label: 'All research fields' }, ...researchFields];

    const onTabChange = (key) => {
        if (key === 'loadMore') {
            loadNextPage();
        } else {
            router.push(
                key
                    ? reverse(ROUTES.OBSERVATORIES_RESEARCH_FIELD, {
                          researchFieldId: key,
                      })
                    : reverse(ROUTES.OBSERVATORIES),
            );
        }
    };

    return (
        <>
            <TitleBar>Observatories</TitleBar>
            <Container className="p-0 rounded mb-3 p-3" style={{ background: '#dcdee6' }}>
                Observatories organize research contributions in a particular research field and are curated by research organizations active in the
                respective field.{' '}
                <a href="https://orkg.org/about/27/Observatories" target="_blank" rel="noreferrer">
                    Learn more in the help center
                </a>
                .
            </Container>
            <Container className="box rounded p-4 clearfix">
                {researchFields?.length > 0 && (
                    <Tabs
                        destroyInactiveTabPane
                        onChange={onTabChange}
                        activeKey={researchFieldId ?? 'all'}
                        items={[
                            ..._researchFields.map((researchField) => ({
                                label: (
                                    <ConditionalWrapper
                                        condition={researchField.label?.length > 40}
                                        wrapper={(children) => <Tippy content={researchField.label}>{children}</Tippy>}
                                    >
                                        <div className="text-truncate" style={{ maxWidth: 250 }}>
                                            {researchField.id === null || '' ? 'Others' : researchField.label}
                                        </div>
                                    </ConditionalWrapper>
                                ),
                                key: researchField.id,
                                children: <ResearchFieldObservatories rfId={researchFieldId !== 'all' ? researchFieldId : null} />,
                            })),
                            ...(hasNextPage
                                ? [{ label: <div className="opacity-75">{isLoading ? 'Loading...' : 'Load more...'}</div>, key: 'loadMore' }]
                                : []),
                        ]}
                        tabPosition="left"
                    />
                )}
                {researchFields.length === 0 && isLastPageReached && <div className="text-center mt-4 mb-4">No observatories yet</div>}
                {page === 0 && isLoading && (
                    <div className="text-center mt-4 mb-4">
                        <Icon icon={faSpinner} spin /> Loading
                    </div>
                )}
            </Container>
        </>
    );
};

export default Observatories;
