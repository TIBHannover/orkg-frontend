import { parseUcumTransformResponse, UcumConversionError } from '@/services/qudt/server';

it('normalizes a successful wrapped UCUM response', () => {
    expect(
        parseUcumTransformResponse({
            UCUMWebServiceResponse: {
                Response: {
                    TargetUnit: 'cm',
                    ResultQuantity: 100,
                    SourceUnit: 'm',
                    SourceQuantity: 1,
                },
            },
        }),
    ).toEqual({
        TargetUnit: 'cm',
        ResultQuantity: '100',
        SourceUnit: 'm',
        SourceQuantity: '1',
        error: null,
    });
});

it('rejects UCUM body-level errors instead of treating them as cacheable conversions', () => {
    expect(() =>
        parseUcumTransformResponse({
            UCUMWebServiceResponse: {
                Response: 'ERROR: not-a-number is not a numeric value',
            },
        }),
    ).toThrow(new UcumConversionError('not-a-number is not a numeric value'));
});
