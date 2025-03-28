import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { uniqueId } from 'lodash';
import { FC, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import { useClickAway } from 'react-use';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';

import useList from '@/components/List/hooks/useList';
import { LiteratureListSectionType } from '@/services/backend/types';

const AddSectionStyled = styled(Button)`
    color: ${(props) => props.theme.secondary}!important;
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

type AddSectionProps = {
    index: number;
};

const AddSection: FC<AddSectionProps> = ({ index }) => {
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    const { list, createSection } = useList();
    const refToolbar = useRef(null);

    useClickAway(refToolbar, () => {
        setIsToolbarVisible(false);
    });

    if (!list) {
        return null;
    }

    const handleAddSection = async (sectionType: LiteratureListSectionType) => {
        setIsToolbarVisible(false);
        createSection({ sectionType, atIndex: index });
    };

    return (
        <div className="d-flex align-items-center justify-content-center add position-relative">
            <AddSectionStyled color="link" className="p-0" onClick={() => setIsToolbarVisible((v) => !v)} aria-label="Add section">
                <FontAwesomeIcon icon={faPlusCircle} />
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

export default AddSection;
