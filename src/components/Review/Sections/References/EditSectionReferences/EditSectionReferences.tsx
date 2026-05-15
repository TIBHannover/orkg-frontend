import { SectionStyled, SectionTypeStyled } from '@/components/ArticleBuilder/styled';
import Tooltip from '@/components/FloatingUI/Tooltip';
import References from '@/components/Review/Sections/References/References';

const EditSectionReferences = () => (
    <SectionStyled className="box rounded mb-6">
        <SectionTypeStyled disabled>
            <Tooltip content="The type of the references cannot be changed">
                <span>references</span>
            </Tooltip>
        </SectionTypeStyled>

        <h2 id="section-references" className="text-2xl border-b pb-1 mb-4">
            <Tooltip content="This section is automatically generated, it is not possible to change it">
                <span>References</span>
            </Tooltip>
        </h2>

        <References />
    </SectionStyled>
);

export default EditSectionReferences;
