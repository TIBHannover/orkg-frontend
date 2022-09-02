import { RESOURCES } from 'constants/graphSettings';
import { getParentResearchFields } from 'services/backend/statements';

const useDetermineResearchField = () => {
    const determineField = async ({ field }) => {
        if (field === RESOURCES.RESEARCH_FIELD_COMPUTER_SCIENCE || field === RESOURCES.RESEARCH_FIELD_COMPUTATIONAL_LINGUISTICS) {
            return true;
        }
        const parentFields = await getParentResearchFields(field);
        return parentFields.some(
            _field => _field.id === RESOURCES.RESEARCH_FIELD_COMPUTER_SCIENCE || _field.id === RESOURCES.RESEARCH_FIELD_COMPUTATIONAL_LINGUISTICS,
        );
    };
    return { determineField };
};

export default useDetermineResearchField;
