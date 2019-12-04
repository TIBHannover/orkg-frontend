import React from 'react';
import { mount } from 'enzyme';
import ExportToLatex from './../ExportToLatex.js';

let props = {
    data: [
        ['Title', 'Property 1'],
        ['Paper 1', 'Value 1'],
        ['Paper 2', 'Value 2']
    ],
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

it('generate Latex without crashing', async () => {
    const wrapper = mount(<ExportToLatex {...props} />);
    expect(wrapper).toHaveLength(1);
    let latex =
        '\\begin{table}\\centering \\caption{This comparison table is built using ORKG \\protect \\cite{Auer2018Towards}}\\begin{tabular}{|c|c|c|} Title & Paper 1 & Paper 2 \\\\ \\hline Property 1 & Value 1 & Value 2 \\\\ \\end{tabular} \\end{table}';
    // manually call function
    await wrapper.instance().generateLatex();
    wrapper.update();
    expect(
        wrapper
            .find('textarea')
            .text()
            .replace(/(\r\n|\n|\r)/gm, '')
    ).toContain(latex);
});

it('generate Bibtex without crashing', async () => {
    const wrapper = mount(<ExportToLatex {...props} />);
    expect(wrapper).toHaveLength(1);
    let bibtex =
        '@misc{R50010,	title = {Paper 1},}@misc{R50011,	title = {Paper 2},}@article{Auer2018Towards,	journal = {Zenodo},	doi = {10.5281/zenodo.1157185},	language = {en},	publisher = {Zenodo},	title = {Towards An Open Research Knowledge Graph},	url = {https://zenodo.org/record/1157185},	author = {Auer, Sören},	date = {2018-01-22},	year = {2018},	month = {1},	day = {22},}';
    // manually call function
    wrapper.setState({ selectedTab: 'references' });
    await wrapper.instance().generateBibTex();
    wrapper.update();
    expect(
        wrapper
            .find('textarea')
            .text()
            .replace(/(\r\n|\n|\r)/gm, '')
    ).toContain(bibtex);
});
