export default function getSteps(currentStep) {
    let currentStepsTours;

    switch (currentStep) {
        case 1: {
            currentStepsTours = [
                {
                    selector: '#doiInputGroup',
                    content: 'Start by entering the DOI or the BibTeX of the paper you want to add. Then, click on "Lookup" to fetch paper meta-data automatically.',
                    style: { borderTop: '4px solid #E86161' },
                },
                {
                    selector: '#entryOptions',
                    content: 'In case you don\'t have the DOI, you can enter the general paper data "Manually".',
                    style: { borderTop: '4px solid #E86161' },
                },
            ];
            break;
        }
        case 2: {
            currentStepsTours = [
                {
                    selector: '.fieldSelector',
                    content: 'Select the most appropriate research field for the paper. The research field can be selected from a hierarchical structure of fields and their subfields',
                    style: { borderTop: '4px solid #E86161' },
                },
            ];
            break;
        }
        case 3: {
            currentStepsTours = [
                {
                    selector: '#researchProblemFormControl',
                    content: 'Specify the research problem that this contribution addresses.',
                    style: { borderTop: '4px solid #E86161' },
                },
                {
                    selector: '#contributionsList',
                    content: ' You can enter multiple contributions, and you can specify a name for each contribution.',
                    style: { borderTop: '4px solid #E86161' },
                },
                {
                    selector: '.listGroupEnlarge',
                    content: 'Contribution data can be added here. This data is added in a property value structure.',
                    style: { borderTop: '4px solid #E86161' },
                },
            ];
            break;
        }
        default: {
            currentStepsTours = [];
            break;
        }
    }
    return [...currentStepsTours];
}
