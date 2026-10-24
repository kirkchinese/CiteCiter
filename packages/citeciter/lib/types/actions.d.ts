import { z } from 'zod';
/**
 * One persisted action slot, shown in the selection toolbar and the optional wheel.
 * An `ask` action opens the composer for the user's own question; any other action
 * sends its prompt as a durable user message. Fields saved by older versions, such as
 * `scenario` and `target`, are read but no longer change where an action goes.
 */
export declare const citeActionSchema: z.ZodObject<{
    label: z.ZodString;
    prompt: z.ZodString;
    ask: z.ZodBoolean;
    presentation: z.ZodEnum<{
        side: "side";
        floating: "floating";
    }>;
    target: z.ZodOptional<z.ZodEnum<{
        current: "current";
        new: "new";
    }>>;
}, z.core.$strip>;
export type CiteAction = z.infer<typeof citeActionSchema>;
export declare const wheelSlotsSchema: z.ZodArray<z.ZodNullable<z.ZodObject<{
    label: z.ZodString;
    prompt: z.ZodString;
    ask: z.ZodBoolean;
    presentation: z.ZodEnum<{
        side: "side";
        floating: "floating";
    }>;
    target: z.ZodOptional<z.ZodEnum<{
        current: "current";
        new: "new";
    }>>;
}, z.core.$strip>>>;
export declare const wheelTriggerSchema: z.ZodEnum<{
    "right-button": "right-button";
    Alt: "Alt";
    Control: "Control";
    Shift: "Shift";
    Meta: "Meta";
}>;
export type WheelTrigger = z.infer<typeof wheelTriggerSchema>;
/** Whether a preset action sends at once or only fills the composer. */
export declare const actionDeliverySchema: z.ZodEnum<{
    send: "send";
    draft: "draft";
}>;
export type ActionDelivery = z.infer<typeof actionDeliverySchema>;
export type PanelPresentation = CiteAction['presentation'];
export declare const actionModelSchema: z.ZodObject<{
    provider: z.ZodString;
    model: z.ZodString;
}, z.core.$strict>;
export type ActionModel = z.infer<typeof actionModelSchema>;
/** Toolbar order, and clockwise from twelve o'clock on the wheel. Empty slots retain their positions. */
export declare const DEFAULT_WHEEL_SLOTS: readonly (CiteAction | null)[];
/** English built-in actions, used only when the active UI language is not Chinese. */
export declare const ENGLISH_WHEEL_SLOTS: readonly (CiteAction | null)[];
/**
 * Resolve the actions for the current UI language without changing persisted settings. Saving
 * actions stores the whole list, so each slot is judged on its own: a built-in action the user
 * left unchanged (even if moved, saved in another language or by an earlier version) shows in the
 * current language; an edited or added action stays as written.
 */
export declare function localizedWheelSlots(slots: readonly (CiteAction | null)[] | undefined, chinese: boolean): readonly (CiteAction | null)[];
/**
 * Decide how a chosen action is delivered.
 * @param action - the chosen slot.
 * @param preference - the user's preset-action setting.
 * @returns `draft` for questions the user writes, otherwise the preference.
 */
export declare function actionDelivery(action: CiteAction, preference: ActionDelivery | undefined): ActionDelivery;
/** Combine a mode and optional user question without hidden system state. */
export declare function actionQuestion(action: CiteAction, question: string): string;
