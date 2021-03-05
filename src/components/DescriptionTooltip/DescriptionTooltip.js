import { useState } from 'react';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { CLASSES, PREDICATES } from 'constants/graphSettings';
import { CLASS_TYPE_ID, PREDICATE_TYPE_ID, RESOURCE_TYPE_ID } from 'constants/misc';

const DescriptionTooltip = props => {
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const onTrigger = () => {
        if (!isLoaded) {
            setIsLoading(true);
            getStatementsBySubjectAndPredicate({ subjectId: props.id, predicateId: PREDICATES.DESCRIPTION })
                .then(descriptionStatement => {
                    if (descriptionStatement.length) {
                        setDescription(descriptionStatement[0].object.label);
                    }
                    setIsLoading(false);
                    setIsLoaded(true);
                })
                .catch(() => {
                    setIsLoading(false);
                    setIsLoaded(true);
                });
        }
    };

    const renderTypeLabel = () => {
        switch (props.typeId) {
            case PREDICATE_TYPE_ID:
                return 'Property';
            case RESOURCE_TYPE_ID:
                return 'Resource';
            case CLASS_TYPE_ID:
                return 'Class';
            case CLASSES.PROBLEM:
                return 'Research problem';
            default:
                return 'Resource';
        }
    };

    return (
        <Tippy
            onTrigger={onTrigger}
            content={
                <>
                    {renderTypeLabel()} : {props.id}
                    <br />
                    Description:{' '}
                    {!isLoading ? (
                        description ? (
                            description
                        ) : (
                            <small className="font-italic">No description yet</small>
                        )
                    ) : (
                        <Icon icon={faSpinner} spin />
                    )}
                    {props.extraContent && (
                        <>
                            <br />
                            {props.extraContent}
                        </>
                    )}
                </>
            }
            arrow={true}
        >
            <span>{props.children}</span>
        </Tippy>
    );
};

DescriptionTooltip.propTypes = {
    children: PropTypes.node.isRequired,
    id: PropTypes.string.isRequired,
    extraContent: PropTypes.string,
    typeId: PropTypes.string.isRequired
};

export default DescriptionTooltip;
