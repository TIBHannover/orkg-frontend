import { Button, Modal, toast } from '@heroui/react';
import { FC, useState } from 'react';
import { useCSVReader } from 'react-papaparse';

import ButtonWithLoading from '@/components/ButtonWithLoading/ButtonWithLoading';
import { PREDICATES } from '@/constants/graphSettings';
import { createLiteral } from '@/services/backend/literals';
import { createResource, getResource } from '@/services/backend/resources';
import { createLiteralStatement } from '@/services/backend/statements';

type ImportCSVInstancesProps = {
    showDialog: boolean;
    toggle: () => void;
    classId: string;
    callBack: () => void;
};

type CSVRow = string[];

const PARSER_OPTIONS = { header: false, skipEmptyLines: true };

const ImportCSVInstances: FC<ImportCSVInstancesProps> = ({ showDialog, toggle, classId, callBack }) => {
    const [data, setData] = useState<CSVRow[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const { CSVReader } = useCSVReader();

    const handleOnFileLoad = (rows: CSVRow[]) => {
        if (!rows || rows.length === 0 || rows[0].length !== 2 || rows[0][0].toLowerCase() !== 'label' || rows[0][1].toLowerCase() !== 'uri') {
            toast.danger('Please upload a CSV file that has only two columns: Label and URI');
            setData([]);
        } else {
            setData(rows);
        }
    };

    const handleImport = async () => {
        if (data.length < 2) return;
        setIsImporting(true);
        try {
            const instances = await Promise.all(data.slice(1).map((r) => createResource({ label: r[0], classes: [classId] }).then(getResource)));
            await Promise.all(
                instances.map((newResource, index) => {
                    const uri = data[index + 1][1];
                    if (!uri) return Promise.resolve();
                    return createLiteral(uri).then((literalId) => createLiteralStatement(newResource.id, PREDICATES.URL, literalId));
                }),
            );
            toast.success(`${data.length - 1} instances imported successfully`);
            callBack();
            setData([]);
            toggle();
        } catch {
            toast.danger('Something went wrong when importing instances');
            setData([]);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Modal.Backdrop isOpen={showDialog} onOpenChange={(open) => !open && toggle()}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Import instances</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                        <p className="m-0">
                            Please import your CSV file that has two columns: <b>Label</b> and <b>URI</b> using the form below.
                        </p>
                        <div className="mt-4">
                            <CSVReader
                                accept=".csv, text/csv"
                                config={PARSER_OPTIONS}
                                onUploadAccepted={(result: { data: CSVRow[] }) => handleOnFileLoad(result.data)}
                            >
                                {({
                                    getRootProps,
                                    acceptedFile,
                                    ProgressBar,
                                }: {
                                    getRootProps: () => Record<string, unknown>;
                                    acceptedFile: File | null;
                                    ProgressBar: FC<{ style?: React.CSSProperties }>;
                                }) => (
                                    <>
                                        <div className="flex items-stretch">
                                            <Button size="sm" className="button--orkg-secondary !rounded-e-none" {...getRootProps()}>
                                                Browse file
                                            </Button>
                                            <div
                                                {...getRootProps()}
                                                className="flex-1 min-w-0 flex items-center px-3 border border-separator border-s-0 rounded-e-[var(--radius)] bg-field-background text-field-foreground text-sm cursor-pointer"
                                            >
                                                {acceptedFile ? acceptedFile.name : <span className="text-muted">No file is selected</span>}
                                            </div>
                                        </div>
                                        <ProgressBar style={{ backgroundColor: 'var(--border)' }} />
                                    </>
                                )}
                            </CSVReader>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onPress={toggle}>
                            Cancel
                        </Button>
                        <ButtonWithLoading
                            variant="primary"
                            onPress={handleImport}
                            isLoading={isImporting}
                            loadingMessage="Importing"
                            isDisabled={!data || data.length === 0}
                        >
                            Import{data.length > 2 ? ` ${data.length - 1}` : ''} instances
                        </ButtonWithLoading>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};

export default ImportCSVInstances;
