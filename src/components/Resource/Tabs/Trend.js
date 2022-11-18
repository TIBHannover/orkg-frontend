import { Chart } from 'react-google-charts';

function Trend() {
    const data = [
        ['Year', 'Number of papers', { role: 'style' }],
        ['2009', 1, 'rgb(232, 97, 97)'],
        ['2011', 1, 'rgb(232, 97, 97)'],
        ['2012', 1, 'rgb(232, 97, 97)'],
        ['2013', 3, 'rgb(232, 97, 97)'],
        ['2014', 1, 'rgb(232, 97, 97)'],
        ['2016', 1, 'rgb(232, 97, 97)'],
        ['2017', 1, 'rgb(232, 97, 97)'],
        ['2020', 2, 'rgb(232, 97, 97)'],
        ['2021', 5, 'rgb(232, 97, 97)'],
        ['2022', 4, 'rgb(232, 97, 97)'],
    ];
    return (
        <div>
            <Chart options={{ colors: ['rgb(232, 97, 97)'] }} chartType="ColumnChart" width="100%" height="400px" data={data} />
        </div>
    );
}

export default Trend;
