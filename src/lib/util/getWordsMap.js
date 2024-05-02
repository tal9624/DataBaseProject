export function getWordsMap(lyrics) {
    const resultMap = {};
    const lines = lyrics.split('\n');

    for (const [rowIndex, line] of lines.entries()) {
        let charIndex = 0;
        const words = line.split(/\s+/).filter(word => word.length > 0);

        for (const word of words) {
            const charStart = line.indexOf(word, charIndex);
            const charEnd = charStart + word.length - 1;

            const normalizedWord = word.toLowerCase().replace(/[^\w']+/g, '');
            if (!normalizedWord) continue;

            if (!resultMap[normalizedWord]) {
                resultMap[normalizedWord] = { count: 0, indexes: [] };
            }

            resultMap[normalizedWord].count++;
            resultMap[normalizedWord].indexes.push([rowIndex + 1, charStart, charEnd]);

            charIndex = charEnd + 1;
        }
    }

    return resultMap;
}
