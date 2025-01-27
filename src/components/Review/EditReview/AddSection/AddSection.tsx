import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useReview from 'components/Review/hooks/useReview';
import { FC, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import { Button, ButtonGroup } from 'reactstrap';
import { ReviewSectionType } from 'services/backend/types';
import styled from 'styled-components';

const InvisibleByDefault = styled.div`
    button {
        visibility: visible;
    }

    &:hover button {
        visibility: visible;
    }
`;

const AddSectionStyled = styled(Button)`
    color: ${(props) => props.theme.secondary}!important;
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

type AddSectionProps = {
    index: number;
};

const AddSection: FC<AddSectionProps> = ({ index }) => {
    const [isToolbarVisible, setIsToolbarVisible] = useState(false);
    const refToolbar = useRef(null);
    const { createSection } = useReview();

    const handleShowToolbar = () => {
        setIsToolbarVisible(true);
    };

    const handleAddSection = (sectionType: ReviewSectionType) => {
        setIsToolbarVisible(false);
        createSection({
            atIndex: index,
            sectionType,
        });
    };

    useClickAway(refToolbar, () => {
        setIsToolbarVisible(false);
    });

    return (
        <InvisibleByDefault className="d-flex align-items-center justify-content-center add position-relative">
            <AddSectionStyled color="link" className="p-0" onClick={handleShowToolbar} aria-label="Add section">
                <FontAwesomeIcon icon={faPlusCircle} />
            </AddSectionStyled>
            {isToolbarVisible && (
                <Toolbar ref={refToolbar}>
                    <ButtonGroup size="sm">
                        <Button color="dark" onClick={() => handleAddSection('text')}>
                            Text
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
                        <Button color="dark" onClick={() => handleAddSection('ontology')}>
                            Ontology
                        </Button>
                    </ButtonGroup>
                </Toolbar>
            )}
        </InvisibleByDefault>
    );
};

export default AddSection;
