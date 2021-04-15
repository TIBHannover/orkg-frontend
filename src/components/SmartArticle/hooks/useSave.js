import { useState } from 'react';
import { createObject } from 'services/backend/misc';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

const useSave = () => {
    const [isLoading, setIsLoading] = useState(false);

    const create = async title => {
        setIsLoading(true);

        const paper = {
            predicates: [],
            resource: {
                name: title,
                classes: [CLASSES.SMART_ARTICLE],
                values: {
                    [PREDICATES.HAS_CONTRIBUTION]: [
                        {
                            label: 'Contribution',
                            classes: [CLASSES.CONTRIBUTION, CLASSES.CONTRIBUTION_SMART_ARTICLE],
                            values: {}
                        }
                    ]
                }
            }
        };

        const createdPaper = await createObject(paper);
        setIsLoading(false);

        return createdPaper.id;
    };

    return { create, isLoading };
};

export default useSave;
