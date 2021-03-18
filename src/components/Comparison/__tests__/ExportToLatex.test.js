import { mount } from 'enzyme';
import ExportToLatex from '../Export/ExportToLatex.js';
import moment from 'moment';

const network = require('network');
network.getComparison = jest.fn(() => {
    return Promise.resolve({
        json: () =>
            Promise.resolve({
                contributions: [],
                data: {},
                properties: [],
                response_hash: '4e11df51bf9edd182ba8d363bb42d8b6'
            })
    });
});

network.createShortLink = jest.fn(() => {
    return Promise.resolve({
        json: () =>
            Promise.resolve({
                id: '66a9c347-2a2c-4076-a18f-3a7a79dfdf07',
                short_code: 'cJinsp'
            })
    });
});

const props = {
    data: [['Title', 'Property 1'], ['Paper 1', 'Value 1'], ['Paper 2', 'Value 2']],
    contributions: [
        {
            contributionLabel: 'Contribution 1',
            id: 'R50001',
            paperId: 'R50010',
            title: 'Paper 1',
            bibtex: '@article{X2,\n\tjournal = {Journal 1},\n\ttitle = {Paper 1},\n\tauthor = {Name, },\n\tyear = {2015}\n}\n\n'
        },
        {
            contributionLabel: 'Contribution 2',
            id: 'R50002',
            paperId: 'R50011',
            title: 'Paper 2',
            bibtex: '@article{X2,\n\tjournal = {Journal 1},\n\ttitle = {Paper 2},\n\tauthor = {Name ,},\n\tyear = {2015}\n}\n\n'
        }
    ],
    properties: [
        {
            active: true,
            contributionAmount: 2,
            id: 'P32',
            label: 'Property 1'
        }
    ],
    showDialog: true,
    toggle: () => null,
    transpose: false,
    location: {
        href: 'http://localhost:3000/comparison/X1/X2?properties=P32&transpose=false',
        origin: 'http://localhost:3000',
        protocol: 'http:',
        host: 'localhost:3000',
        hostname: 'localhost',
        port: '3000',
        pathname: '/comparison/X487/X498',
        search: '?properties=P32&transpose=false',
        hash: ''
    },
    response_hash: ''
};

it.skip('generate Latex without crashing', async () => {
    const wrapper = mount(<ExportToLatex {...props} />);
    expect(wrapper).toHaveLength(1);
    const latex =
        '\\begin{table}\\centering \\caption{This comparison table is built using ORKG \\protect \\cite{Auer2018Towards} \\protect \\footnotemark}\\begin{tabular}{|l|c|c|} \\textbf{Title} & \\textbf{\\cite{R50010}}  & \\textbf{\\cite{R50011}}  \\\\ \\hline \\textit{Property 1} & Value 1 & Value 2 \\\\ \\end{tabular} \\label{tab:ORKG}\\end{table}\\footnotetext{http://localhost//c/:shortCode [accessed ' +
        moment().format('YYYY MMM DD') +
        ']}';
    // manually call function
    await wrapper.instance().generateLatex();
    wrapper.update();
    expect(
        wrapper
            .find('textarea')
            .first()
            .props()
            .value.replace(/(\r\n|\n|\r)/gm, '')
    ).toContain(latex);
});

it.skip('generate Bibtex without crashing', async () => {
    const wrapper = mount(<ExportToLatex {...props} />);
    expect(wrapper).toHaveLength(1);
    const bibtex =
        "@misc{R50010,	title = {Paper 1},}@misc{R50011,	title = {Paper 2},}@inproceedings{Jaradeh2019Open,	journal = {Proceedings of the 10th International Conference on Knowledge Capture},	organization = {K-CAP '19: Knowledge Capture Conference},	doi = {10.1145/3360901.3364435},	isbn = {9781450370080},	publisher = {ACM},	title = {Open Research Knowledge Graph},	url = {http://dx.doi.org/10.1145/3360901.3364435},	author = {Jaradeh, Mohamad Yaser and Oelen, Allard and Farfar, Kheir Eddine and Prinz, Manuel and D'Souza, Jennifer and Kismihók, Gábor and Stocker, Markus and Auer, Sören},	date = {2019-09-23},	year = {2019},	month = {9},	day = {23},}"; // manually call function
    wrapper.setState({ selectedTab: 'references' });
    await wrapper.instance().generateBibTex();
    wrapper.update();
    expect(
        wrapper
            .find('textarea')
            .first()
            .props()
            .value.replace(/(\r\n|\n|\r)/gm, '')
    ).toBe(bibtex);
});
