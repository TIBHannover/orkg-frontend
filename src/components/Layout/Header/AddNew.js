import { useRef } from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import ROUTES from 'constants/routes.js';
import PropTypes from 'prop-types';
import Tippy from '@tippyjs/react';
import { animateFill } from 'tippy.js';
import AddPaperWizard from 'assets/img/tools/add-paper-wizard.png';
import ContributionEditor from 'assets/img/tools/contribution-editor.png';
import styled from 'styled-components';

const TippyStyle = styled.div`
    .tippy-box[data-theme~='addNew'] {
        background: #fff !important;
    }
    .tippy-box[data-theme~='addNew'] .tippy-content {
        background-color: #fff !important;
        padding: 0 !important;
        border: 1px solid #d9d9d9 !important;
        border-radius: 4px !important;
    }
    .tippy-box[data-theme~='addNew'] {
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.125) !important;
    }
`;

const ToolContainer = styled(Link)`
    display: block;
    text-align: center;
    color: inherit;
    border-radius: 0;
    border-bottom: 2px solid ${props => props.theme.ultraLightBlueDarker};
    position: relative;
    &:last-of-type {
        border-bottom: 0;
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
    }
    &:first-of-type {
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
    }

    &:hover {
        background-color: ${props => props.theme.ultraLightBlue};
        color: inherit;
        text-decoration: none;
    }
    @media (max-width: 768px) {
        width: calc(100% - 30px);
    }
`;

const ImgContainer = styled.div`
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
`;

const TextContainer = styled.div`
    flex: 2;
    color: #333;
    text-align: left;
    display: flex;
    justify-content: center;
    flex-direction: column;
`;

const Header = styled.h3`
    font-size: 1.2rem;
    text-align: left;
`;

const AddNew = ({ isHomePageStyle }) => {
    const refTippyInstance = useRef();
    const handleClickMenuItem = () => {
        refTippyInstance?.current?.hide();
    };

    return (
        <TippyStyle>
            <Tippy
                interactive={true}
                animateFill={true}
                arrow={false}
                plugins={[animateFill]}
                interactiveBorder={30}
                placement="bottom"
                trigger="click"
                onCreate={instance => (refTippyInstance.current = instance)}
                theme="addNew"
                maxWidth="470px"
                offset={[0, 0]}
                content={
                    <div>
                        <ToolContainer onClick={handleClickMenuItem} to={ROUTES.ADD_COMPARISON} className="d-flex p-2">
                            <ImgContainer>
                                <img src={ContributionEditor} width="90%" alt="Contribution editor preview" />
                            </ImgContainer>
                            <TextContainer className="pl-2 pr-2">
                                <Header>Comparison</Header>
                                <p className="m-0">
                                    Create an overview of state-of-the-art literature for a particular topic by adding multiple contributions
                                    simultaneously.
                                </p>
                            </TextContainer>
                        </ToolContainer>
                        <RequireAuthentication
                            onClick={handleClickMenuItem}
                            component={ToolContainer}
                            to={ROUTES.ADD_PAPER.GENERAL_DATA}
                            className="d-flex p-2"
                        >
                            <ImgContainer>
                                <img src={AddPaperWizard} width="90%" alt="Add paper wizard preview" />
                            </ImgContainer>
                            <TextContainer className="pl-2 pr-2">
                                <Header>Paper</Header>
                                <p className="m-0">The add paper wizard guides you to the process of generating structured data for your paper.</p>
                            </TextContainer>
                        </RequireAuthentication>
                    </div>
                }
            >
                <div className="mr-3 mb-2 mb-md-0">
                    <Button color={!isHomePageStyle ? 'primary' : 'light'}>
                        <FontAwesomeIcon className="mr-1" icon={faPlus} />
                        Add new
                    </Button>
                </div>
            </Tippy>
        </TippyStyle>
    );
};

AddNew.propTypes = {
    isHomePageStyle: PropTypes.bool.isRequired
};

export default AddNew;
