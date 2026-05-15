import { faCaretDown, faCaretRight, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '@heroui/react';
import { FC, ReactNode, useState } from 'react';

type RecommendationProps = {
    type: 'issue' | 'success' | string;
    title: string;
    info: string | ReactNode;
    evaluation: string | ReactNode;
    solution: string | ReactNode;
};

const Recommendation: FC<RecommendationProps> = ({ type, title, info, evaluation, solution }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isIssue = type === 'issue';

    return (
        <li className="mb-2">
            <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                aria-expanded={isOpen}
                className={cn(
                    'w-full flex justify-between items-center gap-3 py-2 px-4 rounded text-left transition-colors',
                    isIssue
                        ? 'bg-danger/10 hover:bg-danger/20 text-foreground border border-danger/30'
                        : 'bg-success/10 hover:bg-success/20 text-foreground border border-success/30',
                )}
            >
                <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={isOpen ? faCaretDown : faCaretRight} className="w-3 shrink-0" />
                    <span className="text-sm font-medium">{title}</span>
                </span>
                <FontAwesomeIcon icon={isIssue ? faTimes : faCheck} className={cn('text-lg shrink-0', isIssue ? 'text-danger' : 'text-success')} />
            </button>
            {isOpen && (
                <div className="mt-1 px-4 py-3 bg-surface border border-default rounded">
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                        <dt className="font-semibold text-default-600">Description</dt>
                        <dd className="m-0">{info}</dd>
                        <dt className="font-semibold text-default-600">Evaluation</dt>
                        <dd className="m-0">{evaluation}</dd>
                        <dt className="font-semibold text-default-600">Solution</dt>
                        <dd className="m-0">{solution}</dd>
                    </dl>
                </div>
            )}
        </li>
    );
};

export default Recommendation;
