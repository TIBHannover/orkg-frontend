import Link from 'next/link';

import useReview from '@/components/Review/hooks/useReview';
import useScroll from '@/components/Review/hooks/useScroll';

const Outline = ({ editMode = false }: { editMode?: boolean }) => {
    useScroll();
    const { review } = useReview();

    if (!review) {
        return null;
    }

    return (
        <aside className="absolute left-[-188px] h-full max-[1750px]:hidden">
            <div
                className={[
                    'sticky bottom-[250px] top-[150px] mb-[50px] w-[200px] overflow-y-auto bg-surface-tertiary p-[10px]',
                    'max-h-[calc(100vh-190px)] [&_a:focus]:!text-secondary',
                    editMode ? 'mt-0 rounded-md' : 'mt-[150px] rounded-l-md',
                ].join(' ')}
            >
                <ol className="m-0 list-none p-0">
                    {review.sections
                        .filter((section) => section.heading)
                        .map((section) => (
                            <li
                                key={section.id}
                                className="border-t border-[var(--border)] py-[5px] text-[95%] first:border-t-0 [&_a]:text-[var(--muted)]"
                            >
                                <Link href={`#section-${section.id}`} scroll={false}>
                                    {section.heading}
                                </Link>
                            </li>
                        ))}
                    <li className="border-t border-[var(--border)] py-[5px] text-[95%] [&_a]:text-[var(--muted)]">
                        <Link href="#section-acknowledgements">Acknowledgements</Link>
                    </li>
                    <li className="border-t border-[var(--border)] py-[5px] text-[95%] [&_a]:text-[var(--muted)]">
                        <Link href="#section-references">References</Link>
                    </li>
                </ol>
            </div>
        </aside>
    );
};

export default Outline;
