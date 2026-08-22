window.__ModuleLoader__.load({
	id: "@kirkchinese/dsh-citeciter",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
		var _a$1;
		function $constructor(name, initializer, params) {
			function init(inst, def) {
				if (!inst._zod) Object.defineProperty(inst, "_zod", {
					value: {
						def,
						constr: _,
						traits: /* @__PURE__ */ new Set()
					},
					enumerable: false
				});
				if (inst._zod.traits.has(name)) return;
				inst._zod.traits.add(name);
				initializer(inst, def);
				const proto = _.prototype;
				const keys = Object.keys(proto);
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					if (!(k in inst)) inst[k] = proto[k].bind(inst);
				}
			}
			const Parent = params?.Parent ?? Object;
			class Definition extends Parent {}
			Object.defineProperty(Definition, "name", { value: name });
			function _(def) {
				var _a;
				const inst = params?.Parent ? new Definition() : this;
				init(inst, def);
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				for (const fn of inst._zod.deferred) fn();
				return inst;
			}
			Object.defineProperty(_, "init", { value: init });
			Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
				if (params?.Parent && inst instanceof params.Parent) return true;
				return inst?._zod?.traits?.has(name);
			} });
			Object.defineProperty(_, "name", { value: name });
			return _;
		}
		var $ZodAsyncError = class extends Error {
			constructor() {
				super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
			}
		};
		var $ZodEncodeError = class extends Error {
			constructor(name) {
				super(`Encountered unidirectional transform during encode: ${name}`);
				this.name = "ZodEncodeError";
			}
		};
		(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
		const globalConfig = globalThis.__zod_globalConfig;
		function config(newConfig) {
			if (newConfig) Object.assign(globalConfig, newConfig);
			return globalConfig;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js
		function getEnumValues(entries) {
			const numericValues = Object.values(entries).filter((v) => typeof v === "number");
			return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
		}
		function jsonStringifyReplacer(_, value) {
			if (typeof value === "bigint") return value.toString();
			return value;
		}
		function cached(getter) {
			return { get value() {
				{
					const value = getter();
					Object.defineProperty(this, "value", { value });
					return value;
				}
			} };
		}
		function nullish(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		function floatSafeRemainder(val, step) {
			const ratio = val / step;
			const roundedRatio = Math.round(ratio);
			const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
			if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
			return ratio - roundedRatio;
		}
		const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
		function defineLazy(object, key, getter) {
			let value = void 0;
			Object.defineProperty(object, key, {
				get() {
					if (value === EVALUATING) return;
					if (value === void 0) {
						value = EVALUATING;
						value = getter();
					}
					return value;
				},
				set(v) {
					Object.defineProperty(object, key, { value: v });
				},
				configurable: true
			});
		}
		function assignProp(target, prop, value) {
			Object.defineProperty(target, prop, {
				value,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		function mergeDefs(...defs) {
			const mergedDescriptors = {};
			for (const def of defs) {
				const descriptors = Object.getOwnPropertyDescriptors(def);
				Object.assign(mergedDescriptors, descriptors);
			}
			return Object.defineProperties({}, mergedDescriptors);
		}
		function esc(str) {
			return JSON.stringify(str);
		}
		function slugify(input) {
			return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
		function isObject(data) {
			return typeof data === "object" && data !== null && !Array.isArray(data);
		}
		const allowsEval = /* @__PURE__*/ cached(() => {
			if (globalConfig.jitless) return false;
			if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
			try {
				new Function("");
				return true;
			} catch (_) {
				return false;
			}
		});
		function isPlainObject(o) {
			if (isObject(o) === false) return false;
			const ctor = o.constructor;
			if (ctor === void 0) return true;
			if (typeof ctor !== "function") return true;
			const prot = ctor.prototype;
			if (isObject(prot) === false) return false;
			if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
			return true;
		}
		function shallowClone(o) {
			if (isPlainObject(o)) return { ...o };
			if (Array.isArray(o)) return [...o];
			if (o instanceof Map) return new Map(o);
			if (o instanceof Set) return new Set(o);
			return o;
		}
		const propertyKeyTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"symbol"
		]);
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function clone(inst, def, params) {
			const cl = new inst._zod.constr(def ?? inst._zod.def);
			if (!def || params?.parent) cl._zod.parent = inst;
			return cl;
		}
		function normalizeParams(_params) {
			const params = _params;
			if (!params) return {};
			if (typeof params === "string") return { error: () => params };
			if (params?.message !== void 0) {
				if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				params.error = params.message;
			}
			delete params.message;
			if (typeof params.error === "string") return {
				...params,
				error: () => params.error
			};
			return params;
		}
		function optionalKeys(shape) {
			return Object.keys(shape).filter((k) => {
				return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
			});
		}
		const NUMBER_FORMAT_RANGES = {
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		};
		function pick(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = {};
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						newShape[key] = currDef.shape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function omit(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = { ...schema._zod.def.shape };
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						delete newShape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function extend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) {
				const existingShape = schema._zod.def.shape;
				for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function safeExtend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function merge(a, b) {
			if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			return clone(a, mergeDefs(a._zod.def, {
				get shape() {
					const _shape = {
						...a._zod.def.shape,
						...b._zod.def.shape
					};
					assignProp(this, "shape", _shape);
					return _shape;
				},
				get catchall() {
					return b._zod.def.catchall;
				},
				checks: b._zod.def.checks ?? []
			}));
		}
		function partial(Class, schema, mask) {
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const oldShape = schema._zod.def.shape;
					const shape = { ...oldShape };
					if (mask) for (const key in mask) {
						if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						shape[key] = Class ? new Class({
							type: "optional",
							innerType: oldShape[key]
						}) : oldShape[key];
					}
					else for (const key in oldShape) shape[key] = Class ? new Class({
						type: "optional",
						innerType: oldShape[key]
					}) : oldShape[key];
					assignProp(this, "shape", shape);
					return shape;
				},
				checks: []
			}));
		}
		function required(Class, schema, mask) {
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const oldShape = schema._zod.def.shape;
				const shape = { ...oldShape };
				if (mask) for (const key in mask) {
					if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					shape[key] = new Class({
						type: "nonoptional",
						innerType: oldShape[key]
					});
				}
				else for (const key in oldShape) shape[key] = new Class({
					type: "nonoptional",
					innerType: oldShape[key]
				});
				assignProp(this, "shape", shape);
				return shape;
			} }));
		}
		function aborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
			return false;
		}
		function explicitlyAborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
			return false;
		}
		function prefixIssues(path, issues) {
			return issues.map((iss) => {
				var _a;
				(_a = iss).path ?? (_a.path = []);
				iss.path.unshift(path);
				return iss;
			});
		}
		function unwrapMessage(message) {
			return typeof message === "string" ? message : message?.message;
		}
		function finalizeIssue(iss, ctx, config) {
			const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
			const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
			rest.path ?? (rest.path = []);
			rest.message = message;
			if (ctx?.reportInput) rest.input = _input;
			return rest;
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function issue(...args) {
			const [iss, input, inst] = args;
			if (typeof iss === "string") return {
				message: iss,
				code: "custom",
				input,
				inst
			};
			return { ...iss };
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js
		const initializer$1 = (inst, def) => {
			inst.name = "$ZodError";
			Object.defineProperty(inst, "_zod", {
				value: inst._zod,
				enumerable: false
			});
			Object.defineProperty(inst, "issues", {
				value: def,
				enumerable: false
			});
			inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
			Object.defineProperty(inst, "toString", {
				value: () => inst.message,
				enumerable: false
			});
		};
		const $ZodError = $constructor("$ZodError", initializer$1);
		const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
		function flattenError(error, mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of error.issues) if (sub.path.length > 0) {
				fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
				fieldErrors[sub.path[0]].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		function formatError(error, mapper = (issue) => issue.message) {
			const fieldErrors = { _errors: [] };
			const processError = (error, path = []) => {
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < fullpath.length) {
							const el = fullpath[i];
							if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
							else {
								curr[el] = curr[el] || { _errors: [] };
								curr[el]._errors.push(mapper(issue));
							}
							curr = curr[el];
							i++;
						}
					}
				}
			};
			processError(error);
			return fieldErrors;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js
		const _parse = (_Err) => (schema, value, _ctx, _params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			if (result.issues.length) {
				const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, _params?.callee);
				throw e;
			}
			return result.value;
		};
		const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			if (result.issues.length) {
				const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, params?.callee);
				throw e;
			}
			return result.value;
		};
		const _safeParse = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length ? {
				success: false,
				error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
		const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length ? {
				success: false,
				error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
		const _encode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parse(_Err)(schema, value, ctx);
		};
		const _decode = (_Err) => (schema, value, _ctx) => {
			return _parse(_Err)(schema, value, _ctx);
		};
		const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parseAsync(_Err)(schema, value, ctx);
		};
		const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _parseAsync(_Err)(schema, value, _ctx);
		};
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/regexes.js
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid = /^[cC][0-9a-z]{6,}$/;
		const cuid2 = /^[0-9a-z]+$/;
		const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
		const xid = /^[0-9a-vA-V]{20}$/;
		const ksuid = /^[A-Za-z0-9]{27}$/;
		const nanoid = /^[a-zA-Z0-9_-]{21}$/;
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		/** Practical email validation */
		const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		function emoji() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url = /^[A-Za-z0-9_-]*$/;
		const httpProtocol = /^https?$/;
		const e164 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		const date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
		function timeSource(args) {
			const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
			return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
		}
		function time$1(args) {
			return new RegExp(`^${timeSource(args)}$`);
		}
		function datetime$1(args) {
			const time = timeSource({ precision: args.precision });
			const opts = ["Z"];
			if (args.local) opts.push("");
			if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
			const timeRegex = `${time}(?:${opts.join("|")})`;
			return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
		}
		const string$1 = (params) => {
			const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
			return new RegExp(`^${regex}$`);
		};
		const integer = /^-?\d+$/;
		const number$1 = /^-?\d+(?:\.\d+)?$/;
		const boolean$1 = /^(?:true|false)$/i;
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/checks.js
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		const numericOriginMap = {
			number: "number",
			bigint: "bigint",
			object: "date"
		};
		const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
				if (def.value < curr) {
					if (def.inclusive) bag.maximum = def.value;
					else bag.exclusiveMaximum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
				if (def.value > curr) {
					if (def.inclusive) bag.minimum = def.value;
					else bag.exclusiveMinimum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				var _a;
				(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
			});
			inst._zod.check = (payload) => {
				if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
				payload.issues.push({
					origin: typeof payload.value,
					code: "not_multiple_of",
					divisor: def.value,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
			$ZodCheck.init(inst, def);
			def.format = def.format || "float64";
			const isInt = def.format?.includes("int");
			const origin = isInt ? "int" : "number";
			const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				bag.minimum = minimum;
				bag.maximum = maximum;
				if (isInt) bag.pattern = integer;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (isInt) {
					if (!Number.isInteger(input)) {
						payload.issues.push({
							expected: origin,
							format: def.format,
							code: "invalid_type",
							continue: false,
							input,
							inst
						});
						return;
					}
					if (!Number.isSafeInteger(input)) {
						if (input > 0) payload.issues.push({
							input,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						else payload.issues.push({
							input,
							code: "too_small",
							minimum: Number.MIN_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						return;
					}
				}
				if (input < minimum) payload.issues.push({
					origin: "number",
					input,
					code: "too_small",
					minimum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
				if (input > maximum) payload.issues.push({
					origin: "number",
					input,
					code: "too_big",
					maximum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length <= def.maximum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length >= def.minimum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.minimum = def.length;
				bag.maximum = def.length;
				bag.length = def.length;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const length = input.length;
				if (length === def.length) return;
				const origin = getLengthableOrigin(input);
				const tooBig = length > def.length;
				payload.issues.push({
					origin,
					...tooBig ? {
						code: "too_big",
						maximum: def.length
					} : {
						code: "too_small",
						minimum: def.length
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
			var _a, _b;
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				if (def.pattern) {
					bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
					bag.patterns.add(def.pattern);
				}
			});
			if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					...def.pattern ? { pattern: def.pattern.toString() } : {},
					inst,
					continue: !def.abort
				});
			});
			else (_b = inst._zod).check ?? (_b.check = () => {});
		});
		const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: payload.value,
					pattern: def.pattern.toString(),
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
			def.pattern ?? (def.pattern = lowercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
			def.pattern ?? (def.pattern = uppercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
			$ZodCheck.init(inst, def);
			const escapedRegex = escapeRegex(def.includes);
			const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
			def.pattern = pattern;
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.includes(def.includes, def.position)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: def.includes,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.startsWith(def.prefix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: def.prefix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.endsWith(def.suffix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: def.suffix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				payload.value = def.tx(payload.value);
			};
		});
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/doc.js
		var Doc = class {
			constructor(args = []) {
				this.content = [];
				this.indent = 0;
				if (this) this.args = args;
			}
			indented(fn) {
				this.indent += 1;
				fn(this);
				this.indent -= 1;
			}
			write(arg) {
				if (typeof arg === "function") {
					arg(this, { execution: "sync" });
					arg(this, { execution: "async" });
					return;
				}
				const lines = arg.split("\n").filter((x) => x);
				const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
				const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
				for (const line of dedented) this.content.push(line);
			}
			compile() {
				const F = Function;
				const args = this?.args;
				const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
				return new F(...args, lines.join("\n"));
			}
		};
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/versions.js
		const version = {
			major: 4,
			minor: 4,
			patch: 3
		};
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/schemas.js
		const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
			var _a;
			inst ?? (inst = {});
			inst._zod.def = def;
			inst._zod.bag = inst._zod.bag || {};
			inst._zod.version = version;
			const checks = [...inst._zod.def.checks ?? []];
			if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
			for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
			if (checks.length === 0) {
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred?.push(() => {
					inst._zod.run = inst._zod.parse;
				});
			} else {
				const runChecks = (payload, checks, ctx) => {
					let isAborted = aborted(payload);
					let asyncResult;
					for (const ch of checks) {
						if (ch._zod.def.when) {
							if (explicitlyAborted(payload)) continue;
							if (!ch._zod.def.when(payload)) continue;
						} else if (isAborted) continue;
						const currLen = payload.issues.length;
						const _ = ch._zod.check(payload);
						if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
						if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
							await _;
							if (payload.issues.length === currLen) return;
							if (!isAborted) isAborted = aborted(payload, currLen);
						});
						else {
							if (payload.issues.length === currLen) continue;
							if (!isAborted) isAborted = aborted(payload, currLen);
						}
					}
					if (asyncResult) return asyncResult.then(() => {
						return payload;
					});
					return payload;
				};
				const handleCanaryResult = (canary, payload, ctx) => {
					if (aborted(canary)) {
						canary.aborted = true;
						return canary;
					}
					const checkResult = runChecks(payload, checks, ctx);
					if (checkResult instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
					}
					return inst._zod.parse(checkResult, ctx);
				};
				inst._zod.run = (payload, ctx) => {
					if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
					if (ctx.direction === "backward") {
						const canary = inst._zod.parse({
							value: payload.value,
							issues: []
						}, {
							...ctx,
							skipChecks: true
						});
						if (canary instanceof Promise) return canary.then((canary) => {
							return handleCanaryResult(canary, payload, ctx);
						});
						return handleCanaryResult(canary, payload, ctx);
					}
					const result = inst._zod.parse(payload, ctx);
					if (result instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return result.then((result) => runChecks(result, checks, ctx));
					}
					return runChecks(result, checks, ctx);
				};
			}
			defineLazy(inst, "~standard", () => ({
				validate: (value) => {
					try {
						const r = safeParse$1(inst, value);
						return r.success ? { value: r.data } : { issues: r.error?.issues };
					} catch (_) {
						return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
					}
				},
				vendor: "zod",
				version: 1
			}));
		});
		const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
			inst._zod.parse = (payload, _) => {
				if (def.coerce) try {
					payload.value = String(payload.value);
				} catch (_) {}
				if (typeof payload.value === "string") return payload;
				payload.issues.push({
					expected: "string",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			$ZodString.init(inst, def);
		});
		const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
			def.pattern ?? (def.pattern = guid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
			if (def.version) {
				const v = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[def.version];
				if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
				def.pattern ?? (def.pattern = uuid(v));
			} else def.pattern ?? (def.pattern = uuid());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				try {
					const trimmed = payload.value.trim();
					if (!def.normalize && def.protocol?.source === httpProtocol.source) {
						if (!/^https?:\/\//i.test(trimmed)) {
							payload.issues.push({
								code: "invalid_format",
								format: "url",
								note: "Invalid URL format",
								input: payload.value,
								inst,
								continue: !def.abort
							});
							return;
						}
					}
					const url = new URL(trimmed);
					if (def.hostname) {
						def.hostname.lastIndex = 0;
						if (!def.hostname.test(url.hostname)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid hostname",
							pattern: def.hostname.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.protocol) {
						def.protocol.lastIndex = 0;
						if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid protocol",
							pattern: def.protocol.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.normalize) payload.value = url.href;
					else payload.value = trimmed;
					return;
				} catch (_) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
			def.pattern ?? (def.pattern = emoji());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			def.pattern ?? (def.pattern = nanoid);
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
			def.pattern ?? (def.pattern = time$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
			def.pattern ?? (def.pattern = duration$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
			def.pattern ?? (def.pattern = ipv4);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv4`;
		});
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv6`;
			inst._zod.check = (payload) => {
				try {
					new URL(`http://[${payload.value}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "ipv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				const parts = payload.value.split("/");
				try {
					if (parts.length !== 2) throw new Error();
					const [address, prefix] = parts;
					if (!prefix) throw new Error();
					const prefixNum = Number(prefix);
					if (`${prefixNum}` !== prefix) throw new Error();
					if (prefixNum < 0 || prefixNum > 128) throw new Error();
					new URL(`http://[${address}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "cidrv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		function isValidBase64(data) {
			if (data === "") return true;
			if (/\s/.test(data)) return false;
			if (data.length % 4 !== 0) return false;
			try {
				atob(data);
				return true;
			} catch {
				return false;
			}
		}
		const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
			def.pattern ?? (def.pattern = base64);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64";
			inst._zod.check = (payload) => {
				if (isValidBase64(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64URL(data) {
			if (!base64url.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64url);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64url";
			inst._zod.check = (payload) => {
				if (isValidBase64URL(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
			def.pattern ?? (def.pattern = e164);
			$ZodStringFormat.init(inst, def);
		});
		function isValidJWT(token, algorithm = null) {
			try {
				const tokensParts = token.split(".");
				if (tokensParts.length !== 3) return false;
				const [header] = tokensParts;
				if (!header) return false;
				const parsedHeader = JSON.parse(atob(header));
				if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
				if (!parsedHeader.alg) return false;
				if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
				return true;
			} catch {
				return false;
			}
		}
		const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidJWT(payload.value, def.alg)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Number(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
				const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
				payload.issues.push({
					expected: "number",
					code: "invalid_type",
					input,
					inst,
					...received ? { received } : {}
				});
				return payload;
			};
		});
		const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
			$ZodCheckNumberFormat.init(inst, def);
			$ZodNumber.init(inst, def);
		});
		const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = boolean$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Boolean(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "boolean") return payload;
				payload.issues.push({
					expected: "boolean",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
		});
		const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				payload.issues.push({
					expected: "never",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		function handleArrayResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						expected: "array",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = Array(input.length);
				const proms = [];
				for (let i = 0; i < input.length; i++) {
					const item = input[i];
					const result = def.element._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
					else handleArrayResult(result, payload, i);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
			const isPresent = key in input;
			if (result.issues.length) {
				if (isOptionalIn && isOptionalOut && !isPresent) return;
				final.issues.push(...prefixIssues(key, result.issues));
			}
			if (!isPresent && !isOptionalIn) {
				if (!result.issues.length) final.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [key]
				});
				return;
			}
			if (result.value === void 0) {
				if (isPresent) final.value[key] = void 0;
			} else final.value[key] = result.value;
		}
		function normalizeDef(def) {
			const keys = Object.keys(def.shape);
			for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
			const okeys = optionalKeys(def.shape);
			return {
				...def,
				keys,
				keySet: new Set(keys),
				numKeys: keys.length,
				optionalKeys: new Set(okeys)
			};
		}
		function handleCatchall(proms, input, payload, ctx, def, inst) {
			const unrecognized = [];
			const keySet = def.keySet;
			const _catchall = def.catchall._zod;
			const t = _catchall.def.type;
			const isOptionalIn = _catchall.optin === "optional";
			const isOptionalOut = _catchall.optout === "optional";
			for (const key in input) {
				if (key === "__proto__") continue;
				if (keySet.has(key)) continue;
				if (t === "never") {
					unrecognized.push(key);
					continue;
				}
				const r = _catchall.run({
					value: input[key],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
				else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
			}
			if (unrecognized.length) payload.issues.push({
				code: "unrecognized_keys",
				keys: unrecognized,
				input,
				inst
			});
			if (!proms.length) return payload;
			return Promise.all(proms).then(() => {
				return payload;
			});
		}
		const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
			$ZodType.init(inst, def);
			if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
				const sh = def.shape;
				Object.defineProperty(def, "shape", { get: () => {
					const newSh = { ...sh };
					Object.defineProperty(def, "shape", { value: newSh });
					return newSh;
				} });
			}
			const _normalized = cached(() => normalizeDef(def));
			defineLazy(inst._zod, "propValues", () => {
				const shape = def.shape;
				const propValues = {};
				for (const key in shape) {
					const field = shape[key]._zod;
					if (field.values) {
						propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
						for (const v of field.values) propValues[key].add(v);
					}
				}
				return propValues;
			});
			const isObject$1 = isObject;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$1(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = {};
				const proms = [];
				const shape = value.shape;
				for (const key of value.keys) {
					const el = shape[key];
					const isOptionalIn = el._zod.optin === "optional";
					const isOptionalOut = el._zod.optout === "optional";
					const r = el._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
					else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
				}
				if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
				return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
			};
		});
		const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
			$ZodObject.init(inst, def);
			const superParse = inst._zod.parse;
			const _normalized = cached(() => normalizeDef(def));
			const generateFastpass = (shape) => {
				const doc = new Doc([
					"shape",
					"payload",
					"ctx"
				]);
				const normalized = _normalized.value;
				const parseStr = (key) => {
					const k = esc(key);
					return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
				};
				doc.write(`const input = payload.value;`);
				const ids = Object.create(null);
				let counter = 0;
				for (const key of normalized.keys) ids[key] = `key_${counter++}`;
				doc.write(`const newResult = {};`);
				for (const key of normalized.keys) {
					const id = ids[key];
					const k = esc(key);
					const schema = shape[key];
					const isOptionalIn = schema?._zod?.optin === "optional";
					const isOptionalOut = schema?._zod?.optout === "optional";
					doc.write(`const ${id} = ${parseStr(key)};`);
					if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }

        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }

      `);
					else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
					else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }

        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }

      `);
				}
				doc.write(`payload.value = newResult;`);
				doc.write(`return payload;`);
				const fn = doc.compile();
				return (payload, ctx) => fn(shape, payload, ctx);
			};
			let fastpass;
			const isObject$2 = isObject;
			const jit = !globalConfig.jitless;
			const fastEnabled = jit && allowsEval.value;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$2(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
					if (!fastpass) fastpass = generateFastpass(def.shape);
					payload = fastpass(payload, ctx);
					if (!catchall) return payload;
					return handleCatchall([], input, payload, ctx, value, inst);
				}
				return superParse(payload, ctx);
			};
		});
		function handleUnionResults(results, final, inst, ctx) {
			for (const result of results) if (result.issues.length === 0) {
				final.value = result.value;
				return final;
			}
			const nonaborted = results.filter((r) => !aborted(r));
			if (nonaborted.length === 1) {
				final.value = nonaborted[0].value;
				return nonaborted[0];
			}
			final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			return final;
		}
		const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "values", () => {
				if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
			});
			defineLazy(inst._zod, "pattern", () => {
				if (def.options.every((o) => o._zod.pattern)) {
					const patterns = def.options.map((o) => o._zod.pattern);
					return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
				}
			});
			const first = def.options.length === 1 ? def.options[0]._zod.run : null;
			inst._zod.parse = (payload, ctx) => {
				if (first) return first(payload, ctx);
				let async = false;
				const results = [];
				for (const option of def.options) {
					const result = option._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) {
						results.push(result);
						async = true;
					} else {
						if (result.issues.length === 0) return result;
						results.push(result);
					}
				}
				if (!async) return handleUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleUnionResults(results, payload, inst, ctx);
				});
			};
		});
		const $ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("$ZodDiscriminatedUnion", (inst, def) => {
			def.inclusive = false;
			$ZodUnion.init(inst, def);
			const _super = inst._zod.parse;
			defineLazy(inst._zod, "propValues", () => {
				const propValues = {};
				for (const option of def.options) {
					const pv = option._zod.propValues;
					if (!pv || Object.keys(pv).length === 0) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(option)}"`);
					for (const [k, v] of Object.entries(pv)) {
						if (!propValues[k]) propValues[k] = /* @__PURE__ */ new Set();
						for (const val of v) propValues[k].add(val);
					}
				}
				return propValues;
			});
			const disc = cached(() => {
				const opts = def.options;
				const map = /* @__PURE__ */ new Map();
				for (const o of opts) {
					const values = o._zod.propValues?.[def.discriminator];
					if (!values || values.size === 0) throw new Error(`Invalid discriminated union option at index "${def.options.indexOf(o)}"`);
					for (const v of values) {
						if (map.has(v)) throw new Error(`Duplicate discriminator value "${String(v)}"`);
						map.set(v, o);
					}
				}
				return map;
			});
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!isObject(input)) {
					payload.issues.push({
						code: "invalid_type",
						expected: "object",
						input,
						inst
					});
					return payload;
				}
				const opt = disc.value.get(input?.[def.discriminator]);
				if (opt) return opt._zod.run(payload, ctx);
				if (def.unionFallback || ctx.direction === "backward") return _super(payload, ctx);
				payload.issues.push({
					code: "invalid_union",
					errors: [],
					note: "No matching discriminator",
					discriminator: def.discriminator,
					options: Array.from(disc.value.keys()),
					input,
					path: [def.discriminator],
					inst
				});
				return payload;
			};
		});
		const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				const left = def.left._zod.run({
					value: input,
					issues: []
				}, ctx);
				const right = def.right._zod.run({
					value: input,
					issues: []
				}, ctx);
				if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
					return handleIntersectionResults(payload, left, right);
				});
				return handleIntersectionResults(payload, left, right);
			};
		});
		function mergeValues(a, b) {
			if (a === b) return {
				valid: true,
				data: a
			};
			if (a instanceof Date && b instanceof Date && +a === +b) return {
				valid: true,
				data: a
			};
			if (isPlainObject(a) && isPlainObject(b)) {
				const bKeys = Object.keys(b);
				const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				for (const key of sharedKeys) {
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
					};
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			}
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a.length !== b.length) return {
					valid: false,
					mergeErrorPath: []
				};
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
					};
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			}
			return {
				valid: false,
				mergeErrorPath: []
			};
		}
		function handleIntersectionResults(result, left, right) {
			const unrecKeys = /* @__PURE__ */ new Map();
			let unrecIssue;
			for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
				unrecIssue ?? (unrecIssue = iss);
				for (const k of iss.keys) {
					if (!unrecKeys.has(k)) unrecKeys.set(k, {});
					unrecKeys.get(k).l = true;
				}
			} else result.issues.push(iss);
			for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
				if (!unrecKeys.has(k)) unrecKeys.set(k, {});
				unrecKeys.get(k).r = true;
			}
			else result.issues.push(iss);
			const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
			if (bothKeys.length && unrecIssue) result.issues.push({
				...unrecIssue,
				keys: bothKeys
			});
			if (aborted(result)) return result;
			const merged = mergeValues(left.value, right.value);
			if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
			result.value = merged.data;
			return result;
		}
		const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
			$ZodType.init(inst, def);
			const values = getEnumValues(def.entries);
			const valuesSet = new Set(values);
			inst._zod.values = valuesSet;
			inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (valuesSet.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
			$ZodType.init(inst, def);
			if (def.values.length === 0) throw new Error("Cannot create literal schema with no valid values");
			const values = new Set(def.values);
			inst._zod.values = values;
			inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (values.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values: def.values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				const _out = def.transform(payload.value, payload);
				if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				if (_out instanceof Promise) throw new $ZodAsyncError();
				payload.value = _out;
				payload.fallback = true;
				return payload;
			};
		});
		function handleOptionalResult(result, input) {
			if (input === void 0 && (result.issues.length || result.fallback)) return {
				issues: [],
				value: void 0
			};
			return result;
		}
		const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.optout = "optional";
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
			});
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (def.innerType._zod.optin === "optional") {
					const input = payload.value;
					const result = def.innerType._zod.run(payload, ctx);
					if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
					return handleOptionalResult(result, input);
				}
				if (payload.value === void 0) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
			inst._zod.parse = (payload, ctx) => {
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
			});
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === null) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) {
					payload.value = def.defaultValue;
					/**
					* $ZodDefault returns the default value immediately in forward direction.
					* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
					return payload;
				}
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
				return handleDefaultResult(result, def);
			};
		});
		function handleDefaultResult(payload, def) {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return payload;
		}
		const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) payload.value = def.defaultValue;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => {
				const v = def.innerType._zod.values;
				return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
				return handleNonOptionalResult(result, inst);
			};
		});
		function handleNonOptionalResult(payload, inst) {
			if (!payload.issues.length && payload.value === void 0) payload.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: payload.value,
				inst
			});
			return payload;
		}
		const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => {
					payload.value = result.value;
					if (result.issues.length) {
						payload.value = def.catchValue({
							...payload,
							error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
							input: payload.value
						});
						payload.issues = [];
						payload.fallback = true;
					}
					return payload;
				});
				payload.value = result.value;
				if (result.issues.length) {
					payload.value = def.catchValue({
						...payload,
						error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
						input: payload.value
					});
					payload.issues = [];
					payload.fallback = true;
				}
				return payload;
			};
		});
		const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => def.in._zod.values);
			defineLazy(inst._zod, "optin", () => def.in._zod.optin);
			defineLazy(inst._zod, "optout", () => def.out._zod.optout);
			defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
					return handlePipeResult(right, def.in, ctx);
				}
				const left = def.in._zod.run(payload, ctx);
				if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
				return handlePipeResult(left, def.out, ctx);
			};
		});
		function handlePipeResult(left, next, ctx) {
			if (left.issues.length) {
				left.aborted = true;
				return left;
			}
			return next._zod.run({
				value: left.value,
				issues: left.issues,
				fallback: left.fallback
			}, ctx);
		}
		const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
			defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then(handleReadonlyResult);
				return handleReadonlyResult(result);
			};
		});
		function handleReadonlyResult(payload) {
			payload.value = Object.freeze(payload.value);
			return payload;
		}
		const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
			$ZodCheck.init(inst, def);
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _) => {
				return payload;
			};
			inst._zod.check = (payload) => {
				const input = payload.value;
				const r = def.fn(input);
				if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
				handleRefineResult(r, payload, input, inst);
			};
		});
		function handleRefineResult(result, payload, input, inst) {
			if (!result) {
				const _iss = {
					code: "custom",
					input,
					inst,
					path: [...inst._zod.def.path ?? []],
					continue: !inst._zod.def.abort
				};
				if (inst._zod.def.params) _iss.params = inst._zod.def.params;
				payload.issues.push(issue(_iss));
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
		var _a;
		var $ZodRegistry = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
			}
			add(schema, ..._meta) {
				const meta = _meta[0];
				this._map.set(schema, meta);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
				return this;
			}
			clear() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
				return this;
			}
			remove(schema) {
				const meta = this._map.get(schema);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
				this._map.delete(schema);
				return this;
			}
			get(schema) {
				const p = schema._zod.parent;
				if (p) {
					const pm = { ...this.get(p) ?? {} };
					delete pm.id;
					const f = {
						...pm,
						...this._map.get(schema)
					};
					return Object.keys(f).length ? f : void 0;
				}
				return this._map.get(schema);
			}
			has(schema) {
				return this._map.has(schema);
			}
		};
		function registry() {
			return new $ZodRegistry();
		}
		(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
		const globalRegistry = globalThis.__zod_globalRegistry;
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class({
				type: "string",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _email(Class, params) {
			return new Class({
				type: "string",
				format: "email",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _guid(Class, params) {
			return new Class({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuid(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv4(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v4",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv6(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v6",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv7(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v7",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _url(Class, params) {
			return new Class({
				type: "string",
				format: "url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _emoji(Class, params) {
			return new Class({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nanoid(Class, params) {
			return new Class({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link _cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		// @__NO_SIDE_EFFECTS__
		function _cuid(Class, params) {
			return new Class({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cuid2(Class, params) {
			return new Class({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ulid(Class, params) {
			return new Class({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _xid(Class, params) {
			return new Class({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ksuid(Class, params) {
			return new Class({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv4(Class, params) {
			return new Class({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv6(Class, params) {
			return new Class({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv4(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv6(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64(Class, params) {
			return new Class({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64url(Class, params) {
			return new Class({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _e164(Class, params) {
			return new Class({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _jwt(Class, params) {
			return new Class({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDateTime(Class, params) {
			return new Class({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: false,
				local: false,
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDate(Class, params) {
			return new Class({
				type: "string",
				format: "date",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoTime(Class, params) {
			return new Class({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDuration(Class, params) {
			return new Class({
				type: "string",
				format: "duration",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _number(Class, params) {
			return new Class({
				type: "number",
				checks: [],
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _int(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "safeint",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _boolean(Class, params) {
			return new Class({
				type: "boolean",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _unknown(Class) {
			return new Class({ type: "unknown" });
		}
		// @__NO_SIDE_EFFECTS__
		function _never(Class, params) {
			return new Class({
				type: "never",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lt(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lte(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gt(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gte(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _multipleOf(value, params) {
			return new $ZodCheckMultipleOf({
				check: "multiple_of",
				...normalizeParams(params),
				value
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _maxLength(maximum, params) {
			return new $ZodCheckMaxLength({
				check: "max_length",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minLength(minimum, params) {
			return new $ZodCheckMinLength({
				check: "min_length",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _length(length, params) {
			return new $ZodCheckLengthEquals({
				check: "length_equals",
				...normalizeParams(params),
				length
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _regex(pattern, params) {
			return new $ZodCheckRegex({
				check: "string_format",
				format: "regex",
				...normalizeParams(params),
				pattern
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lowercase(params) {
			return new $ZodCheckLowerCase({
				check: "string_format",
				format: "lowercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uppercase(params) {
			return new $ZodCheckUpperCase({
				check: "string_format",
				format: "uppercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _includes(includes, params) {
			return new $ZodCheckIncludes({
				check: "string_format",
				format: "includes",
				...normalizeParams(params),
				includes
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _startsWith(prefix, params) {
			return new $ZodCheckStartsWith({
				check: "string_format",
				format: "starts_with",
				...normalizeParams(params),
				prefix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _endsWith(suffix, params) {
			return new $ZodCheckEndsWith({
				check: "string_format",
				format: "ends_with",
				...normalizeParams(params),
				suffix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _overwrite(tx) {
			return new $ZodCheckOverwrite({
				check: "overwrite",
				tx
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _normalize(form) {
			return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
		}
		// @__NO_SIDE_EFFECTS__
		function _trim() {
			return /* @__PURE__ */ _overwrite((input) => input.trim());
		}
		// @__NO_SIDE_EFFECTS__
		function _toLowerCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _toUpperCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _slugify() {
			return /* @__PURE__ */ _overwrite((input) => slugify(input));
		}
		// @__NO_SIDE_EFFECTS__
		function _array(Class, element, params) {
			return new Class({
				type: "array",
				element,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _refine(Class, fn, _params) {
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...normalizeParams(_params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _superRefine(fn, params) {
			const ch = /* @__PURE__ */ _check((payload) => {
				payload.addIssue = (issue$2) => {
					if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
					else {
						const _issue = issue$2;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = ch);
						_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
						payload.issues.push(issue(_issue));
					}
				};
				return fn(payload.value, payload);
			}, params);
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _check(fn, params) {
			const ch = new $ZodCheck({
				check: "custom",
				...normalizeParams(params)
			});
			ch._zod.check = fn;
			return ch;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
		function initializeContext(params) {
			let target = params?.target ?? "draft-2020-12";
			if (target === "draft-4") target = "draft-04";
			if (target === "draft-7") target = "draft-07";
			return {
				processors: params.processors ?? {},
				metadataRegistry: params?.metadata ?? globalRegistry,
				target,
				unrepresentable: params?.unrepresentable ?? "throw",
				override: params?.override ?? (() => {}),
				io: params?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				cycles: params?.cycles ?? "ref",
				reused: params?.reused ?? "inline",
				external: params?.external ?? void 0
			};
		}
		function process(schema, ctx, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const seen = ctx.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			ctx.seen.set(schema, result);
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
				else {
					const _json = result.schema;
					const processor = ctx.processors[def.type];
					if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
					processor(schema, ctx, _json, params);
				}
				const parent = schema._zod.parent;
				if (parent) {
					if (!result.ref) result.ref = parent;
					process(parent, ctx, params);
					ctx.seen.get(parent).isParent = true;
				}
			}
			const meta = ctx.metadataRegistry.get(schema);
			if (meta) Object.assign(result.schema, meta);
			if (ctx.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return ctx.seen.get(schema).schema;
		}
		function extractDefs(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const idToSchema = /* @__PURE__ */ new Map();
			for (const entry of ctx.seen.entries()) {
				const id = ctx.metadataRegistry.get(entry[0])?.id;
				if (id) {
					const existing = idToSchema.get(id);
					if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
					idToSchema.set(id, entry[0]);
				}
			}
			const makeURI = (entry) => {
				const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
				if (ctx.external) {
					const externalId = ctx.external.registry.get(entry[0])?.id;
					const uriGenerator = ctx.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
					};
				}
				if (entry[1] === root) return { ref: "#" };
				const defUriPrefix = `#/${defsSegment}/`;
				const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
				return {
					defId,
					ref: defUriPrefix + defId
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (ctx.external) {
					const ext = ctx.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (ctx.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (ctx.reused === "ref") {
						extractToDef(entry);
						continue;
					}
				}
			}
		}
		function finalize(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const flattenRef = (zodSchema) => {
				const seen = ctx.seen.get(zodSchema);
				if (seen.ref === null) return;
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref);
					const refSeen = ctx.seen.get(ref);
					const refSchema = refSeen.schema;
					if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else Object.assign(schema, refSchema);
					Object.assign(schema, _cached);
					if (zodSchema._zod.parent === ref) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (!(key in _cached)) delete schema[key];
					}
					if (refSchema.$ref && refSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
					}
				}
				const parent = zodSchema._zod.parent;
				if (parent && parent !== ref) {
					flattenRef(parent);
					const parentSeen = ctx.seen.get(parent);
					if (parentSeen?.schema.$ref) {
						schema.$ref = parentSeen.schema.$ref;
						if (parentSeen.def) for (const key in schema) {
							if (key === "$ref" || key === "allOf") continue;
							if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
						}
					}
				}
				ctx.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
			const result = {};
			if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
			else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
			else if (ctx.target === "openapi-3.0") {}
			if (ctx.external?.uri) {
				const id = ctx.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = ctx.external.uri(id);
			}
			Object.assign(result, root.def ?? root.schema);
			const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
			if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
			const defs = ctx.external?.defs ?? {};
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) {
					if (seen.def.id === seen.defId) delete seen.def.id;
					defs[seen.defId] = seen.def;
				}
			}
			if (ctx.external) {} else if (Object.keys(defs).length > 0) {
				if (ctx.target === "draft-2020-12") result.$defs = defs;
				else result.definitions = defs;
			}
			try {
				const finalized = JSON.parse(JSON.stringify(result));
				Object.defineProperty(finalized, "~standard", {
					value: {
						...schema["~standard"],
						jsonSchema: {
							input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
							output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
						}
					},
					enumerable: false,
					writable: false
				});
				return finalized;
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function isTransforming(_schema, _ctx) {
			const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
			if (ctx.seen.has(_schema)) return false;
			ctx.seen.add(_schema);
			const def = _schema._zod.def;
			if (def.type === "transform") return true;
			if (def.type === "array") return isTransforming(def.element, ctx);
			if (def.type === "set") return isTransforming(def.valueType, ctx);
			if (def.type === "lazy") return isTransforming(def.getter(), ctx);
			if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
			if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			if (def.type === "pipe") {
				if (_schema._zod.traits.has("$ZodCodec")) return true;
				return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			}
			if (def.type === "object") {
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			}
			if (def.type === "union") {
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			}
			if (def.type === "tuple") {
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			}
			return false;
		}
		/**
		* Creates a toJSONSchema method for a schema instance.
		* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
		*/
		const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
			const ctx = initializeContext({
				...params,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
			const { libraryOptions, target } = params ?? {};
			const ctx = initializeContext({
				...libraryOptions ?? {},
				target,
				io,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
		const formatMap = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		};
		const stringProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			json.type = "string";
			const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
			if (typeof minimum === "number") json.minLength = minimum;
			if (typeof maximum === "number") json.maxLength = maximum;
			if (format) {
				json.format = formatMap[format] ?? format;
				if (json.format === "") delete json.format;
				if (format === "time") delete json.format;
			}
			if (contentEncoding) json.contentEncoding = contentEncoding;
			if (patterns && patterns.size > 0) {
				const regexes = [...patterns];
				if (regexes.length === 1) json.pattern = regexes[0].source;
				else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
					...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: regex.source
				}))];
			}
		};
		const numberProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
			if (typeof format === "string" && format.includes("int")) json.type = "integer";
			else json.type = "number";
			const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
			const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
			const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
			if (exMin) {
				if (legacy) {
					json.minimum = exclusiveMinimum;
					json.exclusiveMinimum = true;
				} else json.exclusiveMinimum = exclusiveMinimum;
			} else if (typeof minimum === "number") json.minimum = minimum;
			if (exMax) {
				if (legacy) {
					json.maximum = exclusiveMaximum;
					json.exclusiveMaximum = true;
				} else json.exclusiveMaximum = exclusiveMaximum;
			} else if (typeof maximum === "number") json.maximum = maximum;
			if (typeof multipleOf === "number") json.multipleOf = multipleOf;
		};
		const booleanProcessor = (_schema, _ctx, json, _params) => {
			json.type = "boolean";
		};
		const neverProcessor = (_schema, _ctx, json, _params) => {
			json.not = {};
		};
		const enumProcessor = (schema, _ctx, json, _params) => {
			const def = schema._zod.def;
			const values = getEnumValues(def.entries);
			if (values.every((v) => typeof v === "number")) json.type = "number";
			if (values.every((v) => typeof v === "string")) json.type = "string";
			json.enum = values;
		};
		const literalProcessor = (schema, ctx, json, _params) => {
			const def = schema._zod.def;
			const vals = [];
			for (const val of def.values) if (val === void 0) {
				if (ctx.unrepresentable === "throw") throw new Error("Literal `undefined` cannot be represented in JSON Schema");
			} else if (typeof val === "bigint") {
				if (ctx.unrepresentable === "throw") throw new Error("BigInt literals cannot be represented in JSON Schema");
				else vals.push(Number(val));
			} else vals.push(val);
			if (vals.length === 0) {} else if (vals.length === 1) {
				const val = vals[0];
				json.type = val === null ? "null" : typeof val;
				if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
				else json.const = val;
			} else {
				if (vals.every((v) => typeof v === "number")) json.type = "number";
				if (vals.every((v) => typeof v === "string")) json.type = "string";
				if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
				if (vals.every((v) => v === null)) json.type = "null";
				json.enum = vals;
			}
		};
		const customProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		};
		const transformProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		};
		const arrayProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const { minimum, maximum } = schema._zod.bag;
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
			json.type = "array";
			json.items = process(def.element, ctx, {
				...params,
				path: [...params.path, "items"]
			});
		};
		const objectProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			json.properties = {};
			const shape = def.shape;
			for (const key in shape) json.properties[key] = process(shape[key], ctx, {
				...params,
				path: [
					...params.path,
					"properties",
					key
				]
			});
			const allKeys = new Set(Object.keys(shape));
			const requiredKeys = new Set([...allKeys].filter((key) => {
				const v = def.shape[key]._zod;
				if (ctx.io === "input") return v.optin === void 0;
				else return v.optout === void 0;
			}));
			if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
			if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
			else if (!def.catchall) {
				if (ctx.io === "output") json.additionalProperties = false;
			} else if (def.catchall) json.additionalProperties = process(def.catchall, ctx, {
				...params,
				path: [...params.path, "additionalProperties"]
			});
		};
		const unionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const isExclusive = def.inclusive === false;
			const options = def.options.map((x, i) => process(x, ctx, {
				...params,
				path: [
					...params.path,
					isExclusive ? "oneOf" : "anyOf",
					i
				]
			}));
			if (isExclusive) json.oneOf = options;
			else json.anyOf = options;
		};
		const intersectionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const a = process(def.left, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					0
				]
			});
			const b = process(def.right, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					1
				]
			});
			const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
			json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
		};
		const nullableProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const inner = process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			if (ctx.target === "openapi-3.0") {
				seen.ref = def.innerType;
				json.nullable = true;
			} else json.anyOf = [inner, { type: "null" }];
		};
		const nonoptionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const defaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.default = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const prefaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const catchProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			let catchValue;
			try {
				catchValue = def.catchValue(void 0);
			} catch {
				throw new Error("Dynamic catch values are not supported in JSON Schema");
			}
			json.default = catchValue;
		};
		const pipeProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			const inIsTransform = def.in._zod.traits.has("$ZodTransform");
			const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const readonlyProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.readOnly = true;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/iso.js
		const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
			$ZodISODateTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function datetime(params) {
			return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
		}
		const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
			$ZodISODate.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function date(params) {
			return /* @__PURE__ */ _isoDate(ZodISODate, params);
		}
		const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
			$ZodISOTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function time(params) {
			return /* @__PURE__ */ _isoTime(ZodISOTime, params);
		}
		const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
			$ZodISODuration.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function duration(params) {
			return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
		}
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/errors.js
		const initializer = (inst, issues) => {
			$ZodError.init(inst, issues);
			inst.name = "ZodError";
			Object.defineProperties(inst, {
				format: { value: (mapper) => formatError(inst, mapper) },
				flatten: { value: (mapper) => flattenError(inst, mapper) },
				addIssue: { value: (issue) => {
					inst.issues.push(issue);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				addIssues: { value: (issues) => {
					inst.issues.push(...issues);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				isEmpty: { get() {
					return inst.issues.length === 0;
				} }
			});
		};
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, { Parent: Error });
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/parse.js
		const parse = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode = /* @__PURE__ */ _decode(ZodRealError);
		const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
		const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
		const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
		const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
		const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
		const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
		//#endregion
		//#region ../../node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
		const _installedGroups = /* @__PURE__ */ new WeakMap();
		function _installLazyMethods(inst, group, methods) {
			const proto = Object.getPrototypeOf(inst);
			let installed = _installedGroups.get(proto);
			if (!installed) {
				installed = /* @__PURE__ */ new Set();
				_installedGroups.set(proto, installed);
			}
			if (installed.has(group)) return;
			installed.add(group);
			for (const key in methods) {
				const fn = methods[key];
				Object.defineProperty(proto, key, {
					configurable: true,
					enumerable: false,
					get() {
						const bound = fn.bind(this);
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: bound
						});
						return bound;
					},
					set(v) {
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: v
						});
					}
				});
			}
		}
		const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
			$ZodType.init(inst, def);
			Object.assign(inst["~standard"], { jsonSchema: {
				input: createStandardJSONSchemaMethod(inst, "input"),
				output: createStandardJSONSchemaMethod(inst, "output")
			} });
			inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
			inst.def = def;
			inst.type = def.type;
			Object.defineProperty(inst, "_def", { value: def });
			inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
			inst.safeParse = (data, params) => safeParse(inst, data, params);
			inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
			inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
			inst.spa = inst.safeParseAsync;
			inst.encode = (data, params) => encode(inst, data, params);
			inst.decode = (data, params) => decode(inst, data, params);
			inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
			inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
			inst.safeEncode = (data, params) => safeEncode(inst, data, params);
			inst.safeDecode = (data, params) => safeDecode(inst, data, params);
			inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
			inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
			_installLazyMethods(inst, "ZodType", {
				check(...chks) {
					const def = this.def;
					return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
						check: ch,
						def: { check: "custom" },
						onattach: []
					} } : ch)] }), { parent: true });
				},
				with(...chks) {
					return this.check(...chks);
				},
				clone(def, params) {
					return clone(this, def, params);
				},
				brand() {
					return this;
				},
				register(reg, meta) {
					reg.add(this, meta);
					return this;
				},
				refine(check, params) {
					return this.check(refine(check, params));
				},
				superRefine(refinement, params) {
					return this.check(superRefine(refinement, params));
				},
				overwrite(fn) {
					return this.check(/* @__PURE__ */ _overwrite(fn));
				},
				optional() {
					return optional(this);
				},
				exactOptional() {
					return exactOptional(this);
				},
				nullable() {
					return nullable(this);
				},
				nullish() {
					return optional(nullable(this));
				},
				nonoptional(params) {
					return nonoptional(this, params);
				},
				array() {
					return array(this);
				},
				or(arg) {
					return union([this, arg]);
				},
				and(arg) {
					return intersection(this, arg);
				},
				transform(tx) {
					return pipe(this, transform(tx));
				},
				default(d) {
					return _default(this, d);
				},
				prefault(d) {
					return prefault(this, d);
				},
				catch(params) {
					return _catch(this, params);
				},
				pipe(target) {
					return pipe(this, target);
				},
				readonly() {
					return readonly(this);
				},
				describe(description) {
					const cl = this.clone();
					globalRegistry.add(cl, { description });
					return cl;
				},
				meta(...args) {
					if (args.length === 0) return globalRegistry.get(this);
					const cl = this.clone();
					globalRegistry.add(cl, args[0]);
					return cl;
				},
				isOptional() {
					return this.safeParse(void 0).success;
				},
				isNullable() {
					return this.safeParse(null).success;
				},
				apply(fn) {
					return fn(this);
				}
			});
			Object.defineProperty(inst, "description", {
				get() {
					return globalRegistry.get(inst)?.description;
				},
				configurable: true
			});
			return inst;
		});
		/** @internal */
		const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
			const bag = inst._zod.bag;
			inst.format = bag.format ?? null;
			inst.minLength = bag.minimum ?? null;
			inst.maxLength = bag.maximum ?? null;
			_installLazyMethods(inst, "_ZodString", {
				regex(...args) {
					return this.check(/* @__PURE__ */ _regex(...args));
				},
				includes(...args) {
					return this.check(/* @__PURE__ */ _includes(...args));
				},
				startsWith(...args) {
					return this.check(/* @__PURE__ */ _startsWith(...args));
				},
				endsWith(...args) {
					return this.check(/* @__PURE__ */ _endsWith(...args));
				},
				min(...args) {
					return this.check(/* @__PURE__ */ _minLength(...args));
				},
				max(...args) {
					return this.check(/* @__PURE__ */ _maxLength(...args));
				},
				length(...args) {
					return this.check(/* @__PURE__ */ _length(...args));
				},
				nonempty(...args) {
					return this.check(/* @__PURE__ */ _minLength(1, ...args));
				},
				lowercase(params) {
					return this.check(/* @__PURE__ */ _lowercase(params));
				},
				uppercase(params) {
					return this.check(/* @__PURE__ */ _uppercase(params));
				},
				trim() {
					return this.check(/* @__PURE__ */ _trim());
				},
				normalize(...args) {
					return this.check(/* @__PURE__ */ _normalize(...args));
				},
				toLowerCase() {
					return this.check(/* @__PURE__ */ _toLowerCase());
				},
				toUpperCase() {
					return this.check(/* @__PURE__ */ _toUpperCase());
				},
				slugify() {
					return this.check(/* @__PURE__ */ _slugify());
				}
			});
		});
		const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			_ZodString.init(inst, def);
			inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
			inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
			inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
			inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
			inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
			inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
			inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
			inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
			inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
			inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
			inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
			inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
			inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
			inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
			inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
			inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
			inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
			inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
			inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
			inst.datetime = (params) => inst.check(datetime(params));
			inst.date = (params) => inst.check(date(params));
			inst.time = (params) => inst.check(time(params));
			inst.duration = (params) => inst.check(duration(params));
		});
		function string(params) {
			return /* @__PURE__ */ _string(ZodString, params);
		}
		const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			_ZodString.init(inst, def);
		});
		const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
			$ZodEmail.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
			$ZodNumber.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
			_installLazyMethods(inst, "ZodNumber", {
				gt(value, params) {
					return this.check(/* @__PURE__ */ _gt(value, params));
				},
				gte(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				min(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				lt(value, params) {
					return this.check(/* @__PURE__ */ _lt(value, params));
				},
				lte(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				max(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				int(params) {
					return this.check(int(params));
				},
				safe(params) {
					return this.check(int(params));
				},
				positive(params) {
					return this.check(/* @__PURE__ */ _gt(0, params));
				},
				nonnegative(params) {
					return this.check(/* @__PURE__ */ _gte(0, params));
				},
				negative(params) {
					return this.check(/* @__PURE__ */ _lt(0, params));
				},
				nonpositive(params) {
					return this.check(/* @__PURE__ */ _lte(0, params));
				},
				multipleOf(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				step(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				finite() {
					return this;
				}
			});
			const bag = inst._zod.bag;
			inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
			inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
			inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
			inst.isFinite = true;
			inst.format = bag.format ?? null;
		});
		function number(params) {
			return /* @__PURE__ */ _number(ZodNumber, params);
		}
		const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
			$ZodNumberFormat.init(inst, def);
			ZodNumber.init(inst, def);
		});
		function int(params) {
			return /* @__PURE__ */ _int(ZodNumberFormat, params);
		}
		const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
			$ZodBoolean.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
		});
		function boolean(params) {
			return /* @__PURE__ */ _boolean(ZodBoolean, params);
		}
		const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
			$ZodUnknown.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function unknown() {
			return /* @__PURE__ */ _unknown(ZodUnknown);
		}
		const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
			$ZodNever.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
		});
		function never(params) {
			return /* @__PURE__ */ _never(ZodNever, params);
		}
		const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
			$ZodArray.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
			inst.element = def.element;
			_installLazyMethods(inst, "ZodArray", {
				min(n, params) {
					return this.check(/* @__PURE__ */ _minLength(n, params));
				},
				nonempty(params) {
					return this.check(/* @__PURE__ */ _minLength(1, params));
				},
				max(n, params) {
					return this.check(/* @__PURE__ */ _maxLength(n, params));
				},
				length(n, params) {
					return this.check(/* @__PURE__ */ _length(n, params));
				},
				unwrap() {
					return this.element;
				}
			});
		});
		function array(element, params) {
			return /* @__PURE__ */ _array(ZodArray, element, params);
		}
		const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
			$ZodObjectJIT.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
			defineLazy(inst, "shape", () => {
				return def.shape;
			});
			_installLazyMethods(inst, "ZodObject", {
				keyof() {
					return _enum(Object.keys(this._zod.def.shape));
				},
				catchall(catchall) {
					return this.clone({
						...this._zod.def,
						catchall
					});
				},
				passthrough() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				loose() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				strict() {
					return this.clone({
						...this._zod.def,
						catchall: never()
					});
				},
				strip() {
					return this.clone({
						...this._zod.def,
						catchall: void 0
					});
				},
				extend(incoming) {
					return extend(this, incoming);
				},
				safeExtend(incoming) {
					return safeExtend(this, incoming);
				},
				merge(other) {
					return merge(this, other);
				},
				pick(mask) {
					return pick(this, mask);
				},
				omit(mask) {
					return omit(this, mask);
				},
				partial(...args) {
					return partial(ZodOptional, this, args[0]);
				},
				required(...args) {
					return required(ZodNonOptional, this, args[0]);
				}
			});
		});
		function object(shape, params) {
			const def = {
				type: "object",
				shape: shape ?? {},
				...normalizeParams(params)
			};
			return new ZodObject(def);
		}
		const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
			$ZodUnion.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		function union(options, params) {
			return new ZodUnion({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		const ZodDiscriminatedUnion = /*@__PURE__*/ $constructor("ZodDiscriminatedUnion", (inst, def) => {
			ZodUnion.init(inst, def);
			$ZodDiscriminatedUnion.init(inst, def);
		});
		function discriminatedUnion(discriminator, options, params) {
			return new ZodDiscriminatedUnion({
				type: "union",
				options,
				discriminator,
				...normalizeParams(params)
			});
		}
		const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
			$ZodIntersection.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
		});
		function intersection(left, right) {
			return new ZodIntersection({
				type: "intersection",
				left,
				right
			});
		}
		const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
			$ZodEnum.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
			inst.enum = def.entries;
			inst.options = Object.values(def.entries);
			const keys = new Set(Object.keys(def.entries));
			inst.extract = (values, params) => {
				const newEntries = {};
				for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
			inst.exclude = (values, params) => {
				const newEntries = { ...def.entries };
				for (const value of values) if (keys.has(value)) delete newEntries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
		});
		function _enum(values, params) {
			const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
			return new ZodEnum({
				type: "enum",
				entries,
				...normalizeParams(params)
			});
		}
		const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
			$ZodLiteral.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
			inst.values = new Set(def.values);
			Object.defineProperty(inst, "value", { get() {
				if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
				return def.values[0];
			} });
		});
		function literal(value, params) {
			return new ZodLiteral({
				type: "literal",
				values: Array.isArray(value) ? value : [value],
				...normalizeParams(params)
			});
		}
		const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
			$ZodTransform.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
			inst._zod.parse = (payload, _ctx) => {
				if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				payload.addIssue = (issue$1) => {
					if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
					else {
						const _issue = issue$1;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = inst);
						payload.issues.push(issue(_issue));
					}
				};
				const output = def.transform(payload.value, payload);
				if (output instanceof Promise) return output.then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				payload.value = output;
				payload.fallback = true;
				return payload;
			};
		});
		function transform(fn) {
			return new ZodTransform({
				type: "transform",
				transform: fn
			});
		}
		const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function optional(innerType) {
			return new ZodOptional({
				type: "optional",
				innerType
			});
		}
		const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
			$ZodExactOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function exactOptional(innerType) {
			return new ZodExactOptional({
				type: "optional",
				innerType
			});
		}
		const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
			$ZodNullable.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nullable(innerType) {
			return new ZodNullable({
				type: "nullable",
				innerType
			});
		}
		const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
			$ZodDefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeDefault = inst.unwrap;
		});
		function _default(innerType, defaultValue) {
			return new ZodDefault({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
			$ZodPrefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function prefault(innerType, defaultValue) {
			return new ZodPrefault({
				type: "prefault",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
			$ZodNonOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nonoptional(innerType, params) {
			return new ZodNonOptional({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
			$ZodCatch.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeCatch = inst.unwrap;
		});
		function _catch(innerType, catchValue) {
			return new ZodCatch({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
			});
		}
		const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
			$ZodPipe.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
			inst.in = def.in;
			inst.out = def.out;
		});
		function pipe(in_, out) {
			return new ZodPipe({
				type: "pipe",
				in: in_,
				out
			});
		}
		const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
			$ZodReadonly.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function readonly(innerType) {
			return new ZodReadonly({
				type: "readonly",
				innerType
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		/** Host settings namespace mirrored by the browser settings scope. */
		const CITECITER_SETTINGS_NAMESPACE = "citeciter";
		const topicModeSchema = _enum(["observer", "exact-fork"]);
		/** User preferences applied to new Topics and source reads. */
		const citeCiterSettingsSchema = object({
			defaultMode: _enum(["observer", "exact-when-available"]),
			includeSourceReasoning: boolean(),
			allowSourceFiles: boolean(),
			panelWidthPercent: number().int().min(28).max(55),
			reopenLastTopic: boolean()
		}).strict();
		/** Settings used before an optional DSH settings provider becomes available. */
		const DEFAULT_CITECITER_SETTINGS = Object.freeze({
			defaultMode: "observer",
			includeSourceReasoning: true,
			allowSourceFiles: true,
			panelWidthPercent: 34,
			reopenLastTopic: true
		});
		/** Browser-visible selection resolved by the Host against one committed model call. */
		const citationSelectionClaimSchema = object({
			sourceSessionId: string().min(1),
			anchorSeq: number().int().nonnegative(),
			displayText: string().min(1).max(32e3),
			sourceHintText: string().min(1).max(32e3).optional(),
			prefixText: string().max(1e3),
			suffixText: string().max(1e3)
		}).strict();
		/** Host-verifiable Markdown evidence plus the browser-visible quote used by the UI. */
		const citationDraftSchema = object({
			sourceSessionId: string().min(1),
			anchorSeq: number().int().nonnegative(),
			startOffset: number().int().nonnegative(),
			endOffset: number().int().positive(),
			sourceText: string().min(1).max(32e3),
			displayText: string().min(1).max(32e3),
			prefixText: string().max(1e3),
			suffixText: string().max(1e3),
			selectionFingerprint: string().regex(/^[a-f0-9]{64}$/)
		}).strict();
		const citationRecordSchema = citationDraftSchema.extend({
			schemaVersion: literal(3),
			createdAt: number().int().nonnegative()
		}).strict();
		const modelConfigSchema = object({
			provider: string().min(1),
			model: string().min(1),
			reasoningEffort: string().optional(),
			temperature: number().finite().optional(),
			maxTokens: number().int().positive().optional(),
			stop: array(string()).optional()
		}).strict();
		object({
			schemaVersion: literal(1),
			topicId: number().int().positive(),
			createRequestId: string().min(1).optional(),
			sessionId: string().min(1),
			sourceSessionId: string().min(1),
			sourceCwd: string(),
			mode: topicModeSchema,
			citation: citationRecordSchema,
			modelConfig: modelConfigSchema,
			forkThroughSeq: number().int().nonnegative().nullable(),
			temporaryTitle: string().min(1).max(160),
			cachedTitle: string().min(1).max(240).nullable(),
			cachedTitleSource: _enum([
				"fallback",
				"provider",
				"user"
			]).nullable(),
			cachedTitleEventSeq: number().int().nonnegative().nullable().optional(),
			createdAt: number().int().nonnegative(),
			updatedAt: number().int().nonnegative(),
			archivedAt: number().int().nonnegative().nullable(),
			sourceAvailable: boolean(),
			observedThroughSeq: number().int().nonnegative().nullable().optional()
		}).strict();
		const topicSummarySchema = object({
			topicId: number().int().positive(),
			sessionId: string().min(1),
			sourceSessionId: string().min(1),
			mode: topicModeSchema,
			citation: citationRecordSchema,
			title: string().min(1),
			titlePending: boolean(),
			createdAt: number().int().nonnegative(),
			updatedAt: number().int().nonnegative(),
			archived: boolean(),
			running: boolean(),
			sourceAvailable: boolean(),
			observedThroughSeq: number().int().nonnegative().nullable(),
			modelConfig: modelConfigSchema
		}).strict();
		const topicMessageIdentitySchema = {
			id: string().min(1),
			seq: number().int().nonnegative()
		};
		const topicMessageSchema = discriminatedUnion("role", [
			object({
				...topicMessageIdentitySchema,
				role: literal("user"),
				text: string()
			}).strict(),
			object({
				...topicMessageIdentitySchema,
				role: literal("assistant"),
				text: string(),
				reasoning: string().nullable(),
				streaming: boolean()
			}).strict(),
			object({
				...topicMessageIdentitySchema,
				role: literal("context"),
				label: string().min(1),
				text: string()
			}).strict(),
			object({
				...topicMessageIdentitySchema,
				role: literal("tool"),
				name: string().min(1),
				arguments: string(),
				result: string().nullable(),
				isError: boolean(),
				running: boolean()
			}).strict(),
			object({
				...topicMessageIdentitySchema,
				role: literal("error"),
				text: string(),
				bodyRetained: boolean(),
				attempt: number().int().positive(),
				status: _enum(["failed", "stopped"])
			}).strict()
		]);
		const questionOptionSchema = object({
			label: string().min(1),
			description: string().optional()
		}).strict();
		const questionItemSchema = object({
			id: string().min(1),
			question: string().min(1),
			header: string().optional(),
			options: array(questionOptionSchema).optional(),
			multiSelect: boolean().optional()
		}).strict();
		const questionAnswerSchema = object({ answers: array(object({
			id: string().min(1),
			selected: array(string()),
			custom: string().optional()
		}).strict()) }).strict();
		const pendingQuestionSchema = object({
			key: string().min(1),
			questions: array(questionItemSchema).min(1)
		}).strict();
		const topicSnapshotSchema = object({
			topic: topicSummarySchema,
			messages: array(topicMessageSchema),
			pendingQuestion: pendingQuestionSchema.nullable(),
			error: string().nullable()
		}).strict();
		const modelOptionSchema = object({
			id: string().min(1),
			name: string().min(1),
			description: string().optional(),
			reasoningEfforts: array(object({
				id: string().min(1),
				name: string().min(1)
			}).strict())
		}).strict();
		const providerOptionSchema = object({
			id: string().min(1),
			name: string().min(1),
			models: array(modelOptionSchema)
		}).strict();
		const questionSchema = string().trim().min(1).max(12e3);
		const topicSessionIdSchema = string().min(1);
		/** One strict direct-RPC command for the private CiteCiter runtime. */
		const citeCiterRequestSchema = union([union([object({
			action: literal("create"),
			requestId: string().min(1),
			citation: citationDraftSchema,
			question: questionSchema,
			mode: _enum([
				"observer",
				"exact-fork",
				"exact-when-available"
			])
		}).strict(), object({
			action: literal("create"),
			requestId: string().min(1),
			selectionClaim: citationSelectionClaimSchema,
			question: questionSchema,
			mode: _enum([
				"observer",
				"exact-fork",
				"exact-when-available"
			])
		}).strict()]), discriminatedUnion("action", [
			object({
				action: literal("list"),
				sourceSessionId: string().min(1),
				includeArchived: boolean().optional()
			}).strict(),
			object({
				action: literal("get"),
				topicSessionId: topicSessionIdSchema
			}).strict(),
			object({
				action: literal("ask"),
				topicSessionId: topicSessionIdSchema,
				question: questionSchema
			}).strict(),
			object({
				action: literal("stop"),
				topicSessionId: topicSessionIdSchema
			}).strict(),
			object({
				action: literal("answer-question"),
				topicSessionId: topicSessionIdSchema,
				key: string().min(1),
				answer: questionAnswerSchema
			}).strict(),
			object({
				action: literal("cancel-question"),
				topicSessionId: topicSessionIdSchema,
				key: string().min(1)
			}).strict(),
			object({
				action: literal("rename"),
				topicSessionId: topicSessionIdSchema,
				title: string().trim().min(1).max(240)
			}).strict(),
			object({
				action: literal("archive"),
				topicSessionId: topicSessionIdSchema,
				archived: boolean()
			}).strict(),
			object({
				action: literal("delete"),
				topicSessionId: topicSessionIdSchema,
				confirmSessionId: topicSessionIdSchema
			}).strict(),
			object({ action: literal("models") }).strict(),
			object({
				action: literal("set-model-route"),
				topicSessionId: topicSessionIdSchema,
				provider: string().min(1),
				model: string().min(1)
			}).strict(),
			object({
				action: literal("set-reasoning-effort"),
				topicSessionId: topicSessionIdSchema,
				reasoningEffort: string().min(1).nullable()
			}).strict(),
			object({
				action: literal("select-model"),
				topicSessionId: topicSessionIdSchema,
				provider: string().min(1),
				model: string().min(1),
				reasoningEffort: string().min(1).nullable()
			}).strict()
		])]);
		/** Strict response union returned by the single Remote command endpoint. */
		const citeCiterResponseSchema = discriminatedUnion("kind", [
			object({
				kind: literal("topic"),
				topic: topicSnapshotSchema
			}).strict(),
			object({
				kind: literal("topics"),
				topics: array(topicSummarySchema)
			}).strict(),
			object({
				kind: literal("models"),
				providers: array(providerOptionSchema)
			}).strict(),
			object({
				kind: literal("deleted"),
				sessionId: string().min(1)
			}).strict()
		]);
		//#endregion
		//#region lib/types/typert.remote-client.js
		/** Browser contribution mounted by the CiteCiter Client fiber. */
		const TYPERT_REMOTE = {
			package: "@kirkchinese/dsh-citeciter",
			descriptors: [{
				id: "@kirkchinese/dsh-citeciter#citeciter/request",
				service: "citeciter",
				namespace: "citeciter",
				method: "request",
				invocation: { kind: "direct" },
				parameters: [{
					name: "rawRequest",
					wire: "rawRequest",
					source: "json",
					codec: {
						mode: "strict",
						typeSymbol: "@kirkchinese/dsh-citeciter#CiteCiterRequest",
						schema: citeCiterRequestSchema
					}
				}],
				result: {
					mode: "strict",
					typeSymbol: "@kirkchinese/dsh-citeciter#CiteCiterResponse",
					schema: citeCiterResponseSchema
				},
				sourceLocation: {
					file: "src/index.ts",
					line: 63,
					column: 3
				}
			}]
		};
		//#endregion
		//#region lib/types/client/answer.js
		/**
		* Read visible text from one assistant-step payload without retaining its live node.
		* @param data - assistant-step payload from the conversation snapshot.
		* @returns visible text and status, or null when no displayable answer exists.
		*/
		function readAssistantAnswer(data) {
			if (data === null || typeof data !== "object") return null;
			const record = data;
			if (record.status !== "running" && record.status !== "settled" && record.status !== "interrupted") return null;
			let text = "";
			for (const block of record.blocks ?? []) {
				if (typeof block !== "object" || block === null) continue;
				const candidate = block;
				if (candidate.kind === "text" && typeof candidate.text === "string") text += candidate.text;
			}
			return text === "" ? null : {
				status: record.status,
				text
			};
		}
		//#endregion
		//#region lib/types/client/prompt.js
		/** Maximum genuine user-question length admitted by the Citation Thread UI. */
		const MAX_QUESTION_CHARS = 12e3;
		const NEXT_QUESTIONS_OPEN = "<citeciter-next-questions>";
		const NEXT_QUESTIONS_CLOSE = "</citeciter-next-questions>";
		/**
		* Normalize a genuine user question without wrapping it in Citation or role
		* prose. System Tutor and Citation Context travel through their own layers.
		*/
		function normalizeQuestion(rawQuestion) {
			const question = rawQuestion.trim();
			if (question === "") throw new Error("question cannot be empty");
			if (question.length > 12e3) throw new Error(`question exceeds ${MAX_QUESTION_CHARS} characters`);
			return question;
		}
		/** Parse the optional exact first-answer follow-up block without exposing malformed control text as UI. */
		function parseNextQuestions(text) {
			const markers = [text.indexOf(NEXT_QUESTIONS_OPEN), text.indexOf(NEXT_QUESTIONS_CLOSE)].filter((index) => index >= 0);
			if (markers.length === 0) return {
				text,
				questions: [],
				invalid: false
			};
			const markerIndex = Math.min(...markers);
			const visibleText = text.slice(0, markerIndex).trimEnd();
			const match = new RegExp(`^${NEXT_QUESTIONS_OPEN}\\n([\\s\\S]*?)\\n${NEXT_QUESTIONS_CLOSE}\\s*$`, "u").exec(text.slice(markerIndex));
			if (match === null) return {
				text: visibleText,
				questions: [],
				invalid: true
			};
			try {
				const parsed = JSON.parse(match[1] ?? "");
				if (!Array.isArray(parsed) || parsed.length !== 3) throw new Error("expected three questions");
				const questions = parsed.map((value) => typeof value === "string" ? value.trim() : "");
				if (questions.some((question) => question === "" || question.length > 160) || new Set(questions).size !== 3) throw new Error("questions must be unique non-empty strings");
				return {
					text: visibleText,
					questions,
					invalid: false
				};
			} catch {
				return {
					text: visibleText,
					questions: [],
					invalid: true
				};
			}
		}
		//#endregion
		//#region lib/types/client/response-guard.js
		/** Return whether an asynchronous Topic response still belongs to the visible source and request. */
		function isCurrentTopicResponse(operationEpoch, currentEpoch, currentSourceSessionId, responseSourceSessionId, responseSessionId, expectedSessionId) {
			return operationEpoch === currentEpoch && responseSourceSessionId === currentSourceSessionId && (expectedSessionId === void 0 || responseSessionId === expectedSessionId);
		}
		/** Return whether an idle source may restore its remembered Topic. */
		function shouldReopenLastTopic(hasActiveTopic, phaseIsIdle, reopenLastTopic, showingArchived = false, attempted = false, suppressed = false) {
			return !hasActiveTopic && phaseIsIdle && reopenLastTopic && !showingArchived && !attempted && !suppressed;
		}
		//#endregion
		//#region lib/types/client/companion-controller.js
		const EMPTY = {
			sourceSessionId: null,
			phase: "idle",
			draftQuote: null,
			sourceAnchorKey: null,
			active: null,
			topics: [],
			topicsStatus: "idle",
			topicsError: null,
			providers: [],
			settings: DEFAULT_CITECITER_SETTINGS,
			settingsSaveStatus: "idle",
			settingsSaveMessage: null,
			modelRouteSaving: false,
			reasoningEffortSaving: false,
			renaming: false,
			archiving: false,
			includeArchived: false,
			error: null
		};
		function remoteValue(result) {
			if (!result.ok) throw new Error(result.error.message);
			return result.value;
		}
		function lastTopicKey(sourceSessionId) {
			return "citeciter:last-topic:" + sourceSessionId;
		}
		function readLastTopic(sourceSessionId) {
			try {
				return localStorage.getItem(lastTopicKey(sourceSessionId));
			} catch {
				return null;
			}
		}
		function writeLastTopic(sourceSessionId, topicSessionId) {
			try {
				localStorage.setItem(lastTopicKey(sourceSessionId), topicSessionId);
			} catch {}
		}
		function citationAnchorKey(sourceSessionId, anchorSeq) {
			return `citeciter:source-anchor:${sourceSessionId}:${anchorSeq}`;
		}
		function readCitationAnchor(sourceSessionId, anchorSeq) {
			try {
				return localStorage.getItem(citationAnchorKey(sourceSessionId, anchorSeq));
			} catch {
				return null;
			}
		}
		function writeCitationAnchor(sourceSessionId, anchorSeq, anchorKey) {
			try {
				localStorage.setItem(citationAnchorKey(sourceSessionId, anchorSeq), anchorKey);
			} catch {}
		}
		/** Bind private Topic Remote calls to one browser snapshot and polling lifecycle. */
		function createCompanionController(sessions, settingsScope, request, onAutoOpen = () => void 0, store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(EMPTY)) {
			let disposed = false;
			let visible = false;
			let sourceGeneration = 0;
			let activeGeneration = 0;
			let pollTimer = null;
			let polling = false;
			let pollCount = 0;
			let topicsRefresh = null;
			let topicsRefreshAgain = false;
			let topicsShowLoading = false;
			let reopenAttemptedGeneration = -1;
			let reopenSuppressedGeneration = -1;
			let settingOperation = 0;
			let settingsReady = false;
			const pendingSettings = /* @__PURE__ */ new Map();
			let routeOperation = 0;
			let effortOperation = 0;
			let pendingRoute = null;
			let pendingEffort = null;
			const update = (mutator) => {
				if (!disposed) store.update(mutator);
			};
			const fail = (error, operationGeneration = activeGeneration) => {
				if (disposed || operationGeneration !== activeGeneration) return;
				update((draft) => {
					draft.phase = "error";
					draft.error = error instanceof Error ? error.message : String(error);
				});
			};
			const withPendingModelConfig = (topic) => {
				if (pendingRoute?.sessionId !== topic.topic.sessionId && pendingEffort?.sessionId !== topic.topic.sessionId) return topic;
				const modelConfig = { ...topic.topic.modelConfig };
				if (pendingRoute?.sessionId === topic.topic.sessionId) {
					modelConfig.provider = pendingRoute.provider;
					modelConfig.model = pendingRoute.model;
					delete modelConfig.reasoningEffort;
				}
				if (pendingEffort?.sessionId === topic.topic.sessionId) {
					if (pendingEffort.reasoningEffort === null) delete modelConfig.reasoningEffort;
					else modelConfig.reasoningEffort = pendingEffort.reasoningEffort;
				}
				return {
					...topic,
					topic: {
						...topic.topic,
						modelConfig
					}
				};
			};
			const upsertTopic = (draft, topic) => {
				const belongs = topic.archived === draft.includeArchived;
				const topics = draft.topics.filter((candidate) => candidate.sessionId !== topic.sessionId);
				draft.topics = belongs ? [...topics, topic].sort((left, right) => right.updatedAt - left.updatedAt) : topics;
			};
			const acceptTopic = (rawTopic, operationGeneration, expectedSessionId) => {
				const topic = withPendingModelConfig(rawTopic);
				const current = store.getSnapshot();
				if (disposed || !isCurrentTopicResponse(operationGeneration, activeGeneration, current.sourceSessionId, topic.topic.sourceSessionId, topic.topic.sessionId, expectedSessionId)) return;
				update((draft) => {
					const lastMessage = topic.messages.at(-1);
					draft.active = topic;
					draft.draftQuote = null;
					draft.sourceAnchorKey = readCitationAnchor(topic.topic.sourceSessionId, topic.topic.citation.anchorSeq);
					const stopped = lastMessage?.role === "error" && lastMessage.status === "stopped";
					draft.phase = topic.topic.running ? "running" : stopped ? "stopped" : topic.error === null ? "ready" : "error";
					draft.error = topic.error;
					upsertTopic(draft, topic.topic);
				});
				writeLastTopic(topic.topic.sourceSessionId, topic.topic.sessionId);
			};
			const call = async (command) => remoteValue(await request(command));
			const openTopic = async (sessionId, operationGeneration = activeGeneration) => {
				update((draft) => {
					draft.phase = "creating";
					draft.error = null;
				});
				try {
					const response = await call({
						action: "get",
						topicSessionId: sessionId
					});
					if (response.kind !== "topic") throw new Error("CiteCiter 返回了错误的 Topic 响应");
					acceptTopic(response.topic, operationGeneration, sessionId);
				} catch (error) {
					fail(error, operationGeneration);
				}
			};
			const refreshTopicsOnce = async (showLoading) => {
				const snapshot = store.getSnapshot();
				if (snapshot.sourceSessionId === null) return;
				const generation = sourceGeneration;
				const sourceSessionId = snapshot.sourceSessionId;
				const includeArchived = snapshot.includeArchived;
				if (showLoading && snapshot.topics.length === 0) update((draft) => {
					draft.topicsStatus = "loading";
					draft.topicsError = null;
				});
				let response;
				try {
					response = await call({
						action: "list",
						sourceSessionId,
						includeArchived
					});
				} catch (error) {
					const current = store.getSnapshot();
					if (generation === sourceGeneration && current.sourceSessionId === sourceSessionId && current.includeArchived === includeArchived && !disposed) update((draft) => {
						draft.topicsStatus = "error";
						draft.topicsError = error instanceof Error ? error.message : String(error);
					});
					return;
				}
				const current = store.getSnapshot();
				if (response.kind !== "topics" || generation !== sourceGeneration || current.sourceSessionId !== sourceSessionId || current.includeArchived !== includeArchived || disposed) return;
				update((draft) => {
					draft.topics = response.topics;
					draft.topicsStatus = "ready";
					draft.topicsError = null;
				});
				const accepted = store.getSnapshot();
				if (!settingsReady || !shouldReopenLastTopic(accepted.active !== null, accepted.phase === "idle", accepted.settings.reopenLastTopic, includeArchived, reopenAttemptedGeneration === generation, reopenSuppressedGeneration === generation)) return;
				reopenAttemptedGeneration = generation;
				const remembered = readLastTopic(sourceSessionId);
				const target = response.topics.find((topic) => topic.sessionId === remembered) ?? response.topics[0];
				if (target !== void 0) {
					onAutoOpen();
					await openTopic(target.sessionId, ++activeGeneration);
				}
			};
			const refreshTopics = (showLoading = false) => {
				topicsRefreshAgain = true;
				topicsShowLoading ||= showLoading;
				if (topicsRefresh !== null) return topicsRefresh;
				const refresh = (async () => {
					while (topicsRefreshAgain && !disposed) {
						topicsRefreshAgain = false;
						const loading = topicsShowLoading;
						topicsShowLoading = false;
						await refreshTopicsOnce(loading);
					}
				})().finally(() => {
					if (topicsRefresh === refresh) topicsRefresh = null;
				});
				topicsRefresh = refresh;
				return refresh;
			};
			const refreshActive = async (operationGeneration = activeGeneration) => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const response = await call({
					action: "get",
					topicSessionId: active.topic.sessionId
				});
				if (response.kind === "topic") acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
			};
			const poll = async () => {
				if (!visible || disposed || polling) return;
				polling = true;
				const operationGeneration = activeGeneration;
				try {
					await refreshActive(operationGeneration);
					if (pollCount++ % 6 === 0) await refreshTopics();
				} catch (error) {
					fail(error, operationGeneration);
				} finally {
					polling = false;
				}
			};
			const loadModels = async () => {
				if (store.getSnapshot().providers.length > 0) return;
				const generation = sourceGeneration;
				try {
					const response = await call({ action: "models" });
					if (response.kind === "models" && generation === sourceGeneration) update((draft) => {
						draft.providers = response.providers;
					});
				} catch (error) {
					if (generation === sourceGeneration) fail(error);
				}
			};
			const settingsSnapshot = settingsScope.getSnapshot();
			settingsReady = settingsSnapshot.status !== "loading";
			const initialSettings = settingsSnapshot.value ?? DEFAULT_CITECITER_SETTINGS;
			update((draft) => {
				draft.settings = initialSettings;
			});
			const settingsWithPending = (value) => {
				const merged = { ...value };
				for (const [key, pending] of pendingSettings) Object.assign(merged, { [key]: pending.value });
				return merged;
			};
			const unsubscribeSettings = settingsScope.subscribe(() => {
				const scopeSnapshot = settingsScope.getSnapshot();
				const becameReady = !settingsReady && scopeSnapshot.status !== "loading";
				settingsReady = scopeSnapshot.status !== "loading";
				const value = scopeSnapshot.value;
				if (value !== void 0) update((draft) => {
					draft.settings = settingsWithPending(value);
				});
				if (becameReady) refreshTopics();
			});
			const setSource = (sessionId) => {
				if (disposed || store.getSnapshot().sourceSessionId === sessionId) return;
				sourceGeneration++;
				activeGeneration++;
				routeOperation++;
				effortOperation++;
				pendingRoute = null;
				pendingEffort = null;
				reopenAttemptedGeneration = -1;
				reopenSuppressedGeneration = -1;
				update((draft) => {
					draft.sourceSessionId = sessionId;
					draft.phase = "idle";
					draft.draftQuote = null;
					draft.sourceAnchorKey = null;
					draft.active = null;
					draft.topics = [];
					draft.topicsStatus = "idle";
					draft.topicsError = null;
					draft.modelRouteSaving = false;
					draft.reasoningEffortSaving = false;
					draft.renaming = false;
					draft.archiving = false;
					draft.error = null;
				});
				if (sessionId !== null) refreshTopics(true);
			};
			const setVisible = (next) => {
				if (disposed || visible === next) return;
				visible = next;
				if (!visible) {
					reopenSuppressedGeneration = sourceGeneration;
					if (pollTimer !== null) clearInterval(pollTimer);
					pollTimer = null;
					return;
				}
				refreshTopics(true);
				loadModels();
				pollTimer = setInterval(() => {
					poll();
				}, 700);
			};
			const create = async (selection, rawQuestion, mode) => {
				if (store.getSnapshot().phase === "creating") return;
				const question = normalizeQuestion(rawQuestion);
				const operationGeneration = ++activeGeneration;
				update((draft) => {
					draft.sourceSessionId = selection.sourceSessionId;
					draft.phase = "creating";
					draft.draftQuote = selection.displayText;
					draft.sourceAnchorKey = selection.anchorKey;
					draft.active = null;
					draft.error = null;
				});
				try {
					const node = sessions.binding(selection.sourceSessionId)?.session.getSnapshot().chat.nodes.get(selection.anchorKey);
					if (node === void 0 || node.kind !== "assistant-step") throw new Error("选中的模型回答已不在当前会话快照中");
					const answer = readAssistantAnswer(node.data);
					if (answer === null || answer.status !== "settled") throw new Error("请在一次模型调用完成后引用；无需等待整轮长任务结束");
					const response = await call({
						action: "create",
						requestId: crypto.randomUUID(),
						selectionClaim: {
							sourceSessionId: selection.sourceSessionId,
							anchorSeq: node.anchorSeq,
							displayText: selection.displayText,
							...selection.sourceHintText === void 0 ? {} : { sourceHintText: selection.sourceHintText },
							prefixText: selection.prefixText,
							suffixText: selection.suffixText
						},
						question,
						mode: mode ?? store.getSnapshot().settings.defaultMode
					});
					if (response.kind !== "topic") throw new Error("CiteCiter 返回了错误的创建响应");
					writeCitationAnchor(selection.sourceSessionId, response.topic.topic.citation.anchorSeq, selection.anchorKey);
					acceptTopic(response.topic, operationGeneration);
					await refreshTopics();
				} catch (error) {
					fail(error, operationGeneration);
				}
			};
			const ask = async (rawQuestion) => {
				const active = store.getSnapshot().active;
				if (active === null) {
					fail("请先从选区创建 Topic，或打开一个旧 Topic");
					return false;
				}
				const question = normalizeQuestion(rawQuestion);
				const operationGeneration = ++activeGeneration;
				update((draft) => {
					draft.phase = "running";
					draft.error = null;
				});
				try {
					const response = await call({
						action: "ask",
						topicSessionId: active.topic.sessionId,
						question
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
					return response.kind === "topic" && operationGeneration === activeGeneration;
				} catch (error) {
					fail(error, operationGeneration);
					return false;
				}
			};
			const stop = async () => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const operationGeneration = ++activeGeneration;
				update((draft) => {
					draft.phase = "stopping";
					draft.error = null;
				});
				try {
					const response = await call({
						action: "stop",
						topicSessionId: active.topic.sessionId
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
				} catch (error) {
					fail(error, operationGeneration);
				}
			};
			const answerQuestion = async (key, answer) => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const operationGeneration = ++activeGeneration;
				try {
					const response = await call({
						action: "answer-question",
						topicSessionId: active.topic.sessionId,
						key,
						answer
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
				} catch (error) {
					fail(error, operationGeneration);
				}
			};
			const cancelQuestion = async (key) => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const operationGeneration = ++activeGeneration;
				try {
					const response = await call({
						action: "cancel-question",
						topicSessionId: active.topic.sessionId,
						key
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
				} catch (error) {
					fail(error, operationGeneration);
				}
			};
			const rename = async (rawTitle) => {
				const active = store.getSnapshot().active;
				const title = rawTitle.trim();
				if (active === null || title === "") return false;
				const operationGeneration = ++activeGeneration;
				update((draft) => {
					draft.renaming = true;
					draft.error = null;
				});
				try {
					const response = await call({
						action: "rename",
						topicSessionId: active.topic.sessionId,
						title
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
					await refreshTopics();
					if (operationGeneration === activeGeneration) update((draft) => {
						draft.renaming = false;
					});
					return response.kind === "topic" && operationGeneration === activeGeneration;
				} catch (error) {
					if (operationGeneration === activeGeneration) update((draft) => {
						draft.renaming = false;
					});
					fail(error, operationGeneration);
					return false;
				}
			};
			const archive = async (archived) => {
				const active = store.getSnapshot().active;
				if (active === null) return false;
				const operationGeneration = ++activeGeneration;
				update((draft) => {
					draft.archiving = true;
					draft.error = null;
				});
				try {
					const response = await call({
						action: "archive",
						topicSessionId: active.topic.sessionId,
						archived
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationGeneration, active.topic.sessionId);
					if (archived !== store.getSnapshot().includeArchived) update((draft) => {
						draft.active = null;
						draft.phase = "idle";
					});
					await refreshTopics();
					if (operationGeneration === activeGeneration) update((draft) => {
						draft.archiving = false;
					});
					return response.kind === "topic" && operationGeneration === activeGeneration;
				} catch (error) {
					if (operationGeneration === activeGeneration) update((draft) => {
						draft.archiving = false;
					});
					fail(error, operationGeneration);
					return false;
				}
			};
			const updateModelConfig = (sessionId, mutate) => {
				update((draft) => {
					if (draft.active?.topic.sessionId === sessionId) mutate(draft.active.topic.modelConfig);
					const summary = draft.topics.find((topic) => topic.sessionId === sessionId);
					if (summary !== void 0) mutate(summary.modelConfig);
				});
			};
			const setModelRoute = async (provider, model) => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const operation = ++routeOperation;
				const operationGeneration = activeGeneration;
				const sessionId = active.topic.sessionId;
				effortOperation++;
				pendingEffort = null;
				pendingRoute = {
					operation,
					sessionId,
					provider,
					model
				};
				update((draft) => {
					draft.modelRouteSaving = true;
					draft.reasoningEffortSaving = false;
				});
				updateModelConfig(sessionId, (modelConfig) => {
					modelConfig.provider = provider;
					modelConfig.model = model;
					delete modelConfig.reasoningEffort;
				});
				try {
					const response = await call({
						action: "set-model-route",
						topicSessionId: sessionId,
						provider,
						model
					});
					if (pendingRoute?.operation !== operation || pendingRoute.sessionId !== sessionId) return;
					pendingRoute = null;
					update((draft) => {
						draft.modelRouteSaving = false;
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationGeneration, sessionId);
				} catch (error) {
					if (pendingRoute?.operation !== operation || pendingRoute.sessionId !== sessionId) return;
					pendingRoute = null;
					update((draft) => {
						draft.modelRouteSaving = false;
					});
					fail(error, operationGeneration);
					await refreshActive(activeGeneration);
				}
			};
			const setReasoningEffort = async (reasoningEffort) => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const operation = ++effortOperation;
				const operationGeneration = activeGeneration;
				const sessionId = active.topic.sessionId;
				pendingEffort = {
					operation,
					sessionId,
					reasoningEffort
				};
				update((draft) => {
					draft.reasoningEffortSaving = true;
				});
				updateModelConfig(sessionId, (modelConfig) => {
					if (reasoningEffort === null) delete modelConfig.reasoningEffort;
					else modelConfig.reasoningEffort = reasoningEffort;
				});
				try {
					const response = await call({
						action: "set-reasoning-effort",
						topicSessionId: sessionId,
						reasoningEffort
					});
					if (pendingEffort?.operation !== operation || pendingEffort.sessionId !== sessionId) return;
					pendingEffort = null;
					update((draft) => {
						draft.reasoningEffortSaving = false;
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationGeneration, sessionId);
				} catch (error) {
					if (pendingEffort?.operation !== operation || pendingEffort.sessionId !== sessionId) return;
					pendingEffort = null;
					update((draft) => {
						draft.reasoningEffortSaving = false;
					});
					fail(error, operationGeneration);
					await refreshActive(activeGeneration);
				}
			};
			return {
				getSnapshot: store.getSnapshot,
				subscribe: store.subscribe,
				setSource,
				setVisible,
				create,
				openTopic: (sessionId) => openTopic(sessionId, ++activeGeneration),
				ask,
				answerQuestion,
				cancelQuestion,
				stop,
				rename,
				archive,
				setIncludeArchived: (include) => {
					activeGeneration++;
					update((draft) => {
						draft.includeArchived = include;
						draft.active = null;
						draft.topics = [];
						draft.topicsStatus = "loading";
						draft.topicsError = null;
						draft.phase = "idle";
					});
					refreshTopics(true);
				},
				setModelRoute,
				setReasoningEffort,
				setSetting: async (key, value) => {
					const operation = ++settingOperation;
					pendingSettings.set(key, {
						operation,
						value
					});
					update((draft) => {
						draft.settings = {
							...draft.settings,
							[key]: value
						};
						draft.settingsSaveStatus = "saving";
						draft.settingsSaveMessage = "正在保存…";
					});
					try {
						await settingsScope.set(key, value);
						if (pendingSettings.get(key)?.operation !== operation || disposed) return;
						pendingSettings.delete(key);
						const authoritative = settingsScope.getSnapshot().value ?? DEFAULT_CITECITER_SETTINGS;
						update((draft) => {
							draft.settings = settingsWithPending(authoritative);
							draft.settingsSaveStatus = pendingSettings.size === 0 ? "saved" : "saving";
							draft.settingsSaveMessage = pendingSettings.size === 0 ? "已保存" : "正在保存…";
						});
					} catch (error) {
						if (pendingSettings.get(key)?.operation !== operation || disposed) return;
						pendingSettings.delete(key);
						const restored = settingsScope.getSnapshot().value ?? DEFAULT_CITECITER_SETTINGS;
						update((draft) => {
							draft.settings = settingsWithPending(restored);
							draft.settingsSaveStatus = "error";
							draft.settingsSaveMessage = `保存失败，已恢复：${error instanceof Error ? error.message : String(error)}`;
						});
					}
				},
				dispose: async () => {
					if (disposed) return;
					disposed = true;
					if (pollTimer !== null) clearInterval(pollTimer);
					unsubscribeSettings();
				}
			};
		}
		//#endregion
		//#region \0citeciter-svg:src/client/assets/collapse-arrow.svg
		var collapse_arrow_default = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSI+CiAgPHBhdGggZD0iTTExIDcuNSAxOS41IDE2IDExIDI0LjUiIHN0cm9rZT0iIzM0NzhmNiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==";
		//#endregion
		//#region \0citeciter-png:src/client/assets/citeciter-mascot.png
		var citeciter_mascot_default = "data:image/png;base64,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";
		//#endregion
		//#region \0dsh-css:src/client/components/CiteCiter.module.css.mjs
		const css = "[data-citeciter-docked=true]{grid-template-columns:var(--citeciter-sidebar-width) minmax(0, 1fr) var(--citeciter-dock-width)!important}[data-citeciter-docked=true]>[data-side=details]{display:none!important}._1Fxyxa_selectionPopover{z-index:9999;box-sizing:border-box;width:min(378px,100vw - 24px);color:var(--dsw-alias-label-primary,#20232a);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 96%, #fff);border:1px solid var(--dsw-alias-border-l2,#d9dde5);pointer-events:auto;border-radius:14px;padding:10px;position:fixed;box-shadow:0 16px 44px #191f2c33,0 2px 8px #191f2c14}._1Fxyxa_popoverQuote{color:var(--dsw-alias-label-secondary,#5c6472);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}._1Fxyxa_popoverQuote:before{vertical-align:1px;content:\"\";background:#3478f6;border-radius:999px;width:6px;height:6px;margin-right:7px;display:inline-block}._1Fxyxa_popoverComposer{grid-template-columns:minmax(0,1fr) auto;gap:7px;margin-top:8px;display:grid}._1Fxyxa_popoverComposer input,._1Fxyxa_topicToolbar input,._1Fxyxa_topicToolbar select,._1Fxyxa_composer textarea{box-sizing:border-box;min-width:0;color:var(--dsw-alias-label-primary,#20232a);background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l1,#dfe3ea);outline:none}._1Fxyxa_popoverComposer input{height:36px;font:inherit;border-radius:9px;padding:0 11px;font-size:13px}._1Fxyxa_popoverComposer button,._1Fxyxa_sendButton{color:#fff;cursor:pointer;background:linear-gradient(135deg,#3478f6,#245fd1);border:0;border-radius:9px;padding:0 14px;font-weight:650;box-shadow:0 4px 12px #3478f638}._1Fxyxa_popoverComposer button:disabled,._1Fxyxa_sendButton:disabled{cursor:default;filter:grayscale(.45);opacity:.52;box-shadow:none}._1Fxyxa_popoverComposer input:focus,._1Fxyxa_topicToolbar input:focus,._1Fxyxa_topicToolbar select:focus,._1Fxyxa_composer textarea:focus{border-color:#3478f6;box-shadow:0 0 0 3px #3478f621}._1Fxyxa_popoverMode{color:var(--dsw-alias-label-tertiary,#858c98);margin-top:8px;font-size:11px}._1Fxyxa_popoverMode summary{cursor:pointer;user-select:none}._1Fxyxa_popoverMode select{width:100%;height:30px;color:var(--dsw-alias-label-secondary,#535b68);background:var(--dsw-specific-bubble,#f5f7fa);border:1px solid var(--dsw-alias-border-l1,#dfe3ea);border-radius:7px;margin-top:6px;padding:0 7px}._1Fxyxa_topicLauncher{z-index:200;color:#fff;cursor:pointer;background:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 90%, #dceaff);border:1px solid color-mix(in srgb, var(--dsw-alias-border-l2,#d9dde5) 65%, #3478f6);pointer-events:auto;border-radius:999px;align-items:center;width:112px;height:112px;padding:5px;display:flex;position:fixed;bottom:76px;right:22px;box-shadow:0 10px 28px #245fd13d}._1Fxyxa_topicLauncher img{object-fit:contain;width:100px;height:100px;display:block}._1Fxyxa_launcherCount{border:2px solid var(--dsw-alias-bg-base,#fff);background:#245fd1;border-radius:999px;place-items:center;min-width:24px;height:24px;padding:0 5px;font-size:11px;line-height:1;display:grid;position:absolute;top:-4px;right:-4px}._1Fxyxa_topicLauncher:hover{transform:translateY(-1px)}._1Fxyxa_dock{--citeciter-accent:#3478f6;z-index:1;box-sizing:border-box;min-width:360px;color:var(--dsw-alias-label-primary,#20232a);background:var(--dsw-alias-bg-base,#fff);border-left:1px solid var(--dsw-alias-border-l2,#d9dde5);pointer-events:auto;grid-template-columns:clamp(138px,24%,210px) minmax(0,1fr);display:grid;position:absolute;top:0;bottom:0;right:0;overflow:visible;box-shadow:-12px 0 32px #1a1f2c14}._1Fxyxa_resizeHandle{z-index:3;cursor:col-resize;touch-action:none;width:10px;position:absolute;top:0;bottom:0;left:-5px}._1Fxyxa_resizeHandle:after{content:\"\";background:var(--dsw-alias-border-l2,#d9dde5);border-radius:999px;width:3px;height:42px;transition:background .12s,width .12s;position:absolute;top:50%;left:3px;transform:translateY(-50%)}._1Fxyxa_resizeHandle:hover:after,._1Fxyxa_resizeHandle:focus-visible:after{background:var(--citeciter-accent);width:4px}._1Fxyxa_citationWaterline{z-index:199;pointer-events:none;opacity:0;width:100vw;height:100vh;transition:opacity .16s;position:fixed;inset:0;overflow:visible}._1Fxyxa_citationWaterline[data-visible]{opacity:.48}._1Fxyxa_citationWaterline path{fill:none;stroke:color-mix(in srgb, var(--citeciter-accent) 72%, #73d9ff);stroke-width:1.5px;stroke-linecap:round;stroke-dasharray:3 7}._1Fxyxa_topicRail{background:color-mix(in srgb, var(--dsw-specific-sidebar-fill,#f7f8fa) 94%, #edf5ff);border-right:1px solid var(--dsw-alias-border-l1,#e4e7ec);flex-direction:column;min-width:0;min-height:0;display:flex;overflow:hidden}._1Fxyxa_brand{border-bottom:1px solid var(--dsw-alias-border-l1,#e4e7ec);flex:none;align-items:center;gap:9px;min-height:65px;padding:0 13px;display:flex}._1Fxyxa_mascotStatus,._1Fxyxa_settingsWhale{background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 90%, #3478f6), color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 72%, #3478f6));border:1px solid color-mix(in srgb, var(--dsw-alias-border-l1,#dfe3ea) 64%, #3478f6);width:32px;height:32px;box-shadow:inset 0 1px 0 color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 72%, transparent);border-radius:10px;flex:none;place-items:center;display:grid;overflow:hidden}._1Fxyxa_mascotStatus img,._1Fxyxa_settingsWhale img{object-fit:contain;width:100%;height:100%}._1Fxyxa_mascotStatus{position:relative;overflow:visible}._1Fxyxa_mascotStatus img{transition:transform .18s}._1Fxyxa_mascotStatus>span{pointer-events:none;position:absolute}._1Fxyxa_mascotStatus[data-state=diving] img{transform:translateY(9px)}._1Fxyxa_mascotStatus[data-state=diving]>span,._1Fxyxa_mascotStatus[data-state=surfaced]>span{border-top:2px solid #44aef4;border-radius:50%;height:6px;bottom:3px;left:1px;right:1px;box-shadow:0 -3px 0 -2px #7fd9ff}._1Fxyxa_mascotStatus[data-state=reading]>span{border:2px solid #245fd1;border-radius:50%;width:9px;height:9px;top:4px;right:2px}._1Fxyxa_mascotStatus[data-state=reading]>span:after{content:\"\";background:#245fd1;border-radius:2px;width:6px;height:2px;position:absolute;bottom:-3px;right:-5px;transform:rotate(48deg)}._1Fxyxa_mascotStatus[data-state=answering]>span{color:#245fd1;content:\"\";background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid #8eb4ff;border-radius:7px;place-items:center;width:15px;height:13px;display:grid;top:-4px;right:-5px}._1Fxyxa_mascotStatus[data-state=answering]>span:before{content:\"“\";font-size:12px;line-height:1}._1Fxyxa_brand div{flex-direction:column;min-width:0;display:flex}._1Fxyxa_brand strong{text-overflow:ellipsis;font-size:14px;overflow:hidden}._1Fxyxa_brand>div>span{color:var(--dsw-alias-label-tertiary,#858c98);font-size:10px}._1Fxyxa_railCaption,._1Fxyxa_railFoot{color:var(--dsw-alias-label-tertiary,#858c98);flex:none;justify-content:space-between;align-items:center;gap:6px;padding:10px 11px 7px;font-size:10px;display:flex}._1Fxyxa_railCaption button,._1Fxyxa_topicToolbar button,._1Fxyxa_composerActions button:not(._1Fxyxa_sendButton){color:var(--dsw-alias-label-secondary,#58606d);cursor:pointer;background:0 0;border:0;border-radius:6px}._1Fxyxa_railCaption button:hover,._1Fxyxa_topicToolbar button:hover,._1Fxyxa_composerActions button:not(._1Fxyxa_sendButton):hover,._1Fxyxa_closeButton:hover{background:var(--dsw-alias-interactive-bg-hover,#0000000f)}._1Fxyxa_topicList{flex-direction:column;flex:1;gap:4px;min-height:0;padding:0 7px;display:flex;overflow-y:auto}._1Fxyxa_topicItem{width:100%;color:inherit;text-align:left;cursor:pointer;background:0 0;border:1px solid #0000;border-radius:9px;grid-template-columns:7px minmax(0,1fr);align-items:start;gap:7px;padding:9px 8px;display:grid}._1Fxyxa_topicItem:hover{background:var(--dsw-alias-interactive-bg-hover,#0000000b)}._1Fxyxa_topicItem[data-active]{background:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 88%, #eaf3ff);border-color:color-mix(in srgb, var(--dsw-alias-border-l1,#dde1e8) 72%, #7ca8ff);box-shadow:0 2px 7px #1c222f0d}._1Fxyxa_topicItem[data-archived]{opacity:.58}._1Fxyxa_topicStatus{background:#99a1ae;border-radius:999px;width:6px;height:6px;margin-top:5px}._1Fxyxa_topicStatus[data-running]{background:var(--citeciter-accent);animation:1.2s ease-in-out infinite _1Fxyxa_citeciterPulse;box-shadow:0 0 0 3px #3478f629}@keyframes _1Fxyxa_citeciterPulse{50%{opacity:.42}}._1Fxyxa_topicCopy{flex-direction:column;gap:3px;min-width:0;display:flex}._1Fxyxa_topicCopy strong,._1Fxyxa_topicCopy small{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}._1Fxyxa_topicCopy strong{font-size:12px;font-weight:590}._1Fxyxa_topicCopy strong[data-pending]{color:var(--dsw-alias-label-secondary,#606875);font-style:italic}._1Fxyxa_topicCopy small{color:var(--dsw-alias-label-tertiary,#858c98);font-size:10px}._1Fxyxa_railEmpty{color:var(--dsw-alias-label-tertiary,#858c98);margin:9px 6px;font-size:11px;line-height:17px}._1Fxyxa_railError{color:var(--dsw-alias-state-error-primary,#c93f3f);overflow-wrap:anywhere;margin:9px 6px;font-size:10px;line-height:15px}._1Fxyxa_railFoot{border-top:1px solid var(--dsw-alias-border-l1,#e4e7ec);padding-top:8px;padding-bottom:9px}._1Fxyxa_learningWorkspace{background:var(--dsw-alias-bg-base,#fff);flex-direction:column;min-width:0;min-height:0;display:flex;overflow:hidden}._1Fxyxa_dockHeader{border-bottom:1px solid var(--dsw-alias-border-l1,#e4e7ec);flex:none;justify-content:space-between;align-items:center;gap:12px;min-height:64px;padding:0 15px;display:flex}._1Fxyxa_dockHeading{grid-template-columns:auto minmax(0,1fr);align-items:center;gap:2px 7px;min-width:0;display:grid}._1Fxyxa_dockHeading strong{text-overflow:ellipsis;white-space:nowrap;font-size:14px;overflow:hidden}._1Fxyxa_dockHeading>span:last-child{color:var(--dsw-alias-label-tertiary,#858c98);grid-column:1/-1;font-size:10px}._1Fxyxa_modeBadge{color:color-mix(in srgb, var(--dsw-alias-label-primary,#20232a) 36%, #3478f6);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 84%, #3478f6);border:1px solid color-mix(in srgb, var(--dsw-alias-border-l1,#dfe3ea) 64%, #3478f6);letter-spacing:.02em;white-space:nowrap;border-radius:999px;padding:2px 6px;font-size:9px;font-weight:700}._1Fxyxa_closeButton{z-index:5;color:#3478f6;cursor:pointer;background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#d9dde5);border-radius:999px;flex:none;place-items:center;width:30px;height:30px;padding:0;display:grid;position:absolute;top:50%;left:6px;transform:translateY(-50%);box-shadow:0 4px 14px #1d222f24}._1Fxyxa_closeButton img{width:18px;height:18px}._1Fxyxa_emptyState{box-sizing:border-box;text-align:center;flex-direction:column;flex:1;justify-content:center;align-items:center;padding:34px 24px;display:flex}._1Fxyxa_emptyWhale{background:radial-gradient(circle at 32% 25%,#fff,#dceaff);border:1px solid #c9dcff;border-radius:22px;place-items:center;width:68px;height:68px;margin-bottom:13px;display:grid;overflow:hidden;box-shadow:0 14px 35px #245fd124}._1Fxyxa_emptyWhale img{object-fit:contain;width:100%;height:100%}._1Fxyxa_emptyState h2{margin:0;font-size:17px}._1Fxyxa_emptyState>p{max-width:430px;color:var(--dsw-alias-label-secondary,#606875);margin:9px 0 0;font-size:12px;line-height:20px}._1Fxyxa_contextBar{background:color-mix(in srgb, var(--dsw-specific-bubble,#f6f7f9) 90%, #edf5ff);border-bottom:1px solid var(--dsw-alias-border-l1,#e4e7ec);flex:none;padding:10px 14px}._1Fxyxa_contextBar blockquote{max-height:57px;color:var(--dsw-alias-label-secondary,#59616e);border-left:3px solid var(--citeciter-accent);margin:0;padding-left:9px;font-size:11px;line-height:18px;overflow:auto}._1Fxyxa_contextMeta{color:var(--dsw-alias-label-tertiary,#858c98);gap:9px;margin-top:6px;font-size:9px;display:flex}._1Fxyxa_contextMeta span:first-child:before{content:\"\";vertical-align:1px;background:#b3bac5;border-radius:999px;width:5px;height:5px;margin-right:4px;display:inline-block}._1Fxyxa_contextMeta span[data-ok]:before{background:#27a96b}._1Fxyxa_topicToolbar{border-bottom:1px solid var(--dsw-alias-border-l1,#e4e7ec);flex:none;align-items:center;gap:6px;padding:7px 11px;display:flex;overflow-x:auto}._1Fxyxa_topicToolbar form{flex:180px;min-width:130px;display:flex}._1Fxyxa_topicToolbar input,._1Fxyxa_topicToolbar select{border-radius:7px;height:30px;padding:0 7px;font-size:10px}._1Fxyxa_topicToolbar input{flex:1}._1Fxyxa_topicToolbar form button,._1Fxyxa_topicToolbar>button{white-space:nowrap;flex:none;padding:5px 7px;font-size:10px}._1Fxyxa_archiveButton{align-items:center;gap:3px;display:inline-flex}._1Fxyxa_topicToolbar button:disabled,._1Fxyxa_nextQuestions button:disabled{cursor:default;opacity:.42}._1Fxyxa_transcript{flex-direction:column;flex:1;gap:14px;min-height:0;padding:17px clamp(12px,4%,28px) 24px;display:flex;overflow:hidden auto}._1Fxyxa_assistantTurn,._1Fxyxa_userTurn,._1Fxyxa_errorTurn{overflow-wrap:anywhere;min-width:0;font-size:13px;line-height:21px}._1Fxyxa_assistantTurn{border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-border-l1,#e4e7ec) 72%, transparent);padding-bottom:14px}._1Fxyxa_userTurn{background:var(--dsw-specific-bubble,#f1f3f7);border-radius:12px 12px 3px;align-self:flex-end;max-width:86%;padding:8px 11px}._1Fxyxa_errorTurn,._1Fxyxa_panelError{color:var(--dsw-alias-state-error-primary,#c93f3f);background:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 88%, #f45555);border:1px solid #c93f3f33;border-radius:8px}._1Fxyxa_errorTurn{padding:8px 10px}._1Fxyxa_errorTurn[data-status=stopped]{color:var(--dsw-alias-label-secondary,#606875);background:var(--dsw-specific-bubble,#f5f6f8);border-color:var(--dsw-alias-border-l1,#e4e7ec)}._1Fxyxa_errorMeta{color:var(--dsw-alias-label-tertiary,#858c98);flex-wrap:wrap;gap:5px 10px;font-size:9px;display:flex}._1Fxyxa_errorTurn details{margin-top:6px}._1Fxyxa_errorTurn pre{white-space:pre-wrap;max-height:160px;overflow:auto}._1Fxyxa_assistantTurn p,._1Fxyxa_userTurn p,._1Fxyxa_errorTurn p{margin-top:0;margin-bottom:8px}._1Fxyxa_turnRole{color:var(--dsw-alias-label-tertiary,#858c98);margin-bottom:5px;font-size:10px;font-weight:650}._1Fxyxa_flowDisclosure{min-width:0;color:var(--dsw-alias-label-secondary,#606875);font-size:12px}._1Fxyxa_flowRow,._1Fxyxa_flowRowRunning{align-items:center;min-width:0;height:26px;display:flex;position:relative;overflow:hidden}._1Fxyxa_flowRowRunning:after{content:\"\";pointer-events:none;background:linear-gradient(90deg,#0000 20%,#ffffff94 48%,#0000 76%);animation:1.7s linear infinite _1Fxyxa_citeciterSweep;position:absolute;inset:0;transform:translate(-100%)}@keyframes _1Fxyxa_citeciterSweep{to{transform:translate(100%)}}._1Fxyxa_flowDot{color:var(--dsw-alias-label-tertiary,#858c98);flex:none;margin:0 6px}._1Fxyxa_flowSummary{min-width:0;color:var(--dsw-alias-label-tertiary,#78808e);white-space:nowrap;overflow-x:hidden}._1Fxyxa_flowBody{max-height:320px;color:var(--dsw-alias-label-secondary,#606875);background:var(--dsw-specific-bubble,#f5f6f8);font:inherit;white-space:pre-wrap;border-radius:7px;margin:5px 0 5px 22px;padding:7px 9px;font-size:11px;line-height:18px;overflow:auto}._1Fxyxa_toolPreview{background:var(--dsw-specific-bubble,#f5f6f8);border-radius:7px;gap:5px;max-height:360px;margin:5px 0 5px 22px;padding:8px;display:grid;overflow:auto}._1Fxyxa_toolPreview>strong{color:var(--dsw-alias-label-tertiary,#858c98);text-transform:uppercase;font-size:9px}._1Fxyxa_toolPreview pre{overflow-wrap:anywhere;white-space:pre-wrap;margin:0;font:10px/17px ui-monospace,SFMono-Regular,Menlo,monospace}._1Fxyxa_loadingCard{color:var(--dsw-alias-label-secondary,#606875);background:color-mix(in srgb, var(--dsw-specific-bubble,#f5f6f8) 82%, #3478f6);border-radius:9px;align-self:flex-start;padding:8px 10px;font-size:11px}._1Fxyxa_panelError{overflow-wrap:anywhere;margin:0;padding:8px 10px;font-size:11px;line-height:17px}._1Fxyxa_composer{background:var(--dsw-specific-input-major,var(--dsw-alias-bg-layer-1,#fff));border:1px solid var(--dsw-alias-border-l2-darkmode-thin,var(--dsw-alias-border-l2,#d9dde5));box-shadow:var(--dsw-shadow-lv2,0 5px 18px #1d222f14);border-radius:22px;flex:none;margin:0 12px 12px;padding:10px 8px 6px}._1Fxyxa_composer textarea{resize:none;width:100%;min-height:50px;max-height:150px;font:inherit;border:0;padding:4px 12px 0 16px;font-size:14px;line-height:22px;display:block}._1Fxyxa_composer textarea:focus{box-shadow:none}._1Fxyxa_composerActions{align-items:center;gap:6px;margin-top:4px;padding:2px 0 0 8px;display:flex}._1Fxyxa_composerActions span{color:var(--dsw-alias-label-tertiary,#858c98);margin-right:auto;font-size:9px}._1Fxyxa_composerActions ._1Fxyxa_sendButton{border-radius:999px;place-items:center;width:34px;height:34px;min-height:34px;padding:0;display:grid;transform:translateY(-2px)}._1Fxyxa_nextQuestions{flex-wrap:wrap;gap:6px;margin-top:10px;display:flex}._1Fxyxa_nextQuestions button{color:color-mix(in srgb, var(--dsw-alias-label-primary,#20232a) 46%, #3478f6);text-align:left;cursor:pointer;background:color-mix(in srgb, var(--dsw-specific-bubble,#f5f6f8) 86%, #3478f6);border:1px solid color-mix(in srgb, var(--dsw-alias-border-l1,#dfe3ea) 70%, #3478f6);border-radius:999px;padding:6px 9px;font-size:10px}._1Fxyxa_questionFrame{background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l2,#d9dde5);border-radius:14px;flex:none;margin:0 12px 12px;padding:12px;box-shadow:0 6px 20px #1d222f1a}._1Fxyxa_questionHeader{color:var(--dsw-alias-label-secondary,#606875);grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:8px;display:grid}._1Fxyxa_questionHeader>div{flex-direction:column;gap:2px;min-width:0;display:flex}._1Fxyxa_questionHeader span{color:var(--dsw-alias-label-tertiary,#858c98);font-size:9px}._1Fxyxa_questionHeader strong{color:var(--dsw-alias-label-primary,#20232a);font-size:12px;line-height:18px}._1Fxyxa_questionOptions{gap:6px;margin-top:10px;display:grid}._1Fxyxa_questionOptions>button{color:inherit;text-align:left;cursor:pointer;background:var(--dsw-specific-bubble,#f5f6f8);border:1px solid #0000;border-radius:8px;grid-template-columns:20px minmax(0,1fr);align-items:start;gap:6px;padding:8px;display:grid}._1Fxyxa_questionOptions>button[data-selected]{background:color-mix(in srgb, var(--dsw-specific-bubble,#f5f6f8) 82%, #3478f6);border-color:color-mix(in srgb, var(--dsw-alias-border-l1,#dfe3ea) 54%, #3478f6)}._1Fxyxa_questionOptions>button>span:first-child{color:#245fd1;background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l2,#d9dde5);border-radius:5px;place-items:center;width:18px;height:18px;font-size:9px;display:grid}._1Fxyxa_questionOptions>button>span:last-child{flex-direction:column;min-width:0;display:flex}._1Fxyxa_questionOptions strong{font-size:11px}._1Fxyxa_questionOptions small{color:var(--dsw-alias-label-tertiary,#858c98);margin-top:2px;font-size:9px;line-height:14px}._1Fxyxa_questionCustom{box-sizing:border-box;resize:vertical;width:100%;color:inherit;background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l1,#dfe3ea);font:inherit;border-radius:8px;outline:0;margin-top:8px;padding:7px 8px;font-size:10px}._1Fxyxa_questionCustom:focus{border-color:#3478f6;box-shadow:0 0 0 3px #3478f61f}._1Fxyxa_questionFooter{align-items:center;gap:6px;margin-top:9px;display:flex}._1Fxyxa_questionFooter span{flex:1}._1Fxyxa_questionFooter button{min-height:28px;color:var(--dsw-alias-label-secondary,#606875);cursor:pointer;background:0 0;border:0;border-radius:7px;padding:0 9px;font-size:10px}._1Fxyxa_questionFooter button:last-child{color:#fff;background:#3478f6}._1Fxyxa_questionFooter button:disabled{cursor:default;opacity:.45}._1Fxyxa_richAnswer{min-width:0}._1Fxyxa_richFigure{background:var(--dsw-specific-bubble,#f5f6f8);border:1px solid var(--dsw-alias-border-l1,#e4e7ec);border-radius:9px;margin:10px 0;overflow:hidden}._1Fxyxa_richSvg{width:100%;height:auto;display:block}._1Fxyxa_richHtml{border:0;width:100%;min-height:240px;display:block}._1Fxyxa_settingsPage{width:min(760px,100%);color:var(--dsw-alias-label-primary,#20232a);flex-direction:column;gap:14px;padding-bottom:32px;display:flex}._1Fxyxa_settingsHero{background:linear-gradient(130deg, color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 82%, #3478f6), var(--dsw-alias-bg-layer-1,#fff) 72%);border:1px solid color-mix(in srgb, var(--dsw-alias-border-l1,#e4e7ec) 72%, #8eb4ff);border-radius:14px;align-items:center;gap:13px;padding:17px;display:flex}._1Fxyxa_settingsWhale{width:42px;height:42px;font-size:21px}._1Fxyxa_settingsHero h2,._1Fxyxa_settingsHero p,._1Fxyxa_settingsGroup h3{margin:0}._1Fxyxa_settingsHero h2{font-size:17px}._1Fxyxa_settingsHero p{color:var(--dsw-alias-label-secondary,#606875);margin-top:3px;font-size:11px}._1Fxyxa_settingsGroup{background:var(--dsw-alias-bg-layer-1,#fff);border:1px solid var(--dsw-alias-border-l1,#e4e7ec);border-radius:13px;flex-direction:column;gap:8px;padding:15px;display:flex}._1Fxyxa_settingsGroup h3{margin-bottom:3px;font-size:13px}._1Fxyxa_settingChoice,._1Fxyxa_settingToggle{cursor:pointer;border:1px solid var(--dsw-alias-border-l1,#e4e7ec);border-radius:10px;align-items:center;gap:10px;padding:10px;display:flex}._1Fxyxa_settingChoice[data-selected]{background:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 82%, #3478f6);border-color:color-mix(in srgb, var(--dsw-alias-border-l1,#e4e7ec) 48%, #3478f6)}._1Fxyxa_settingChoice>span,._1Fxyxa_settingToggle>span{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}._1Fxyxa_settingChoice strong,._1Fxyxa_settingToggle strong,._1Fxyxa_widthSetting strong{font-size:12px}._1Fxyxa_settingChoice small,._1Fxyxa_settingToggle small{color:var(--dsw-alias-label-secondary,#606875);font-size:10px;line-height:16px}._1Fxyxa_settingChoice input,._1Fxyxa_settingToggle input{accent-color:var(--citeciter-accent,#3478f6)}._1Fxyxa_settingToggle>input{width:17px;height:17px}._1Fxyxa_widthSetting{flex-direction:column;gap:8px;padding:5px 2px 9px;display:flex}._1Fxyxa_widthSetting>span{justify-content:space-between;display:flex}._1Fxyxa_widthSetting output{color:#245fd1;font-size:11px;font-weight:650}._1Fxyxa_widthSetting input{accent-color:#3478f6;width:100%}._1Fxyxa_dockPreview{height:72px;color:var(--dsw-alias-label-tertiary,#858c98);background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l1,#e4e7ec);border-radius:9px;font-size:9px;display:flex;overflow:hidden}._1Fxyxa_previewSidebar{background:var(--dsw-specific-sidebar-fill,#f5f6f8);border-right:1px solid var(--dsw-alias-border-l1,#e4e7ec);width:16%}._1Fxyxa_previewCoding,._1Fxyxa_previewDock{place-items:center;min-width:0;display:grid}._1Fxyxa_previewCoding{flex:1}._1Fxyxa_previewDock{color:#245fd1;background:color-mix(in srgb, var(--dsw-alias-bg-layer-1,#fff) 82%, #3478f6);border-left:1px solid color-mix(in srgb, var(--dsw-alias-border-l1,#e4e7ec) 58%, #3478f6);max-width:55%}._1Fxyxa_settingsSaveStatus{min-height:18px;color:var(--dsw-alias-label-tertiary,#858c98);align-self:flex-end;margin:-7px 4px;font-size:10px}._1Fxyxa_settingsSaveStatus[data-status=error]{color:var(--dsw-alias-state-error-primary,#c93f3f)}@media (width<=720px){._1Fxyxa_dock{grid-template-columns:128px minmax(0,1fr);min-width:100%}._1Fxyxa_brand{padding:0 8px}._1Fxyxa_mascotStatus,._1Fxyxa_topicToolbar form{display:none}._1Fxyxa_topicLauncher{width:78px;height:78px}._1Fxyxa_topicLauncher img{width:68px;height:68px}._1Fxyxa_closeButton{left:6px}}@media (prefers-reduced-motion:reduce){._1Fxyxa_topicStatus[data-running]{animation:none}._1Fxyxa_topicLauncher:hover{transform:none}}";
		const tagId = "@kirkchinese/dsh-citeciter/CiteCiter.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@kirkchinese/dsh-citeciter";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var CiteCiter_module_css_default = {
			"archiveButton": "_1Fxyxa_archiveButton",
			"assistantTurn": "_1Fxyxa_assistantTurn",
			"brand": "_1Fxyxa_brand",
			"citationWaterline": "_1Fxyxa_citationWaterline",
			"citeciterPulse": "_1Fxyxa_citeciterPulse",
			"citeciterSweep": "_1Fxyxa_citeciterSweep",
			"closeButton": "_1Fxyxa_closeButton",
			"composer": "_1Fxyxa_composer",
			"composerActions": "_1Fxyxa_composerActions",
			"contextBar": "_1Fxyxa_contextBar",
			"contextMeta": "_1Fxyxa_contextMeta",
			"dock": "_1Fxyxa_dock",
			"dockHeader": "_1Fxyxa_dockHeader",
			"dockHeading": "_1Fxyxa_dockHeading",
			"dockPreview": "_1Fxyxa_dockPreview",
			"emptyState": "_1Fxyxa_emptyState",
			"emptyWhale": "_1Fxyxa_emptyWhale",
			"errorMeta": "_1Fxyxa_errorMeta",
			"errorTurn": "_1Fxyxa_errorTurn",
			"flowBody": "_1Fxyxa_flowBody",
			"flowDisclosure": "_1Fxyxa_flowDisclosure",
			"flowDot": "_1Fxyxa_flowDot",
			"flowRow": "_1Fxyxa_flowRow",
			"flowRowRunning": "_1Fxyxa_flowRowRunning",
			"flowSummary": "_1Fxyxa_flowSummary",
			"launcherCount": "_1Fxyxa_launcherCount",
			"learningWorkspace": "_1Fxyxa_learningWorkspace",
			"loadingCard": "_1Fxyxa_loadingCard",
			"mascotStatus": "_1Fxyxa_mascotStatus",
			"modeBadge": "_1Fxyxa_modeBadge",
			"nextQuestions": "_1Fxyxa_nextQuestions",
			"panelError": "_1Fxyxa_panelError",
			"popoverComposer": "_1Fxyxa_popoverComposer",
			"popoverMode": "_1Fxyxa_popoverMode",
			"popoverQuote": "_1Fxyxa_popoverQuote",
			"previewCoding": "_1Fxyxa_previewCoding",
			"previewDock": "_1Fxyxa_previewDock",
			"previewSidebar": "_1Fxyxa_previewSidebar",
			"questionCustom": "_1Fxyxa_questionCustom",
			"questionFooter": "_1Fxyxa_questionFooter",
			"questionFrame": "_1Fxyxa_questionFrame",
			"questionHeader": "_1Fxyxa_questionHeader",
			"questionOptions": "_1Fxyxa_questionOptions",
			"railCaption": "_1Fxyxa_railCaption",
			"railEmpty": "_1Fxyxa_railEmpty",
			"railError": "_1Fxyxa_railError",
			"railFoot": "_1Fxyxa_railFoot",
			"resizeHandle": "_1Fxyxa_resizeHandle",
			"richAnswer": "_1Fxyxa_richAnswer",
			"richFigure": "_1Fxyxa_richFigure",
			"richHtml": "_1Fxyxa_richHtml",
			"richSvg": "_1Fxyxa_richSvg",
			"selectionPopover": "_1Fxyxa_selectionPopover",
			"sendButton": "_1Fxyxa_sendButton",
			"settingChoice": "_1Fxyxa_settingChoice",
			"settingsGroup": "_1Fxyxa_settingsGroup",
			"settingsHero": "_1Fxyxa_settingsHero",
			"settingsPage": "_1Fxyxa_settingsPage",
			"settingsSaveStatus": "_1Fxyxa_settingsSaveStatus",
			"settingsWhale": "_1Fxyxa_settingsWhale",
			"settingToggle": "_1Fxyxa_settingToggle",
			"toolPreview": "_1Fxyxa_toolPreview",
			"topicCopy": "_1Fxyxa_topicCopy",
			"topicItem": "_1Fxyxa_topicItem",
			"topicLauncher": "_1Fxyxa_topicLauncher",
			"topicList": "_1Fxyxa_topicList",
			"topicRail": "_1Fxyxa_topicRail",
			"topicStatus": "_1Fxyxa_topicStatus",
			"topicToolbar": "_1Fxyxa_topicToolbar",
			"transcript": "_1Fxyxa_transcript",
			"turnRole": "_1Fxyxa_turnRole",
			"userTurn": "_1Fxyxa_userTurn",
			"widthSetting": "_1Fxyxa_widthSetting"
		};
		//#endregion
		//#region lib/types/client/components/QuestionCard.js
		/** Collect one standard DSH ask_user_question answer batch inside the private Topic. */
		function QuestionCard({ companion, pending }) {
			const [page, setPage] = (0, react.useState)(0);
			const [drafts, setDrafts] = (0, react.useState)({});
			const question = pending.questions[page];
			const complete = (0, react.useMemo)(() => pending.questions.every((item) => {
				const draft = drafts[item.id];
				return draft !== void 0 && (draft.selected.length > 0 || draft.custom.trim() !== "");
			}), [drafts, pending.questions]);
			if (question === void 0) return null;
			const draft = drafts[question.id] ?? {
				selected: [],
				custom: ""
			};
			const update = (next) => setDrafts((current) => ({
				...current,
				[question.id]: next
			}));
			const choose = (label) => {
				if (question.multiSelect === true) {
					update({
						...draft,
						selected: draft.selected.includes(label) ? draft.selected.filter((item) => item !== label) : [...draft.selected, label]
					});
					return;
				}
				update({
					selected: [label],
					custom: ""
				});
			};
			const submit = (event) => {
				event.preventDefault();
				if (!complete) return;
				const answer = { answers: pending.questions.map((item) => {
					const value = drafts[item.id] ?? {
						selected: [],
						custom: ""
					};
					const custom = value.custom.trim();
					return {
						id: item.id,
						selected: [...value.selected],
						...custom === "" ? {} : { custom }
					};
				}) };
				companion.answerQuestion(pending.key, answer);
			};
			return (0, react_jsx_runtime.jsxs)("form", {
				className: CiteCiter_module_css_default.questionFrame,
				onSubmit: submit,
				"aria-label": "CiteCiter 提问",
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: CiteCiter_module_css_default.questionHeader,
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQuestionOutline14, {}),
							(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("span", { children: question.header ?? "CiteCiter 需要你的回答" }), (0, react_jsx_runtime.jsx)("strong", { children: question.question })] }),
							(0, react_jsx_runtime.jsxs)("span", { children: [
								page + 1,
								"/",
								pending.questions.length
							] })
						]
					}),
					(question.options ?? []).length > 0 && (0, react_jsx_runtime.jsx)("div", {
						className: CiteCiter_module_css_default.questionOptions,
						children: question.options?.map((option, index) => {
							const selected = draft.selected.includes(option.label);
							return (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								"data-selected": selected || void 0,
								onClick: () => choose(option.label),
								children: [(0, react_jsx_runtime.jsx)("span", { children: question.multiSelect === true ? selected ? "✓" : "□" : index + 1 }), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: option.label }), option.description !== void 0 && (0, react_jsx_runtime.jsx)("small", { children: option.description })] })]
							}, option.label);
						})
					}),
					(0, react_jsx_runtime.jsx)("textarea", {
						className: CiteCiter_module_css_default.questionCustom,
						rows: 2,
						value: draft.custom,
						placeholder: (question.options ?? []).length === 0 ? "输入回答…" : "其他（可填写）",
						"aria-label": "自定义回答",
						onChange: (event) => update({
							selected: question.multiSelect === true ? draft.selected : [],
							custom: event.currentTarget.value
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: CiteCiter_module_css_default.questionFooter,
						children: [
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => {
									companion.cancelQuestion(pending.key);
								},
								children: "取消"
							}),
							(0, react_jsx_runtime.jsx)("span", {}),
							page > 0 && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setPage(page - 1),
								children: "上一个"
							}),
							page + 1 < pending.questions.length ? (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: draft.selected.length === 0 && draft.custom.trim() === "",
								onClick: () => setPage(page + 1),
								children: "下一个"
							}) : (0, react_jsx_runtime.jsx)("button", {
								type: "submit",
								disabled: !complete,
								children: "提交回答"
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/rich-content.js
		const MAX_RICH_SOURCE_LENGTH = 2e5;
		const RICH_FENCE = /^```(?<kind>svg|html)[ \t]*\r?\n(?<source>[\s\S]*?)^```[ \t]*$/gimu;
		const HTML_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:";
		/**
		* Split complete safe rich fences from Markdown while preserving all prose.
		* @param text - current assistant response text.
		* @returns ordered Markdown and isolated rich-preview segments.
		*/
		function splitRichContent(text) {
			const segments = [];
			let cursor = 0;
			for (const match of text.matchAll(RICH_FENCE)) {
				const index = match.index ?? 0;
				if (index > cursor) pushMarkdown(segments, text.slice(cursor, index));
				const wholeFence = match[0];
				const kind = match.groups?.kind?.toLowerCase();
				const source = match.groups?.source ?? "";
				if (kind === "svg" && isSafeSvg(source)) {
					const normalized = source.trim();
					segments.push({
						kind: "svg",
						source: normalized,
						dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalized)}`
					});
				} else if (kind === "html" && isPreviewableHtml(source)) segments.push({
					kind: "html",
					document: isolatedHtmlDocument(source.trim())
				});
				else pushMarkdown(segments, wholeFence);
				cursor = index + wholeFence.length;
			}
			if (cursor < text.length || segments.length === 0) pushMarkdown(segments, text.slice(cursor));
			return segments;
		}
		/**
		* Check whether SVG markup is self-contained and non-active.
		* @param source - SVG fence body.
		* @returns whether the source may be rendered as an inert image preview.
		*/
		function isSafeSvg(source) {
			const svg = source.trim();
			if (svg.length === 0 || svg.length > MAX_RICH_SOURCE_LENGTH) return false;
			if (!/^<svg(?:\s|>)/iu.test(svg) || !/<\/svg\s*>$/iu.test(svg)) return false;
			if (/<\/?(?:script|foreignobject|iframe|object|embed|audio|video|canvas)\b/iu.test(svg)) return false;
			if (/\son[a-z][a-z0-9:_-]*\s*=/iu.test(svg)) return false;
			if (/\b(?:href|xlink:href)\s*=/iu.test(svg)) return false;
			if (/\b(?:javascript|vbscript)\s*:/iu.test(svg)) return false;
			if (/url\(\s*(?:['"]?\s*)?(?!#)/iu.test(svg)) return false;
			return true;
		}
		/**
		* Build a network-free, script-free iframe document for an HTML fence.
		* @param source - HTML fence body.
		* @returns complete iframe `srcDoc` markup with restrictive CSP metadata.
		*/
		function isolatedHtmlDocument(source) {
			return [
				"<!doctype html><html><head>",
				`<meta http-equiv="Content-Security-Policy" content="${HTML_CSP}">`,
				"<meta name=\"referrer\" content=\"no-referrer\">",
				"<style>html{color-scheme:light dark}body{margin:0;padding:12px;font:14px/1.5 system-ui,sans-serif;overflow-wrap:anywhere}</style>",
				"</head><body>",
				source,
				"</body></html>"
			].join("");
		}
		function isPreviewableHtml(source) {
			return source.trim().length > 0 && source.length <= MAX_RICH_SOURCE_LENGTH;
		}
		function pushMarkdown(segments, text) {
			if (text !== "") segments.push({
				kind: "markdown",
				text
			});
		}
		//#endregion
		//#region lib/types/client/components/RichAnswer.js
		/**
		* Render model Markdown plus safe SVG and sandboxed HTML fence previews.
		* @param props - response text and streaming flag.
		* @returns isolated rich-answer element.
		*/
		function RichAnswer({ text, streaming }) {
			const segments = (0, react.useMemo)(() => splitRichContent(text), [text]);
			return (0, react_jsx_runtime.jsx)("div", {
				className: CiteCiter_module_css_default.richAnswer,
				"data-citeciter-answer": true,
				children: segments.map((segment, index) => {
					const key = `${segment.kind}:${index}`;
					if (segment.kind === "svg") return (0, react_jsx_runtime.jsx)("figure", {
						className: CiteCiter_module_css_default.richFigure,
						"data-citeciter-svg": true,
						children: (0, react_jsx_runtime.jsx)("img", {
							className: CiteCiter_module_css_default.richSvg,
							src: segment.dataUrl,
							alt: "CiteCiter SVG explanation"
						})
					}, key);
					if (segment.kind === "html") return (0, react_jsx_runtime.jsx)("figure", {
						className: CiteCiter_module_css_default.richFigure,
						"data-citeciter-html": true,
						children: (0, react_jsx_runtime.jsx)("iframe", {
							className: CiteCiter_module_css_default.richHtml,
							title: "CiteCiter HTML explanation",
							sandbox: "",
							referrerPolicy: "no-referrer",
							srcDoc: segment.document
						})
					}, key);
					return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
						text: segment.text,
						streaming
					}, key);
				})
			});
		}
		//#endregion
		//#region lib/types/client/components/CitePanel.js
		const PHASE_LABEL = {
			idle: "等待一个选区",
			creating: "正在确认上下文方式…",
			ready: "可以继续追问",
			running: "CiteCiter 正在回答…",
			stopping: "正在停止…",
			stopped: "已停止，可继续",
			error: "需要处理"
		};
		function mascotState(phase, messages) {
			const runningTool = messages.findLast((message) => message.role === "tool" && message.running);
			if (runningTool?.role === "tool" && runningTool.name.toLowerCase().includes("bash")) return "diving";
			if (runningTool?.role === "tool" && [
				"read",
				"read_source_session",
				"glob",
				"grep"
			].includes(runningTool.name)) return "reading";
			return phase === "running" || phase === "creating" || phase === "stopping" ? "answering" : "surfaced";
		}
		function MascotStatus({ state }) {
			return (0, react_jsx_runtime.jsxs)("span", {
				className: CiteCiter_module_css_default.mascotStatus,
				"data-state": state,
				role: "img",
				"aria-label": {
					diving: "鲸鱼娘正在潜水执行 Bash",
					reading: "鲸鱼娘正举着放大镜读取文件",
					answering: "鲸鱼娘抱住引用气泡开始回答",
					surfaced: "鲸鱼娘已浮出水面，回答完成"
				}[state],
				children: [(0, react_jsx_runtime.jsx)("img", {
					src: citeciter_mascot_default,
					alt: ""
				}), (0, react_jsx_runtime.jsx)("span", { "aria-hidden": "true" })]
			});
		}
		function CitationWaterline({ anchorKey, target }) {
			const [path, setPath] = (0, react.useState)("");
			const [visible, setVisible] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (anchorKey === void 0) return;
				const source = document.querySelector(`[data-chat-anchor-key="${CSS.escape(anchorKey)}"]`);
				const destination = target.current;
				if (source === null || destination === null) return;
				const update = () => {
					const from = source.getBoundingClientRect();
					const to = destination.getBoundingClientRect();
					const x1 = Math.min(from.right, window.innerWidth - 8);
					const y1 = from.top + from.height / 2;
					const x2 = to.left;
					const y2 = to.top + to.height / 2;
					const bend = Math.max(36, Math.abs(x2 - x1) * .42);
					setPath(`M ${x1} ${y1} C ${x1 + bend} ${y1 - 8}, ${x2 - bend} ${y2 + 8}, ${x2} ${y2}`);
				};
				const show = () => {
					update();
					setVisible(true);
				};
				const hide = () => setVisible(false);
				update();
				setVisible(true);
				const initialFade = setTimeout(hide, 1800);
				for (const element of [source, destination]) {
					element.addEventListener("pointerenter", show);
					element.addEventListener("pointerleave", hide);
				}
				window.addEventListener("resize", update);
				document.addEventListener("scroll", update, true);
				return () => {
					clearTimeout(initialFade);
					for (const element of [source, destination]) {
						element.removeEventListener("pointerenter", show);
						element.removeEventListener("pointerleave", hide);
					}
					window.removeEventListener("resize", update);
					document.removeEventListener("scroll", update, true);
				};
			}, [anchorKey, target]);
			return (0, react_jsx_runtime.jsx)("svg", {
				className: CiteCiter_module_css_default.citationWaterline,
				"data-visible": visible || void 0,
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", { d: path })
			});
		}
		function clampWidth(value) {
			return Math.max(28, Math.min(55, Math.round(value)));
		}
		function modelValue(provider, model) {
			return encodeURIComponent(provider) + "|" + encodeURIComponent(model);
		}
		function parseModelValue(value) {
			const divider = value.indexOf("|");
			return [decodeURIComponent(value.slice(0, divider)), decodeURIComponent(value.slice(divider + 1))];
		}
		function quotePreview(text) {
			const compact = text.replaceAll(/\s+/g, " ").trim();
			return compact.length > 54 ? compact.slice(0, 54) + "…" : compact;
		}
		function firstLine(text) {
			return text.trim().split(/\r?\n/u, 1)[0] ?? "";
		}
		function latestLine(text) {
			return text.trimEnd().split(/\r?\n/u).at(-1) ?? "";
		}
		function compactPreview(text) {
			const compact = text.replaceAll(/\s+/g, " ").trim();
			return compact.length > 120 ? compact.slice(0, 120) + "…" : compact;
		}
		function jsonObject(text) {
			try {
				const value = JSON.parse(text);
				return typeof value === "object" && value !== null ? value : null;
			} catch {
				return null;
			}
		}
		const TOOL_TITLES = {
			read_source_session: "读取来源会话",
			read: "读取文件",
			glob: "枚举文件",
			grep: "搜索内容",
			ask_user_question: "提问"
		};
		function FlowDisclosure({ icon, title, summary, running = false, children }) {
			const [open, setOpen] = (0, react.useState)(false);
			const summaryRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!running) return;
				const element = summaryRef.current;
				if (element !== null) element.scrollLeft = element.scrollWidth - element.clientWidth;
			}, [running, summary]);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
				className: CiteCiter_module_css_default.flowDisclosure,
				rowClassName: running ? CiteCiter_module_css_default.flowRowRunning : CiteCiter_module_css_default.flowRow,
				icon,
				title,
				open,
				expandable: true,
				expandOnRowClick: true,
				onToggle: () => setOpen(!open),
				collapsedContent: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
					className: CiteCiter_module_css_default.flowDot,
					children: "·"
				}), (0, react_jsx_runtime.jsx)("span", {
					className: CiteCiter_module_css_default.flowSummary,
					ref: summaryRef,
					children: summary
				})] }),
				children
			});
		}
		function ReasoningRow({ text, running }) {
			return (0, react_jsx_runtime.jsx)(FlowDisclosure, {
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconThinkOutline14, {}),
				title: "Think",
				summary: running ? latestLine(text) : firstLine(text),
				running,
				children: (0, react_jsx_runtime.jsx)("pre", {
					className: CiteCiter_module_css_default.flowBody,
					children: text
				})
			});
		}
		function ToolRow({ message }) {
			const args = jsonObject(message.arguments);
			const result = message.result === null ? null : jsonObject(message.result);
			const summary = message.running ? compactPreview(message.arguments) : message.isError ? "调用失败" : compactPreview(message.result ?? "完成");
			return (0, react_jsx_runtime.jsx)(FlowDisclosure, {
				icon: message.name === "ask_user_question" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQuestionOutline14, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkle16, {}),
				title: TOOL_TITLES[message.name] ?? message.name,
				summary,
				running: message.running,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: CiteCiter_module_css_default.toolPreview,
					children: [
						(0, react_jsx_runtime.jsx)("strong", { children: "参数" }),
						args === null ? (0, react_jsx_runtime.jsx)("pre", { children: message.arguments }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
							data: args,
							label: "工具参数",
							copyable: false
						}),
						message.result !== null && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("strong", { children: message.isError ? "错误" : "结果" }), result === null ? (0, react_jsx_runtime.jsx)("pre", { children: message.result }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonTree, {
							data: result,
							label: "工具结果",
							copyable: false
						})] })
					]
				})
			});
		}
		function ContextRow({ message }) {
			return (0, react_jsx_runtime.jsx)(FlowDisclosure, {
				icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkle16, {}),
				title: message.label,
				summary: firstLine(message.text),
				children: (0, react_jsx_runtime.jsx)("pre", {
					className: CiteCiter_module_css_default.flowBody,
					children: message.text
				})
			});
		}
		function friendlyFailure(text) {
			return text.replaceAll(/https?:\/\/[^\s)]+/gu, "模型服务地址");
		}
		function ErrorTurn({ message }) {
			const summary = friendlyFailure(message.text);
			return (0, react_jsx_runtime.jsxs)("article", {
				className: CiteCiter_module_css_default.errorTurn,
				"data-status": message.status,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: CiteCiter_module_css_default.turnRole,
						children: message.status === "stopped" ? "已停止" : "请求失败"
					}),
					(0, react_jsx_runtime.jsx)("p", { children: summary }),
					(0, react_jsx_runtime.jsxs)("div", {
						className: CiteCiter_module_css_default.errorMeta,
						children: [
							(0, react_jsx_runtime.jsxs)("span", { children: [
								"第 ",
								message.attempt,
								" 次请求"
							] }),
							(0, react_jsx_runtime.jsx)("span", { children: message.bodyRetained ? "已保留已生成正文" : "未产生可保留正文" }),
							(0, react_jsx_runtime.jsx)("span", { children: message.status === "stopped" ? "可继续追问" : "可修改问题后重试" })
						]
					}),
					summary !== message.text && (0, react_jsx_runtime.jsxs)("details", { children: [(0, react_jsx_runtime.jsx)("summary", { children: "技术详情" }), (0, react_jsx_runtime.jsx)("pre", { children: message.text })] })
				]
			});
		}
		function AssistantTurn({ message, first, disabled, companion, reportParseError }) {
			const parsed = (0, react.useMemo)(() => first ? parseNextQuestions(message.text) : {
				text: message.text,
				questions: [],
				invalid: false
			}, [first, message.text]);
			(0, react.useEffect)(() => {
				if (parsed.invalid && !message.streaming) reportParseError(message.id);
			}, [
				message.id,
				message.streaming,
				parsed.invalid,
				reportParseError
			]);
			return (0, react_jsx_runtime.jsxs)("article", {
				className: CiteCiter_module_css_default.assistantTurn,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: CiteCiter_module_css_default.turnRole,
						children: "CiteCiter"
					}),
					message.reasoning !== null && (0, react_jsx_runtime.jsx)(ReasoningRow, {
						text: message.reasoning,
						running: message.streaming
					}),
					parsed.text !== "" && (0, react_jsx_runtime.jsx)(RichAnswer, {
						text: parsed.text,
						streaming: message.streaming
					}),
					!message.streaming && parsed.questions.length === 3 && (0, react_jsx_runtime.jsx)("div", {
						className: CiteCiter_module_css_default.nextQuestions,
						"aria-label": "接下来可能想问",
						children: parsed.questions.map((question) => (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							disabled,
							onClick: () => {
								companion.ask(question);
							},
							children: question
						}, question))
					})
				]
			});
		}
		/** Reserve a real third DSH column while keeping the official shell and coding surface intact. */
		function useDockColumn(open, widthPercent) {
			const [width, setWidth] = (0, react.useState)(0);
			const [docked, setDocked] = (0, react.useState)(true);
			(0, react.useEffect)(() => {
				if (!open) return;
				const frame = document.querySelector("[data-shell-overlay]")?.parentElement;
				if (!(frame instanceof HTMLElement)) return;
				const setTrack = (name, value) => {
					if (frame.style.getPropertyValue(name) !== value) frame.style.setProperty(name, value);
				};
				const apply = () => {
					const frameWidth = frame.getBoundingClientRect().width;
					const nativeTrack = /^([\d.]+)px(?:\s|$)/u.exec(frame.style.gridTemplateColumns);
					const sidebarWidth = nativeTrack === null ? frame.firstElementChild?.getBoundingClientRect().width ?? 0 : Number(nativeTrack[1]);
					const available = frameWidth - sidebarWidth - 480;
					setTrack("--citeciter-sidebar-width", sidebarWidth + "px");
					if (available < 360) {
						setTrack("--citeciter-dock-width", "0px");
						setWidth(Math.min(frameWidth, 720));
						setDocked(false);
						return;
					}
					const requested = frameWidth * widthPercent / 100;
					const panelWidth = Math.max(360, Math.min(requested, available));
					setTrack("--citeciter-dock-width", panelWidth + "px");
					setWidth(panelWidth);
					setDocked(true);
				};
				apply();
				frame.dataset.citeciterDocked = "true";
				const resizeObserver = new ResizeObserver(apply);
				const styleObserver = new MutationObserver(apply);
				resizeObserver.observe(frame);
				styleObserver.observe(frame, {
					attributes: true,
					attributeFilter: ["style"]
				});
				return () => {
					resizeObserver.disconnect();
					styleObserver.disconnect();
					delete frame.dataset.citeciterDocked;
					frame.style.removeProperty("--citeciter-sidebar-width");
					frame.style.removeProperty("--citeciter-dock-width");
				};
			}, [open, widthPercent]);
			return [width, docked];
		}
		/** Independent, resizable learning workspace docked beside the active coding conversation. */
		function CitePanel({ bus, companion, closePanel, reportParseError }) {
			const overlay = (0, react.useSyncExternalStore)(bus.subscribe, bus.getSnapshot);
			const snapshot = (0, react.useSyncExternalStore)(companion.subscribe, companion.getSnapshot);
			const [question, setQuestion] = (0, react.useState)("");
			const [title, setTitle] = (0, react.useState)("");
			const [titleDirty, setTitleDirty] = (0, react.useState)(false);
			const [widthPercent, setWidthPercent] = (0, react.useState)(snapshot.settings.panelWidthPercent);
			const resizeOrigin = (0, react.useRef)(null);
			const titleRef = (0, react.useRef)(null);
			const open = overlay.panelOpen;
			const [panelWidth, docked] = useDockColumn(open, widthPercent);
			const active = snapshot.active;
			(0, react.useEffect)(() => companion.setVisible(open), [companion, open]);
			(0, react.useEffect)(() => setWidthPercent(snapshot.settings.panelWidthPercent), [snapshot.settings.panelWidthPercent]);
			(0, react.useEffect)(() => {
				setTitle(active?.topic.title ?? "");
				setTitleDirty(false);
			}, [active?.topic.sessionId]);
			(0, react.useEffect)(() => {
				if (!titleDirty) setTitle(active?.topic.title ?? "");
			}, [active?.topic.title, titleDirty]);
			const selectedModel = snapshot.providers.find((provider) => provider.id === active?.topic.modelConfig.provider)?.models.find((model) => model.id === active?.topic.modelConfig.model);
			const models = (0, react.useMemo)(() => snapshot.providers.flatMap((provider) => provider.models.map((model) => ({
				provider: provider.id,
				providerName: provider.name,
				model
			}))), [snapshot.providers]);
			const firstAssistantId = active?.messages.find((message) => message.role === "assistant" && message.text !== "")?.id;
			const whaleState = mascotState(snapshot.phase, active?.messages ?? []);
			if (!open) return null;
			const submit = (event) => {
				event.preventDefault();
				if (snapshot.phase === "running" || snapshot.phase === "stopping") return;
				const value = question.trim();
				if (value === "") return;
				const submitted = question;
				companion.ask(value).then((sent) => {
					if (sent) setQuestion((current) => current === submitted ? "" : current);
				});
			};
			const updateWidth = (next) => {
				const value = clampWidth(next);
				setWidthPercent(value);
				companion.setSetting("panelWidthPercent", value);
			};
			const startResize = (event) => {
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				resizeOrigin.current = {
					x: event.clientX,
					width: widthPercent,
					frameWidth: document.querySelector("[data-shell-overlay]")?.parentElement?.getBoundingClientRect().width ?? window.innerWidth
				};
			};
			const moveResize = (event) => {
				const origin = resizeOrigin.current;
				if (origin === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
				setWidthPercent(clampWidth(origin.width + (origin.x - event.clientX) / origin.frameWidth * 100));
			};
			const endResize = (event) => {
				const origin = resizeOrigin.current;
				if (origin === null || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
				resizeOrigin.current = null;
				event.currentTarget.releasePointerCapture(event.pointerId);
				updateWidth(origin.width + (origin.x - event.clientX) / origin.frameWidth * 100);
			};
			const cancelResize = (event) => {
				if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
				resizeOrigin.current = null;
				setWidthPercent(snapshot.settings.panelWidthPercent);
			};
			const resizeKey = (event) => {
				if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
				event.preventDefault();
				updateWidth(widthPercent + (event.key === "ArrowLeft" ? 1 : -1));
			};
			return (0, react_jsx_runtime.jsxs)("aside", {
				className: CiteCiter_module_css_default.dock,
				style: { width: panelWidth > 0 ? panelWidth : void 0 },
				"data-citeciter-panel": true,
				"data-overlay": docked ? void 0 : true,
				"aria-label": "CiteCiter 学习伴侣",
				children: [
					docked && (0, react_jsx_runtime.jsx)("div", {
						className: CiteCiter_module_css_default.resizeHandle,
						role: "separator",
						"aria-label": "调整 CiteCiter 宽度",
						"aria-orientation": "vertical",
						"aria-valuemin": 28,
						"aria-valuemax": 55,
						"aria-valuenow": widthPercent,
						tabIndex: 0,
						onPointerDown: startResize,
						onPointerMove: moveResize,
						onPointerUp: endResize,
						onPointerCancel: cancelResize,
						onKeyDown: resizeKey
					}),
					(0, react_jsx_runtime.jsx)("button", {
						className: CiteCiter_module_css_default.closeButton,
						type: "button",
						onClick: closePanel,
						"aria-label": "关闭 CiteCiter",
						children: (0, react_jsx_runtime.jsx)("img", {
							src: collapse_arrow_default,
							alt: ""
						})
					}),
					(0, react_jsx_runtime.jsx)(CitationWaterline, {
						anchorKey: snapshot.sourceAnchorKey ?? void 0,
						target: titleRef
					}),
					(0, react_jsx_runtime.jsxs)("nav", {
						className: CiteCiter_module_css_default.topicRail,
						"aria-label": "CiteCiter Topics",
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.brand,
								children: [(0, react_jsx_runtime.jsx)(MascotStatus, { state: whaleState }), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "CiteCiter" }), (0, react_jsx_runtime.jsx)("span", { children: "学习伴侣" })] })]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.railCaption,
								children: [(0, react_jsx_runtime.jsx)("span", { children: snapshot.includeArchived ? "归档讨论" : "当前来源的讨论" }), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => companion.setIncludeArchived(!snapshot.includeArchived),
									children: snapshot.includeArchived ? "返回活动" : "查看归档"
								})]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.topicList,
								children: [
									snapshot.topics.map((topic) => (0, react_jsx_runtime.jsxs)("button", {
										className: CiteCiter_module_css_default.topicItem,
										"data-active": active?.topic.sessionId === topic.sessionId || void 0,
										"data-archived": topic.archived || void 0,
										"data-citeciter-topic": topic.sessionId,
										type: "button",
										onClick: () => {
											companion.openTopic(topic.sessionId);
										},
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: CiteCiter_module_css_default.topicStatus,
											"data-running": topic.running || void 0
										}), (0, react_jsx_runtime.jsxs)("span", {
											className: CiteCiter_module_css_default.topicCopy,
											children: [(0, react_jsx_runtime.jsx)("strong", {
												"data-pending": topic.titlePending || void 0,
												children: topic.title
											}), (0, react_jsx_runtime.jsxs)("small", { children: [
												"“",
												quotePreview(topic.citation.displayText),
												"”"
											] })]
										})]
									}, topic.sessionId)),
									snapshot.topicsStatus === "loading" && (0, react_jsx_runtime.jsx)("p", {
										className: CiteCiter_module_css_default.railEmpty,
										role: "status",
										children: "正在读取 Topic…"
									}),
									snapshot.topicsStatus === "error" && (0, react_jsx_runtime.jsxs)("p", {
										className: CiteCiter_module_css_default.railError,
										role: "alert",
										children: [
											"Topic 读取失败",
											(0, react_jsx_runtime.jsx)("br", {}),
											snapshot.topicsError
										]
									}),
									snapshot.topicsStatus === "ready" && snapshot.topics.length === 0 && (0, react_jsx_runtime.jsx)("p", {
										className: CiteCiter_module_css_default.railEmpty,
										children: snapshot.includeArchived ? "当前来源还没有归档 Topic。" : "在中央编程对话中选中文字，右键即可开始。"
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.railFoot,
								children: [(0, react_jsx_runtime.jsx)("span", { children: snapshot.topicsStatus === "ready" ? `${snapshot.topics.length} 个 Topic` : "Topic 状态未知" }), (0, react_jsx_runtime.jsxs)("span", { children: [widthPercent, "%"] })]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: CiteCiter_module_css_default.learningWorkspace,
						children: [(0, react_jsx_runtime.jsx)("header", {
							className: CiteCiter_module_css_default.dockHeader,
							children: (0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.dockHeading,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: CiteCiter_module_css_default.modeBadge,
										children: active === null ? snapshot.phase === "creating" ? "待确认" : "学习栏" : active.topic.mode === "exact-fork" ? "Exact Fork" : "Observer"
									}),
									(0, react_jsx_runtime.jsx)("strong", {
										ref: titleRef,
										children: active?.topic.title ?? "新的学习讨论"
									}),
									(0, react_jsx_runtime.jsx)("span", { children: PHASE_LABEL[snapshot.phase] })
								]
							})
						}), active === null && snapshot.draftQuote === null ? (0, react_jsx_runtime.jsxs)("div", {
							className: CiteCiter_module_css_default.emptyState,
							children: [
								(0, react_jsx_runtime.jsx)("div", {
									className: CiteCiter_module_css_default.emptyWhale,
									"aria-hidden": "true",
									children: (0, react_jsx_runtime.jsx)("img", {
										src: citeciter_mascot_default,
										alt: ""
									})
								}),
								(0, react_jsx_runtime.jsx)("h2", { children: "编程别停，问题放到旁边问" }),
								(0, react_jsx_runtime.jsx)("p", { children: "选中主对话里一次已完成模型调用的任意文字，右键输入问题。Topic 会在这里独立多轮继续，不进入左侧主会话列表。" }),
								snapshot.error !== null && (0, react_jsx_runtime.jsx)("p", {
									className: CiteCiter_module_css_default.panelError,
									children: friendlyFailure(snapshot.error)
								})
							]
						}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.contextBar,
								children: [(0, react_jsx_runtime.jsxs)("blockquote", { children: [
									"“",
									active?.topic.citation.displayText ?? snapshot.draftQuote,
									"”"
								] }), active !== null && (0, react_jsx_runtime.jsxs)("div", {
									className: CiteCiter_module_css_default.contextMeta,
									children: [(0, react_jsx_runtime.jsx)("span", {
										"data-ok": active.topic.sourceAvailable || void 0,
										children: active.topic.sourceAvailable ? "来源在线" : "来源不可用"
									}), (0, react_jsx_runtime.jsx)("span", { children: active.topic.observedThroughSeq === null ? "尚未读取来源" : "已读至 seq " + active.topic.observedThroughSeq })]
								})]
							}),
							active !== null && (0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.topicToolbar,
								children: [
									(0, react_jsx_runtime.jsxs)("form", {
										onSubmit: (event) => {
											event.preventDefault();
											companion.rename(title).then((saved) => {
												if (saved) setTitleDirty(false);
											});
										},
										children: [(0, react_jsx_runtime.jsx)("input", {
											value: title,
											onChange: (event) => {
												setTitle(event.currentTarget.value);
												setTitleDirty(true);
											},
											"aria-label": "Topic 标题"
										}), (0, react_jsx_runtime.jsx)("button", {
											type: "submit",
											disabled: title.trim() === "" || !titleDirty || snapshot.renaming,
											children: snapshot.renaming ? "保存中…" : titleDirty ? "保存标题" : "已保存"
										})]
									}),
									(0, react_jsx_runtime.jsxs)("select", {
										"aria-label": "CiteCiter 模型",
										value: modelValue(active.topic.modelConfig.provider, active.topic.modelConfig.model),
										disabled: snapshot.modelRouteSaving,
										onChange: (event) => {
											const [provider, model] = parseModelValue(event.currentTarget.value);
											companion.setModelRoute(provider, model);
										},
										children: [!models.some((item) => item.provider === active.topic.modelConfig.provider && item.model.id === active.topic.modelConfig.model) && (0, react_jsx_runtime.jsxs)("option", {
											value: modelValue(active.topic.modelConfig.provider, active.topic.modelConfig.model),
											children: [
												active.topic.modelConfig.provider,
												" / ",
												active.topic.modelConfig.model
											]
										}), snapshot.providers.map((provider) => (0, react_jsx_runtime.jsx)("optgroup", {
											label: provider.name,
											children: provider.models.map((model) => (0, react_jsx_runtime.jsx)("option", {
												value: modelValue(provider.id, model.id),
												children: model.name
											}, model.id))
										}, provider.id))]
									}),
									selectedModel !== void 0 && selectedModel.reasoningEfforts.length > 0 && (0, react_jsx_runtime.jsxs)("select", {
										"aria-label": "思考强度",
										value: active.topic.modelConfig.reasoningEffort ?? "",
										disabled: snapshot.reasoningEffortSaving || snapshot.modelRouteSaving,
										onChange: (event) => {
											companion.setReasoningEffort(event.currentTarget.value === "" ? null : event.currentTarget.value);
										},
										children: [(0, react_jsx_runtime.jsx)("option", {
											value: "",
											children: "模型默认思考"
										}), selectedModel.reasoningEfforts.map((effort) => (0, react_jsx_runtime.jsx)("option", {
											value: effort.id,
											children: effort.name
										}, effort.id))]
									}),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: CiteCiter_module_css_default.archiveButton,
										"aria-label": active.topic.archived ? "恢复当前 Topic" : "归档当前 Topic",
										disabled: snapshot.archiving,
										onClick: () => {
											companion.archive(!active.topic.archived);
										},
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconArchiveOutline20, { size: 14 }), snapshot.archiving ? "处理中…" : active.topic.archived ? "恢复" : "归档"]
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.transcript,
								"aria-live": "polite",
								children: [
									active?.messages.map((message) => {
										if (message.role === "tool") return (0, react_jsx_runtime.jsx)(ToolRow, { message }, message.id);
										if (message.role === "context") return (0, react_jsx_runtime.jsx)(ContextRow, { message }, message.id);
										if (message.role === "user") return (0, react_jsx_runtime.jsxs)("article", {
											className: CiteCiter_module_css_default.userTurn,
											children: [(0, react_jsx_runtime.jsx)("div", {
												className: CiteCiter_module_css_default.turnRole,
												children: "你"
											}), (0, react_jsx_runtime.jsx)("p", { children: message.text })]
										}, message.id);
										if (message.role === "error") return (0, react_jsx_runtime.jsx)(ErrorTurn, { message }, message.id);
										return (0, react_jsx_runtime.jsx)(AssistantTurn, {
											message,
											first: message.id === firstAssistantId,
											disabled: snapshot.phase === "running" || snapshot.phase === "stopping",
											companion,
											reportParseError
										}, message.id);
									}),
									snapshot.phase === "creating" && (0, react_jsx_runtime.jsx)("div", {
										className: CiteCiter_module_css_default.loadingCard,
										children: "正在验证引用并确认 Observer / Exact Fork…"
									}),
									snapshot.error !== null && !active?.messages.some((message) => message.role === "error") && (0, react_jsx_runtime.jsx)("p", {
										className: CiteCiter_module_css_default.panelError,
										"data-citeciter-error": true,
										children: friendlyFailure(snapshot.error)
									})
								]
							}),
							active?.pendingQuestion !== null && active?.pendingQuestion !== void 0 ? (0, react_jsx_runtime.jsx)(QuestionCard, {
								pending: active.pendingQuestion,
								companion
							}, active.pendingQuestion.key) : (0, react_jsx_runtime.jsxs)("form", {
								className: CiteCiter_module_css_default.composer,
								onSubmit: submit,
								children: [(0, react_jsx_runtime.jsx)("textarea", {
									rows: 3,
									maxLength: 12e3,
									"aria-label": "继续向 CiteCiter 提问",
									value: question,
									disabled: active === null,
									onChange: (event) => setQuestion(event.currentTarget.value),
									placeholder: active === null ? "Topic 创建后可继续追问" : "继续追问，或聊点题外话…"
								}), (0, react_jsx_runtime.jsxs)("div", {
									className: CiteCiter_module_css_default.composerActions,
									children: [(0, react_jsx_runtime.jsx)("span", { children: "只读 · 不干预主 Agent" }), (0, react_jsx_runtime.jsx)("button", {
										className: CiteCiter_module_css_default.sendButton,
										type: snapshot.phase === "running" ? "button" : "submit",
										disabled: snapshot.phase === "stopping" || snapshot.phase !== "running" && (active === null || question.trim() === ""),
										"aria-label": snapshot.phase === "running" ? "停止回答" : snapshot.phase === "stopping" ? "正在停止" : "发送",
										onClick: snapshot.phase === "running" ? () => {
											companion.stop();
										} : void 0,
										children: snapshot.phase === "running" || snapshot.phase === "stopping" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconStopFill16, { size: 16 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSendOutline16, { size: 16 })
									})]
								})]
							})
						] })]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/components/CiteCiterSettings.js
		/** Native DSH settings page for CiteCiter-owned preferences. */
		function CiteCiterSettings({ companion }) {
			const snapshot = (0, react.useSyncExternalStore)(companion.subscribe, companion.getSnapshot);
			const settings = snapshot.settings;
			const [widthDraft, setWidthDraft] = (0, react.useState)(settings.panelWidthPercent);
			const committedWidth = (0, react.useRef)(settings.panelWidthPercent);
			(0, react.useEffect)(() => {
				committedWidth.current = settings.panelWidthPercent;
				setWidthDraft(settings.panelWidthPercent);
			}, [settings.panelWidthPercent]);
			const commitWidth = (value) => {
				if (value === committedWidth.current) return;
				committedWidth.current = value;
				companion.setSetting("panelWidthPercent", value);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: CiteCiter_module_css_default.settingsPage,
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: CiteCiter_module_css_default.settingsHero,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: CiteCiter_module_css_default.settingsWhale,
							"aria-hidden": "true",
							children: (0, react_jsx_runtime.jsx)("img", {
								src: citeciter_mascot_default,
								alt: ""
							})
						}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h2", { children: "CiteCiter" }), (0, react_jsx_runtime.jsx)("p", { children: "保留 DSH 的编程主界面，把学习讨论放在右侧独立工作区。" })] })]
					}),
					snapshot.settingsSaveMessage !== null && (0, react_jsx_runtime.jsx)("p", {
						className: CiteCiter_module_css_default.settingsSaveStatus,
						"data-status": snapshot.settingsSaveStatus,
						role: snapshot.settingsSaveStatus === "error" ? "alert" : "status",
						children: snapshot.settingsSaveMessage
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: CiteCiter_module_css_default.settingsGroup,
						children: [
							(0, react_jsx_runtime.jsx)("h3", { children: "新 Topic 的来源方式" }),
							(0, react_jsx_runtime.jsxs)("label", {
								className: CiteCiter_module_css_default.settingChoice,
								"data-selected": settings.defaultMode === "observer" || void 0,
								children: [(0, react_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "citeciter-default-mode",
									checked: settings.defaultMode === "observer",
									onChange: () => {
										companion.setSetting("defaultMode", "observer");
									}
								}), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "Observer（推荐）" }), (0, react_jsx_runtime.jsx)("small", { children: "模型调用一完成即可提问；主 Agent 后续的新调用仍可被只读查看。" })] })]
							}),
							(0, react_jsx_runtime.jsxs)("label", {
								className: CiteCiter_module_css_default.settingChoice,
								"data-selected": settings.defaultMode === "exact-when-available" || void 0,
								children: [(0, react_jsx_runtime.jsx)("input", {
									type: "radio",
									name: "citeciter-default-mode",
									checked: settings.defaultMode === "exact-when-available",
									onChange: () => {
										companion.setSetting("defaultMode", "exact-when-available");
									}
								}), (0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "可用时精确分叉" }), (0, react_jsx_runtime.jsx)("small", { children: "轮次已结束时冻结完整前缀；开放轮次自动回到 Observer。" })] })]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: CiteCiter_module_css_default.settingsGroup,
						children: [
							(0, react_jsx_runtime.jsx)("h3", { children: "来源读取" }),
							(0, react_jsx_runtime.jsxs)("label", {
								className: CiteCiter_module_css_default.settingToggle,
								children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "包含来源 reasoning" }), (0, react_jsx_runtime.jsx)("small", { children: "关闭后 read_source_session 不向 CiteCiter 返回主 Agent 的思考正文。" })] }), (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: settings.includeSourceReasoning,
									onChange: (event) => {
										companion.setSetting("includeSourceReasoning", event.currentTarget.checked);
									}
								})]
							}),
							(0, react_jsx_runtime.jsxs)("label", {
								className: CiteCiter_module_css_default.settingToggle,
								children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "允许调查来源工作区" }), (0, react_jsx_runtime.jsx)("small", { children: "提供 DSH 标准 read、glob 与 grep；写入、编辑、任意命令与外部副作用始终不可用。" })] }), (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: settings.allowSourceFiles,
									onChange: (event) => {
										companion.setSetting("allowSourceFiles", event.currentTarget.checked);
									}
								})]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: CiteCiter_module_css_default.settingsGroup,
						children: [
							(0, react_jsx_runtime.jsx)("h3", { children: "学习栏" }),
							(0, react_jsx_runtime.jsxs)("label", {
								className: CiteCiter_module_css_default.widthSetting,
								children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "默认宽度" }), (0, react_jsx_runtime.jsxs)("output", { children: [widthDraft, "%"] })] }), (0, react_jsx_runtime.jsx)("input", {
									type: "range",
									min: 28,
									max: 55,
									step: 1,
									value: widthDraft,
									onChange: (event) => setWidthDraft(Number(event.currentTarget.value)),
									onPointerUp: (event) => commitWidth(Number(event.currentTarget.value)),
									onBlur: (event) => commitWidth(Number(event.currentTarget.value)),
									onKeyUp: (event) => {
										if ([
											"ArrowLeft",
											"ArrowRight",
											"Home",
											"End"
										].includes(event.key)) commitWidth(Number(event.currentTarget.value));
									}
								})]
							}),
							(0, react_jsx_runtime.jsxs)("label", {
								className: CiteCiter_module_css_default.settingToggle,
								children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "重新打开上次 Topic" }), (0, react_jsx_runtime.jsx)("small", { children: "刷新或重新进入来源 Session 时，自动展开学习栏并恢复最近讨论。" })] }), (0, react_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: settings.reopenLastTopic,
									onChange: (event) => {
										companion.setSetting("reopenLastTopic", event.currentTarget.checked);
									}
								})]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.dockPreview,
								"aria-label": "学习栏宽度预览",
								children: [
									(0, react_jsx_runtime.jsx)("span", { className: CiteCiter_module_css_default.previewSidebar }),
									(0, react_jsx_runtime.jsx)("span", {
										className: CiteCiter_module_css_default.previewCoding,
										children: "DSH 编程对话"
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: CiteCiter_module_css_default.previewDock,
										style: { width: widthDraft + "%" },
										children: "CiteCiter"
									})
								]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/components/SelectionMenu.js
		const PREVIEW_LIMIT = 96;
		/** Ask the first question beside the selected source text. */
		function SelectionMenu({ bus, companion, openPanel }) {
			const overlay = (0, react.useSyncExternalStore)(bus.subscribe, bus.getSnapshot);
			const snapshot = (0, react.useSyncExternalStore)(companion.subscribe, companion.getSnapshot);
			const [question, setQuestion] = (0, react.useState)("");
			const [mode, setMode] = (0, react.useState)(snapshot.settings.defaultMode);
			const selection = overlay.menuSelection;
			(0, react.useEffect)(() => {
				if (selection === null) return;
				setQuestion("");
				setMode(snapshot.settings.defaultMode);
			}, [selection, snapshot.settings.defaultMode]);
			const submit = (event) => {
				event.preventDefault();
				if (selection === null || question.trim() === "") return;
				const prompt = question.trim();
				openPanel();
				bus.setMenuSelection(null);
				companion.create(selection, prompt, mode);
			};
			const preview = selection === null ? "" : selection.displayText.length > PREVIEW_LIMIT ? selection.displayText.slice(0, PREVIEW_LIMIT) + "…" : selection.displayText;
			const left = selection === null ? 0 : Math.max(12, Math.min(selection.x, window.innerWidth - 390));
			const top = selection === null ? 0 : Math.max(12, Math.min(selection.y, window.innerHeight - 260));
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [selection !== null && (0, react_jsx_runtime.jsxs)("form", {
				className: CiteCiter_module_css_default.selectionPopover,
				"data-citeciter-menu": true,
				style: {
					left,
					top
				},
				role: "dialog",
				"aria-label": "向 CiteCiter 提问",
				onSubmit: submit,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: CiteCiter_module_css_default.popoverQuote,
						title: selection.displayText,
						children: [
							"“",
							preview,
							"”"
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: CiteCiter_module_css_default.popoverComposer,
						children: [(0, react_jsx_runtime.jsx)("input", {
							autoFocus: true,
							value: question,
							maxLength: 12e3,
							onChange: (event) => setQuestion(event.currentTarget.value),
							placeholder: "哪里没看懂？",
							"aria-label": "CiteCiter 的第一个问题"
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: question.trim() === "",
							children: "Citer!"
						})]
					}),
					(0, react_jsx_runtime.jsxs)("details", {
						className: CiteCiter_module_css_default.popoverMode,
						children: [(0, react_jsx_runtime.jsxs)("summary", { children: ["上下文方式：", mode === "observer" ? "旁观（推荐）" : mode === "exact-fork" ? "精确分叉" : "可用时精确分叉"] }), (0, react_jsx_runtime.jsxs)("select", {
							value: mode,
							onChange: (event) => setMode(event.currentTarget.value),
							children: [
								(0, react_jsx_runtime.jsx)("option", {
									value: "observer",
									children: "旁观：来源继续更新"
								}),
								(0, react_jsx_runtime.jsx)("option", {
									value: "exact-when-available",
									children: "轮次结束时精确，否则旁观"
								}),
								(0, react_jsx_runtime.jsx)("option", {
									value: "exact-fork",
									children: "精确分叉：要求轮次已结束"
								})
							]
						})]
					})
				]
			}), snapshot.sourceSessionId !== null && !overlay.panelOpen && (0, react_jsx_runtime.jsxs)("button", {
				className: CiteCiter_module_css_default.topicLauncher,
				type: "button",
				onClick: openPanel,
				"aria-label": snapshot.topics.length === 0 ? "打开 CiteCiter" : "打开 CiteCiter，共 " + snapshot.topics.length + " 个讨论",
				title: "打开 CiteCiter",
				children: [(0, react_jsx_runtime.jsx)("img", {
					src: "data:image/png;base64,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",
					alt: "",
					"aria-hidden": "true"
				}), snapshot.topics.length > 0 && (0, react_jsx_runtime.jsx)("span", {
					className: CiteCiter_module_css_default.launcherCount,
					children: snapshot.topics.length
				})]
			})] });
		}
		//#endregion
		//#region lib/types/client/selection.js
		const RANGE_CONTEXT_CHARS = 240;
		const TRANSLATED_CONTENT_SELECTOR = "[data-read-frog-translation-mode]";
		/** Resolve a DOM Node to its nearest Element parent. */
		function parentElement(node) {
			return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
		}
		function isTranslatedContent(node) {
			return node.nodeType === Node.ELEMENT_NODE && node.matches(TRANSLATED_CONTENT_SELECTOR);
		}
		function committedText(root, target) {
			let text = "";
			let targetStart;
			let targetEnd;
			const visit = (node) => {
				if (isTranslatedContent(node)) return;
				if (node === target) targetStart = text.length;
				if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? "";
				else for (const child of node.childNodes) visit(child);
				if (node === target) targetEnd = text.length;
			};
			visit(root);
			return {
				text,
				targetStart,
				targetEnd
			};
		}
		function committedTextBefore(root, boundary, offset) {
			let text = "";
			let found = false;
			const visit = (node) => {
				if (found || isTranslatedContent(node)) return;
				if (node === boundary) {
					if (node.nodeType === Node.TEXT_NODE) text += (node.textContent ?? "").slice(0, offset);
					else for (let index = 0; index < offset; index++) {
						const child = node.childNodes[index];
						if (child !== void 0) visit(child);
					}
					found = true;
					return;
				}
				if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? "";
				else for (const child of node.childNodes) visit(child);
			};
			visit(root);
			return found ? text : null;
		}
		/**
		* Resolve the current DOM selection into a CiteSelection.
		*
		* A Range inside one assistant flow keeps exact visible offsets. A cross-flow
		* Range binds to its final intersected assistant model call while preserving
		* the complete visible quote for the learning UI.
		*
		* @param event - context-menu event whose pointer position anchors the menu.
		* @param sourceSessionId - current session identity captured with the DOM range.
		* @returns validated selection metadata, or null when CiteCiter should ignore it.
		*/
		function readSelection(event, sourceSessionId) {
			const selection = window.getSelection();
			if (selection === null || selection.isCollapsed || selection.rangeCount === 0) return null;
			const range = selection.getRangeAt(0);
			const startFlow = parentElement(range.startContainer)?.closest("[data-chat-flow-kind]");
			const endFlow = parentElement(range.endContainer)?.closest("[data-chat-flow-kind]");
			if (startFlow === null || startFlow === void 0 || endFlow === null || endFlow === void 0) return null;
			if (endFlow !== startFlow) {
				const flow = [...document.querySelectorAll("[data-chat-flow-kind=\"assistant-step\"][data-chat-anchor-key]")].filter((candidate) => range.intersectsNode(candidate)).at(-1);
				const anchorKey = flow?.dataset.chatAnchorKey;
				const displayText = range.toString().trim();
				if (flow === void 0 || anchorKey === void 0 || anchorKey === "" || displayText === "") return null;
				const projected = committedText(flow).text;
				const sourceHintText = projected.trim();
				if (sourceHintText === "") return null;
				return {
					sourceSessionId,
					displayText,
					sourceHintText,
					kind: "assistant-step",
					anchorKey,
					startOffset: projected.length - projected.trimStart().length,
					endOffset: projected.length - (projected.length - projected.trimEnd().length),
					prefixText: "",
					suffixText: "",
					x: event.clientX,
					y: event.clientY
				};
			}
			for (const reasoning of startFlow.querySelectorAll("[data-variant=\"think\"]")) if (range.intersectsNode(reasoning)) return null;
			for (const generated of startFlow.querySelectorAll("button, .katex, [data-footnotes], sup")) if (range.intersectsNode(generated)) return null;
			for (const endpoint of [range.startContainer, range.endContainer]) {
				const element = parentElement(endpoint);
				if (element?.closest(".md-code-block") !== null && element?.closest("pre") === null) return null;
			}
			const kind = startFlow.dataset.chatFlowKind;
			const anchorKey = startFlow.dataset.chatAnchorKey;
			if (kind !== "assistant-step" || anchorKey === void 0 || anchorKey === "") return null;
			const translatedStart = parentElement(range.startContainer)?.closest(TRANSLATED_CONTENT_SELECTOR);
			const translatedEnd = parentElement(range.endContainer)?.closest(TRANSLATED_CONTENT_SELECTOR);
			let text;
			let flowText;
			let startOffset;
			let endOffset;
			let sourceHintText;
			if (translatedStart !== null || translatedEnd !== null) {
				if (translatedStart === null || translatedStart === void 0 || translatedStart !== translatedEnd) return null;
				const sourceElement = translatedStart.parentElement?.closest("[data-read-frog-paragraph]");
				if (sourceElement === null || sourceElement === void 0 || !startFlow.contains(sourceElement)) return null;
				const projected = committedText(startFlow, sourceElement);
				if (projected.targetStart === void 0 || projected.targetEnd === void 0) return null;
				const rawSourceHint = projected.text.slice(projected.targetStart, projected.targetEnd);
				const sourceLeading = rawSourceHint.length - rawSourceHint.trimStart().length;
				const sourceTrailing = rawSourceHint.length - rawSourceHint.trimEnd().length;
				text = range.toString().trim();
				flowText = projected.text;
				startOffset = projected.targetStart + sourceLeading;
				endOffset = projected.targetEnd - sourceTrailing;
				sourceHintText = rawSourceHint.trim();
			} else {
				const beforeStart = committedTextBefore(startFlow, range.startContainer, range.startOffset);
				const beforeEnd = committedTextBefore(startFlow, range.endContainer, range.endOffset);
				if (beforeStart === null || beforeEnd === null || beforeEnd.length < beforeStart.length) return null;
				const rawText = beforeEnd.slice(beforeStart.length);
				const leadingWhitespace = rawText.length - rawText.trimStart().length;
				const trailingWhitespace = rawText.length - rawText.trimEnd().length;
				text = rawText.trim();
				flowText = committedText(startFlow).text;
				startOffset = beforeStart.length + leadingWhitespace;
				endOffset = beforeEnd.length - trailingWhitespace;
			}
			if (text === "") return null;
			if (startOffset < 0 || endOffset < startOffset || endOffset > flowText.length) return null;
			return {
				sourceSessionId,
				displayText: text,
				...sourceHintText === void 0 ? {} : { sourceHintText },
				kind,
				anchorKey,
				startOffset,
				endOffset,
				prefixText: flowText.slice(Math.max(0, startOffset - RANGE_CONTEXT_CHARS), startOffset),
				suffixText: flowText.slice(endOffset, endOffset + RANGE_CONTEXT_CHARS),
				x: event.clientX,
				y: event.clientY
			};
		}
		//#endregion
		//#region lib/types/client/types.js
		/** Tiny observable state shared by the selection popover and independent dock. */
		var CiteBus = class {
			reportListenerError;
			snapshot = {
				menuSelection: null,
				panelOpen: false
			};
			listeners = /* @__PURE__ */ new Set();
			/** @param reportListenerError - contains one failed browser subscriber. */
			constructor(reportListenerError) {
				this.reportListenerError = reportListenerError;
			}
			/** @returns stable overlay snapshot. */
			getSnapshot = () => this.snapshot;
			/** @param listener - observer. @returns disposer. */
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			/** Show or dismiss the selection question popover. */
			setMenuSelection(selection) {
				if (this.snapshot.menuSelection === selection) return;
				this.snapshot = {
					...this.snapshot,
					menuSelection: selection
				};
				this.notify();
			}
			/** Open or close the independent companion dock. */
			setPanelOpen(panelOpen) {
				if (this.snapshot.panelOpen === panelOpen) return;
				this.snapshot = {
					...this.snapshot,
					panelOpen
				};
				this.notify();
			}
			notify() {
				for (const listener of [...this.listeners]) try {
					listener();
				} catch (error) {
					this.reportListenerError(error);
				}
			}
		};
		//#endregion
		//#region lib/types/client/index.js
		const name = "@kirkchinese/dsh-citeciter";
		const inject = [
			"layout",
			"slots",
			"sessions",
			"remote",
			"settingsScope"
		];
		function decodeSettings(section) {
			const parsed = citeCiterSettingsSchema.safeParse(section);
			return parsed.success ? parsed.data : void 0;
		}
		/** Register one root-scoped companion without entering DSH's Session list. */
		async function apply(ctx) {
			const unmountRemote = await ctx.remote.$mount(TYPERT_REMOTE);
			ctx.effect(() => unmountRemote, "citeciter: Remote contribution");
			ctx.inject(["remote.citeciter"], (remoteCtx) => {
				const sessions = remoteCtx.get("sessions");
				const settings = remoteCtx.settingsScope.bind({
					namespace: CITECITER_SETTINGS_NAMESPACE,
					decode: decodeSettings
				});
				const bus = new CiteBus((error) => remoteCtx.logger.warn("CiteCiter browser listener failed", error));
				const openPanel = () => {
					remoteCtx.layout.closeDetails();
					bus.setPanelOpen(true);
				};
				const closePanel = () => {
					remoteCtx.layout.closeDetails();
					bus.setPanelOpen(false);
				};
				const companion = createCompanionController(sessions, settings, (request) => remoteCtx.remote.citeciter.request(request), openPanel);
				const reportedParseErrors = /* @__PURE__ */ new Set();
				const reportParseError = (messageId) => {
					const storageKey = `citeciter:malformed-followups:${messageId}`;
					try {
						if (sessionStorage.getItem(storageKey) !== null) return;
						sessionStorage.setItem(storageKey, "1");
					} catch {}
					if (reportedParseErrors.has(messageId)) return;
					reportedParseErrors.add(messageId);
					remoteCtx.logger.warn(`CiteCiter ignored malformed first-answer follow-up questions in ${messageId}`);
				};
				const syncSource = () => {
					companion.setSource(sessions.list.getSnapshot().current ?? null);
				};
				syncSource();
				const unsubscribeSessions = sessions.list.subscribe(syncSource);
				remoteCtx.effect(() => {
					const onContextMenu = (event) => {
						const sourceSessionId = sessions.list.getSnapshot().current;
						if (sourceSessionId === void 0) return;
						const selection = readSelection(event, sourceSessionId);
						if (selection === null) return;
						event.preventDefault();
						bus.setMenuSelection(selection);
					};
					const onPointerDown = (event) => {
						const target = event.target;
						if (!(target instanceof Element) || target.closest("[data-citeciter-menu]") === null) bus.setMenuSelection(null);
					};
					const onKeyDown = (event) => {
						if (event.key === "Escape") bus.setMenuSelection(null);
					};
					document.addEventListener("contextmenu", onContextMenu);
					document.addEventListener("pointerdown", onPointerDown);
					document.addEventListener("keydown", onKeyDown);
					return () => {
						document.removeEventListener("contextmenu", onContextMenu);
						document.removeEventListener("pointerdown", onPointerDown);
						document.removeEventListener("keydown", onKeyDown);
					};
				}, "citeciter: selection capture");
				remoteCtx.slots.inject("shell.overlay", () => remoteCtx.slots.register({
					name: "shell.overlay",
					id: "citeciter.selection",
					inject: () => ({
						bus,
						companion,
						openPanel
					})
				}, SelectionMenu));
				remoteCtx.slots.inject("shell.overlay", () => remoteCtx.slots.register({
					name: "shell.overlay",
					id: "citeciter.panel",
					inject: () => ({
						bus,
						companion,
						closePanel,
						reportParseError
					})
				}, CitePanel));
				remoteCtx.slots.inject("settings.section", () => remoteCtx.slots.register({
					name: "settings.section",
					id: "citeciter",
					order: 45,
					label: "CiteCiter",
					inject: () => ({ companion })
				}, CiteCiterSettings));
				remoteCtx.effect(() => async () => {
					unsubscribeSessions();
					closePanel();
					await companion.dispose();
				}, "citeciter: browser controller");
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});
