import References from '@/components/Review/Sections/References/References';

const SectionReferences = () => {
    return (
        <section typeof="doco:Section deo:Reference">
            <h2 id="section-references" className="h4 border-bottom mt-4" typeof="doco:SectionTitle" property="c4o:hasContent">
                References
            </h2>
            <References />
        </section>
    );
};

export default SectionReferences;
