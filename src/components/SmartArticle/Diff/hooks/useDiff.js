import { useCallback } from 'react';
import { isString } from 'lodash';

const useDiff = () => {
    const articleToPlainText = useCallback(article => {
        let articleText = '';
        articleText += `Title: ${article.paper.title}\n\n`;

        for (const [index, author] of article.authorResources.entries()) {
            articleText += `Author ${index + 1}: ${author.label}\n`;
        }

        for (const section of article.sections) {
            articleText += '------------------Section------------------\n';
            articleText += `Title: ${section.title.label}\n`;
            articleText += `Type: ${section.type.id}\n`;

            if (section.markdown) {
                articleText += `Content:\n${section.markdown?.label}\n\n`;
            }
            if (section.contentLink) {
                articleText += `Link to: ${section.contentLink?.objectId} (${section.contentLink?.label})\n\n`;
            }
        }

        return articleText;
    }, []);

    const isOldIdHigherThanNewId = useCallback(({ oldId, newId }) => {
        const numericOldId = isString(oldId) && parseInt(oldId.replace('R', ''));
        const numericNewId = isString(newId) && parseInt(newId.replace('R', ''));

        return numericOldId > numericNewId;
    }, []);

    return { articleToPlainText, isOldIdHigherThanNewId };
};

export default useDiff;
