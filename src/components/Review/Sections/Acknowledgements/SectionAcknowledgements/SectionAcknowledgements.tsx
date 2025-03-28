import Tooltip from '@/components/FloatingUI/Tooltip';
import Acknowledgements from '@/components/Review/Sections/Acknowledgements/Acknowledgements';

const SectionAcknowledgements = () => {
    return (
        <section typeof="doco:Section deo:Acknowledgements">
            <h2 id="section-acknowledgements" className="h4 border-bottom mt-5" typeof="doco:SectionTitle" property="c4o:hasContent">
                <Tooltip
                    content="Acknowledgements are automatically generated based on ORKG users that contributed to resources used in this article"
                    contentStyle={{ maxWidth: '300px' }}
                >
                    <span>Acknowledgements</span>
                </Tooltip>
            </h2>
            <Acknowledgements />
        </section>
    );
};

export default SectionAcknowledgements;
