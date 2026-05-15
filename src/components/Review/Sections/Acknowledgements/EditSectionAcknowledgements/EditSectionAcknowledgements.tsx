import { Tooltip } from '@heroui/react';

import { SectionStyled, SectionTypeStyled } from '@/components/ArticleBuilder/styled';
import Acknowledgements from '@/components/Review/Sections/Acknowledgements/Acknowledgements';

const EditSectionAcknowledgements = () => (
    <SectionStyled className="box rounded mb-6">
        <Tooltip>
            <SectionTypeStyled disabled>acknowledgements</SectionTypeStyled>
            <Tooltip.Content>
                <Tooltip.Arrow />
                The type of the acknowledgements cannot be changed
            </Tooltip.Content>
        </Tooltip>

        <h2 id="section-acknowledgements" className="text-2xl border-b pb-1 mb-4">
            <Tooltip>
                <Tooltip.Trigger className="inline-block w-fit">
                    <span>Acknowledgements</span>
                </Tooltip.Trigger>
                <Tooltip.Content>
                    <Tooltip.Arrow />
                    This section is automatically generated, it is not possible to change it
                </Tooltip.Content>
            </Tooltip>
        </h2>

        <Acknowledgements />
    </SectionStyled>
);

export default EditSectionAcknowledgements;
