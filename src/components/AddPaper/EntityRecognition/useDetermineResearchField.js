import { RESOURCES } from 'constants/graphSettings';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { getStatementsBySubject } from 'services/backend/statements';

const useDetermineResearchField = () => {
    const { selectedResearchField } = useSelector(state => state.addPaper);
    const [isComputerScienceField, setIsComputerScienceField] = useState(false);

    useEffect(() => {
        if (selectedResearchField === RESOURCES.RESEARCH_FIELD_COMPUTER_SCIENCE) {
            setIsComputerScienceField(true);
            return;
        }
        const getComputerScienceSubFields = async () => {
            const computerScienceSubFields = await getStatementsBySubject({ id: RESOURCES.RESEARCH_FIELD_COMPUTER_SCIENCE });
            setIsComputerScienceField(computerScienceSubFields.some(statement => statement.object.id === selectedResearchField));
        };
        getComputerScienceSubFields();
    }, [selectedResearchField]);

    return { isComputerScienceField };
};

export default useDetermineResearchField;
