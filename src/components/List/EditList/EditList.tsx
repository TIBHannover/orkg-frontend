import { SectionStyled } from 'components/ArticleBuilder/styled';
import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import Tooltip from 'components/FloatingUI/Tooltip';
import Contributors from 'components/List/Contributors/Contributors';
import AddSection from 'components/List/EditList/AddSection/AddSection';
import EditMetadata from 'components/List/EditList/EditMetadata/EditMetadata';
import SortableSectionsList from 'components/List/EditList/SortableSectionsList/SortableSectionsList';
import { Container } from 'reactstrap';

const EditList = () => (
    <main>
        <header>
            <Container className="p-0">
                <EditMetadata />
            </Container>
        </header>
        <AddSection index={0} />
        <SortableSectionsList />
        <Container className="p-0">
            <SectionStyled className="box rounded mb-4">
                <h2 className="h4 border-bottom pb-1 mb-3">
                    <Tooltip content="This section is automatically generated, it is not possible to change it">
                        <span>Contributors</span>
                    </Tooltip>
                </h2>

                <Contributors />
            </SectionStyled>
        </Container>
        <ComparisonPopup />
    </main>
);

export default EditList;
