/** Assistant response text and its current stream state. */
export interface RichAnswerProps {
    readonly text: string;
    readonly streaming: boolean;
}
/**
 * Render model Markdown plus safe SVG and sandboxed HTML fence previews.
 * @param props - response text and streaming flag.
 * @returns isolated rich-answer element.
 */
export declare function RichAnswer({ text, streaming }: RichAnswerProps): import("react").JSX.Element;
