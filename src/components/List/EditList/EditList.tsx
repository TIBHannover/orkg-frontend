import { SectionStyled } from '@/components/ArticleBuilder/styled';
import Tooltip from '@/components/FloatingUI/Tooltip';
import Contributors from '@/components/List/Contributors/Contributors';
import AddSection from '@/components/List/EditList/AddSection/AddSection';
import EditMetadata from '@/components/List/EditList/EditMetadata/EditMetadata';
import SortableSectionsList from '@/components/List/EditList/SortableSectionsList/SortableSectionsList';
import Container from '@/components/Ui/Structure/Container';

const EditList = () => (
    <div>
        <header>
            <Container>
                <EditMetadata />
            </Container>
        </header>
        <AddSection index={0} />
        <SortableSectionsList />
        <Container>
            <SectionStyled className="box rounded mb-6">
                <h2 className="text-2xl border-b pb-1 mb-4">
                    <Tooltip content="This section is automatically generated, it is not possible to change it">
                        <span>Contributors</span>
                    </Tooltip>
                </h2>

                <Contributors />
            </SectionStyled>
        </Container>
    </div>
);

export default EditList;
