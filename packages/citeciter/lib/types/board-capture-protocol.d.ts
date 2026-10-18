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
                    highlight: "highlight";
                    "fade-in": "fade-in";
                    "slide-in": "slide-in";
                    pulse: "pulse";
                }>;
                durationMs: z.ZodNumber;
                iterations: z.ZodNumber;
                run: z.ZodNumber;
            }, z.core.$strict>>;
        }, z.core.$strict>>;
        invalid: z.ZodNumber;
        timeline: z.ZodOptional<z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            spec: z.ZodObject<{
                durationMs: z.ZodNumber;
                loop: z.ZodOptional<z.ZodBoolean>;
                beats: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    atMs: z.ZodNumber;
                    caption: z.ZodString;
                }, z.core.$strict>>>;
                tracks: z.ZodArray<z.ZodObject<{
                    target: z.ZodString;
                    verb: z.ZodEnum<{
                        appear: "appear";
                        disappear: "disappear";
                        move: "move";
                        scale: "scale";
                        rotate: "rotate";
                        highlight: "highlight";
                        reveal: "reveal";
                        follow: "follow";
                        keyframes: "keyframes";
                        parametric: "parametric";
                    }>;
                    startMs: z.ZodOptional<z.ZodNumber>;
                    endMs: z.ZodOptional<z.ZodNumber>;
                    easing: z.ZodOptional<z.ZodEnum<{
                        linear: "linear";
                        "ease-in": "ease-in";
                        "ease-out": "ease-out";
                        "ease-in-out": "ease-in-out";
                    }>>;
                    to: z.ZodOptional<z.ZodObject<{
                        x: z.ZodNumber;
                        y: z.ZodNumber;
                    }, z.core.$strict>>;
                    scale: z.ZodOptional<z.ZodNumber>;
                    degrees: z.ZodOptional<z.ZodNumber>;
                    direction: z.ZodOptional<z.ZodEnum<{
                        left: "left";
                        right: "right";
                        up: "up";
                        down: "down";
                    }>>;
                    path: z.ZodOptional<z.ZodString>;
                    orient: z.ZodOptional<z.ZodBoolean>;
                    frames: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        atMs: z.ZodNumber;
                        x: z.ZodOptional<z.ZodNumber>;
                        y: z.ZodOptional<z.ZodNumber>;
                        opacity: z.ZodOptional<z.ZodNumber>;
                        scale: z.ZodOptional<z.ZodNumber>;
                        rotate: z.ZodOptional<z.ZodNumber>;
                    }, z.core.$strict>>>;
                    x: z.ZodOptional<z.ZodString>;
                    y: z.ZodOptional<z.ZodString>;
                    t: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
                }, z.core.$strict>>;
            }, z.core.$strict>;
        }, z.core.$strict>>>;
    }, z.core.$strict>;
    atMs: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export type BoardCaptureJob = z.infer<typeof boardCaptureJobSchema>;
