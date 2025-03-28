'use client';

import dayjs from 'dayjs';
import { toInteger } from 'lodash';
import { reverse } from 'named-urls';
import reactStringReplace from 'react-string-replace';
import { Container } from 'reactstrap';

import NotFound from '@/app/not-found';
import DiffView from '@/components/DiffView/DiffView';
import removeEmptySegments from '@/components/RosettaStone/SingleStatement/hooks/helpers';
import useRosettaStatementVersions from '@/components/RosettaStone/SingleStatement/hooks/useRosettaStatementVersions';
import useRosettaTemplate from '@/components/RosettaStone/SingleStatement/hooks/useRosettaTemplate';
import useRosettaStatements from '@/components/RosettaStone/SingleStatement/hooks/useStatements';
import useParams from '@/components/useParams/useParams';
import ROUTES from '@/constants/routes';
import { RosettaStoneStatement, RosettaStoneTemplate } from '@/services/backend/types';

const StatementDiff = () => {
    const { oldId, newId } = useParams();

    const { data: oldStatement, isLoading: isLoadingOldStatement, error: oldStatementError } = useRosettaStatements({ id: oldId });
    const { data: newStatement, isLoading: isLoadingNewStatement, error: newStatementError } = useRosettaStatements({ id: newId });

    const { data: oldTemplate } = useRosettaTemplate({ id: oldStatement?.template_id ?? '' });
    const { data: newTemplate } = useRosettaTemplate({ id: newStatement?.template_id ?? '' });

    const { data: versions, isLoading: isLoadingVersions } = useRosettaStatementVersions({ id: oldId });

    const replacementFunction = (match: string, _i: number, offset: number, s?: RosettaStoneStatement, t?: RosettaStoneTemplate) => {
        const i = toInteger(match);
        const value = match === '0' ? s?.subjects : s?.objects[i - 1];
        if (!t?.properties[i]) {
            return '';
        }
        if (!value) {
            return t?.properties[i].placeholder;
        }
        const formattedValue = value
            .map((v, ii) => {
                let text = '';
                if ('datatype' in v) {
                    text = `${v.label}`;
                } else {
                    text = `${v.label}[${v.id}]`;
                }
                if (ii + 1 < value.length - 1) {
                    text += ', ';
                }
                if (ii + 2 === value.length) {
                    text += ' and ';
                }
                return text;
            })
            .join('\n');

        return `${formattedValue}\n`;
    };

    const oldDynamicLabel = reactStringReplace(removeEmptySegments(oldTemplate?.formatted_label ?? '', oldStatement), /{(.*?)}/, (match, i, offset) =>
        replacementFunction(match, i, offset, oldStatement, oldTemplate),
    );

    const newDynamicLabel = reactStringReplace(removeEmptySegments(newTemplate?.formatted_label ?? '', newStatement), /{(.*?)}/, (match, i, offset) =>
        replacementFunction(match, i, offset, newStatement, newTemplate),
    );

    const getTitleData = (version: RosettaStoneStatement) => {
        const versionNumber = versions && versions.length ? versions.findIndex((v) => v.id === version.id) + 1 : null;
        const publicationDate = version ? dayjs(version.created_at).format('DD MMMM YYYY - HH:mm:ss') : null;

        return {
            creator: version?.created_by,
            route: reverse(ROUTES.RS_STATEMENT, { id: version.id }),
            headerText: version && (
                <span>
                    Version {versionNumber} - {publicationDate}
                </span>
            ),
            buttonText: 'View statement',
        };
    };

    const getData = async ({ oldId: oId, newId: nId }: { oldId: string; newId: string }) => {
        let oldText = `Negation ${oldStatement?.negated}\n`;
        oldText += `Certainty ${oldStatement?.certainty}\n\n`;
        oldText += oldDynamicLabel
            .map((p) => p?.toString().trim())
            .join('\n')
            .toString();

        let newText = `Negation ${newStatement?.negated}\n`;
        newText += `Certainty ${newStatement?.certainty}\n\n`;
        newText += newDynamicLabel
            .map((p) => p?.toString().trim())
            .join('\n')
            .toString();

        return {
            oldText,
            newText,
            oldTitleData: oId && oldStatement ? getTitleData(oldStatement) : null,
            newTitleData: nId && newStatement ? getTitleData(newStatement) : null,
        };
    };

    if (isLoadingOldStatement || isLoadingNewStatement || isLoadingVersions) {
        return <Container className="box rounded p-4 overflow-hidden">Loading...</Container>;
    }

    if (oldStatementError || newStatementError) {
        return <NotFound />;
    }

    return <DiffView diffRoute={ROUTES.ROSETTA_STONE_DIFF} type="rosetta statement" getData={getData} />;
};

export default StatementDiff;
