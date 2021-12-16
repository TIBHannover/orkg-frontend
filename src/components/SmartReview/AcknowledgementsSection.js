import Tippy from '@tippyjs/react';
import Acknowledgements from 'components/SmartReview/Acknowledgements';
import { SectionStyled, SectionTypeStyled } from 'components/ArticleBuilder/styled';
import React from 'react';

const AcknowledgementsSection = () => {
    return (
        <SectionStyled className="box rounded mb-4">
            <SectionTypeStyled disabled>
                <Tippy hideOnClick={false} content="The type of the acknowledgements cannot be changed">
                    <span>acknowledgements</span>
                </Tippy>
            </SectionTypeStyled>

            <h2 id="section-acknowledgements" className="h4 border-bottom pb-1 mb-3">
                <Tippy content="This section is automatically generated, it is not possible to change it">
                    <span>Acknowledgements</span>
                </Tippy>
            </h2>

            <Acknowledgements />
        </SectionStyled>
    );
};

export default AcknowledgementsSection;
