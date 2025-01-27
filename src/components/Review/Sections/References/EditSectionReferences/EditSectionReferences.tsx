import Tippy from '@tippyjs/react';
import References from 'components/Review/Sections/References/References';
import { SectionStyled, SectionTypeStyled } from 'components/ArticleBuilder/styled';

const EditSectionReferences = () => (
    <SectionStyled className="box rounded mb-4">
        <SectionTypeStyled disabled>
            <Tippy hideOnClick={false} content="The type of the references cannot be changed">
                <span>references</span>
            </Tippy>
        </SectionTypeStyled>

        <h2 id="section-references" className="h4 border-bottom pb-1 mb-3">
            <Tippy content="This section is automatically generated, it is not possible to change it">
                <span>References</span>
            </Tippy>
        </h2>

        <References />
    </SectionStyled>
);

export default EditSectionReferences;
