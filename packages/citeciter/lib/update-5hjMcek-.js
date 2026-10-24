import { z } from "zod";
import parse from "semver/functions/parse.js";
//#region lib/types/draft-contract.js
/** Persisted drafts are user work, never model input until explicitly submitted. */
const draftReferenceSchema = z.object({
	id: z.string().min(1).max(500),
	kind: z.enum([
		"source",
		"excerpt",
		"board"
	]),
	label: z.string().max(1e3),
	content: z.string().max(5e5),
	address: z.string().max(4e3).optional()
}).strict();
const draftFileSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1).max(1e3),
	type: z.string().max(200),
	size: z.number().int().nonnegative().max(104857600),
	lastModified: z.number().int().nonnegative()
}).strict();
const draftContentSchema = z.object({
	text: z.string().max(11e3),
	references: z.array(draftReferenceSchema).max(64),
	files: z.array(draftFileSchema).max(32)
}).strict();
const draftStateSchema = z.object({
	version: z.literal(1),
	revision: z.number().int().nonnegative(),
	content: draftContentSchema,
	pending: z.object({
		requestId: z.uuid(),
		content: draftContentSchema
	}).strict().nullable()
}).strict();
const EMPTY_DRAFT_STATE = {
	version: 1,
	revision: 0,
	content: {
		text: "",
		references: [],
		files: []
	},
	pending: null
};
const DRAFT_CHUNK_BYTES = 262144;
/** Remove only the acknowledged submission, preserving edits made while it was pending. */
function subtractSubmitted(current, submitted) {
	return {
		text: current.text === submitted.text ? "" : current.text,
		references: current.references.filter((item) => !submitted.references.some((sent) => sent.id === item.id)),
		files: current.files.filter((item) => !submitted.files.some((sent) => sent.id === item.id))
	};
}
//#endregion
//#region lib/types/question-draft-contract.js
/** Question identities are opaque values, never filesystem paths. */
const questionDraftKeySchema = z.string().min(1).max(2e3);
/** Partial answers preserve custom text verbatim, including whitespace and code indentation. */
const questionDraftAnswerSchema = z.object({
	selected: z.array(z.string().max(4e3)).max(128),
	custom: z.string().max(1e5)
}).strict();
const questionDraftContentSchema = z.object({
	answers: z.record(z.string().min(1).max(1e3), questionDraftAnswerSchema).refine((answers) => Object.keys(answers).length <= 128, "Too many question drafts"),
	page: z.number().int().nonnegative().max(127),
	edited: z.boolean(),
	held: z.boolean()
}).strict();
/** A per-question CAS revision, independent from the ordinary message draft. */
const questionDraftStateSchema = z.object({
	version: z.literal(1),
	revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1),
	content: questionDraftContentSchema
}).strict();
const EMPTY_QUESTION_DRAFT_STATE = {
	version: 1,
	revision: 0,
	content: {
		answers: {},
		page: 0,
		edited: false,
		held: false
	}
};
/** Closed tombstones prevent delayed saves from recreating an accepted or ended question. */
const questionDraftRecordSchema = z.object({
	key: questionDraftKeySchema,
	closed: z.boolean(),
	/** Set only by the owning Host while observing a legacy blocking ask invocation. */
	blocking: z.boolean().optional(),
	state: questionDraftStateSchema
}).strict().refine((record) => !record.closed || Object.keys(record.state.content.answers).length === 0 && record.state.content.page === 0 && !record.state.content.edited && !record.state.content.held, "Closed question drafts must be empty");
//#endregion
//#region lib/types/native-session-contract.js
const attachmentId = z.string().min(1).transform((value) => value);
const nativeImageSchema = z.object({
	attachmentId,
	mediaType: z.enum([
		"image/png",
		"image/jpeg",
		"image/webp",
		"image/gif"
	]),
	bytes: z.number().int().nonnegative(),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	name: z.string().optional(),
	originalDimensions: z.object({
		width: z.number().int().positive(),
		height: z.number().int().positive()
	}).strict().optional()
}).strict().transform(({ name, originalDimensions, ...image }) => ({
	...image,
	...name === void 0 ? {} : { name },
	...originalDimensions === void 0 ? {} : { originalDimensions }
}));
const file = z.object({
	attachmentId,
	name: z.string(),
	bytes: z.number().int().nonnegative()
}).strict();
/** Wire reference for an authorized attachment; generic files have no image metadata. */
const nativeAttachmentRefSchema = z.union([nativeImageSchema, file]);
const nativeAttachmentSchema = z.discriminatedUnion("type", [z.object({
	type: z.literal("image"),
	attachment: nativeImageSchema
}).strict(), z.object({
	type: z.literal("file"),
	attachment: file
}).strict()]);
/** Read-only control projection. The Agent inbox remains the only authoritative queue. */
const nativeStateSchema = z.object({
	modelSelectionRequired: z.boolean().optional(),
	running: z.boolean(),
	blank: z.boolean(),
	error: z.string().nullable(),
	queue: z.array(z.object({
		id: z.string().min(1),
		placement: z.enum([
			"queued",
			"steering",
			"context"
		]),
		rpcId: z.string().optional(),
		text: z.string(),
		attachments: z.array(nativeAttachmentSchema)
	}).strict()),
	receipts: z.array(z.object({
		requestId: z.string().min(1),
		attachments: z.array(nativeAttachmentSchema)
	}).strict())
}).strict();
const ANIMATION_MAX_DURATION_MS = 3e4;
/** Offset in canvas percent used by directional appear and disappear. */
const SLIDE_DISTANCE = 6;
const easingSchema = z.enum([
	"linear",
	"ease-in",
	"ease-out",
	"ease-in-out"
]);
const directionSchema = z.enum([
	"left",
	"right",
	"up",
	"down"
]);
const timeSchema = z.number().int().min(0).max(ANIMATION_MAX_DURATION_MS);
const coordinateSchema = z.number().min(-50).max(150);
const expressionSchema = z.string().min(1).max(240);
/** One verb applied to one board element. */
const animationTrackSchema = z.object({
	target: z.string().min(1).max(80),
	verb: z.enum([
		"appear",
		"disappear",
		"move",
		"scale",
		"rotate",
		"highlight",
		"reveal",
		"follow",
		"keyframes",
		"parametric"
	]),
	startMs: timeSchema.optional(),
	endMs: timeSchema.optional(),
	easing: easingSchema.optional(),
	to: z.object({
		x: coordinateSchema,
		y: coordinateSchema
	}).strict().optional(),
	scale: z.number().min(.05).max(10).optional(),
	degrees: z.number().min(-3600).max(3600).optional(),
	direction: directionSchema.optional(),
	path: z.string().min(1).max(4e3).optional(),
	orient: z.boolean().optional(),
	frames: z.array(z.object({
		atMs: timeSchema,
		x: coordinateSchema.optional(),
		y: coordinateSchema.optional(),
		opacity: z.number().min(0).max(1).optional(),
		scale: z.number().min(.05).max(10).optional(),
		rotate: z.number().min(-3600).max(3600).optional()
	}).strict()).min(1).max(40).optional(),
	x: expressionSchema.optional(),
	y: expressionSchema.optional(),
	t: z.tuple([z.number().min(-1e6).max(1e6), z.number().min(-1e6).max(1e6)]).optional()
}).strict();
/** One complete timeline as written by the model. */
const animationSpecSchema = z.object({
	durationMs: z.number().int().min(200).max(ANIMATION_MAX_DURATION_MS),
	loop: z.boolean().optional(),
	beats: z.array(z.object({
		atMs: timeSchema,
		caption: z.string().min(1).max(160)
	}).strict()).max(20).optional(),
	tracks: z.array(animationTrackSchema).min(1).max(40)
}).strict();
/** The board's current timeline: the spec of the latest successful call, keyed by that call. */
const boardTimelineSchema = z.object({
	id: z.string().min(1),
	spec: animationSpecSchema
}).strict();
const FUNCTIONS = {
	sin: Math.sin,
	cos: Math.cos,
	tan: Math.tan,
	asin: Math.asin,
	acos: Math.acos,
	atan: Math.atan,
	atan2: Math.atan2,
	sqrt: Math.sqrt,
	abs: Math.abs,
	exp: Math.exp,
	log: Math.log,
	min: Math.min,
	max: Math.max,
	pow: Math.pow,
	floor: Math.floor,
	ceil: Math.ceil,
	round: Math.round,
	sign: Math.sign
};
const CONSTANTS = {
	pi: Math.PI,
	e: Math.E,
	tau: Math.PI * 2
};
/**
* Compile a restricted arithmetic expression of `t`: numbers, `+ - * / ^`, parentheses,
* the constants pi, e, tau and a fixed set of Math functions. Nothing else is accepted.
* @throws an Error naming the first unexpected token.
*/
function compileExpression(source) {
	const tokens = source.match(/\d+(?:\.\d+)?(?:e[+-]?\d+)?|\.\d+|[a-z_][a-z0-9_]*|\*\*|[-+*/^(),]|\S/giu) ?? [];
	let index = 0;
	const peek = () => tokens[index];
	const take = (expected) => {
		const token = tokens[index];
		if (token === void 0 || expected !== void 0 && token !== expected) throw new Error(`expression "${source}": expected ${expected ?? "a value"} at ${token ?? "end"}`);
		index += 1;
		return token;
	};
	const primary = () => {
		const token = take();
		if (/^(?:\d|\.\d)/u.test(token)) {
			const value = Number(token);
			return () => value;
		}
		if (token === "(") {
			const inner = sum();
			take(")");
			return inner;
		}
		if (token === "-") {
			const inner = power();
			return (t) => -inner(t);
		}
		if (token === "+") return power();
		const name = token.toLowerCase();
		if (name === "t") return (t) => t;
		if (Object.hasOwn(CONSTANTS, name)) {
			const value = CONSTANTS[name];
			return () => value;
		}
		if (Object.hasOwn(FUNCTIONS, name)) {
			const fn = FUNCTIONS[name];
			take("(");
			const args = [sum()];
			while (peek() === ",") {
				take(",");
				args.push(sum());
			}
			take(")");
			return (t) => fn(...args.map((arg) => arg(t)));
		}
		throw new Error(`expression "${source}": unknown name or symbol "${token}"`);
	};
	const power = () => {
		const base = primary();
		if (peek() === "^" || peek() === "**") {
			take();
			const exponent = power();
			return (t) => base(t) ** exponent(t);
		}
		return base;
	};
	const product = () => {
		let left = power();
		while (peek() === "*" || peek() === "/") {
			const op = take();
			const right = power();
			const previous = left;
			left = op === "*" ? (t) => previous(t) * right(t) : (t) => previous(t) / right(t);
		}
		return left;
	};
	const sum = () => {
		let left = product();
		while (peek() === "+" || peek() === "-") {
			const op = take();
			const right = product();
			const previous = left;
			left = op === "+" ? (t) => previous(t) + right(t) : (t) => previous(t) - right(t);
		}
		return left;
	};
	const expression = sum();
	if (index !== tokens.length) throw new Error(`expression "${source}": unexpected "${tokens[index]}"`);
	return expression;
}
const CURVE_STEPS = 24;
function arcPoints(from, rx, ry, rotation, large, sweep, to) {
	if (rx === 0 || ry === 0) return [to];
	const phi = rotation * Math.PI / 180;
	const cos = Math.cos(phi);
	const sin = Math.sin(phi);
	const dx = (from.x - to.x) / 2;
	const dy = (from.y - to.y) / 2;
	const x1 = cos * dx + sin * dy;
	const y1 = -sin * dx + cos * dy;
	let a = Math.abs(rx);
	let b = Math.abs(ry);
	const lambda = x1 * x1 / (a * a) + y1 * y1 / (b * b);
	if (lambda > 1) {
		a *= Math.sqrt(lambda);
		b *= Math.sqrt(lambda);
	}
	const numerator = a * a * b * b - a * a * y1 * y1 - b * b * x1 * x1;
	const factor = (large === sweep ? -1 : 1) * Math.sqrt(Math.max(0, numerator / (a * a * y1 * y1 + b * b * x1 * x1)));
	const cx1 = factor * (a * y1) / b;
	const cy1 = factor * -(b * x1) / a;
	const cx = cos * cx1 - sin * cy1 + (from.x + to.x) / 2;
	const cy = sin * cx1 + cos * cy1 + (from.y + to.y) / 2;
	const angle = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
	const start = angle(1, 0, (x1 - cx1) / a, (y1 - cy1) / b);
	let delta = angle((x1 - cx1) / a, (y1 - cy1) / b, (-x1 - cx1) / a, (-y1 - cy1) / b);
	if (!sweep && delta > 0) delta -= Math.PI * 2;
	if (sweep && delta < 0) delta += Math.PI * 2;
	const points = [];
	for (let step = 1; step <= CURVE_STEPS; step += 1) {
		const theta = start + delta * step / CURVE_STEPS;
		points.push({
			x: cos * a * Math.cos(theta) - sin * b * Math.sin(theta) + cx,
			y: sin * a * Math.cos(theta) + cos * b * Math.sin(theta) + cy
		});
	}
	return points;
}
/**
* Sample an SVG path (M L H V C S Q T A Z, absolute and relative) into a polyline.
* @throws an Error for unsupported commands or malformed numbers.
*/
function samplePath(d) {
	const tokens = d.match(/[a-z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/giu) ?? [];
	if (tokens.join("").length < d.replace(/[\s,]/gu, "").length) throw new Error("path contains unsupported characters");
	const points = [];
	let index = 0;
	let command = "";
	let current = {
		x: 0,
		y: 0
	};
	let start = {
		x: 0,
		y: 0
	};
	let control = null;
	const number = () => {
		const token = tokens[index];
		if (token === void 0 || /^[a-z]$/iu.test(token)) throw new Error(`path command ${command} is missing a number`);
		index += 1;
		return Number(token);
	};
	const flag = () => number() !== 0;
	while (index < tokens.length) {
		if (/^[a-z]$/iu.test(tokens[index])) command = tokens[index++];
		else if (command === "") throw new Error("path must start with a command");
		const relative = command === command.toLowerCase();
		const base = relative ? current : {
			x: 0,
			y: 0
		};
		const at = (x, y) => ({
			x: base.x + x,
			y: base.y + y
		});
		switch (command.toUpperCase()) {
			case "M":
				current = at(number(), number());
				start = current;
				points.push(current);
				control = null;
				command = relative ? "l" : "L";
				break;
			case "L":
				current = at(number(), number());
				points.push(current);
				control = null;
				break;
			case "H":
				current = {
					x: (relative ? current.x : 0) + number(),
					y: current.y
				};
				points.push(current);
				control = null;
				break;
			case "V":
				current = {
					x: current.x,
					y: (relative ? current.y : 0) + number()
				};
				points.push(current);
				control = null;
				break;
			case "Z":
				current = start;
				points.push(current);
				control = null;
				break;
			case "C":
			case "S": {
				const first = command.toUpperCase() === "C" ? at(number(), number()) : control === null ? current : {
					x: 2 * current.x - control.x,
					y: 2 * current.y - control.y
				};
				const second = at(number(), number());
				const end = at(number(), number());
				for (let step = 1; step <= CURVE_STEPS; step += 1) {
					const s = step / CURVE_STEPS;
					const r = 1 - s;
					points.push({
						x: r ** 3 * current.x + 3 * r * r * s * first.x + 3 * r * s * s * second.x + s ** 3 * end.x,
						y: r ** 3 * current.y + 3 * r * r * s * first.y + 3 * r * s * s * second.y + s ** 3 * end.y
					});
				}
				control = second;
				current = end;
				break;
			}
			case "Q":
			case "T": {
				const middle = command.toUpperCase() === "Q" ? at(number(), number()) : control === null ? current : {
					x: 2 * current.x - control.x,
					y: 2 * current.y - control.y
				};
				const end = at(number(), number());
				for (let step = 1; step <= CURVE_STEPS; step += 1) {
					const s = step / CURVE_STEPS;
					const r = 1 - s;
					points.push({
						x: r * r * current.x + 2 * r * s * middle.x + s * s * end.x,
						y: r * r * current.y + 2 * r * s * middle.y + s * s * end.y
					});
				}
				control = middle;
				current = end;
				break;
			}
			case "A": {
				const rx = number();
				const ry = number();
				const rotation = number();
				const large = flag();
				const sweep = flag();
				const end = at(number(), number());
				points.push(...arcPoints(current, rx, ry, rotation, large, sweep, end));
				current = end;
				control = null;
				break;
			}
			default: throw new Error(`unsupported path command ${command}`);
		}
		if (command.toUpperCase() === "Z" && index < tokens.length && !/^[a-z]$/iu.test(tokens[index])) throw new Error("numbers after Z need a command");
	}
	if (points.length < 2) throw new Error("path needs at least two points");
	if (points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) throw new Error("path has non-finite coordinates");
	const lengths = [0];
	for (let i = 1; i < points.length; i += 1) lengths.push(lengths[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
	return {
		points,
		lengths,
		total: lengths.at(-1)
	};
}
/** Position and tangent angle (degrees) at a fraction of a sampled path's length. */
function pointAlong(path, fraction) {
	const target = Math.min(1, Math.max(0, fraction)) * path.total;
	let i = 1;
	while (i < path.points.length - 1 && path.lengths[i] < target) i += 1;
	const a = path.points[i - 1];
	const b = path.points[i];
	const span = path.lengths[i] - path.lengths[i - 1];
	const local = span === 0 ? 0 : (target - path.lengths[i - 1]) / span;
	return {
		x: a.x + (b.x - a.x) * local,
		y: a.y + (b.y - a.y) * local,
		angle: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI
	};
}
const BASE = {
	dx: 0,
	dy: 0,
	scale: 1,
	rotate: 0,
	opacity: 1,
	clip: 0,
	glow: 0,
	slideX: 0,
	slideY: 0
};
function ease(kind, p) {
	if (kind === "ease-in") return p ** 3;
	if (kind === "ease-out") return 1 - (1 - p) ** 3;
	if (kind === "ease-in-out") return p < .5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
	return p;
}
const lerp = (a, b, p) => a + (b - a) * p;
function direction(value) {
	if (value === "left") return {
		x: -1,
		y: 0
	};
	if (value === "right") return {
		x: 1,
		y: 0
	};
	if (value === "up") return {
		x: 0,
		y: -1
	};
	return {
		x: 0,
		y: 1
	};
}
function valueAt(segments, from, base, t) {
	let active;
	for (const segment of segments) {
		if (segment.start > t) break;
		active = segment;
	}
	if (active === void 0) return segments[0]?.before ?? base;
	return active.at(t, from.get(active) ?? base);
}
/**
* Validate and compile a timeline against the current board.
* @param spec - parsed timeline spec.
* @param targets - current board element envelopes.
* @returns the compiled timeline.
* @throws an Error describing the first invalid track.
*/
function compileTimeline(spec, targets) {
	const byId = new Map(targets.map((target) => [target.id, target]));
	const pending = /* @__PURE__ */ new Map();
	const clipSides = /* @__PURE__ */ new Map();
	spec.tracks.forEach((track, index) => {
		const label = `track ${index + 1} (${track.verb} ${track.target})`;
		const target = byId.get(track.target);
		if (target === void 0) throw new Error(`${label}: no board element with id "${track.target}"`);
		const cx = target.x + target.w / 2;
		const cy = target.y + target.h / 2;
		const start = track.startMs ?? 0;
		const end = track.endMs ?? spec.durationMs;
		if (track.verb !== "keyframes" && (end <= start || end > spec.durationMs)) throw new Error(`${label}: needs 0 <= startMs < endMs <= durationMs`);
		const easing = track.easing ?? (track.verb === "follow" || track.verb === "parametric" ? "linear" : "ease-in-out");
		const progress = (t) => ease(easing, Math.min(1, Math.max(0, (t - start) / (end - start))));
		const props = pending.get(track.target) ?? /* @__PURE__ */ new Map();
		pending.set(track.target, props);
		const add = (prop, segment) => {
			props.set(prop, [...props.get(prop) ?? [], segment]);
		};
		const require = (value, name) => {
			if (value === void 0) throw new Error(`${label}: ${track.verb} requires ${name}`);
			return value;
		};
		switch (track.verb) {
			case "appear":
			case "disappear": {
				const showing = track.verb === "appear";
				add("opacity", {
					start,
					end,
					...showing ? { before: 0 } : {},
					at: (t, from) => showing ? progress(t) : lerp(from, 0, progress(t))
				});
				if (track.direction !== void 0) {
					const unit = direction(track.direction);
					add("slideX", {
						start,
						end,
						at: (t) => (showing ? -unit.x * (1 - progress(t)) : unit.x * progress(t)) * SLIDE_DISTANCE
					});
					add("slideY", {
						start,
						end,
						at: (t) => (showing ? -unit.y * (1 - progress(t)) : unit.y * progress(t)) * SLIDE_DISTANCE
					});
				}
				break;
			}
			case "move": {
				const to = require(track.to, "to");
				add("dx", {
					start,
					end,
					at: (t, from) => lerp(from, to.x - cx, progress(t))
				});
				add("dy", {
					start,
					end,
					at: (t, from) => lerp(from, to.y - cy, progress(t))
				});
				break;
			}
			case "scale": {
				const factor = require(track.scale, "scale");
				add("scale", {
					start,
					end,
					at: (t, from) => lerp(from, factor, progress(t))
				});
				break;
			}
			case "rotate": {
				const degrees = require(track.degrees, "degrees");
				add("rotate", {
					start,
					end,
					at: (t, from) => from + degrees * progress(t)
				});
				break;
			}
			case "highlight":
				add("glow", {
					start,
					end,
					at: (t) => t >= end ? 0 : Math.sin(Math.PI * Math.min(1, Math.max(0, (t - start) / (end - start))))
				});
				break;
			case "reveal": {
				const side = track.direction ?? "right";
				clipSides.set(track.target, side === "right" ? "right" : side === "left" ? "left" : side === "up" ? "top" : "bottom");
				add("clip", {
					start,
					end,
					before: 100,
					at: (t) => 100 * (1 - progress(t))
				});
				break;
			}
			case "follow": {
				let path;
				try {
					path = samplePath(require(track.path, "path"));
				} catch (error) {
					throw new Error(`${label}: ${error instanceof Error ? error.message : String(error)}`);
				}
				add("dx", {
					start,
					end,
					at: (t) => pointAlong(path, progress(t)).x - cx
				});
				add("dy", {
					start,
					end,
					at: (t) => pointAlong(path, progress(t)).y - cy
				});
				if (track.orient === true) add("rotate", {
					start,
					end,
					at: (t) => pointAlong(path, progress(t)).angle
				});
				break;
			}
			case "parametric": {
				let x;
				let y;
				try {
					x = compileExpression(require(track.x, "x"));
					y = compileExpression(require(track.y, "y"));
				} catch (error) {
					throw new Error(`${label}: ${error instanceof Error ? error.message : String(error)}`);
				}
				const [t0, t1] = track.t ?? [0, 1];
				const param = (t) => lerp(t0, t1, Math.min(1, Math.max(0, (t - start) / (end - start))));
				for (let step = 0; step <= 16; step += 1) {
					const value = lerp(t0, t1, step / 16);
					if (!Number.isFinite(x(value)) || !Number.isFinite(y(value))) throw new Error(`${label}: x or y is not finite at t = ${value}`);
				}
				add("dx", {
					start,
					end,
					at: (t) => x(param(t)) - cx
				});
				add("dy", {
					start,
					end,
					at: (t) => y(param(t)) - cy
				});
				break;
			}
			case "keyframes": {
				const frames = [...require(track.frames, "frames")].sort((a, b) => a.atMs - b.atMs);
				if (frames.some((frame) => frame.atMs > spec.durationMs)) throw new Error(`${label}: frame atMs exceeds durationMs`);
				const channels = [
					["dx", (frame) => frame.x === void 0 ? void 0 : frame.x - cx],
					["dy", (frame) => frame.y === void 0 ? void 0 : frame.y - cy],
					["opacity", (frame) => frame.opacity],
					["scale", (frame) => frame.scale],
					["rotate", (frame) => frame.rotate]
				];
				for (const [prop, read] of channels) {
					const stops = frames.flatMap((frame) => {
						const value = read(frame);
						return value === void 0 ? [] : [{
							at: frame.atMs,
							value
						}];
					});
					if (stops.length === 0) continue;
					const first = stops[0];
					const last = stops.at(-1);
					add(prop, {
						start: first.at,
						end: Math.max(first.at + 1, last.at),
						at: (t) => {
							if (t >= last.at) return last.value;
							let i = 1;
							while (i < stops.length - 1 && stops[i].at <= t) i += 1;
							const a = stops[i - 1];
							const b = stops[i];
							return lerp(a.value, b.value, ease(easing, b.at === a.at ? 1 : Math.min(1, Math.max(0, (t - a.at) / (b.at - a.at)))));
						}
					});
				}
				break;
			}
			default: return track.verb;
		}
	});
	const elements = /* @__PURE__ */ new Map();
	for (const [id, props] of pending) {
		const segments = /* @__PURE__ */ new Map();
		const from = /* @__PURE__ */ new Map();
		for (const [prop, list] of props) {
			const sorted = [...list].sort((a, b) => a.start - b.start);
			sorted.forEach((segment, index) => {
				from.set(segment, valueAt(sorted.slice(0, index), from, BASE[prop], segment.start));
			});
			segments.set(prop, sorted);
		}
		elements.set(id, {
			segments,
			from,
			clipSide: clipSides.get(id) ?? "right"
		});
	}
	return {
		durationMs: spec.durationMs,
		loop: spec.loop ?? false,
		beats: [...spec.beats ?? []].sort((a, b) => a.atMs - b.atMs),
		elements
	};
}
/** Maximum combined UTF-8 element-content bytes retained on one board. */
const BOARD_MAX_CONTENT_BYTES = 5e5;
/** Element kinds the blackboard renders safely on the chalk canvas. */
const boardElementKindSchema = z.enum([
	"text",
	"markdown",
	"math",
	"svg",
	"html",
	"image",
	"table"
]);
const boardColorValueSchema = z.string().max(80).regex(/^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+|(rgb|rgba|hsl|hsla)\([\d\s,.%()/-]+\))$/u);
const boardFontSizeSchema = z.string().max(20).regex(/^[\d.]+(px|em|rem|%)$/u);
/** Style keys the board renderer applies directly as inline CSS properties. */
const boardStyleSchema = z.object({
	color: boardColorValueSchema.optional(),
	fontSize: boardFontSizeSchema.optional()
}).strict();
const boardElementIdSchema = z.string().min(1).max(80);
const boardContentSchema = z.string().min(1).max(2e5);
const boardImageContentSchema = z.string().max(2e5).regex(/^data:image\/(?:png|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/]+={0,2}$/u);
const boardTableContentSchema = z.string().max(2e5).regex(/^\|[^\n]+\|(?:\r?\n\|[-: |]+\|)+(?:\r?\n\|[^\n]+\|)*$/u);
const boardAnimationSchema = z.enum([
	"fade-in",
	"slide-in",
	"pulse",
	"highlight"
]);
const boardPercentSchema = z.number().min(0).max(100);
const boardSizeSchema = z.number().min(.5).max(100);
const utf8Encoder = new TextEncoder();
function addEnvelopeIssues(value, context) {
	if (value.x + value.w > 100) context.addIssue({
		code: "custom",
		message: "x + w must be at most 100",
		path: ["w"]
	});
	if (value.y + value.h > 100) context.addIssue({
		code: "custom",
		message: "y + h must be at most 100",
		path: ["h"]
	});
}
function addContentIssues(kind, content, context) {
	if (kind === "image" && !boardImageContentSchema.safeParse(content).success) context.addIssue({
		code: "custom",
		message: "image content must be a data:image/...;base64 data URI",
		path: ["content"]
	});
	else if (kind === "table" && !boardTableContentSchema.safeParse(content).success) context.addIssue({
		code: "custom",
		message: "table content must be a Markdown table",
		path: ["content"]
	});
}
/** One deterministic blackboard command in canvas-percent coordinates. */
const boardOpSchema = z.discriminatedUnion("op", [
	z.object({ op: z.literal("clear") }).strict(),
	z.object({
		op: z.literal("set"),
		id: boardElementIdSchema,
		kind: boardElementKindSchema,
		content: boardContentSchema,
		x: boardPercentSchema,
		y: boardPercentSchema,
		w: boardSizeSchema,
		h: boardSizeSchema,
		style: boardStyleSchema.optional()
	}).strict(),
	z.object({
		op: z.literal("update"),
		id: boardElementIdSchema,
		content: boardContentSchema.optional(),
		x: boardPercentSchema.optional(),
		y: boardPercentSchema.optional(),
		w: boardSizeSchema.optional(),
		h: boardSizeSchema.optional(),
		style: boardStyleSchema.optional()
	}).strict(),
	z.object({
		op: z.literal("remove"),
		id: boardElementIdSchema
	}).strict(),
	z.object({
		op: z.literal("clear_region"),
		x: boardPercentSchema,
		y: boardPercentSchema,
		w: boardSizeSchema,
		h: boardSizeSchema
	}).strict(),
	z.object({
		op: z.literal("animate"),
		id: boardElementIdSchema,
		animation: boardAnimationSchema,
		durationMs: z.number().int().min(50).max(5e3).optional(),
		iterations: z.number().int().min(1).max(5).optional()
	}).strict(),
	z.object({
		op: z.literal("focus"),
		id: boardElementIdSchema.nullable()
	}).strict()
]).superRefine((op, context) => {
	if (op.op === "set") {
		addEnvelopeIssues(op, context);
		addContentIssues(op.kind, op.content, context);
		return;
	}
	if (op.op === "clear_region") {
		addEnvelopeIssues(op, context);
		return;
	}
	if (op.op !== "update") return;
	if (!(op.content !== void 0 || op.x !== void 0 || op.y !== void 0 || op.w !== void 0 || op.h !== void 0) && (op.style === void 0 || Object.keys(op.style).length === 0)) context.addIssue({
		code: "custom",
		message: "update must change content, envelope, or style"
	});
});
/** One validated, non-empty atomic blackboard commit. */
const boardBatchSchema = z.array(boardOpSchema).min(1).max(50);
const boardElementStateSchema = z.object({
	id: boardElementIdSchema,
	kind: boardElementKindSchema,
	content: boardContentSchema,
	x: boardPercentSchema,
	y: boardPercentSchema,
	w: boardSizeSchema,
	h: boardSizeSchema,
	style: boardStyleSchema,
	focused: z.boolean(),
	animation: z.object({
		name: boardAnimationSchema,
		durationMs: z.number().int().min(50).max(5e3),
		iterations: z.number().int().min(1).max(5),
		run: z.number().int().positive()
	}).strict().optional()
}).strict().superRefine((element, context) => {
	addEnvelopeIssues(element, context);
	addContentIssues(element.kind, element.content, context);
});
/** Empty immutable input for the first board commit. */
const EMPTY_BOARD_STATE = /* @__PURE__ */ new Map();
function intersects(left, right) {
	return left.x < right.x + right.w && left.x + left.w > right.x && left.y < right.y + right.h && left.y + left.h > right.y;
}
function assertElementFits(element) {
	boardElementStateSchema.parse(element);
}
function assertBoardBudget(state) {
	if (state.size > 50) throw new Error(`board cannot retain more than 50 elements`);
	let contentBytes = 0;
	for (const element of state.values()) contentBytes += utf8Encoder.encode(element.content).byteLength;
	if (contentBytes > 5e5) throw new Error(`board content cannot exceed ${BOARD_MAX_CONTENT_BYTES} UTF-8 bytes`);
}
/**
* Apply one validated op batch atomically to the current board state.
* @param state - current element map.
* @param ops - validated, non-empty ops in application order.
* @returns the new state and the number of applied ops.
*/
function applyBoardOps(state, ops) {
	if (ops.length === 0) throw new Error("board commit must contain at least one op");
	if (ops.length > 50) throw new Error(`board commit cannot exceed 50 ops`);
	const next = new Map(state);
	for (const op of ops) switch (op.op) {
		case "clear":
			next.clear();
			break;
		case "set": {
			const element = {
				id: op.id,
				kind: op.kind,
				content: op.content,
				x: op.x,
				y: op.y,
				w: op.w,
				h: op.h,
				style: op.style ?? {},
				focused: false
			};
			assertElementFits(element);
			next.set(op.id, element);
			break;
		}
		case "update": {
			const current = next.get(op.id);
			if (current === void 0) throw new Error(`cannot update unknown board element ${op.id}`);
			const element = {
				...current,
				...op.content === void 0 ? {} : { content: op.content },
				...op.x === void 0 ? {} : { x: op.x },
				...op.y === void 0 ? {} : { y: op.y },
				...op.w === void 0 ? {} : { w: op.w },
				...op.h === void 0 ? {} : { h: op.h },
				...op.style === void 0 ? {} : { style: {
					...current.style,
					...op.style
				} }
			};
			assertElementFits(element);
			next.set(op.id, element);
			break;
		}
		case "animate": {
			const current = next.get(op.id);
			if (current === void 0) throw new Error(`cannot animate unknown board element ${op.id}`);
			next.set(op.id, {
				...current,
				animation: {
					name: op.animation,
					durationMs: op.durationMs ?? 500,
					iterations: op.iterations ?? 1,
					run: (current.animation?.run ?? 0) + 1
				}
			});
			break;
		}
		case "focus":
			if (op.id !== null && !next.has(op.id)) throw new Error(`cannot focus unknown board element ${op.id}`);
			for (const [id, element] of next) {
				const focused = id === op.id;
				if (element.focused !== focused) next.set(id, {
					...element,
					focused
				});
			}
			break;
		case "remove":
			next.delete(op.id);
			break;
		case "clear_region":
			for (const [id, element] of next) if (intersects(element, op)) next.delete(id);
			break;
		default: return op;
	}
	assertBoardBudget(next);
	return {
		state: next,
		revision: ops.length
	};
}
/** Snapshot field containing only the final projected board state. */
const boardSnapshotSchema = z.object({
	version: z.literal(4),
	revision: z.number().int().nonnegative(),
	elements: z.array(boardElementStateSchema).max(50),
	invalid: z.number().int().nonnegative(),
	/** Latest animation timeline; absent in snapshots from earlier versions. */
	timeline: boardTimelineSchema.nullable().optional()
}).strict();
Object.freeze({
	version: 4,
	revision: 0,
	elements: [],
	invalid: 0
});
//#endregion
//#region lib/types/board-capture-protocol.js
/** Immutable board revision requested by one real model tool call, independent of UI selection. */
const boardCaptureJobSchema = z.object({
	id: z.string().min(1),
	sessionId: z.string().min(1),
	board: boardSnapshotSchema,
	/** Render the board's timeline frozen at this time instead of its resting state. */
	atMs: z.number().int().min(0).max(ANIMATION_MAX_DURATION_MS).optional()
}).strict();
//#endregion
//#region lib/types/learning-example.js
/** Shared contract for model input and persisted card examples. Code is never Markdown. */
const descriptions = {
	text: "A prose example in Markdown, at most 1500 characters. Use the code variant for source code.",
	code: "Raw source code, at most 1500 characters. Preserve line breaks and indentation; do not add Markdown fences.",
	language: "Language identifier such as javascript, python, html or text; 1–40 letters, digits, underscores, plus signs, dots, hashes or hyphens."
};
const learningExampleSchema = z.discriminatedUnion("kind", [z.object({
	kind: z.literal("text"),
	content: z.string().trim().min(1).max(1500).describe(descriptions.text)
}).strict(), z.object({
	kind: z.literal("code"),
	content: z.string().min(1).max(1500).refine((value) => value.trim().length > 0, "Code must not be blank").describe(descriptions.code),
	language: z.string().regex(/^[a-zA-Z0-9_+#.-]{1,40}$/).describe(descriptions.language)
}).strict()]);
/** Native DSH tool schema; kept beside the validator to expose the same tagged contract. */
const LEARNING_EXAMPLE_PARAMETER = {
	required: true,
	description: "Choose text for prose or code for literal source code.",
	oneOf: [{
		type: "object",
		additionalProperties: false,
		properties: {
			kind: {
				type: "string",
				enum: ["text"],
				required: true
			},
			content: {
				type: "string",
				required: true,
				description: descriptions.text
			}
		}
	}, {
		type: "object",
		additionalProperties: false,
		properties: {
			kind: {
				type: "string",
				enum: ["code"],
				required: true
			},
			content: {
				type: "string",
				required: true,
				description: descriptions.code
			},
			language: {
				type: "string",
				required: true,
				description: descriptions.language
			}
		}
	}]
};
//#endregion
//#region lib/types/learning.js
/** User-selected teaching stages; these indicate intent, never measured mastery. */
const LEARNING_STAGES = [
	{
		id: "logic",
		label: "底层逻辑",
		shortLabel: "逻辑",
		hint: "从定义、成立条件和因果机制讲起。",
		instruction: "请讲清当前主题的底层逻辑：先给出定义和成立条件，再解释因果机制与为什么成立。区分来源证据、一般知识和假设。只讲这一阶段，不自动推进。"
	},
	{
		id: "qualitative",
		label: "定性分析",
		shortLabel: "定性",
		hint: "看方向、边界，以及改变条件会发生什么。",
		instruction: "请对当前主题做定性分析：解释变量或因素之间的关系、变化方向、边界与反例，用一个具体情境说明。只讲这一阶段，不自动推进。"
	},
	{
		id: "quantitative",
		label: "定量分析（板书）",
		shortLabel: "定量",
		hint: "把变量、推导和算例写到板书上。",
		instruction: "请对当前主题做定量分析，并调用 blackboard_apply 整理板书：注明变量、单位、假设、推导步骤与一个可核查算例。示例数值必须标明是假设，不得伪造来源数据。如果此主题不适合定量或信息不足，请明确说明原因。只讲这一阶段，不自动推进。"
	},
	{
		id: "connections",
		label: "概念关联",
		shortLabel: "关联",
		hint: "说明它与哪些概念相连，以及为什么。",
		instruction: "请围绕当前主题给出 2–4 个最有帮助的概念关联，逐一解释是前提、推论、类比还是对比，说明关联理由与类比的边界。需要时用板书画关系。只讲这一阶段，不自动推进。"
	},
	{
		id: "summary",
		label: "总结学习卡片",
		shortLabel: "总结",
		hint: "先核对与纠错，再整理成学习卡片。",
		instruction: "请先核对本 Topic 的结论与已有板书：检查定义、成立条件、推导、数值和前后矛盾，不要把此前的模型回答当作证据；必要时读取可用来源。纠正发现的错误，将无法核实的内容明确标为“未核实”或省略，不要补造来源与定位。然后调用 learning_cards 生成 1–6 张学习卡片，每张包含核心结论、一个具体例子、可选自测问题和参考答案；逐项检查这些字段的一致性，纠错必须同步到例子和参考答案。涉及来源事实时保留真实可用的定位，区分来源证据与一般知识。完成后简短说明纠正了什么、还有哪些内容未核实；不安排复习计划。"
	}
];
/** Make the entire stage instruction visible and durable as an ordinary Topic user message. */
function learningQuestion(stageId, question = "") {
	const stage = LEARNING_STAGES.find((candidate) => candidate.id === stageId);
	return `【学习阶段：${stage.label}】\n${stage.instruction}${question.trim() === "" ? "" : `\n\n我的问题：${question.trim()}`}`;
}
/** The validation schema and model-visible native tool must expose the same field contract. */
const LEARNING_CARD_FIELD_DESCRIPTIONS = {
	title: "Non-empty title, at most 100 characters.",
	summary: "Markdown summary, at most 2000 characters. Separate independent points with lists or paragraphs; include conditions and corrections.",
	question: "Non-empty self-test question, at most 500 characters.",
	answer: "Markdown reference answer, at most 2000 characters, consistent with the summary and example. Fence multiline code."
};
const learningCardSchema = z.object({
	title: z.string().trim().min(1).max(100).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.title),
	summary: z.string().trim().min(1).max(2e3).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.summary),
	example: learningExampleSchema,
	question: z.string().trim().min(1).max(500).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.question),
	answer: z.string().trim().min(1).max(2e3).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.answer)
}).strict();
const learningCardsInputSchema = z.object({ cards: z.array(learningCardSchema).min(1).max(8) }).strict();
z.object({ cards: z.array(learningCardSchema.extend({ example: z.union([learningExampleSchema, z.string().trim().min(1).max(1500).transform((content) => ({
	kind: "text",
	content
}))]) })).min(1).max(8) }).strict();
//#endregion
//#region lib/types/actions.js
/**
* One persisted action slot, shown in the selection toolbar and the optional wheel.
* An `ask` action opens the composer for the user's own question; any other action
* sends its prompt as a durable user message. Fields saved by older versions, such as
* `scenario` and `target`, are read but no longer change where an action goes.
*/
const citeActionSchema = z.object({
	label: z.string().trim().min(1).max(20),
	prompt: z.string().max(4e3),
	ask: z.boolean(),
	presentation: z.enum(["side", "floating"]),
	target: z.enum(["current", "new"]).optional()
}).refine((action) => action.ask || action.prompt.trim() !== "", "直接执行的模式需要提示词");
const wheelSlotsSchema = z.array(citeActionSchema.nullable()).length(8);
const wheelTriggerSchema = z.enum([
	"right-button",
	"Alt",
	"Control",
	"Shift",
	"Meta"
]);
/** Whether a preset action sends at once or only fills the composer. */
const actionDeliverySchema = z.enum(["send", "draft"]);
const actionModelSchema = z.object({
	provider: z.string().min(1).max(200),
	model: z.string().min(1).max(200)
}).strict();
/** Toolbar order, and clockwise from twelve o'clock on the wheel. Empty slots retain their positions. */
const DEFAULT_WHEEL_SLOTS = [
	{
		label: "提问",
		prompt: "",
		ask: true,
		presentation: "side"
	},
	{
		label: "解释",
		prompt: learningQuestion("logic"),
		ask: false,
		presentation: "side"
	},
	{
		label: "找错误",
		prompt: "请审查引用内容的错误、遗漏和成立条件。区分可确认的错误与需要补充的信息。",
		ask: false,
		presentation: "floating"
	},
	{
		label: "翻译",
		prompt: "请将引用内容翻译为中文，保留重要术语的原文。",
		ask: false,
		presentation: "floating"
	},
	{
		label: "板书",
		prompt: learningQuestion("quantitative"),
		ask: false,
		presentation: "side"
	},
	{
		label: "学习卡",
		prompt: learningQuestion("summary", "围绕本次引用的内容整理。"),
		ask: false,
		presentation: "side"
	},
	null,
	null
];
//#endregion
//#region lib/types/tool-outcome-contract.js
/** Recognized question outcomes shared by Host and Client without importing either service face. */
const QUESTION_TOOL_OUTCOME_CODES = ["ASK_CANCELLED", "ASK_ABORTED"];
//#endregion
//#region lib/types/question-reply.js
/** Client-safe presentation of a durable late answer; the original model payload stays in the Session log. */
const questionReplySchema = z.object({
	callId: z.string().min(1),
	items: z.array(z.object({
		id: z.string().min(1),
		question: z.string(),
		header: z.string().optional(),
		values: z.array(z.string())
	}).strict())
}).strict();
const payloadSchema = z.object({
	kind: z.literal("answer_to_pending_question"),
	tool: z.literal("ask_user_question"),
	callId: z.string(),
	questions: z.array(z.object({
		id: z.string().min(1),
		question: z.string(),
		header: z.string().optional()
	})).min(1),
	answers: z.array(z.object({
		id: z.string().min(1),
		selected: z.array(z.string()),
		custom: z.string().optional()
	}))
});
/**
* Read the official late-answer payload at the persisted-data boundary.
* @param text - Text of one committed user-question-reply message.
* @param callId - Identity from the message source, which the payload must match.
* @returns Question/answer pairs, or an empty presentation for unreadable history; never raw internal JSON.
*/
function readQuestionReply(text, callId) {
	const unreadable = {
		callId,
		items: []
	};
	let value;
	try {
		value = JSON.parse(text);
	} catch {
		return unreadable;
	}
	const parsed = payloadSchema.safeParse(value);
	if (!parsed.success || parsed.data.callId !== callId) return unreadable;
	const { questions, answers } = parsed.data;
	const byId = new Map(answers.map((answer) => [answer.id, answer]));
	if (new Set(questions.map((question) => question.id)).size !== questions.length || byId.size !== answers.length || questions.length !== answers.length || questions.some((question) => !byId.has(question.id))) return unreadable;
	return {
		callId,
		items: questions.map((question) => {
			const answer = byId.get(question.id);
			const custom = answer.custom ?? "";
			return {
				...question,
				values: [...answer.selected, ...custom.trim() === "" ? [] : [custom]]
			};
		})
	};
}
/** Human-readable transcript text for copying and other plain-text consumers. */
function questionReplyText(reply) {
	if (reply.items.length === 0) return "已补答；这条历史回答的格式无法解析。";
	return "补答\n\n" + reply.items.map((item) => `${item.question}\n${item.values.length === 0 ? "已跳过" : `回答：${item.values.join("、")}`}`).join("\n\n");
}
/** Host settings namespace mirrored by the browser settings scope. */
const CITECITER_SETTINGS_NAMESPACE = "citeciter";
/** Topic-scoped system prompt section. */
const TUTOR_SECTION_NAME = "@kirkchinese/dsh-citeciter:tutor";
/**
* Historical on-disk fields. Every Topic is now an Observer Topic; Exact Fork
* values and scenarios remain readable in metadata written before 0.9.
*/
const topicModeSchema = z.enum(["observer", "exact-fork"]);
const topicScenarioSchema = z.enum([
	"qa",
	"present",
	"read",
	"investigate"
]);
/** User preferences applied to new Topics, source reads and the browser panel. */
const citeCiterSettingsSchema = z.object({
	includeSourceReasoning: z.boolean(),
	panelWidthPercent: z.number().int().min(28).max(55),
	reopenLastTopic: z.boolean(),
	tutorPrompt: z.string().max(4e3).optional(),
	followupQuestions: z.boolean().optional(),
	shortcutOpenPanel: z.string().max(40).optional(),
	boardAnimations: z.boolean().optional(),
	activeRecall: z.boolean().optional(),
	updateNotifications: z.boolean().optional(),
	selectionToolbar: z.boolean().optional(),
	actionDelivery: actionDeliverySchema.optional(),
	wheelEnabled: z.boolean().optional(),
	wheelSlots: wheelSlotsSchema.optional(),
	wheelTrigger: wheelTriggerSchema.optional(),
	defaultCiterModel: actionModelSchema.nullable().optional(),
	defaultPermission: z.enum([
		"read-only",
		"workspace-write",
		"danger-full-access"
	]).optional(),
	learningRoute: z.boolean().optional(),
	autoReadSource: z.boolean().optional(),
	workspaceChanges: z.enum([
		"off",
		"summary",
		"diff"
	]).optional()
}).strict();
/** Settings used before an optional DSH settings provider becomes available. */
const DEFAULT_CITECITER_SETTINGS = Object.freeze({
	includeSourceReasoning: true,
	panelWidthPercent: 34,
	reopenLastTopic: true,
	followupQuestions: true,
	boardAnimations: true,
	activeRecall: false,
	defaultPermission: "read-only",
	learningRoute: false,
	autoReadSource: false,
	workspaceChanges: "summary",
	updateNotifications: true,
	selectionToolbar: true,
	actionDelivery: "send",
	wheelEnabled: false
});
/**
* Read persisted settings field by field. Keys written by other versions are
* ignored, and an invalid value falls back to its default without discarding the rest.
* @param raw - settings value from the Host configuration.
* @returns complete settings for this version.
*/
function readCiteCiterSettings(raw) {
	const input = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? raw : {};
	const settings = { ...DEFAULT_CITECITER_SETTINGS };
	for (const [key, field] of Object.entries(citeCiterSettingsSchema.shape)) {
		if (input[key] === void 0) continue;
		const parsed = field.safeParse(input[key]);
		if (parsed.success) settings[key] = parsed.data;
	}
	return settings;
}
/** Browser-visible selection resolved by the Host against one committed model call. */
const citationSelectionClaimSchema = z.object({
	sourceSessionId: z.string().min(1),
	anchorSeq: z.number().int().nonnegative(),
	displayText: z.string().min(1).max(32e3),
	sourceHintText: z.string().min(1).max(32e3).optional(),
	prefixText: z.string().max(1e3),
	suffixText: z.string().max(1e3)
}).strict();
/** Host-verifiable Markdown evidence plus the browser-visible quote used by the UI. */
const citationDraftSchema = z.object({
	sourceSessionId: z.string().min(1),
	anchorSeq: z.number().int().nonnegative(),
	startOffset: z.number().int().nonnegative(),
	endOffset: z.number().int().positive(),
	sourceText: z.string().min(1).max(32e3),
	displayText: z.string().min(1).max(32e3),
	prefixText: z.string().max(1e3),
	suffixText: z.string().max(1e3),
	selectionFingerprint: z.string().regex(/^[a-f0-9]{64}$/)
}).strict();
/**
* Evidence anchor discriminator for one durable Citation. `anchorSeq` mirrors
* the record-level coordinate; the canonical schema enforces equality.
*/
const citationEntrySchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("assistant-message"),
		anchorSeq: z.number().int().nonnegative()
	}).strict(),
	z.object({
		kind: z.literal("tool-result"),
		anchorSeq: z.number().int().nonnegative(),
		callId: z.string().min(1),
		toolName: z.string().min(1),
		projection: z.enum([
			"result-text",
			"terminal",
			"diff"
		]),
		fileIndex: z.number().int().nonnegative().optional(),
		side: z.enum(["old", "new"]).optional()
	}).strict(),
	z.object({
		kind: z.literal("document-range"),
		documentId: z.string().min(1),
		startOffset: z.number().int().nonnegative(),
		endOffset: z.number().int().positive()
	}).strict()
]);
/** Shared verified text projection carried by every Citation evidence record. */
const citationEvidenceFields = {
	sourceSessionId: z.string().min(1),
	anchorSeq: z.number().int().nonnegative(),
	startOffset: z.number().int().nonnegative(),
	endOffset: z.number().int().positive(),
	sourceText: z.string().min(1).max(32e3),
	displayText: z.string().min(1).max(32e3),
	prefixText: z.string().max(1e3),
	suffixText: z.string().max(1e3)
};
/** Canonical v4 Citation: the shared text projection plus one EvidenceRef entry. */
const citationRecordSchema = z.object({
	schemaVersion: z.literal(4),
	...citationEvidenceFields,
	entry: citationEntrySchema,
	selectionFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
	createdAt: z.number().int().nonnegative()
}).strict().superRefine((citation, context) => {
	if ("anchorSeq" in citation.entry && citation.entry.anchorSeq !== citation.anchorSeq) context.addIssue({
		code: "custom",
		message: "citation entry anchorSeq must equal the record anchorSeq",
		path: ["entry", "anchorSeq"]
	});
	if (citation.entry.kind === "document-range" && citation.anchorSeq !== 0) context.addIssue({
		code: "custom",
		message: "document EvidenceRef records must carry anchorSeq 0",
		path: ["anchorSeq"]
	});
});
/** On-disk Citation written by v3 (no entry) or v4. */
const citationRecordFileSchema = z.object({
	schemaVersion: z.union([z.literal(3), z.literal(4)]),
	...citationEvidenceFields,
	entry: citationEntrySchema.optional(),
	selectionFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
	createdAt: z.number().int().nonnegative()
}).strict();
/**
* Normalize one durable Citation file record to canonical v4.
* @param raw - parsed v3 or v4 file record.
* @returns canonical v4 record; v3 synthesizes its assistant-message entry.
*/
function normalizeCitationRecord(raw) {
	if (raw.schemaVersion === 4) {
		if (raw.entry === void 0) throw new Error("CiteCiter Citation v4 is missing its evidence entry");
		const { entry, ...rest } = raw;
		return citationRecordSchema.parse({
			...rest,
			entry
		});
	}
	const { entry: _legacyEntry, ...rest } = raw;
	return citationRecordSchema.parse({
		...rest,
		schemaVersion: 4,
		entry: {
			kind: "assistant-message",
			anchorSeq: raw.anchorSeq
		}
	});
}
/**
* Parse a durable Citation written by v3 or v4.
* @param raw - stored Citation value.
* @returns canonical v4 CitationRecord.
*/
function parseCitationRecord(raw) {
	return normalizeCitationRecord(citationRecordFileSchema.parse(raw));
}
const modelConfigSchema = z.object({
	provider: z.string().min(1),
	model: z.string().min(1),
	reasoningEffort: z.string().optional(),
	temperature: z.number().finite().optional(),
	maxTokens: z.number().int().positive().optional(),
	stop: z.array(z.string()).optional()
}).strict();
/** Fields shared by the canonical Topic metadata schema and its on-disk reader. */
const topicMetadataFields = {
	modelSelectionRequired: z.boolean().optional(),
	hosted: z.boolean().optional(),
	storage: z.literal("source").optional(),
	topicId: z.number().int().positive(),
	createRequestId: z.string().min(1).optional(),
	sessionId: z.string().min(1),
	sourceSessionId: z.string().min(1),
	sourceCwd: z.string(),
	mode: topicModeSchema,
	modelConfig: modelConfigSchema,
	forkThroughSeq: z.number().int().nonnegative().nullable(),
	temporaryTitle: z.string().min(1).max(160),
	cachedTitle: z.string().min(1).max(240).nullable(),
	cachedTitleSource: z.enum([
		"fallback",
		"provider",
		"user"
	]).nullable(),
	cachedTitleEventSeq: z.number().int().nonnegative().nullable().optional(),
	createdAt: z.number().int().nonnegative(),
	updatedAt: z.number().int().nonnegative(),
	archivedAt: z.number().int().nonnegative().nullable(),
	sourceAvailable: z.boolean(),
	/** Cursor from this Topic's last source read, never the source horizon or a permission boundary. */
	observedThroughSeq: z.number().int().nonnegative().nullable().optional().describe("Last source-read scan cursor; not the source horizon or an access limit.")
};
/** Canonical Topic metadata committed by the current runtime. */
const topicMetadataSchema = z.object({
	schemaVersion: z.literal(2),
	...topicMetadataFields,
	citation: citationRecordSchema.nullable(),
	scenario: topicScenarioSchema,
	documentId: z.string().min(1).nullable()
}).strict();
/** v1 metadata always carries a Citation; scenario/document fields landed during that version. */
const topicMetadataV1FileSchema = z.object({
	schemaVersion: z.literal(1),
	...topicMetadataFields,
	citation: citationRecordFileSchema,
	scenario: topicScenarioSchema.optional(),
	documentId: z.string().min(1).nullable().optional()
}).strict();
/** v2 metadata distinguishes a selected Citation from a source-bound free Topic. */
const topicMetadataV2FileSchema = z.object({
	schemaVersion: z.literal(2),
	...topicMetadataFields,
	citation: citationRecordFileSchema.nullable(),
	scenario: topicScenarioSchema,
	documentId: z.string().min(1).nullable()
}).strict();
/**
* Parse one on-disk Topic metadata record, normalizing legacy v3 Citations and
* missing scenario/document fields to their current defaults.
* @param raw - stored metadata value.
* @returns canonical TopicMetadata.
*/
function parseTopicMetadataFile(raw) {
	const { citation, scenario, documentId, ...rest } = z.union([topicMetadataV1FileSchema, topicMetadataV2FileSchema]).parse(raw);
	return topicMetadataSchema.parse({
		...rest,
		schemaVersion: 2,
		citation: citation === null ? null : parseCitationRecord(citation),
		scenario: scenario ?? "qa",
		documentId: documentId ?? null
	});
}
/**
* The title a Topic shows. DSH's fallback title repeats the first prompt, which for a Topic
* is Citer's action instructions, so the excerpt or question it started from stays until a
* provider or the user names the Topic.
* @param metadata - the Topic's cached and temporary titles.
* @returns the display title and whether a real title is still pending.
*/
function topicDisplayTitle(metadata) {
	const named = metadata.cachedTitleSource === "fallback" ? null : metadata.cachedTitle;
	return {
		title: named ?? metadata.temporaryTitle,
		pending: named === null
	};
}
const permissionSchema = z.enum([
	"read-only",
	"workspace-write",
	"danger-full-access"
]);
const topicSummarySchema = z.object({
	modelSelectionRequired: z.boolean().optional(),
	permission: permissionSchema.optional(),
	topicId: z.number().int().positive(),
	sessionId: z.string().min(1),
	sourceSessionId: z.string().min(1),
	documentId: z.string().min(1).nullable(),
	citation: citationRecordSchema.nullable(),
	title: z.string().min(1),
	titlePending: z.boolean(),
	createdAt: z.number().int().nonnegative(),
	updatedAt: z.number().int().nonnegative(),
	archived: z.boolean(),
	running: z.boolean(),
	sourceAvailable: z.boolean(),
	/** Cursor from this Topic's last source read, never the source horizon or a permission boundary. */
	observedThroughSeq: z.number().int().nonnegative().nullable().describe("Last source-read scan cursor; not the source horizon or an access limit."),
	modelConfig: modelConfigSchema
}).strict();
const messageAttachmentSchema = z.object({
	kind: z.enum(["image", "file"]),
	id: z.string().min(1),
	name: z.string()
}).strict();
const topicMessageIdentitySchema = {
	id: z.string().min(1),
	seq: z.number().int().nonnegative()
};
const topicMessageSchema = z.discriminatedUnion("role", [
	z.object({
		...topicMessageIdentitySchema,
		role: z.literal("user"),
		questionReply: questionReplySchema.optional(),
		attachments: z.array(messageAttachmentSchema).optional(),
		text: z.string()
	}).strict(),
	z.object({
		...topicMessageIdentitySchema,
		role: z.literal("assistant"),
		renderKey: z.string().optional(),
		attachments: z.array(messageAttachmentSchema).optional(),
		text: z.string(),
		reasoning: z.string().nullable(),
		streaming: z.boolean()
	}).strict(),
	z.object({
		...topicMessageIdentitySchema,
		role: z.literal("context"),
		label: z.string().min(1),
		/** DSH context role: material recalled from another session, or any other injected context. */
		contextRole: z.enum(["inject", "recall"]).optional(),
		/** Producer named by the durable source: a plugin package, a source kind, or Citer's own form. */
		producer: z.string().nullable().optional(),
		/** One-line account a `notice` records for its collapsed row. */
		summary: z.string().optional(),
		text: z.string()
	}).strict(),
	z.object({
		...topicMessageIdentitySchema,
		role: z.literal("tool"),
		questionReply: questionReplySchema.optional(),
		attachments: z.array(messageAttachmentSchema).optional(),
		name: z.string().min(1),
		arguments: z.string(),
		result: z.string().nullable(),
		/** Structured result metadata the tool recorded beside its model-facing text (read windows, search hits, exit codes). */
		meta: z.unknown().optional(),
		/** The run_code call that dispatched this one, when it was a programmatic child call. */
		parentCallId: z.string().optional(),
		isError: z.boolean(),
		errorCode: z.enum(QUESTION_TOOL_OUTCOME_CODES).optional(),
		approvalOutcome: z.literal("rejected").optional(),
		interruptionOutcome: z.literal("interrupted").optional(),
		running: z.boolean()
	}).strict(),
	z.object({
		...topicMessageIdentitySchema,
		role: z.literal("error"),
		turn: z.number().int().nonnegative().optional(),
		text: z.string(),
		bodyRetained: z.boolean(),
		attempt: z.number().int().positive(),
		status: z.enum(["failed", "stopped"])
	}).strict()
]);
const questionOptionSchema = z.object({
	label: z.string().min(1),
	description: z.string().optional()
}).strict();
const questionItemSchema = z.object({
	id: z.string().min(1),
	question: z.string().min(1),
	header: z.string().optional(),
	detail: z.string().optional(),
	options: z.array(questionOptionSchema).optional(),
	multiSelect: z.boolean().optional()
}).strict();
const questionAnswerSchema = z.object({ answers: z.array(z.object({
	id: z.string().min(1),
	selected: z.array(z.string()),
	custom: z.string().optional()
}).strict()) }).strict();
const pendingQuestionSchema = z.object({
	key: z.string().min(1),
	questions: z.array(questionItemSchema).min(1),
	state: z.enum(["open", "continued"]).optional(),
	callId: z.string().min(1).optional(),
	timed: z.boolean().optional(),
	blocking: z.boolean().optional()
}).strict();
const topicSnapshotSchema = z.object({
	captureId: z.string().optional(),
	documentTitle: z.string().optional(),
	topic: topicSummarySchema,
	messages: z.array(topicMessageSchema),
	pendingQuestion: pendingQuestionSchema.nullable(),
	pendingQuestions: z.array(pendingQuestionSchema).optional(),
	error: z.string().nullable(),
	board: boardSnapshotSchema.optional()
}).strict();
const modelOptionSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional(),
	reasoningEfforts: z.array(z.object({
		id: z.string().min(1),
		name: z.string().min(1)
	}).strict())
}).strict();
const providerOptionSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	models: z.array(modelOptionSchema)
}).strict();
const draftQuestionSchema = z.string().trim().max(12e3);
const questionSchema = z.string().trim().min(1).max(12e3);
const topicSessionIdSchema = z.string().min(1);
/** Tool-result claim of the whole card or a selected part of it; the Host verifies it against the committed `tool/result`. */
const toolEvidenceClaimSchema = z.object({
	sourceSessionId: z.string().min(1),
	callId: z.string().min(1),
	displayText: z.string().min(1).max(32e3),
	projection: z.enum([
		"result-text",
		"terminal",
		"diff"
	]).optional()
}).strict();
/** Browser-submitted claim that anchors one Topic on a CiteCiter document range. */
const documentEvidenceClaimSchema = z.object({
	sourceSessionId: z.string().min(1),
	documentId: z.string().min(1),
	displayText: z.string().min(1).max(32e3),
	prefixText: z.string().max(1e3),
	suffixText: z.string().max(1e3)
}).strict();
/** Document format accepted by the CiteCiter private document library. */
const documentFormatSchema = z.enum(["text", "markdown"]);
/** Document-library metadata exposed to the Reader and document Topics. */
const documentSummarySchema = z.object({
	documentId: z.string().min(1),
	title: z.string().trim().min(1).max(200),
	format: documentFormatSchema,
	size: z.number().int().nonnegative(),
	importedAt: z.number().int().nonnegative()
}).strict();
/** Bounded document content page returned to the Reader. */
const documentContentSchema = z.object({
	documentId: z.string().min(1),
	title: z.string().trim().min(1).max(200),
	format: documentFormatSchema,
	content: z.string(),
	truncated: z.boolean(),
	page: z.number().int().nonnegative().default(0),
	pageCount: z.number().int().positive().default(1)
}).strict();
const createFields = {
	action: z.literal("create"),
	modelRoute: actionModelSchema.optional(),
	requestId: z.string().min(1),
	question: draftQuestionSchema
};
/** Create a Topic bound to its source Session, optionally anchored on one piece of evidence the Host verifies. */
const createRequestSchema = z.union([
	z.object({
		...createFields,
		sourceSessionId: z.string().min(1)
	}).strict(),
	z.object({
		...createFields,
		selectionClaim: citationSelectionClaimSchema
	}).strict(),
	z.object({
		...createFields,
		toolClaim: toolEvidenceClaimSchema
	}).strict(),
	z.object({
		...createFields,
		documentClaim: documentEvidenceClaimSchema
	}).strict()
]);
/** One strict direct-RPC command for the private CiteCiter runtime. */
const citeCiterRequestSchema = z.union([createRequestSchema, z.discriminatedUnion("action", [
	z.object({
		action: z.literal("question-draft-get"),
		topicSessionId: topicSessionIdSchema,
		key: questionDraftKeySchema
	}).strict(),
	z.object({
		action: z.literal("question-draft-save"),
		topicSessionId: topicSessionIdSchema,
		key: questionDraftKeySchema,
		state: questionDraftStateSchema
	}).strict(),
	z.object({
		action: z.literal("draft-get"),
		topicSessionId: topicSessionIdSchema
	}).strict(),
	z.object({
		action: z.literal("draft-save"),
		topicSessionId: topicSessionIdSchema,
		state: draftStateSchema
	}).strict(),
	z.object({
		action: z.literal("draft-file-put"),
		topicSessionId: topicSessionIdSchema,
		file: draftFileSchema,
		offset: z.number().int().nonnegative(),
		data: z.string().max(349528).regex(/^[A-Za-z0-9+/]*={0,2}$/)
	}).strict(),
	z.object({
		action: z.literal("draft-file-get"),
		topicSessionId: topicSessionIdSchema,
		fileId: z.uuid(),
		offset: z.number().int().nonnegative()
	}).strict(),
	z.object({
		action: z.literal("list"),
		sourceSessionId: z.string().min(1),
		includeArchived: z.boolean().optional()
	}).strict(),
	z.object({
		action: z.literal("board-capture"),
		topicSessionId: topicSessionIdSchema,
		id: z.string().min(1),
		png: z.string().max(8e6).regex(/^[A-Za-z0-9+/]+={0,2}$/).optional(),
		error: z.string().max(500).optional()
	}).strict(),
	z.object({ action: z.literal("board-capture-pending") }).strict(),
	z.object({
		action: z.literal("get"),
		topicSessionId: topicSessionIdSchema
	}).strict(),
	z.object({
		action: z.literal("native-state"),
		topicSessionId: topicSessionIdSchema,
		requestIds: z.array(z.string().min(1).max(100)).max(32)
	}).strict(),
	z.object({
		action: z.literal("native-attachment"),
		topicSessionId: topicSessionIdSchema,
		attachmentId: z.string().min(1).max(200)
	}).strict(),
	z.object({
		action: z.literal("ask"),
		requestId: z.string().min(1).optional(),
		topicSessionId: topicSessionIdSchema,
		question: questionSchema
	}).strict(),
	z.object({
		action: z.literal("stop"),
		topicSessionId: topicSessionIdSchema
	}).strict(),
	z.object({
		action: z.literal("answer-question"),
		topicSessionId: topicSessionIdSchema,
		key: z.string().min(1),
		answer: questionAnswerSchema,
		draftRevision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1).optional()
	}).strict(),
	z.object({
		action: z.literal("cancel-question"),
		topicSessionId: topicSessionIdSchema,
		key: z.string().min(1)
	}).strict(),
	z.object({
		action: z.literal("timeout-question"),
		topicSessionId: topicSessionIdSchema,
		key: z.string().min(1)
	}).strict(),
	z.object({
		action: z.literal("rename"),
		topicSessionId: topicSessionIdSchema,
		title: z.string().trim().min(1).max(240)
	}).strict(),
	z.object({
		action: z.literal("archive"),
		topicSessionId: topicSessionIdSchema,
		archived: z.boolean()
	}).strict(),
	z.object({
		action: z.literal("delete"),
		topicSessionId: topicSessionIdSchema,
		confirmSessionId: topicSessionIdSchema
	}).strict(),
	z.object({ action: z.literal("models") }).strict(),
	z.object({
		action: z.literal("set-permission"),
		topicSessionId: topicSessionIdSchema,
		mode: permissionSchema
	}).strict(),
	z.object({
		action: z.literal("set-model-route"),
		topicSessionId: topicSessionIdSchema,
		provider: z.string().min(1),
		model: z.string().min(1)
	}).strict(),
	z.object({
		action: z.literal("set-reasoning-effort"),
		topicSessionId: topicSessionIdSchema,
		reasoningEffort: z.string().min(1).nullable()
	}).strict(),
	z.object({
		action: z.literal("document-import"),
		requestId: z.string().min(1).optional(),
		title: z.string().trim().min(1).max(200),
		format: documentFormatSchema,
		content: z.string().min(1).max(2e6)
	}).strict(),
	z.object({ action: z.literal("documents") }).strict(),
	z.object({
		action: z.literal("document-get"),
		documentId: z.string().min(1),
		page: z.number().int().nonnegative().optional()
	}).strict()
])]);
/** Strict response union returned by the single Remote command endpoint. */
const citeCiterResponseSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("question-draft"),
		state: questionDraftStateSchema,
		conflict: z.boolean(),
		closed: z.boolean()
	}).strict(),
	z.object({
		kind: z.literal("draft"),
		state: draftStateSchema,
		conflict: z.boolean()
	}).strict(),
	z.object({ kind: z.literal("draft-file-saved") }).strict(),
	z.object({
		kind: z.literal("draft-file"),
		data: z.string().max(349528).regex(/^[A-Za-z0-9+/]*={0,2}$/)
	}).strict(),
	z.object({
		kind: z.literal("board-captures"),
		jobs: z.array(boardCaptureJobSchema)
	}).strict(),
	z.object({ kind: z.literal("board-capture-accepted") }).strict(),
	z.object({
		kind: z.literal("native-state"),
		state: nativeStateSchema
	}).strict(),
	z.object({
		kind: z.literal("native-attachment"),
		attachment: nativeAttachmentRefSchema,
		data: z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/)
	}).strict(),
	z.object({
		kind: z.literal("topic"),
		topic: topicSnapshotSchema
	}).strict(),
	z.object({
		kind: z.literal("topics"),
		topics: z.array(topicSummarySchema)
	}).strict(),
	z.object({
		kind: z.literal("models"),
		providers: z.array(providerOptionSchema)
	}).strict(),
	z.object({
		kind: z.literal("deleted"),
		sessionId: z.string().min(1),
		sourceSessionId: z.string().min(1),
		topicId: z.number().int().positive(),
		cleanup: z.enum(["complete", "pending"])
	}).strict(),
	z.object({
		kind: z.literal("document"),
		document: documentSummarySchema
	}).strict(),
	z.object({
		kind: z.literal("documents"),
		documents: z.array(documentSummarySchema)
	}).strict(),
	z.object({
		kind: z.literal("document-content"),
		document: documentContentSchema
	}).strict()
]);
/** Serialize the identity-bearing fields. Legacy drafts without an entry keep their v3 identity. */
function canonicalCitationIdentity(citation) {
	return JSON.stringify([
		citation.sourceSessionId,
		citation.anchorSeq,
		citation.startOffset,
		citation.endOffset,
		citation.sourceText,
		citation.displayText,
		citation.prefixText,
		citation.suffixText,
		...citation.entry === void 0 ? [] : [citation.entry]
	]);
}
//#endregion
//#region lib/types/package-version.js
/** Accept canonical package versions, including prerelease and build identifiers, without coercion. */
function parsePackageVersion(version) {
	const parsed = parse(version);
	if (parsed === null) return null;
	return parsed.version + (parsed.build.length > 0 ? `+${parsed.build.join(".")}` : "") === version ? parsed : null;
}
/** Validate an exact package version, not an npm tag, range or CLI argument. */
function isPackageVersion(version) {
	return parsePackageVersion(version) !== null;
}
/**
* Compare complete package versions using npm SemVer precedence; build metadata does not affect order.
* @param installed - installed package version.
* @param available - version selected by the registry tag; it may be a prerelease.
* @returns negative, zero or positive, or null when either input is not a canonical package version.
*/
function comparePackageVersions(installed, available) {
	const left = parsePackageVersion(installed);
	const right = parsePackageVersion(available);
	if (left === null || right === null) return null;
	const result = left.compare(right);
	return result < 0 ? -1 : result > 0 ? 1 : 0;
}
//#endregion
//#region lib/types/update.js
/** Bounded, read-only npm update check for the Web plugin. */
/** Fixed registry document used to resolve the installable `latest` version. */
const CITECITER_NPM_LATEST_URL = "https://registry.npmjs.org/@kirkchinese%2fdsh-citeciter/latest";
/** Successful checks remain fresh for six hours in one Host process. */
const UPDATE_CHECK_TTL_MS = 216e5;
const UPDATE_CHECK_TIMEOUT_MS = 5e3;
const UPDATE_RESPONSE_MAX_BYTES = 65536;
/** npm tags select versions; latest is not a guarantee that the selected version is stable. */
const packageVersionSchema = z.string().refine(isPackageVersion, "expected a canonical SemVer package version");
/** Stable failure identifiers consumed by the Web settings and notification UI. */
const updateCheckErrorCodeSchema = z.enum([
	"installed-version-invalid",
	"registry-timeout",
	"registry-network",
	"registry-http",
	"registry-response-too-large",
	"registry-response-invalid",
	"registry-version-invalid"
]);
/** Strict result of one read-only npm `latest` check. */
const updateCheckResponseSchema = z.discriminatedUnion("kind", [z.object({
	kind: z.literal("success"),
	installedVersion: packageVersionSchema,
	latestVersion: packageVersionSchema,
	updateAvailable: z.boolean(),
	checkedAt: z.number().int().nonnegative(),
	profile: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/u).optional()
}).strict(), z.object({
	kind: z.literal("error"),
	code: updateCheckErrorCodeSchema,
	checkedAt: z.number().int().nonnegative()
}).strict()]);
const registryLatestSchema = z.object({ version: z.string() }).passthrough();
var UpdateFailure = class extends Error {
	code;
	constructor(code) {
		super(code);
		this.code = code;
	}
};
async function readInstalledVersion() {
	const [{ readFile }, { createRequire }] = await Promise.all([import("node:fs/promises"), import("node:module")]);
	const raw = await readFile(createRequire(import.meta.url).resolve("@kirkchinese/dsh-citeciter/package.json"), "utf8");
	const parsed = JSON.parse(raw);
	return z.object({ version: z.string() }).passthrough().parse(parsed).version;
}
async function cancelReader(reader) {
	try {
		await reader.cancel();
	} catch {}
}
async function cancelResponseBody(response) {
	try {
		await response.body?.cancel();
	} catch {}
}
async function readBoundedText(response, signal) {
	const declaredLength = response.headers.get("content-length");
	if (declaredLength !== null && /^\d+$/u.test(declaredLength) && Number(declaredLength) > UPDATE_RESPONSE_MAX_BYTES) {
		await cancelResponseBody(response);
		throw new UpdateFailure("registry-response-too-large");
	}
	if (response.body === null) return "";
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let received = 0;
	let text = "";
	while (true) {
		signal.throwIfAborted();
		const chunk = await reader.read();
		if (chunk.done) break;
		received += chunk.value.byteLength;
		if (received > UPDATE_RESPONSE_MAX_BYTES) {
			await cancelReader(reader);
			throw new UpdateFailure("registry-response-too-large");
		}
		text += decoder.decode(chunk.value, { stream: true });
	}
	return text + decoder.decode();
}
/** Per-Host update checker with bounded I/O and a successful-result TTL cache. */
var UpdateChecker = class {
	fetchImpl;
	now;
	installedVersion;
	cached;
	inFlight;
	/**
	* @param fetchImpl - HTTPS transport; injectable for deterministic tests.
	* @param now - wall-clock provider used for response timestamps and cache expiry.
	* @param installedVersion - installed package-version reader.
	*/
	constructor(fetchImpl = globalThis.fetch, now = Date.now, installedVersion = readInstalledVersion) {
		this.fetchImpl = fetchImpl;
		this.now = now;
		this.installedVersion = installedVersion;
	}
	/**
	* Read npm's installable latest version without mutating the installation.
	* @param callerSignal - Remote caller cancellation.
	* @returns a strict success or stable classified failure.
	*/
	async check(callerSignal) {
		callerSignal.throwIfAborted();
		const now = this.now();
		if (this.cached !== void 0 && now < this.cached.expiresAt) return this.cached.response;
		if (this.inFlight === void 0) {
			const operation = this.checkFresh().finally(() => {
				if (this.inFlight === operation) this.inFlight = void 0;
			});
			this.inFlight = operation;
		}
		return waitForCaller(this.inFlight, callerSignal);
	}
	async checkFresh() {
		let installedVersion;
		try {
			installedVersion = await this.installedVersion();
		} catch {
			return {
				kind: "error",
				code: "installed-version-invalid",
				checkedAt: this.now()
			};
		}
		if (!packageVersionSchema.safeParse(installedVersion).success) return {
			kind: "error",
			code: "installed-version-invalid",
			checkedAt: this.now()
		};
		const timeoutSignal = AbortSignal.timeout(UPDATE_CHECK_TIMEOUT_MS);
		const signal = timeoutSignal;
		try {
			const response = await this.fetchImpl(CITECITER_NPM_LATEST_URL, {
				method: "GET",
				headers: { accept: "application/json" },
				redirect: "error",
				signal
			});
			if (!response.ok) {
				await cancelResponseBody(response);
				return {
					kind: "error",
					code: "registry-http",
					checkedAt: this.now()
				};
			}
			const text = await readBoundedText(response, signal);
			let raw;
			try {
				raw = JSON.parse(text);
			} catch {
				return {
					kind: "error",
					code: "registry-response-invalid",
					checkedAt: this.now()
				};
			}
			const latest = registryLatestSchema.safeParse(raw);
			if (!latest.success) return {
				kind: "error",
				code: "registry-response-invalid",
				checkedAt: this.now()
			};
			const comparison = comparePackageVersions(installedVersion, latest.data.version);
			if (comparison === null) return {
				kind: "error",
				code: "registry-version-invalid",
				checkedAt: this.now()
			};
			const checkedAt = this.now();
			const result = {
				kind: "success",
				installedVersion,
				latestVersion: latest.data.version,
				updateAvailable: comparison < 0,
				checkedAt
			};
			this.cached = {
				expiresAt: checkedAt + UPDATE_CHECK_TTL_MS,
				response: result
			};
			return result;
		} catch (error) {
			if (timeoutSignal.aborted) return {
				kind: "error",
				code: "registry-timeout",
				checkedAt: this.now()
			};
			if (error instanceof UpdateFailure) return {
				kind: "error",
				code: error.code,
				checkedAt: this.now()
			};
			return {
				kind: "error",
				code: "registry-network",
				checkedAt: this.now()
			};
		}
	}
};
function waitForCaller(operation, signal) {
	signal.throwIfAborted();
	return new Promise((resolve, reject) => {
		const onAbort = () => reject(signal.reason);
		signal.addEventListener("abort", onAbort, { once: true });
		operation.then(resolve, reject).finally(() => {
			signal.removeEventListener("abort", onAbort);
		});
	});
}
//#endregion
export { applyBoardOps as A, draftFileSchema as B, questionReplyText as C, learningCardsInputSchema as D, LEARNING_CARD_FIELD_DESCRIPTIONS as E, EMPTY_QUESTION_DRAFT_STATE as F, subtractSubmitted as H, questionDraftKeySchema as I, questionDraftRecordSchema as L, ANIMATION_MAX_DURATION_MS as M, animationSpecSchema as N, LEARNING_EXAMPLE_PARAMETER as O, compileTimeline as P, DRAFT_CHUNK_BYTES as R, topicSummarySchema as S, DEFAULT_WHEEL_SLOTS as T, draftStateSchema as V, readCiteCiterSettings as _, DEFAULT_CITECITER_SETTINGS as a, topicMetadataSchema as b, citationDraftSchema as c, citeCiterRequestSchema as d, citeCiterResponseSchema as f, parseTopicMetadataFile as g, documentSummarySchema as h, CITECITER_SETTINGS_NAMESPACE as i, boardBatchSchema as j, EMPTY_BOARD_STATE as k, citationRecordSchema as l, documentEvidenceClaimSchema as m, updateCheckErrorCodeSchema as n, TUTOR_SECTION_NAME as o, documentContentSchema as p, updateCheckResponseSchema as r, canonicalCitationIdentity as s, UpdateChecker as t, citationSelectionClaimSchema as u, toolEvidenceClaimSchema as v, readQuestionReply as w, topicSnapshotSchema as x, topicDisplayTitle as y, EMPTY_DRAFT_STATE as z };
