const LLM_TASK_NAMES: {
    [key: string]: string;
} = {
    RECOMMEND_PROPERTIES: 'recommendProperties',
    RECOMMEND_PROPERTIES_DESCRIPTION: 'recommendPropertyDescription',
    RECOMMEND_RESEARCH_PROBLEMS: 'recommendResearchProblems',
    RECOMMEND_MATERIALS: 'recommendMaterials',
    RECOMMEND_METHODS: 'recommendMethods',
    CHECK_DESCRIPTIVENESS: 'checkDescriptiveness',
    CHECK_RESOURCE_DESTRUCTURING: 'checkResourceDestructuring',
    CHECK_IF_LITERAL_TYPE_IS_CORRECT: 'checkIfLiteralTypeIsCorrect',
    RECOMMEND_ANNOTATION: 'RecommendAnnotation',
    CHECK_PROPERTY_LABEL_GUIDELINES: 'checkPropertyLabelGuidelines',
};

export default LLM_TASK_NAMES;
