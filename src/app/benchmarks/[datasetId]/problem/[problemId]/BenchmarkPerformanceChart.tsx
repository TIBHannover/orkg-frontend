'use client';

import { DatasetSummaryRepresentation } from '@orkg/orkg-client';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import Chart from 'react-google-charts';

import useColorMode from '@/components/hooks/useColorMode';
import Container from '@/components/Ui/Structure/Container';
import ROUTES from '@/constants/routes';
import { reverse } from '@/lib/namedRoute';

type ChartTooltipRow = [Date, number, string];
type ChartHeaderRow = [string, string, { type: 'string'; role: 'tooltip'; p: { html: true } }];
type ChartData = [ChartHeaderRow, ...ChartTooltipRow[]];

function getTicksAxisH(rows: ChartTooltipRow[]) {
    const dateRange = rows.map((row) => row[0]);
    const maxDate = new Date(Math.max(...dateRange.map((d) => d.getTime())));
    const minDate = new Date(Math.min(...dateRange.map((d) => d.getTime())));
    const ticksAxisH: { v: Date; f: string }[] = [];
    let year = '';
    for (
        let i = dayjs(minDate.getTime()).subtract(1, 'month').valueOf();
        i <= dayjs(maxDate.getTime()).add(1, 'month').valueOf();
        i = dayjs(i).add(1, 'month').valueOf()
    ) {
        const tick = new Date(i);
        if (year !== dayjs(tick).format('MMM YYYY')) {
            ticksAxisH.push({ v: tick, f: dayjs(tick).format('MMM YYYY') });
            year = dayjs(tick).format('MMM YYYY');
        }
    }
    return ticksAxisH;
}

type BenchmarkPerformanceChartProps = {
    benchmarkPapers: DatasetSummaryRepresentation[];
    selectedMetric: string;
};

const BenchmarkPerformanceChart = ({ benchmarkPapers, selectedMetric }: BenchmarkPerformanceChartProps) => {
    const router = useRouter();
    const isDark = useColorMode() === 'dark';

    const rows: ChartTooltipRow[] = benchmarkPapers
        .map((c) => {
            const publishedOn = dayjs(`${c.paperYear}-${c.paperMonth ? c.paperMonth : '01'}`, 'YYYY-MM');
            try {
                const score = parseFloat(c.score);
                if (!score) return null;
                return [
                    publishedOn.toDate(),
                    score,
                    `<b>Paper</b>: ${c.paperTitle}<br /> <b>Model</b>: ${c.modelName ?? '-'}<br /> <b>Score</b>: ${c.score}<br /> <b>Published on</b>: ${publishedOn.format('MM-YYYY')}`,
                ] satisfies ChartTooltipRow;
            } catch {
                return null;
            }
        })
        .filter((v): v is ChartTooltipRow => v !== null);

    const axisColor = isDark ? '#e5e7eb' : '#374151';
    const trendlineColor = isDark ? '#60a5fa' : '#2563eb';

    if (rows.length === 0) {
        return <Container className="p-4 box rounded">No data to plot!</Container>;
    }

    const dataChart: ChartData = [['Year', selectedMetric, { type: 'string', role: 'tooltip', p: { html: true } }], ...rows];

    // Google Charts accepts {v, f} objects for ticks but the react-google-charts
    // types only declare Date[]. The runtime behavior is correct.
    const ticks = getTicksAxisH(rows);

    return (
        <Container className="p-4 box rounded">
            <Chart
                width="100%"
                height={300}
                chartType="ScatterChart"
                loader={<div>Loading Chart</div>}
                data={dataChart}
                options={{
                    backgroundColor: 'transparent',
                    hAxis: {
                        title: 'Year',
                        format: 'MMM yyyy',
                        ticks: ticks as unknown as Date[],
                        textStyle: { color: axisColor },
                        titleTextStyle: { color: axisColor },
                    },
                    vAxis: {
                        title: selectedMetric,
                        textStyle: { color: axisColor },
                        titleTextStyle: { color: axisColor },
                    },
                    legend: { position: 'right', textStyle: { color: axisColor } },
                    tooltip: { isHtml: true },
                    pointSize: 7,
                    trendlines: {
                        0: {
                            labelInLegend: 'Linear trendline',
                            tooltip: false,
                            type: 'linear',
                            visibleInLegend: true,
                            color: trendlineColor,
                        },
                    },
                }}
                chartEvents={[
                    {
                        eventName: 'select',
                        callback: ({ chartWrapper }) => {
                            const chart = chartWrapper?.getChart();
                            const selection = chart?.getSelection() ?? [];
                            if (selection.length === 1) {
                                const [selectedItem] = selection;
                                const { row } = selectedItem;
                                router.push(
                                    reverse(ROUTES.VIEW_PAPER, {
                                        resourceId: benchmarkPapers[row].paperId,
                                    }),
                                );
                            }
                        },
                    },
                ]}
            />
        </Container>
    );
};

export default BenchmarkPerformanceChart;
