import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React, { useRef, useState } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { createSection } from 'actions/smartReview';
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
    const contributionId = useSelector(state => state.smartReview.contributionId);
    const refToolbar = useRef(null);

    const handleShowToolbar = () => {
        setIsToolbarVisible(true);
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

    useClickAway(refToolbar, () => {
        setIsToolbarVisible(false);
    });

    return (
        <InvisibleByDefault className="d-flex align-items-center justify-content-center add position-relative">
            <AddSectionStyled color="link" className="p-0" onClick={handleShowToolbar}>
                <Icon icon={faPlusCircle} />
            </AddSectionStyled>
            {isToolbarVisible && (
                <Toolbar ref={refToolbar}>
                    <ButtonGroup size="sm">
                        <Button color="dark" onClick={() => handleAddSection('content')}>
                            Content
                        </Button>
                        <Button color="dark" onClick={() => handleAddSection('comparison')}>
                            Comparison
                        </Button>
                        <Button color="dark" onClick={() => handleAddSection('visualization')}>
                            Visualization
                        </Button>
                        <Button color="dark" onClick={() => handleAddSection('resource')}>
                            Resource
                        </Button>
                        <Button color="dark" onClick={() => handleAddSection('property')}>
                            Property
                        </Button>
                        <Button color="dark" onClick={() => handleAddSection('data-table')}>
                            Data table
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
