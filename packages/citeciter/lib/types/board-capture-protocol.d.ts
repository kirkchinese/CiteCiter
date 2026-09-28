import { z } from 'zod';
/** Immutable board revision requested by one real model tool call, independent of UI selection. */
export declare const boardCaptureJobSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    board: z.ZodObject<{
        version: z.ZodLiteral<4>;
        revision: z.ZodNumber;
        elements: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            kind: z.ZodEnum<{
                text: "text";
                image: "image";
                markdown: "markdown";
                math: "math";
                svg: "svg";
                html: "html";
                table: "table";
            }>;
            content: z.ZodString;
            x: z.ZodNumber;
            y: z.ZodNumber;
            w: z.ZodNumber;
            h: z.ZodNumber;
            style: z.ZodObject<{
                color: z.ZodOptional<z.ZodString>;
                fontSize: z.ZodOptional<z.ZodString>;
            }, z.core.$strict>;
            focused: z.ZodBoolean;
            animation: z.ZodOptional<z.ZodObject<{
                name: z.ZodEnum<{
                    "fade-in": "fade-in";
                    "slide-in": "slide-in";
                    pulse: "pulse";
                    highlight: "highlight";
                }>;
                durationMs: z.ZodNumber;
                iterations: z.ZodNumber;
                run: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        invalid: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
export type BoardCaptureJob = z.infer<typeof boardCaptureJobSchema>;
