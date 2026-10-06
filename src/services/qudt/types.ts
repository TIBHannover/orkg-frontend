export type ConversionResult = {
    sourceKey?: string;
    TargetUnit: string;
    ResultQuantity: string | null;
    SourceUnit: string | null;
    SourceQuantity: string | null;
    error?: string | null;
};

export type QuantityUnitItem = {
    quantityKindLabel: string;
    id: string;
    label?: string;
    ucum?: string | null;
};
