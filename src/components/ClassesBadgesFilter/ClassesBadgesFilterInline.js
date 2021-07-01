import { useState } from 'react';
import { CLASSES } from 'constants/graphSettings';
import ClassBadgeFilter from './ClassBadgeFilter';

export default function ClassesBadgesFilter() {
    const [classes, setClasses] = useState([CLASSES.COMPARISON, CLASSES.VISUALIZATION, CLASSES.SMART_REVIEW]);
    const toggle = classId => {
        if (classes.includes(classId)) {
            setClasses(v => v.filter(c => c !== classId));
        } else {
            setClasses(v => [...v, classId]);
        }
    };
    const filters = [
        { id: CLASSES.PAPER, label: 'Paper' },
        { id: CLASSES.COMPARISON, label: 'Comparison' },
        { id: CLASSES.VISUALIZATION, label: 'Visualization' },
        { id: CLASSES.SMART_REVIEW, label: 'SmartReview' }
    ];
    return (
        <div>
            Filters:{' '}
            {filters.map(f => (
                <ClassBadgeFilter filter={f} active={classes.includes(f.id)} toggle={toggle} />
            ))}
        </div>
    );
}
