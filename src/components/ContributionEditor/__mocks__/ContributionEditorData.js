export const contribution = {
    contributionEditor: {
        contributions: {
            R30609: {
                id: 'R30609',
                label: 'Contribution 1',
                created_at: '2021-03-04T13:25:13.16666Z',
                classes: ['Contribution'],
                shared: 1,
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'resource',
                observatory_id: '42fee2b2-02e8-4b59-ad68-752be219aefc',
                extraction_method: 'UNKNOWN',
                organization_id: '1bdc53bc-4f75-49ab-9cd1-ea219ca7e250',
                featured: false,
                unlisted: false,
                paperId: 'R30608'
            }
        },
        statements: {
            S56530: {
                contributionId: 'R30609',
                propertyId: 'P15136',
                objectId: 'L45713',
                type: 'literal'
            },
            S56529: {
                contributionId: 'R30609',
                propertyId: 'P15136',
                objectId: 'R30611',
                type: 'resource'
            },
            S56528: {
                contributionId: 'R30609',
                propertyId: 'P15137',
                objectId: 'R30613',
                type: 'resource'
            }
        },
        resources: {
            R30611: {
                id: 'R30611',
                label: 'test resource',
                created_at: '2021-03-04T13:25:13.198131Z',
                classes: [],
                shared: 1,
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'resource',
                observatory_id: '42fee2b2-02e8-4b59-ad68-752be219aefc',
                extraction_method: 'UNKNOWN',
                organization_id: '1bdc53bc-4f75-49ab-9cd1-ea219ca7e250',
                featured: false,
                unlisted: false,
                statements: []
            },
            R30613: {
                id: 'R30613',
                label: 'test resource 2',
                created_at: '2021-03-05T10:19:32.653345Z',
                classes: [],
                shared: 1,
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'resource',
                observatory_id: '42fee2b2-02e8-4b59-ad68-752be219aefc',
                extraction_method: 'UNKNOWN',
                organization_id: '1bdc53bc-4f75-49ab-9cd1-ea219ca7e250',
                featured: false,
                unlisted: false,
                statements: []
            }
        },
        literals: {
            L45713: {
                id: 'L45713',
                label: 'test literal',
                datatype: 'xsd:string',
                created_at: '2021-03-04T13:25:13.209097Z',
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'literal'
            }
        },
        properties: {
            P15136: {
                id: 'P15136',
                label: 'test property',
                created_at: '2021-03-04T13:25:13.132834Z',
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'predicate',
                description: null,
                staticRowId: '419b5e7c-0e0a-5798-4d2a-8ec43c9fbe3f'
            },
            P15137: {
                id: 'P15137',
                label: 'test property 2',
                created_at: '2021-03-04T13:25:13.143811Z',
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'predicate',
                description: null,
                staticRowId: 'b2718119-d3c2-353e-7c45-f63cd77004ce'
            }
        },
        papers: {
            R30608: {
                id: 'R30608',
                label: 'test paper',
                created_at: '2021-03-04T13:25:13.038073Z',
                classes: ['Paper'],
                shared: 0,
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'resource',
                observatory_id: '42fee2b2-02e8-4b59-ad68-752be219aefc',
                extraction_method: 'UNKNOWN',
                organization_id: '1bdc53bc-4f75-49ab-9cd1-ea219ca7e250',
                featured: false,
                unlisted: false,
                researchField: {
                    id: 'R375',
                    label: 'Arts and Humanities',
                    created_at: '2020-06-18T11:45:22.183035Z',
                    classes: ['ResearchField'],
                    shared: 40,
                    created_by: '00000000-0000-0000-0000-000000000000',
                    _class: 'resource',
                    observatory_id: '00000000-0000-0000-0000-000000000000',
                    extraction_method: 'UNKNOWN',
                    organization_id: '00000000-0000-0000-0000-000000000000',
                    featured: false,
                    unlisted: false,
                    statementId: 'S56527',
                    s_created_at: '2021-03-04T13:25:13.129173Z'
                }
            }
        },
        templates: {
            R52232: {
                id: 'R52232',
                label: 'Contribution',
                statements: ['S85997', 'S85992', 'S85987', 'S85982', 'S85981'],
                predicate: null,
                labelFormat: '',
                hasLabelFormat: false,
                isStrict: false,
                components: [
                    {
                        id: 'R52248',
                        property: {
                            id: 'P32',
                            label: 'has research problem'
                        },
                        value: {
                            id: 'Problem',
                            label: 'Problem'
                        },
                        minOccurs: '0',
                        maxOccurs: null,
                        order: '0',
                        validationRules: {}
                    },
                    {
                        id: 'R52249',
                        property: {
                            id: 'MATERIAL',
                            label: 'Material'
                        },
                        value: {
                            id: 'C16001',
                            label: 'Research Material'
                        },
                        minOccurs: '0',
                        maxOccurs: null,
                        order: '1',
                        validationRules: {}
                    },
                    {
                        id: 'R52250',
                        property: {
                            id: 'HasMethod',
                            label: 'HasMethod'
                        },
                        value: {
                            id: 'Methods',
                            label: 'Methods'
                        },
                        minOccurs: '0',
                        maxOccurs: null,
                        order: '2',
                        validationRules: {}
                    },
                    {
                        id: 'R52251',
                        property: {
                            id: 'HAS_RESULTS',
                            label: 'Has result'
                        },
                        value: {
                            id: 'Results',
                            label: 'Results'
                        },
                        minOccurs: '0',
                        maxOccurs: null,
                        order: '3',
                        validationRules: {}
                    }
                ],
                class: {
                    id: 'Contribution',
                    label: 'Contribution'
                },
                researchFields: [],
                researchProblems: [],
                isLoading: false
            }
        },
        classes: {
            Contribution: {
                isFetching: false,
                templateIds: ['R52232']
            }
        },
        isLoading: false,
        hasFailed: false
    }
};

export const contributionLiteralOnly = {
    contributionEditor: {
        contributions: {
            R30609: {
                id: 'R30609',
                label: 'Contribution 1',
                created_at: '2021-03-04T13:25:13.16666Z',
                classes: ['Contribution'],
                shared: 1,
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'resource',
                observatory_id: '42fee2b2-02e8-4b59-ad68-752be219aefc',
                extraction_method: 'UNKNOWN',
                organization_id: '1bdc53bc-4f75-49ab-9cd1-ea219ca7e250',
                featured: false,
                unlisted: false,
                paperId: 'R30608'
            }
        },
        statements: {
            S56530: {
                contributionId: 'R30609',
                propertyId: 'P15136',
                objectId: 'L45713',
                type: 'literal'
            }
        },
        resources: {},
        literals: {
            L45713: {
                id: 'L45713',
                label: 'test literal',
                datatype: 'xsd:string',
                created_at: '2021-03-04T13:25:13.209097Z',
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'literal'
            }
        },
        properties: {
            P15136: {
                id: 'P15136',
                label: 'test property',
                created_at: '2021-03-04T13:25:13.132834Z',
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'predicate',
                description: null,
                staticRowId: 'bd8d2f65-22a4-512f-094f-b992f7b5e32a'
            }
        },
        papers: {
            R30608: {
                id: 'R30608',
                label: 'test',
                created_at: '2021-03-04T13:25:13.038073Z',
                classes: ['Paper'],
                shared: 0,
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'resource',
                observatory_id: '42fee2b2-02e8-4b59-ad68-752be219aefc',
                extraction_method: 'UNKNOWN',
                organization_id: '1bdc53bc-4f75-49ab-9cd1-ea219ca7e250',
                featured: false,
                unlisted: false,
                researchField: {
                    id: 'R375',
                    label: 'Arts and Humanities',
                    created_at: '2020-06-18T11:45:22.183035Z',
                    classes: ['ResearchField'],
                    shared: 40,
                    created_by: '00000000-0000-0000-0000-000000000000',
                    _class: 'resource',
                    observatory_id: '00000000-0000-0000-0000-000000000000',
                    extraction_method: 'UNKNOWN',
                    organization_id: '00000000-0000-0000-0000-000000000000',
                    featured: false,
                    unlisted: false,
                    statementId: 'S56527',
                    s_created_at: '2021-03-04T13:25:13.129173Z'
                }
            }
        },
        templates: {
            R52232: {
                id: 'R52232',
                label: 'Contribution',
                statements: ['S85997', 'S85992', 'S85987', 'S85982', 'S85981'],
                predicate: null,
                labelFormat: '',
                hasLabelFormat: false,
                isStrict: false,
                components: [
                    {
                        id: 'R52248',
                        property: {
                            id: 'P32',
                            label: 'has research problem'
                        },
                        value: {
                            id: 'Problem',
                            label: 'Problem'
                        },
                        minOccurs: '0',
                        maxOccurs: null,
                        order: '0',
                        validationRules: {}
                    },
                    {
                        id: 'R52249',
                        property: {
                            id: 'MATERIAL',
                            label: 'Material'
                        },
                        value: {
                            id: 'C16001',
                            label: 'Research Material'
                        },
                        minOccurs: '0',
                        maxOccurs: null,
                        order: '1',
                        validationRules: {}
                    },
                    {
                        id: 'R52250',
                        property: {
                            id: 'HasMethod',
                            label: 'HasMethod'
                        },
                        value: {
                            id: 'Methods',
                            label: 'Methods'
                        },
                        minOccurs: '0',
                        maxOccurs: null,
                        order: '2',
                        validationRules: {}
                    },
                    {
                        id: 'R52251',
                        property: {
                            id: 'HAS_RESULTS',
                            label: 'Has result'
                        },
                        value: {
                            id: 'Results',
                            label: 'Results'
                        },
                        minOccurs: '0',
                        maxOccurs: null,
                        order: '3',
                        validationRules: {}
                    }
                ],
                class: {
                    id: 'Contribution',
                    label: 'Contribution'
                },
                researchFields: [],
                researchProblems: [],
                isLoading: false
            }
        },
        classes: {
            Contribution: {
                isFetching: false,
                templateIds: ['R52232']
            }
        },
        isLoading: false,
        hasFailed: false
    }
};
