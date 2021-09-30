import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React, { useRef, useState } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { createSection } from 'actions/literatureList';
import { useClickAway } from 'react-use';

const InvisibleByDefault = styled.div`
    button {
        visibility: visible;
    }

    &:hover button {
        visibility: visible;
    }
`;

const AddSectionStyled = styled(Button)`
    color: ${props => props.theme.secondary}!important;
    font-size: 140% !important;
    margin: 5px 0 !important;
`;

const Toolbar = styled.div`
    position: absolute !important;
    top: -25px;

    button {
        margin-right: 2px;
    }
`;

const AddSection = props => {
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    const dispatch = useDispatch();
    const { id } = useSelector(state => state.literatureList.literatureList);
    const refToolbar = useRef(null);

    const handleShowToolbar = () => {
        setIsToolbarVisible(true);
    };

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
        <InvisibleByDefault className="d-flex align-items-center justify-content-center add position-relative">
            <AddSectionStyled color="link" className="p-0" onClick={handleShowToolbar} aria-label="Add section">
                <Icon icon={faPlusCircle} />
            </AddSectionStyled>
            {isToolbarVisible && (
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
            )}
        </InvisibleByDefault>
    );
};

AddSection.propTypes = {
    index: PropTypes.number.isRequired
};

export default AddSection;
