import { faEllipsisH, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AddPaperWizard from 'assets/img/tools/add-paper-wizard.png';
import ContributionEditor from 'assets/img/tools/contribution-editor.png';
import Popover from 'components/FloatingUI/Popover';
import RequireAuthentication from 'components/RequireAuthentication/RequireAuthentication';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import Image from 'next/image';
import Link from 'next/link';
import { FC, useState } from 'react';
import { Button } from 'reactstrap';
import styled from 'styled-components';

const LabelStyled = styled.span`
    @media (max-width: ${(props) => props.theme.gridBreakpoints.lg}) {
        display: none;
    }
`;

const ToolContainer = styled(Link)`
    display: block;
    text-align: center;
    color: inherit;
    border-radius: 0;
    border-bottom: 2px solid ${(props) => props.theme.lightDarker};
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
        background-color: ${(props) => props.theme.lightLighter};
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

type AddNewProps = {
    isHomePageStyle: boolean;
    onAdd: (() => void) | null;
};

const AddNew: FC<AddNewProps> = ({ isHomePageStyle, onAdd = null }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleClickMenuItem = () => {
        setIsOpen(false);
        onAdd?.();
    };

    return (
        <Popover
            showArrow={false}
            open={isOpen}
            onOpenChange={setIsOpen}
            placement="bottom"
            contentStyle={{ maxWidth: '470px', padding: 0, background: '#fff', boxShadow: '0 0 8px rgba(0, 0, 0, 0.125)' }}
            content={
                <div style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}>
                    <ToolContainer onClick={handleClickMenuItem} href={ROUTES.ADD_COMPARISON} className="d-flex p-2">
                        <ImgContainer>
                            <Image src={ContributionEditor} style={{ width: '90%', height: 'auto' }} alt="Contribution editor preview" />
                        </ImgContainer>
                        <TextContainer className="ps-2 pe-2">
                            <Header>Comparison</Header>
                            <p className="m-0">
                                Create an overview of state-of-the-art literature for a particular topic by adding multiple contributions
                                simultaneously.
                            </p>
                        </TextContainer>
                    </ToolContainer>
                    <RequireAuthentication onClick={handleClickMenuItem} component={ToolContainer} href={ROUTES.ADD_PAPER} className="d-flex p-2">
                        <ImgContainer>
                            <Image src={AddPaperWizard} style={{ width: '90%', height: 'auto' }} alt="Add paper wizard preview" />
                        </ImgContainer>
                        <TextContainer className="ps-2 pe-2">
                            <Header>Paper</Header>
                            <p className="m-0">The add paper form guides you to the process of generating structured data for your paper.</p>
                        </TextContainer>
                    </RequireAuthentication>
                    <RequireAuthentication
                        onClick={handleClickMenuItem}
                        component={ToolContainer}
                        href={reverse(ROUTES.CONTENT_TYPE_NEW_NO_TYPE)}
                        className="d-flex p-2"
                    >
                        <ImgContainer>
                            <FontAwesomeIcon className="text-secondary" icon={faEllipsisH} style={{ fontSize: 40 }} />
                        </ImgContainer>
                        <TextContainer className="ps-2 pe-2">
                            <Header>Other</Header>
                            <p className="m-0">Add other artifacts, such as datasets, software or general resources.</p>
                        </TextContainer>
                    </RequireAuthentication>
                </div>
            }
        >
            <div className="mx-2 mb-2 mb-md-0 flex-shrink-0" id="tour-add-paper">
                <Button onClick={() => setIsOpen((v) => !v)} color={!isHomePageStyle ? 'primary' : 'light'} className="px-3">
                    <FontAwesomeIcon className="me-1" icon={faPlus} />
                    <LabelStyled>Add new</LabelStyled>
                </Button>
            </div>
        </Popover>
    );
};

export default AddNew;
