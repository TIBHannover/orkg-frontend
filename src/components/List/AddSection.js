import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React, { useRef, useState } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useClickAway } from 'react-use';
import { createSection } from 'slices/listSlice';
import { CSSTransition } from 'react-transition-group';

const AddSectionStyled = styled(Button)`
    color: ${props => props.theme.secondary}!important;
    font-size: 140% !important;
    margin: 5px 0 !important;
    animation: 0.3s ease-out 0s 1 slideDown;

    @keyframes slideDown {
        0% {
            max-height: 0;
            margin: 0;
            opacity: 0;
        }
        100% {
            max-height: 50px;
            margin: 5px 0 !important;
            opacity: 1;
        }
    }
`;

const Toolbar = styled.div`
    position: absolute !important;
    top: -25px;

    button {
        margin-right: 2px;
    }
`;

const AnimationContainer = styled(CSSTransition)`
    &.opacity-enter {
        opacity: 0;
    }

    &.opacity-enter.opacity-enter-active,
    &.opacity-exit {
        transition: 0.2s ease-out;
        opacity: 1;
    }

    &.opacity-exit.opacity-exit-active {
        transition: 0.2s ease-in;
        opacity: 0;
    }
`;

const AddSection = props => {
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    const dispatch = useDispatch();
    const { id } = useSelector(state => state.list.list);
    const refToolbar = useRef(null);

    const handleAddSection = sectionType => {
        setIsToolbarVisible(false);

        dispatch(
            createSection({
                afterIndex: props.index,
                listId: id,
                sectionType
            })
        );
    };

    useClickAway(refToolbar, () => {
        setIsToolbarVisible(false);
    });

    return (
        <div className="d-flex align-items-center justify-content-center add position-relative">
            <AddSectionStyled color="link" className="p-0" onClick={() => setIsToolbarVisible(v => !v)} aria-label="Add section">
                <Icon icon={faPlusCircle} />
            </AddSectionStyled>
            <AnimationContainer in={isToolbarVisible} unmountOnExit classNames="opacity" timeout={{ enter: 800, exit: 800 }}>
                <Toolbar ref={refToolbar}>
                    <ButtonGroup size="sm">
                        <Button color="dark" onClick={() => handleAddSection('text')}>
                            Text
                        </Button>
                        <Button color="dark" onClick={() => handleAddSection('list')}>
                            List
                        </Button>
                    </ButtonGroup>
                </Toolbar>
            </AnimationContainer>
        </div>
    );
};

AddSection.propTypes = {
    index: PropTypes.number.isRequired
};

export default AddSection;
