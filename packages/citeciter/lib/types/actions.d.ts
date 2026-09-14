import { z } from 'zod';
/** One persisted wheel slot; its prompt is sent as a durable user message. */
export declare const citeActionSchema: z.ZodObject<{
    label: z.ZodString;
    prompt: z.ZodString;
    ask: z.ZodBoolean;
    scenario: z.ZodEnum<{
        qa: "qa";
        present: "present";
    }>;
    presentation: z.ZodEnum<{
        side: "side";
        floating: "floating";
    }>;
}, z.core.$strict>;
export type CiteAction = z.infer<typeof citeActionSchema>;
export declare const wheelSlotsSchema: z.ZodArray<z.ZodNullable<z.ZodObject<{
    label: z.ZodString;
    prompt: z.ZodString;
    ask: z.ZodBoolean;
    scenario: z.ZodEnum<{
        qa: "qa";
        present: "present";
    }>;
    presentation: z.ZodEnum<{
        side: "side";
        floating: "floating";
    }>;
}, z.core.$strict>>>;
export declare const wheelTriggerSchema: z.ZodEnum<{
    "right-button": "right-button";
    Alt: "Alt";
    Control: "Control";
    Shift: "Shift";
    Meta: "Meta";
}>;
export type WheelTrigger = z.infer<typeof wheelTriggerSchema>;
export type PanelPresentation = CiteAction['presentation'];
export declare const actionModelSchema: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
}, z.core.$strict>;
export type ActionModel = z.infer<typeof actionModelSchema>;
/** Clockwise from twelve o'clock. Empty slots retain their positions. */
export declare const DEFAULT_WHEEL_SLOTS: readonly (CiteAction | null)[];
/** Combine a mode and optional user question without hidden system state. */
export declare function actionQuestion(action: CiteAction, question: string): string;
