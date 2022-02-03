import Tippy from '@tippyjs/react';
import { SectionStyled } from 'components/ArticleBuilder/styled';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import AddSection from 'components/LiteratureList/AddSection';
import Contributors from 'components/LiteratureList/Contributors';
import EditTitle from 'components/LiteratureList/EditTitle';
import SortableSectionsList from 'components/LiteratureList/SortableSectionsList';
import { Container } from 'reactstrap';

const EditLiteratureList = () => (
    <main>
        <header>
            <Container>
                <EditTitle />
            </Container>
        </header>
        <AddSection index={0} />
        <SortableSectionsList />
        <Container>
            <SectionStyled className="box rounded mb-4">
                <h2 className="h4 border-bottom pb-1 mb-3">
                    <Tippy content="This section is automatically generated, it is not possible to change it">
                        <span>Contributors</span>
                    </Tippy>
                </h2>

                <Contributors />
            </SectionStyled>
        </Container>
        <ComparisonPopup />
    </main>
);

export default EditLiteratureList;
