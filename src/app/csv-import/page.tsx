'use client';

import { useSearchParams } from 'next/navigation';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';

import CsvImport from '@/app/csv-import/CSVImport';
import requireAuthentication from '@/requireAuthentication';
import { getAiJobResultCsv } from '@/services/agenticLoop/api';

const CsvImportPage = () => {
    const [data, setData] = useState<string[][]>([]);
    const searchParams = useSearchParams();
    const aiJobId = searchParams.get('aiJobId');

    const [isLoadingAi, setIsLoadingAi] = useState<boolean>(!!aiJobId);
    const [aiError, setAiError] = useState<string | null>(null);

    useEffect(() => {
        document.title = 'CSV import - ORKG';
    }, []);

    useEffect(() => {
        if (!aiJobId) {
            return undefined;
        }
        let cancelled = false;
        const loadCsv = async () => {
            try {
                const text = await getAiJobResultCsv(aiJobId);
                Papa.parse<string[]>(text, {
                    header: false,
                    skipEmptyLines: true,
                    transformHeader: (header) => header.trim(),
                    transform: (value) => value.trim(),
                    complete: (results) => {
                        if (cancelled) return;
                        setData(results.data as string[][]);
                        setIsLoadingAi(false);
                    },
                    error: (error: Error) => {
                        if (cancelled) return;
                        setAiError(error.message);
                        setIsLoadingAi(false);
                    },
                });
            } catch (error) {
                if (cancelled) return;
                setAiError(error instanceof Error ? error.message : 'Failed to load CSV');
                setIsLoadingAi(false);
            }
        };
        loadCsv();

        return () => {
            cancelled = true;
        };
    }, [aiJobId]);

    if (isLoadingAi) {
        return <div className="p-6">Loading CSV from AI comparison creator...</div>;
    }

    if (aiError) {
        return <div className="alert alert-danger m-3">{aiError}</div>;
    }

    return (
        <div>
            <CsvImport data={data} setData={setData} onFinish={() => {}} showUploadForm={!aiJobId} />
        </div>
    );
};

export default requireAuthentication(CsvImportPage);
