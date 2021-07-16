import Tippy from '@tippyjs/react';
import ListReferences from 'components/SmartReview/References/ListReferences';
import { SectionStyled, SectionTypeStyled } from 'components/SmartReview/styled';
import React from 'react';

const ReferencesSection = () => {
    return (
        <SectionStyled className="box rounded mb-4">
            <SectionTypeStyled disabled>
                <Tippy hideOnClick={false} content="The type of the references cannot be changed">
                    <span>references</span>
                </Tippy>
            </SectionTypeStyled>

            <h2 id="section-acknowledgements" className="h4 border-bottom pb-1 mb-3">
                <Tippy content="This section is automatically generated, it is not possible to change it">
                    <span>References</span>
                </Tippy>
            </h2>

            <ListReferences />
        </SectionStyled>
    );
};

export default ReferencesSection;
