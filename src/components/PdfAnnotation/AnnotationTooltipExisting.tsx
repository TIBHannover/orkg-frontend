import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { upperFirst } from 'lodash';

import useOntology, { CSVW_TABLE_IRI, SURVEY_TABLES_IRI } from '@/components/PdfAnnotation/hooks/useOntology';

type AnnotationTooltipExistingProps = {
    type?: string;
    id?: string;
    deleteAnnotation: (id: string) => void;
};

const AnnotationTooltipExisting = ({ type, id, deleteAnnotation }: AnnotationTooltipExistingProps) => {
    const { findByType } = useOntology();

    if (!type || !id) {
        return null;
    }

    let label: string;
    if (type === SURVEY_TABLES_IRI) {
        label = 'Survey Table';
    } else if (type === CSVW_TABLE_IRI) {
        label = 'Regular Table';
    } else {
        label = upperFirst(findByType(type)?.label ?? '');
    }

    return (
        <div
            className="flex items-center gap-3 bg-foreground text-background rounded-md px-3 py-2 shadow-md pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
        >
            <span>{label}</span>
            <span className="border-l border-white/20 ps-3">
                <button
                    type="button"
                    aria-label="Delete annotation"
                    className="text-danger hover:opacity-80 cursor-pointer"
                    onClick={() => deleteAnnotation(id ?? '')}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </span>
        </div>
    );
};

export default AnnotationTooltipExisting;
