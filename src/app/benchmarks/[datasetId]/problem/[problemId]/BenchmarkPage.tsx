'use client';

import { faCaretDown, faEllipsisV, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, Skeleton } from '@heroui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import BenchmarkPapersTable from '@/app/benchmarks/[datasetId]/problem/[problemId]/BenchmarkPapersTable';
import BenchmarkPerformanceChart from '@/app/benchmarks/[datasetId]/problem/[problemId]/BenchmarkPerformanceChart';
import useBenchmarkDatasetPapers from '@/components/Benchmarks/hooks/useBenchmarkDatasetPapers';
import useBenchmarkDatasetResource from '@/components/Benchmarks/hooks/useBenchmarkDatasetResource';
import DataBrowserDialog from '@/components/DataBrowser/DataBrowserDialog';
import RequireAuthentication from '@/components/RequireAuthentication/RequireAuthentication';
import { SubTitle } from '@/components/styled';
import TitleBar from '@/components/TitleBar/TitleBar';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';
import { datasetsUrl, findAllDatasetsByResearchProblemId } from '@/services/backend/datasets';
import { reverseWithSlug } from '@/utilsTyped';

type BenchmarkPageProps = {
    datasetId: string;
    problemId: string;
};

const BenchmarkPage = ({ datasetId, problemId }: BenchmarkPageProps) => {
    const { datasetResource, problemResource, isLoading, datasetDescription, isFailedLoading, loadResourceData } = useBenchmarkDatasetResource({
        datasetId,
        problemId,
    });
    const [menuOpen, setMenuOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [metricParam, setMetricParam] = useQueryState('metric');
    const router = useRouter();
    const {
        isLoading: isLoadingPapers,
        isFailedLoadingPapers,
        benchmarkDatasetPapers,
        datasetProblems,
        metrics,
    } = useBenchmarkDatasetPapers({ datasetId, problemId });

    const selectedMetric = metricParam && metrics.includes(metricParam) ? metricParam : (metrics[0] ?? null);

    const { data: datasets, isLoading: isLoadingDatasets } = useSWR(
        [{ id: problemId, page: 0, size: 9999 }, datasetsUrl, 'findAllDatasetsByResearchProblemId'],
        ([params]) => findAllDatasetsByResearchProblemId(params),
        { revalidateIfStale: true, revalidateOnFocus: true, revalidateOnReconnect: true },
    );

    const tableData = useMemo(
        () => (selectedMetric && benchmarkDatasetPapers[selectedMetric] ? benchmarkDatasetPapers[selectedMetric] : []),
        [selectedMetric, benchmarkDatasetPapers],
    );

    return (
        <div>
            {isLoading && (
                <>
                    <Container className="mt-6 mb-6">
                        <Skeleton className="w-full h-5 rounded" />
                    </Container>
                    <Container className="mt-6 mb-6 box rounded p-4">
                        <div className="text-left flex flex-col gap-2">
                            <Skeleton className="w-full h-5 rounded" />
                            <Skeleton className="w-3/4 h-5 rounded" />
                        </div>
                    </Container>
                </>
            )}
            {!isLoading && isFailedLoading && <div className="text-center mt-6 mb-6">Failed loading the resource</div>}
            {!isLoading && !isFailedLoading && datasetResource && problemResource && (
                <>
                    <TitleBar
                        titleAddition={
                            <SubTitle>
                                {problemResource.label} on {datasetResource.label}
                            </SubTitle>
                        }
                        buttonGroup={
                            <div className="action-bar flex">
                                <RequireAuthentication
                                    component={Button}
                                    size="sm"
                                    className="button--orkg-secondary !h-8"
                                    onClick={() => setEditMode((v) => !v)}
                                >
                                    <FontAwesomeIcon icon={faPen} /> Edit
                                </RequireAuthentication>
                                <Dropdown isOpen={menuOpen} onOpenChange={setMenuOpen}>
                                    <Button size="sm" className="button--orkg-secondary !h-8" isIconOnly aria-label="More options">
                                        <FontAwesomeIcon icon={faEllipsisV} />
                                    </Button>
                                    <Dropdown.Popover placement="bottom end">
                                        <Dropdown.Menu>
                                            <Dropdown.Item
                                                href={`${reverse(ROUTES.RESOURCE, { id: datasetId })}?noRedirect`}
                                                textValue="View resource"
                                            >
                                                View resource
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown>
                            </div>
                        }
                    >
                        Benchmark
                    </TitleBar>

                    {editMode && (
                        <DataBrowserDialog
                            show={editMode}
                            toggleModal={() => setEditMode((v) => !v)}
                            id={datasetId}
                            isEditMode
                            onCloseModal={() => loadResourceData()}
                        />
                    )}

                    <Container className="p-4 box rounded">
                        <div>
                            <i>Research problem:</i>{' '}
                            <Link
                                href={reverseWithSlug(ROUTES.RESEARCH_PROBLEM, {
                                    researchProblemId: problemResource.id,
                                    slug: problemResource.label,
                                })}
                                className="no-underline"
                            >
                                {problemResource.label}
                            </Link>
                        </div>
                        <div className="mt-4 mb-4 flex items-center">
                            <Button size="sm" isDisabled className="!h-8 rounded-r-none">
                                Dataset
                            </Button>
                            {isLoadingDatasets && (
                                <Button size="sm" isDisabled className="!h-8 rounded-l-none -ms-px">
                                    Loading...
                                </Button>
                            )}
                            {!isLoadingDatasets && (
                                <Dropdown>
                                    <Button size="sm" className="button--orkg-secondary !h-8 rounded-l-none -ms-px shrink-0">
                                        {datasetResource.label} <FontAwesomeIcon icon={faCaretDown} className="ml-1" />
                                    </Button>
                                    <Dropdown.Popover>
                                        <Dropdown.Menu className="max-h-[280px] overflow-y-auto">
                                            {datasets?.content?.map((ds) => (
                                                <Dropdown.Item
                                                    key={ds.id}
                                                    isDisabled={isLoading}
                                                    onAction={() => router.push(reverse(ROUTES.BENCHMARK, { datasetId: ds.id, problemId }))}
                                                    textValue={ds.label}
                                                >
                                                    {ds.label}
                                                </Dropdown.Item>
                                            ))}
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown>
                            )}
                        </div>

                        {datasetDescription && <p className="m-0">{datasetDescription}</p>}
                    </Container>
                </>
            )}
            {!isLoading && !isFailedLoading && !isLoadingPapers && !isFailedLoadingPapers && problemResource && datasetResource && (
                <div>
                    <Container className="flex items-center mt-6 mb-6">
                        <div className="flex grow">
                            <h1 className="text-xl mb-0">Performance trend</h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center">
                                <Button size="sm" isDisabled className="!h-8 rounded-r-none">
                                    Research problem
                                </Button>
                                <Dropdown>
                                    <Button size="sm" className="button--orkg-secondary !h-8 rounded-l-none -ms-px shrink-0">
                                        {problemResource.label} <FontAwesomeIcon icon={faCaretDown} className="ml-1" />
                                    </Button>
                                    <Dropdown.Popover>
                                        <Dropdown.Menu>
                                            {datasetProblems &&
                                                datasetProblems.length > 0 &&
                                                datasetProblems.map((rp) => (
                                                    <Dropdown.Item
                                                        key={rp.id}
                                                        isDisabled={isLoading}
                                                        onAction={() => router.push(reverse(ROUTES.BENCHMARK, { datasetId, problemId: rp.id }))}
                                                        textValue={rp.label}
                                                    >
                                                        {rp.label}
                                                    </Dropdown.Item>
                                                ))}
                                        </Dropdown.Menu>
                                    </Dropdown.Popover>
                                </Dropdown>
                            </div>
                            {metrics?.length > 0 && (
                                <div className="flex items-center">
                                    <Button size="sm" isDisabled className="!h-8 rounded-r-none">
                                        Metric
                                    </Button>
                                    <Dropdown>
                                        <Button size="sm" className="button--orkg-secondary !h-8 rounded-l-none -ms-px shrink-0">
                                            {selectedMetric} <FontAwesomeIcon icon={faCaretDown} className="ml-1" />
                                        </Button>
                                        <Dropdown.Popover placement="bottom end">
                                            <Dropdown.Menu>
                                                {metrics.map((m) => (
                                                    <Dropdown.Item key={m} isDisabled={isLoading} onAction={() => setMetricParam(m)} textValue={m}>
                                                        {m}
                                                    </Dropdown.Item>
                                                ))}
                                            </Dropdown.Menu>
                                        </Dropdown.Popover>
                                    </Dropdown>
                                </div>
                            )}
                        </div>
                    </Container>

                    {selectedMetric && <BenchmarkPerformanceChart benchmarkPapers={tableData} selectedMetric={selectedMetric} />}

                    <TitleBar
                        titleSize="h5"
                        titleAddition={
                            <SubTitle className="mb-0">
                                <small className="text-gray-500 dark:text-gray-400 mb-0 text-small">Data imported from paperswithcode.com</small>
                            </SubTitle>
                        }
                    >
                        Papers
                    </TitleBar>
                    <Container className="p-0">
                        <BenchmarkPapersTable data={tableData} problemLabel={problemResource.label} datasetLabel={datasetResource.label} />
                    </Container>
                </div>
            )}
            {!isLoadingPapers && isFailedLoadingPapers && (
                <Container className="p-0 mt-4 rounded box">
                    <div className="text-center mt-6 mb-6">Failed loading benchmark papers.</div>
                </Container>
            )}
            {isLoadingPapers && !isFailedLoadingPapers && (
                <Container className="p-0 mt-4 rounded box">
                    <div className="text-center mt-6 mb-6 py-6">Loading benchmark papers...</div>
                </Container>
            )}
        </div>
    );
};

export default BenchmarkPage;
