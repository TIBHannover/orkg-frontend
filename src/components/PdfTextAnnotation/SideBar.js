import React from 'react';
import styled from 'styled-components';
import useOntology from 'components/PdfTextAnnotation/hooks/useOntology';
import { upperFirst } from 'lodash';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faHeart } from '@fortawesome/free-solid-svg-icons';
import Tippy from '@tippy.js/react';
import { Button } from 'reactstrap';
import { useSelector } from 'react-redux';
import { filter } from 'lodash';
import AnnotationCategory from 'components/PdfTextAnnotation/AnnotationCategory';

const SideBarStyled = styled.div`
    height: calc(100vh - 73px);
    width: 380px;
    background: #cccfdd;
    padding: 0 15px 30px;
    overflow-y: auto;
`;

// Just having some fun here :) can be removed during release
const HeartsAreRed = styled.div`
    &:hover svg {
        color: red;
    }
    svg {
        transition: 0.5s;
    }
`;

const SideBar = props => {
    const { recommendedClasses, nonRecommendedClasses } = useOntology();

    return (
        <SideBarStyled>
            <div className="d-flex justify-content-between align-items-center">
                <h1 className="h4 mt-4 mb-4">Paper annotator</h1>
                <Button color="primary">Save</Button>
            </div>

            {recommendedClasses.map(className => (
                <AnnotationCategory className={className} hideEmpty={false} />
            ))}

            <hr />

            {nonRecommendedClasses.map(className => (
                <AnnotationCategory className={className} hideEmpty={true} />
            ))}

            <HeartsAreRed className="text-center pt-3">
                Made with <Icon icon={faHeart} /> in Hannover
            </HeartsAreRed>
        </SideBarStyled>
    );
};

export default SideBar;
