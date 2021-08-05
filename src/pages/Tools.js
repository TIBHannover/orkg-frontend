import AddPaperWizard from 'assets/img/tools/add-paper-wizard.png';
import CsvImport from 'assets/img/tools/csv-import.png';
import PdfSentenceAnnotation from 'assets/img/tools/pdf-sentence-annotation.png';
import SurveyImporter from 'assets/img/tools/survey-importer.png';
import ContributionEditor from 'assets/img/tools/contribution-editor.png';
import ROUTES from 'constants/routes.js';
import React from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'reactstrap';
import styled from 'styled-components';

const ToolsContainer = styled(Container)`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 1340px !important;
    margin-top: 50px;

    @media (max-width: 768px) {
        margin-top: 0;
        flex-direction: column;
    }
`;

const ToolContainer = styled(Link)`
    flex-grow: 1;
    width: calc(33% - 30px);
    margin: 15px;
    flex-grow: 0;
    display: block;
    text-align: center;
    color: inherit;
    transition: 0.5s opacity;

    &:hover {
        opacity: 0.7;
        color: inherit;
        text-decoration: none;
    }
    @media (max-width: 768px) {
        width: calc(100% - 30px);
    }
`;

const ImgContainer = styled.div`
    border-top: 2px solid ${props => props.theme.lightDarker};
    border-bottom: 2px solid ${props => props.theme.lightDarker};
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Header = styled.h2`
    font-size: 1.4rem;
    margin: 15px 0;
`;

const Tools = () => {
    return (
        <ToolsContainer>
            <ToolContainer to={ROUTES.ADD_PAPER.GENERAL_DATA} className="box rounded">
                <Header>Add paper wizard</Header>
                <ImgContainer>
                    <img src={AddPaperWizard} width="70%" alt="Add paper wizard preview" />
                </ImgContainer>
                <p className="my-2 px-2">The wizard guides you to the process of generating structured data for your paper</p>
            </ToolContainer>

            <ToolContainer to={ROUTES.CONTRIBUTION_EDITOR} className="box rounded">
                <Header>Contribution editor</Header>
                <ImgContainer>
                    <img src={ContributionEditor} width="60%" alt="Add paper wizard preview" />
                </ImgContainer>
                <p className="my-2 px-2">Create multiple contributions simultaneously and create a comparison from them </p>
            </ToolContainer>

            <ToolContainer to={ROUTES.PDF_TEXT_ANNOTATION} className="box rounded">
                <Header>PDF sentence annotator</Header>
                <ImgContainer>
                    <img src={PdfSentenceAnnotation} width="50%" alt="Add paper wizard preview" />
                </ImgContainer>
                <p className="my-2 px-2">Upload your paper as PDF and annotate the most important sentences</p>
            </ToolContainer>

            <ToolContainer to={ROUTES.PDF_ANNOTATION} className="box rounded text-default">
                <Header>Survey importer</Header>
                <ImgContainer>
                    <img src={SurveyImporter} width="70%" alt="Add paper wizard preview" />
                </ImgContainer>
                <p className="my-2 px-2">Import already existing surveys into the ORKG directly from the PDF article</p>
            </ToolContainer>

            <ToolContainer to={ROUTES.CSV_IMPORT} className="box rounded">
                <Header>CSV import</Header>
                <ImgContainer>
                    <img src={CsvImport} width="60%" alt="Add paper wizard preview" />
                </ImgContainer>
                <p className="my-2 px-2">Import a CSV file containing a list of papers and import them in bulk to ORKG</p>
            </ToolContainer>
        </ToolsContainer>
    );
};

export default Tools;
