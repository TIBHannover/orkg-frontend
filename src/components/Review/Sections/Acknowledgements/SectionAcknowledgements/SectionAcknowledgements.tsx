import { Tooltip } from '@heroui/react';

import Acknowledgements from '@/components/Review/Sections/Acknowledgements/Acknowledgements';

const SectionAcknowledgements = () => {
    return (
        <section typeof="doco:Section deo:Acknowledgements">
            <h2 id="section-acknowledgements" className="text-2xl border-b mt-12" typeof="doco:SectionTitle" property="c4o:hasContent">
                <Tooltip>
                    <Tooltip.Trigger className="inline-block w-fit">
                        <span>Acknowledgements</span>
                    </Tooltip.Trigger>
                    <Tooltip.Content className="max-w-[300px]">
                        <Tooltip.Arrow />
                        Acknowledgements are automatically generated based on ORKG users that contributed to resources used in this article
                    </Tooltip.Content>
                </Tooltip>
            </h2>
            <Acknowledgements />
        </section>
    );
};

export default SectionAcknowledgements;
