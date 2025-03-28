import { SectionStyled, SectionTypeStyled } from '@/components/ArticleBuilder/styled';
import Tooltip from '@/components/FloatingUI/Tooltip';
import References from '@/components/Review/Sections/References/References';

const EditSectionReferences = () => (
    <SectionStyled className="box rounded mb-4">
        <SectionTypeStyled disabled>
            <Tooltip content="The type of the references cannot be changed">
                <span>references</span>
            </Tooltip>
        </SectionTypeStyled>

        <h2 id="section-references" className="h4 border-bottom pb-1 mb-3">
            <Tooltip content="This section is automatically generated, it is not possible to change it">
                <span>References</span>
            </Tooltip>
        </h2>

        <References />
    </SectionStyled>
);

export default EditSectionReferences;
