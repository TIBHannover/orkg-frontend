import { useState, Fragment } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { truncate } from 'lodash';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner, faClipboard } from '@fortawesome/free-solid-svg-icons';
import { getStatementsBySubjectAndPredicate } from 'services/backend/statements';
import { PREDICATES, ENTITIES } from 'constants/graphSettings';
import CopyToClipboard from 'react-copy-to-clipboard';
import { getResourceLink } from 'utils';
import { toast } from 'react-toastify';

const DescriptionTooltip = props => {
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const onTrigger = () => {
        if (!isLoaded && props._class !== ENTITIES.LITERAL) {
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
        switch (props._class) {
            case ENTITIES.PREDICATE:
                return 'Property';
            case ENTITIES.RESOURCE:
                return 'Resource';
            case ENTITIES.CLASS:
                return 'Class';
            case ENTITIES.LITERAL:
                return 'Literal';
            default:
                return 'Resource';
        }
    };

    return (
        <Tippy
            onTrigger={onTrigger}
            content={
                <div>
                    <div>
                        <span style={{ verticalAlign: 'middle' }}>
                            {renderTypeLabel()} id: {props.id}
                        </span>
                        <CopyToClipboard
                            text={props.id}
                            onCopy={() => {
                                toast.dismiss();
                                toast.success('ID copied to clipboard');
                            }}
                        >
                            <Button title="Click to copy id" onClick={e => e.stopPropagation()} className="py-0 px-0 ms-1" size="sm" color="link">
                                <Icon icon={faClipboard} size="xs" />
                            </Button>
                        </CopyToClipboard>
                    </div>
                    <ul className="p-0 mb-0" style={{ listStyle: 'none' }}>
                        {props.classes?.length > 0 && (
                            <li className="mb-1">
                                Instance of:{' '}
                                {props.classes.map((c, index) => (
                                    <Fragment key={index}>
                                        <Link to={getResourceLink(ENTITIES.CLASS, c)} target="_blank">
                                            {c}
                                        </Link>
                                        {index + 1 < props.classes.length && ','}
                                    </Fragment>
                                ))}
                            </li>
                        )}
                    </ul>
                    {props._class !== ENTITIES.LITERAL && (
                        <div>
                            Description:
                            {!isLoading ? (
                                <>
                                    {description ? (
                                        <> {truncate(description, { length: 300 })}</>
                                    ) : (
                                        <small className="font-italic"> No description yet</small>
                                    )}
                                </>
                            ) : (
                                <Icon icon={faSpinner} spin />
                            )}
                        </div>
                    )}
                    {props.extraContent && <div>{props.extraContent}</div>}
                </div>
            }
            delay={[500, 0]}
            appendTo={document.body}
            disabled={props.disabled}
            interactive={true}
            arrow={true}
        >
            <span tabIndex="0">{props.children}</span>
        </Tippy>
    );
};

DescriptionTooltip.propTypes = {
    children: PropTypes.node.isRequired,
    id: PropTypes.string.isRequired,
    _class: PropTypes.string.isRequired,
    classes: PropTypes.array.isRequired,
    extraContent: PropTypes.string,
    disabled: PropTypes.array.isRequired,
};

DescriptionTooltip.defaultProps = {
    disabled: false,
};

export default DescriptionTooltip;
