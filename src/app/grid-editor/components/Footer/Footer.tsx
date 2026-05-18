import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '@heroui/react';
import { AgGridReact } from 'ag-grid-react';
import { RefObject, useState } from 'react';

import AddProperty from '@/app/grid-editor/components/Footer/AddProperty/AddProperty';
import PropertySuggestions from '@/app/grid-editor/components/Footer/PropertySuggestions/PropertySuggestions';
import TemplatesModal from '@/app/grid-editor/components/TemplatesModal/TemplatesModal';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import { ENTITIES } from '@/constants/graphSettings';
import { Thing } from '@/services/backend/things';

type FooterProps = {
    gridRef: RefObject<AgGridReact | null>;
};

const Footer = ({ gridRef }: FooterProps) => {
    const { entities } = useEntities();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="mb-2">
            <div>
                <div className="flex items-center w-[40%]">
                    <AddProperty />
                    {entities?.every((entity: Thing) => entity._class === ENTITIES.RESOURCE) && (
                        <>
                            <TemplatesModal isOpen={isOpen} toggle={() => setIsOpen((v) => !v)} />
                            <Button variant="secondary" size="sm" className="ml-1 button--orkg-secondary" onPress={() => setIsOpen(true)}>
                                <FontAwesomeIcon className="mr-1" icon={faPuzzlePiece} /> Templates
                            </Button>
                        </>
                    )}
                </div>
                <PropertySuggestions />
            </div>
        </div>
    );
};

export default Footer;
