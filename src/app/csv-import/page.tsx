'use client';

import { useEffect, useState } from 'react';

import CsvImport from '@/app/csv-import/CSVImport';
import requireAuthentication from '@/requireAuthentication';

const CsvImportPage = () => {
    const [data, setData] = useState<string[][]>([]);

    useEffect(() => {
        document.title = 'CSV import - ORKG';
    }, []);

    return (
        <div>
            <CsvImport data={data} setData={setData} onFinish={() => {}} showUploadForm />
        </div>
    );
};

export default requireAuthentication(CsvImportPage);
