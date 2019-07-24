import React from 'react';
import { mount } from 'enzyme';
import ExportToLatex from './../ExportToLatex.js';

it('generate Latex without crashing', async () => {
  let props = {
    data: [
      [
        'Title',
        'Property 1'
      ],
      [
        'Paper 1',
        'Value 1'
      ],
      [
        'Paper 2',
        'Value 2'
      ]
    ],
    contributions: [{
      'contributionLabel': 'Contribution 1',
      'id': 'R1',
      'paperId': 'R10',
      'title': 'Paper 1',
      'bibtex': '@article{R2,\n\tjournal = {Journal 1},\n\ttitle = {Paper 1},\n\tauthor = {Name},\n\tyear = {2015}\n}\n\n'
    }, {
      'contributionLabel': 'Contribution 2',
      'id': 'R2',
      'paperId': 'R11',
      'title': 'Paper 2',
      'bibtex': '@article{R2,\n\tjournal = {Journal 1},\n\ttitle = {Paper 2},\n\tauthor = {Name},\n\tyear = {2015}\n}\n\n'
    }],
    properties: [
      {
        'active': true,
        'contributionAmount': 2,
        'id': 'P32',
        'label': 'Property 1'
      }
    ],
    showDialog: true,
    toggle: () => null,
    transpose: false,
    location: {
      'href': 'http://localhost:3000/comparison/R1/R2?properties=P32&transpose=false',
      'origin': 'http://localhost:3000',
      'protocol': 'http:',
      'host': 'localhost:3000',
      'hostname': 'localhost',
      'port': '3000',
      'pathname': '/comparison/R487/R498',
      'search': '?properties=P32&transpose=false',
      'hash': ''
    },
    response_hash: '',
  };
  const wrapper = mount(<ExportToLatex {...props} />);
  expect(wrapper).toHaveLength(1);
  let latex = '\\begin{table}\\centering \\caption{This comparison table is built using ORKG \\protect \\cite{Auer2018Towards}}\\begin{tabular}{|c|c|c|} Title & Paper 1 & Paper 2 \\\\ \\hline Property 1 & Value 1 & Value 2 \\\\ \\end{tabular} \\end{table}'
  // manually call function
  await wrapper.instance().generateLatex();
  wrapper.update();
  expect(wrapper.find('textarea').text().replace(/(\r\n|\n|\r)/gm, '')).toContain(latex);
});
