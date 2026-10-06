import ROUTES from '@/constants/routes';
import { ConversionResult, QuantityUnitItem } from '@/services/qudt/types';

type UcumTransformResponse = { UCUMWebServiceResponse?: { Response?: ConversionResult } } & {
    Response?: ConversionResult;
} & ConversionResult;

export const qudtUnitsUrl = ROUTES.QUDT_UNITS;

export async function getQudtData(): Promise<QuantityUnitItem[]> {
    const response = await fetch(ROUTES.QUDT_UNITS);
    if (!response.ok) {
        throw new Error(`Failed to fetch QUDT units: ${response.status}`);
    }
    return response.json();
}

export async function transformUcum({ quantity, from, to }: { quantity: string; from: string; to: string }): Promise<ConversionResult> {
    const params = new URLSearchParams({ quantity, from, to });
    const response = await fetch(`${ROUTES.UCUM_TRANSFORM}?${params}`);
    if (!response.ok) {
        throw new Error(`Failed to convert ${quantity} from ${from} to ${to}`);
    }
    const result = (await response.json()) as UcumTransformResponse;
    return result?.UCUMWebServiceResponse?.Response || result?.Response || result;
}
