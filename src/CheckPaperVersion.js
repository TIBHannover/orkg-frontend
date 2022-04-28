import { useState, useEffect } from 'react';
import ViewPaper from 'pages/ViewPaper';
import { useParams } from 'react-router-dom';
import ViewPaperVersion from 'pages/ViewPaperVersion';
import { getResource } from 'services/backend/resources';
import { CLASSES } from 'constants/graphSettings';

export default function CheckPaperVersion() {
    const [paperType, setPaperType] = useState('');
    const params = useParams();

    useEffect(() => {
        getResource(params.resourceId).then(r => {
            const type = r.classes.find(c => c === CLASSES.PAPER || c === CLASSES.PAPER_VERSION);
            setPaperType(type);
        });
    }, [params]);

    if (paperType === CLASSES.PAPER) {
        return <ViewPaper />;
    } else {
        return <ViewPaperVersion />;
    }
}
