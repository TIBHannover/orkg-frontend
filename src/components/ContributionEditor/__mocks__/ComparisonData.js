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
                objectId: 'R30610',
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
                organization_id: '1bdc53bc-4f75-49ab-9cd1-ea219ca7e250'
            },
            R30610: {
                id: 'R30610',
                label: 'test resource 2',
                created_at: '2021-03-04T13:25:13.179289Z',
                classes: [],
                shared: 1,
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'resource',
                observatory_id: '42fee2b2-02e8-4b59-ad68-752be219aefc',
                extraction_method: 'UNKNOWN',
                organization_id: '1bdc53bc-4f75-49ab-9cd1-ea219ca7e250'
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
                description: null
            },
            P15137: {
                id: 'P15137',
                label: 'test property 2',
                created_at: '2021-03-04T13:25:13.143811Z',
                created_by: '93da2912-06f9-4aab-987e-810347b21dd5',
                _class: 'predicate',
                description: null
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
                organization_id: '1bdc53bc-4f75-49ab-9cd1-ea219ca7e250'
            }
        },
        isLoading: false
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
                description: null
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
                organization_id: '1bdc53bc-4f75-49ab-9cd1-ea219ca7e250'
            }
        },
        isLoading: false
    }
};
