'use client';

import EditSectionAcknowledgements from 'components/Review/Sections/Acknowledgements/EditSectionAcknowledgements/EditSectionAcknowledgements';
import AddSection from 'components/Review/EditReview/AddSection/AddSection';
import EditMetadata from 'components/Review/EditReview/EditMetadata/EditMetadata';
import SortableSections from 'components/Review/EditReview/SortableSections/SortableSections';
import EditSectionReferences from 'components/Review/Sections/References/EditSectionReferences/EditSectionReferences';
import { Container } from 'reactstrap';

const EditReview = () => {
    return (
        <main
            prefix="doco: http://purl.org/spar/doco/ fabio: http://purl.org/spar/fabio/ deo: http://purl.org/spar/deo/ c4o: http://purl.org/spar/c4o foaf: http://xmlns.com/foaf/0.1/"
            typeof="fabio:ScholarlyWork"
        >
            <header>
                <Container>
                    <EditMetadata />
                </Container>
            </header>
            <AddSection index={0} />
            <SortableSections />
            <Container>
                <EditSectionAcknowledgements />
            </Container>
            <Container>
                <EditSectionReferences />
            </Container>
        </main>
    );
};

export default EditReview;
