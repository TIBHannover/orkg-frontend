import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FC } from 'react';
import { Button, Input, InputGroup } from 'reactstrap';

type ReferenceItemProps = {
    reference: {
        id: string;
        text: string;
    };
    onDelete: (id: string) => void;
    onChange: ({ id, text }: { id: string; text: string }) => void;
};

const ReferenceItem: FC<ReferenceItemProps> = ({ reference, onDelete, onChange }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: reference.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <InputGroup className="mb-1">
                <Button
                    color="light"
                    {...attributes}
                    {...listeners}
                    className="ps-3 pe-3"
                    style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, cursor: 'move' }}
                >
                    <FontAwesomeIcon icon={faBars} />
                </Button>
                <Input
                    type="text"
                    value={reference.text}
                    onChange={(e) => onChange({ id: reference.id, text: e.target.value })}
                    placeholder='E.g. Vaswani, A. "Attention is all you need." (2017)'
                />
                <Button
                    color="light"
                    className="ps-3 pe-3"
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    onClick={() => onDelete(reference.id)}
                >
                    <FontAwesomeIcon icon={faTimes} />
                </Button>
            </InputGroup>
        </div>
    );
};

export default ReferenceItem;
