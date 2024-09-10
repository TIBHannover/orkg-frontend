'use client';

import { useState, useEffect } from 'react';
import ViewPaper from 'components/ViewPaper/Page/ViewPaper';

import { getResource } from 'services/backend/resources';
import { CLASSES } from 'constants/graphSettings';
import ViewPaperVersion from 'components/ViewPaper/Page/ViewPaperVersion';
import useParams from 'components/useParams/useParams';

/**
 * This component checks if the paper if a published version or live version and return the correct page
 */
export default function CheckPaperVersion() {
    const [paperType, setPaperType] = useState(null);
    const params = useParams();

    useEffect(() => {
        getResource(params.resourceId).then((r) => {
            const type = r.classes.find((c) => c === CLASSES.PAPER || c === CLASSES.PAPER_VERSION);
            setPaperType(type);
        });
    }, [params]);

    if (paperType === CLASSES.PAPER_VERSION) {
        return <ViewPaperVersion />;
    }
    return <ViewPaper />;
}
