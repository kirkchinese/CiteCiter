import * as primitives from '@deepseek-ai/dsh-client-ui-primitives';
/** DSH renamed size-specific icons in 0.1.7; the module-table import remains shared. */
function icon(modern, legacy) {
    const exports = primitives;
    const component = exports[modern] ?? exports[legacy];
    if (component === undefined)
        throw new Error(`DSH 缺少图标：${modern}`);
    return component;
}
export const IconSettingsOutlineMedium = icon('IconSettingsOutlineMedium', 'IconSettingsOutline14');
export const IconQuestionOutlineMedium = icon('IconQuestionOutlineMedium', 'IconQuestionOutline14');
export const IconSparkleMedium = icon('IconSparkleMedium', 'IconSparkle16');
export const IconDownloadOutlineMedium = icon('IconDownloadOutlineMedium', 'IconDownloadOutline16');
export const IconThinkOutlineMedium = icon('IconThinkOutlineMedium', 'IconThinkOutline14');
export const IconStopFillMedium = icon('IconStopFillMedium', 'IconStopFill16');
export const IconArchiveOutlineMedium = icon('IconArchiveOutlineMedium', 'IconArchiveOutline20');
