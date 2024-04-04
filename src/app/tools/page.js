'use client';

import Link from 'components/NextJsMigration/Link';
import AddPaperWizard from 'assets/img/tools/add-paper-wizard.png';
import CsvImport from 'assets/img/tools/csv-import.png';
import PdfSentenceAnnotation from 'assets/img/tools/pdf-sentence-annotation.png';
import SurveyImporter from 'assets/img/tools/survey-importer.png';
import ContributionEditor from 'assets/img/tools/contribution-editor.png';
import ROUTES from 'constants/routes';
import { Container } from 'reactstrap';
import styled from 'styled-components';
import Image from 'components/NextJsMigration/Image';

const ToolsContainer = styled(Container)`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 1340px !important;
    margin-top: 30px;

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
    border-top: 2px solid ${(props) => props.theme.lightDarker};
    border-bottom: 2px solid ${(props) => props.theme.lightDarker};
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const Header = styled.h2`
    font-size: 1.4rem;
    margin: 15px 0;
`;

const Tools = () => (
    <ToolsContainer>
        <ToolContainer href={ROUTES.ADD_PAPER} className="box rounded text-decoration-none">
            <Header>Add paper form</Header>
            <ImgContainer>
                <Image src={AddPaperWizard} style={{ width: '70%', height: 'auto' }} alt="Add paper form preview" />
            </ImgContainer>
            <p className="my-2 px-2">The form guides you through the process of generating structured data for your paper</p>
        </ToolContainer>

        <ToolContainer href={ROUTES.CONTRIBUTION_EDITOR} className="box rounded text-decoration-none">
            <Header>Contribution editor</Header>
            <ImgContainer>
                <Image src={ContributionEditor} style={{ width: '60%', height: 'auto' }} alt="Contribution editor preview" />
            </ImgContainer>
            <p className="my-2 px-2">Create multiple contributions simultaneously and create a comparison from them </p>
        </ToolContainer>

        <ToolContainer href={ROUTES.PDF_TEXT_ANNOTATION} className="box rounded text-decoration-none">
            <Header>PDF sentence annotator</Header>
            <ImgContainer>
                <Image src={PdfSentenceAnnotation} style={{ width: '50%', height: 'auto' }} alt="PDF sentence annotator preview" />
            </ImgContainer>
            <p className="my-2 px-2">Upload your paper as PDF and annotate the most important sentences</p>
        </ToolContainer>

        <ToolContainer href={ROUTES.PDF_ANNOTATION} className="box rounded text-default text-decoration-none">
            <Header>Survey importer</Header>
            <ImgContainer>
                <Image src={SurveyImporter} style={{ width: '70%', height: 'auto' }} alt="Survey importer preview" />
            </ImgContainer>
            <p className="my-2 px-2">Import already existing surveys into the ORKG directly from the PDF article</p>
        </ToolContainer>

        <ToolContainer href={ROUTES.CSV_IMPORT} className="box rounded text-decoration-none">
            <Header>CSV import</Header>
            <ImgContainer>
                <Image src={CsvImport} style={{ width: '60%', height: 'auto' }} alt="CSV import preview" />
            </ImgContainer>
            <p className="my-2 px-2">Import a CSV file containing a list of papers and import them in bulk to ORKG</p>
        </ToolContainer>
    </ToolsContainer>
);

export default Tools;
