import Tippy from '@tippyjs/react';
import Acknowledgements from 'components/Review/Sections/Acknowledgements/Acknowledgements';

const SectionAcknowledgements = () => {
    return (
        <section typeof="doco:Section deo:Acknowledgements">
            <h2 id="section-acknowledgements" className="h4 border-bottom mt-5" typeof="doco:SectionTitle" property="c4o:hasContent">
                <Tippy content="Acknowledgements are automatically generated based on ORKG users that contributed to resources used in this article">
                    <span>Acknowledgements</span>
                </Tippy>
            </h2>
            <Acknowledgements />
        </section>
    );
};

export default SectionAcknowledgements;
