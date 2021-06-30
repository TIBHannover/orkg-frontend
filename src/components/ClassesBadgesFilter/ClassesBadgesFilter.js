import { useState } from 'react';
import { CardBadgeFilter } from 'components/styled';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { CLASSES } from 'constants/graphSettings';

export default function ClassesBadgesFilter() {
    const [classes, setClasses] = useState([]);
    const toggle = classId => {
        if (classes.includes(classId)) {
            setClasses(v => v.filter(c => c !== classId));
        } else {
            setClasses(v => [...v, classId]);
        }
    };
    return (
        <div>
            <CardBadgeFilter className={classes.includes(CLASSES.PAPER) ? 'active' : ''} onClick={() => toggle(CLASSES.PAPER)}>
                <span>
                    {classes.includes(CLASSES.PAPER) && <Icon icon={faCheck} className="mr-1" />}
                    Paper
                </span>
            </CardBadgeFilter>
            <CardBadgeFilter className={classes.includes(CLASSES.COMPARISON) ? 'active' : ''} onClick={() => toggle(CLASSES.COMPARISON)}>
                <span>
                    {classes.includes(CLASSES.COMPARISON) && <Icon icon={faCheck} className="mr-1" />}
                    Comparison
                </span>
            </CardBadgeFilter>
            <CardBadgeFilter className={classes.includes(CLASSES.VISUALIZATION) ? 'active' : ''} onClick={() => toggle(CLASSES.VISUALIZATION)}>
                <span>
                    {classes.includes(CLASSES.VISUALIZATION) && <Icon icon={faCheck} className="mr-1" />}
                    Visualization
                </span>
            </CardBadgeFilter>
            <CardBadgeFilter className={classes.includes(CLASSES.SMART_REVIEW) ? 'active' : ''} onClick={() => toggle(CLASSES.SMART_REVIEW)}>
                <span>
                    {classes.includes(CLASSES.SMART_REVIEW) && <Icon icon={faCheck} className="mr-1" />}
                    SmartReview
                </span>
            </CardBadgeFilter>
        </div>
    );
}
