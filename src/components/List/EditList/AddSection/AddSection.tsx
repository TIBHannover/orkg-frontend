import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import { FC, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import styled from 'styled-components';

import useList from '@/components/List/hooks/useList';
import Button from '@/components/Ui/Button/Button';
import ButtonGroup from '@/components/Ui/Button/ButtonGroup';
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
    left: 50%;
    transform: translateX(-50%);
    button {
        margin-right: 2px;
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
            <AnimatePresence>
                {isToolbarVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddSection;
