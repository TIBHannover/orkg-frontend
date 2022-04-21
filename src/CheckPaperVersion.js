import { useState, useEffect } from 'react';
import ViewPaper from 'pages/ViewPaper';
import ViewPaperVersion from 'pages/ViewPaperVersion';
import { getResource } from 'services/backend/resources';
import { CLASSES } from 'constants/graphSettings';

export default function CheckPaperVersion(props) {
    const [paperType, setPaperType] = useState('');
    useEffect(() => {
        getResource(props.match.params.resourceId).then(r => {
            const type = r.classes.find(c => c === CLASSES.PAPER || c === CLASSES.PAPER_VERSION);
            setPaperType(type);
        });
    }, [props]);

    if (paperType === CLASSES.PAPER) {
        return <ViewPaper />;
    } else {
        return <ViewPaperVersion />;
    }
}
