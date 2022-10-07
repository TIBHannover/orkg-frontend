import ComparisonPopup from 'components/ComparisonPopup/ComparisonPopup';
import ResourceHeader from 'components/Usage/ResourceHeader';
import ResourceUsage from 'components/Usage/ResourceUsage';
import { useParams } from 'react-router-dom';

const UsagePage = () => {
    const { id } = useParams();

    return (
        <>
            <div>
                <ResourceHeader id={id} />
                <ResourceUsage id={id} />
                <ComparisonPopup />
            </div>
        </>
    );
};

export default UsagePage;
