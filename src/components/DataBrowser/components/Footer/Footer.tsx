import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { useDataBrowserState } from 'components/DataBrowser/context/DataBrowserContext';
import AddProperty from 'components/DataBrowser/components/Footer/AddProperty/AddProperty';
import PropertySuggestions from 'components/DataBrowser/components/Footer/PropertySuggestions/PropertySuggestions';
import SameAsStatements from 'components/DataBrowser/components/Footer/SameAsStatements/SameAsStatements';
import useCanEdit from 'components/DataBrowser/hooks/useCanEdit';
import useEntity from 'components/DataBrowser/hooks/useEntity';
import TemplatesModal from 'components/DataBrowser/components/TemplatesModal/TemplatesModal';
import { ENTITIES } from 'constants/graphSettings';
import { useState } from 'react';
import { Button } from 'reactstrap';

const Footer = () => {
    const { config } = useDataBrowserState();
    const { isEditMode } = config;
    const { canEdit } = useCanEdit();
    const { entity } = useEntity();
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div className="mb-2">
            {canEdit && isEditMode && (
                <div>
                    <div className="d-flex align-items-center">
                        <AddProperty />
                        {canEdit && entity?._class === ENTITIES.RESOURCE && isEditMode && (
                            <>
                                <TemplatesModal isOpen={isOpen} toggle={toggle} />
                                <Button className="ms-1" color="secondary" size="sm" onClick={() => setIsOpen(true)}>
                                    <Icon className="me-1" icon={faPuzzlePiece} /> Templates
                                </Button>
                            </>
                        )}
                    </div>
                    <PropertySuggestions />
                </div>
            )}

            {config.showExternalDescriptions && <SameAsStatements />}
        </div>
    );
};

export default Footer;
