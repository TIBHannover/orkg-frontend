import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { createSection } from 'actions/smartArticle';

const InvisibleByDefault = styled.div`
    button {
        visibility: visible;
    }

    &:hover button {
        visibility: visible;
    }
`;

const AddSectionStyled = styled(Button)`
    color: ${props => props.theme.darkblue}!important;
    font-size: 140% !important;
    margin: 5px 0 !important;
`;

const Toolbar = styled(ButtonGroup)`
    position: absolute !important;
    top: -25px;

    button {
        margin-right: 2px;
    }
`;

const AddSection = props => {
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    const dispatch = useDispatch();
    const contributionId = useSelector(state => state.smartArticle.contributionId);

    const handleShowToolbar = () => {
        setIsToolbarVisible(true);
        // show toolbar
    };

    const handleOutsideClick = () => {
        setIsToolbarVisible(false);
    };

    const handleAddSection = sectionType => {
        setIsToolbarVisible(false);

        dispatch(
            createSection({
                afterIndex: props.index,
                contributionId,
                sectionType
            })
        );
    };

    return (
        <InvisibleByDefault className="d-flex align-items-center justify-content-center add position-relative">
            <AddSectionStyled color="link" className="p-0" onClick={handleShowToolbar}>
                <Icon icon={faPlusCircle} />
            </AddSectionStyled>
            {isToolbarVisible && (
                <OutsideClickHandler onOutsideClick={handleOutsideClick} display="contents">
                    <Toolbar size="sm">
                        <Button color="dark" onClick={() => handleAddSection('content')}>
                            Content
                        </Button>
                        <Button color="dark">Survey</Button>
                        <Button color="dark">Visualization</Button>
                        <Button color="dark">Problem</Button>
                        <Button color="dark">Property</Button>
                        <Button color="dark">Resource</Button>
                    </Toolbar>
                </OutsideClickHandler>
            )}
        </InvisibleByDefault>
    );
};

AddSection.propTypes = {
    index: PropTypes.number.isRequired
};

export default AddSection;
