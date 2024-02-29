export type SimilarPaper = {
    comparison_id: string;
    score: number | Float32Array;
    title: string;
    abstract?: string | null;
};
