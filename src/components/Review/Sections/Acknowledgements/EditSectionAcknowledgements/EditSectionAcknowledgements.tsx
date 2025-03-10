import { SectionStyled, SectionTypeStyled } from 'components/ArticleBuilder/styled';
import Tooltip from 'components/FloatingUI/Tooltip';
import Acknowledgements from 'components/Review/Sections/Acknowledgements/Acknowledgements';

const EditSectionAcknowledgements = () => (
    <SectionStyled className="box rounded mb-4">
        <SectionTypeStyled disabled>
            <Tooltip content="The type of the acknowledgements cannot be changed">
                <span>acknowledgements</span>
            </Tooltip>
        </SectionTypeStyled>

        <h2 id="section-acknowledgements" className="h4 border-bottom pb-1 mb-3">
            <Tooltip content="This section is automatically generated, it is not possible to change it">
                <span>Acknowledgements</span>
            </Tooltip>
        </h2>

        <Acknowledgements />
    </SectionStyled>
);

export default EditSectionAcknowledgements;
