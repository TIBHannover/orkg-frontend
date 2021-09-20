import { Button } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPlus, faSpinner } from '@fortawesome/free-solid-svg-icons';
import TemplateDetailsTooltip from './TemplateDetailsTooltip';
import { fillResourceWithTemplate } from 'actions/statementBrowser';
import { getTemplateById } from 'services/backend/statements';
import { useDispatch } from 'react-redux';
import Tippy from '@tippyjs/react';
import { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const IconWrapper = styled.span`
    background-color: #d1d5e4;
    position: absolute;
    left: 0;
    height: 100%;
    top: 0;
    width: 28px;
    border-radius: inherit;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${props => props.theme.secondary};
    padding-left: 3px;
`;

const Label = styled.div`
    padding-left: 28px;
`;

const AddTemplateButton = props => {
    const [isAdding, setIsAdding] = useState(false);
    const ref = useRef(null);
    const dispatch = useDispatch();
    const [template, setTemplate] = useState({});
    const [isTemplateLoading, setIsTemplateLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const addTemplate = useCallback(() => {
        setIsAdding(true);
        dispatch(
            fillResourceWithTemplate({
                templateID: props.id,
                resourceId: props.resourceId,
                syncBackend: props.syncBackend
            })
        ).then(() => {
            ref.current?.removeAttribute('disabled');
            setIsAdding(false);
        });
    }, [dispatch, props.id, props.resourceId, props.syncBackend]);

    const onTrigger = useCallback(() => {
        if (!isLoaded) {
            setIsTemplateLoading(true);
            getTemplateById(props.id).then(template => {
                setTemplate(template);
                setIsLoaded(true);
                setIsTemplateLoading(false);
            });
        }
    }, [isLoaded, props.id]);

    return (
        <Tippy
            onTrigger={onTrigger}
            interactive={true}
            content={<TemplateDetailsTooltip id={props.id} source={props.source} isTemplateLoading={isTemplateLoading} template={template} />}
        >
            <span tabIndex="0">
                <Button
                    innerRef={ref}
                    onClick={() => {
                        ref.current.setAttribute('disabled', 'disabled');
                        addTemplate();
                    }}
                    size="sm"
                    color="light"
                    className="mr-2 mb-2 position-relative px-3 rounded-pill border-0"
                >
                    <IconWrapper>
                        {!isAdding && <Icon size="sm" icon={faPlus} />}
                        {isAdding && <Icon icon={faSpinner} spin />}
                    </IconWrapper>
                    <Label>{props.label}</Label>
                </Button>
            </span>
        </Tippy>
    );
};

AddTemplateButton.propTypes = {
    resourceId: PropTypes.string, // The resource to prefill with the template
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    source: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    syncBackend: PropTypes.bool.isRequired,
    tippyTarget: PropTypes.object
};

AddTemplateButton.defaultProps = {
    label: '',
    syncBackend: false
};

export default AddTemplateButton;
