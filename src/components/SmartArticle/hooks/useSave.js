import { useState } from 'react';
import { createObject } from 'services/backend/misc';
import { CLASSES, PREDICATES } from 'constants/graphSettings';

const useHeaderBar = () => {
    const [isLoading, setIsLoading] = useState(false);

    const create = async title => {
        setIsLoading(true);

        /*const paper = {
            predicates: [],
            resource: {
                name: title,
                classes: [CLASSES.PAPER, CLASSES.SMART_ARTICLE, CLASSES.FABIO_SCHOLARLY_WORK], //TODO: paper should probably be removed
                values: {
                    [PREDICATES.IS_LISTED]: [
                        {
                            text: 'true',
                            datatype: 'xsd:boolean'
                        }
                    ],
                    [PREDICATES.HAS_CONTRIBUTION]: [
                        {
                            label: 'Contribution',
                            classes: [CLASSES.CONTRIBUTION],
                            values: {
                                [PREDICATES.CONTAINS]: [
                                    {
                                        label: 'Front matter',
                                        classes: [CLASSES.DOCO_FRONT_MATTER],
                                        values: {
                                            [PREDICATES.CONTAINS]: [
                                                {
                                                    label: 'Title',
                                                    classes: [CLASSES.DOCO_TITLE],
                                                    values: {
                                                        [PREDICATES.HAS_CONTENT]: [
                                                            {
                                                                text: title,
                                                                datatype: 'xsd:string'
                                                            }
                                                        ]
                                                    }
                                                },
                                                {
                                                    label: 'Authors',
                                                    classes: [CLASSES.DOCO_LIST_OF_AUTHORS]
                                                }
                                            ]
                                        }
                                    },
                                    {
                                        label: 'Back matter',
                                        classes: [CLASSES.DOCO_BACK_MATTER]
                                    },
                                    {
                                        label: 'Body matter',
                                        classes: [CLASSES.DOCO_BODY_MATTER]
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        };*/

        const paper = {
            predicates: [],
            resource: {
                name: title,
                classes: [CLASSES.PAPER, CLASSES.SMART_ARTICLE], //TODO: paper should probably be removed?
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

export default useHeaderBar;
