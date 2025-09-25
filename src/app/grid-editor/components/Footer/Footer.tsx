import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AgGridReact } from 'ag-grid-react';
import { RefObject, useState } from 'react';

import AddProperty from '@/app/grid-editor/components/Footer/AddProperty/AddProperty';
import PropertySuggestions from '@/app/grid-editor/components/Footer/PropertySuggestions/PropertySuggestions';
import TemplatesModal from '@/app/grid-editor/components/TemplatesModal/TemplatesModal';
import useEntities from '@/app/grid-editor/hooks/useEntities';
import Button from '@/components/Ui/Button/Button';
import { ENTITIES } from '@/constants/graphSettings';
import { Thing } from '@/services/backend/things';

type FooterProps = {
    gridRef: RefObject<AgGridReact | null>;
};

const Footer = ({ gridRef }: FooterProps) => {
    const { entities } = useEntities();
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div className="tw:mb-2">
            <div>
                <div className="tw:flex tw:items-center tw:w-[40%]">
                    <AddProperty />
                    {entities?.every((entity: Thing) => entity._class === ENTITIES.RESOURCE) && (
                        <>
                            <TemplatesModal isOpen={isOpen} toggle={toggle} />
                            <Button className="tw:ml-1!" color="secondary" size="sm" onClick={() => setIsOpen(true)}>
                                <FontAwesomeIcon className="tw:mr-1" icon={faPuzzlePiece} /> Templates
                            </Button>
                        </>
                    )}
                </div>
                <PropertySuggestions gridRef={gridRef} />
            </div>
        </div>
    );
};

export default Footer;
