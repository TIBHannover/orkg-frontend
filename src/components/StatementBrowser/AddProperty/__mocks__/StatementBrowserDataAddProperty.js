const statementBrowserStrictTemplate = {
    statementBrowser: {
        selectedResource: 'R142012',
        selectedProperty: '',
        level: 0,
        isFetchingStatements: false,
        openExistingResourcesInDialog: false,
        propertiesAsLinks: true,
        resourcesAsLinks: true,
        initOnLocationChange: true,
        keyToKeepStateOnLocationChange: null,
        resources: {
            byId: {
                R142012: {
                    label: 'instance 1',
                    existingResourceId: 'R142012',
                    shared: 1,
                    propertyIds: [],
                    classes: ['C19000'],
                    isFetching: false,
                    isFetched: true,
                    fetchedDepth: 1,
                },
            },
            allIds: ['R142012'],
        },
        properties: {
            byId: {},
            allIds: [],
        },
        values: {
            byId: {},
            allIds: [],
        },
        resourceHistory: {
            byId: {
                R142012: {
                    id: 'R142012',
                    label: 'instance 1',
                },
            },
            allIds: ['R142012'],
        },
        templates: {
            R142011: {
                id: 'R142011',
                label: 'test',
                formatted_label: null,
                is_closed: true,
                properties: [],
                target_class: {
                    id: 'C19000',
                    label: 'test',
                },
                relations: { researchFields: [], researchProblems: [], predicate: null },
            },
        },
        classes: {
            C19000: {
                isFetching: false,
                templateIds: ['R142011'],
            },
        },
        contributions: {},
        selectedContributionId: '',
    },
};

export default statementBrowserStrictTemplate;
