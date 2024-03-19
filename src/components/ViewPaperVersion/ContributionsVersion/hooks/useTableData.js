import { useEffect, useState, useCallback } from 'react';
import { sortBy } from 'lodash';
import REGEX from 'constants/regex';
import { PREDICATES } from 'constants/graphSettings';

const useTableData = ({ id, paperStatements }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [cols, setCols] = useState([]);
    const [lines, setLines] = useState([]);
    const [value, setValue] = useState([]);
    const [isTitlesColumnsExist, setIsTitlesColumnsExist] = useState(false);

    const loadColumns = useCallback(() => {
        const list = paperStatements.filter((st) => st.subject.id === id);
        setValue(list[0]?.subject ?? null);

        const columnsId = list.filter((st) => st.object.classes.includes('Column'));
        const columns = columnsId.map((item) => {
            const c = item.object;
            const matchedStatements = paperStatements.filter((st) => c.id === st.subject.id);

            const titlesMatch = matchedStatements.find((st) => st.predicate.id === PREDICATES.CSVW_TITLES);
            const numberMatch = matchedStatements.find((st) => st.predicate.id === PREDICATES.CSVW_NUMBER);

            const titles = titlesMatch ? titlesMatch.object : {};
            const number = numberMatch ? numberMatch.object : {};

            return { ...c, titles, number };
        });

        let columnTitleExist = false;
        const rowsId = list.filter((st) => st.object.classes.includes('Row'));
        const _lines = rowsId.map((item) => {
            const r = item.object;
            const rowStatements = paperStatements.filter((st) => r.id === st.subject.id);

            const titles = rowStatements.filter((st) => st.predicate.id === PREDICATES.CSVW_TITLES).map((st) => st.object)[0] ?? {}; // single title per row
            const number = rowStatements.filter((st) => st.predicate.id === PREDICATES.CSVW_NUMBER).map((st) => st.object)[0] ?? {}; // single number per row
            if (titles) {
                columnTitleExist = true;
            }

            const cellStatements = rowStatements.filter((st) => st.predicate.id === PREDICATES.CSVW_CELLS);
            const cells = cellStatements.map((st) => {
                const c = st.object;
                const valueStatements = paperStatements.filter(
                    (valueSt) => c.id === valueSt.subject.id && valueSt.predicate.id === PREDICATES.CSVW_VALUE,
                );
                const _value = valueStatements.map((valueSt) => valueSt.object)[0] ?? {}; // Assuming single value per cell

                return { ...c, value: _value, row: r };
            });

            return { ...r, cells, number, titles };
        });
        if (columnTitleExist) {
            const findTitleNotRowX = _lines.find((r) => !REGEX.CSW_ROW_TITLES_VALUE.test(r.titles?.label?.toLowerCase?.() ?? ''));
            if (!findTitleNotRowX) {
                columnTitleExist = false;
            }
        }
        const temp = columnTitleExist
            ? [
                  {
                      existingResourceId: 'titles',
                      id: 'titles',
                      label: '',
                      classes: ['Column'],
                      titles: {
                          id: '',
                          label: '',
                      },
                      number: {
                          id: '',
                          label: '',
                      },
                  },
                  ...columns,
              ]
            : columns;
        setLines(sortBy(_lines, (obj) => parseInt(obj.number.label ?? '0', 10)));
        setCols(temp);
        setIsTitlesColumnsExist(columnTitleExist);
    }, [id, paperStatements]);

    const loadTableData = useCallback(() => {
        setIsLoading(true);
        loadColumns(id, paperStatements);
        setIsLoading(false);
    }, [id, paperStatements, loadColumns]);

    useEffect(() => {
        loadTableData();
    }, [id, paperStatements, loadTableData]);

    return {
        cols,
        lines,
        isTitlesColumnsExist,
        value,
        isLoading,
    };
};

export default useTableData;
