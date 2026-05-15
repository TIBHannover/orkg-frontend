import References from '@/components/Review/Sections/References/References';

const SectionReferences = () => {
    return (
        <section typeof="doco:Section deo:Reference">
            <h2 id="section-references" className="text-2xl border-b mt-6" typeof="doco:SectionTitle" property="c4o:hasContent">
                References
            </h2>
            <References />
        </section>
    );
};

export default SectionReferences;
