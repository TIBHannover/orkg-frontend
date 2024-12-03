import useStatements from 'components/RosettaStone/hooks/useStatements';
import { getRSTemplate, rosettaStoneUrl } from 'services/backend/rosettaStone';
import useSWR from 'swr';

const useUsedStatementTypes = ({ context }: { context: string }) => {
    const { statements } = useStatements({ context });
    const templateIds = statements?.content?.map((s) => s.template_id) ?? [];

    const { data: templates } = useSWR(templateIds.length > 0 ? [templateIds, rosettaStoneUrl, 'getRSTemplate'] : null, ([params]) =>
        Promise.all(params.map((p) => getRSTemplate(p))),
    );

    return { usedStatementTypes: templates ?? [] };
};
export default useUsedStatementTypes;
