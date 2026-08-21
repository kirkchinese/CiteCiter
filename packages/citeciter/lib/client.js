window.__ModuleLoader__.load({
	id: "@kirkchinese/dsh-citeciter",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __defProp = Object.defineProperty;
		var __exportAll = (all, no_symbols) => {
			let target = {};
			for (var name in all) __defProp(target, name, {
				get: all[name],
				enumerable: true
			});
			if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
			return target;
		};
		//#endregion
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
		const string$3 = (params) => {
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
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$3(inst._zod.bag);
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
		const parse$1 = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode$1 = /* @__PURE__ */ _decode(ZodRealError);
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
			inst.parse = (data, params) => parse$1(inst, data, params, { callee: inst.parse });
			inst.safeParse = (data, params) => safeParse(inst, data, params);
			inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
			inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
			inst.spa = inst.safeParseAsync;
			inst.encode = (data, params) => encode(inst, data, params);
			inst.decode = (data, params) => decode$1(inst, data, params);
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
		function string$2(params) {
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
		/** Host-verifiable Markdown evidence plus the browser-visible quote used by the UI. */
		const citationDraftSchema = object({
			sourceSessionId: string$2().min(1),
			anchorSeq: number().int().nonnegative(),
			startOffset: number().int().nonnegative(),
			endOffset: number().int().positive(),
			sourceText: string$2().min(1).max(32e3),
			displayText: string$2().min(1).max(32e3),
			prefixText: string$2().max(1e3),
			suffixText: string$2().max(1e3),
			selectionFingerprint: string$2().regex(/^[a-f0-9]{64}$/)
		}).strict();
		const citationRecordSchema = citationDraftSchema.extend({
			schemaVersion: literal(3),
			createdAt: number().int().nonnegative()
		}).strict();
		const modelConfigSchema = object({
			provider: string$2().min(1),
			model: string$2().min(1),
			reasoningEffort: string$2().optional(),
			temperature: number().finite().optional(),
			maxTokens: number().int().positive().optional(),
			stop: array(string$2()).optional()
		}).strict();
		object({
			schemaVersion: literal(1),
			topicId: number().int().positive(),
			sessionId: string$2().min(1),
			sourceSessionId: string$2().min(1),
			sourceCwd: string$2(),
			mode: topicModeSchema,
			citation: citationRecordSchema,
			modelConfig: modelConfigSchema,
			forkThroughSeq: number().int().nonnegative().nullable(),
			temporaryTitle: string$2().min(1).max(160),
			cachedTitle: string$2().min(1).max(240).nullable(),
			cachedTitleSource: _enum([
				"fallback",
				"provider",
				"user"
			]).nullable(),
			createdAt: number().int().nonnegative(),
			updatedAt: number().int().nonnegative(),
			archivedAt: number().int().nonnegative().nullable(),
			sourceAvailable: boolean()
		}).strict();
		const topicSummarySchema = object({
			topicId: number().int().positive(),
			sessionId: string$2().min(1),
			sourceSessionId: string$2().min(1),
			mode: topicModeSchema,
			citation: citationRecordSchema,
			title: string$2().min(1),
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
			id: string$2().min(1),
			seq: number().int().nonnegative()
		};
		const topicMessageSchema = discriminatedUnion("role", [
			object({
				...topicMessageIdentitySchema,
				role: literal("user"),
				text: string$2()
			}).strict(),
			object({
				...topicMessageIdentitySchema,
				role: literal("assistant"),
				text: string$2(),
				reasoning: string$2().nullable(),
				streaming: boolean()
			}).strict(),
			object({
				...topicMessageIdentitySchema,
				role: literal("context"),
				label: string$2().min(1),
				text: string$2()
			}).strict(),
			object({
				...topicMessageIdentitySchema,
				role: literal("tool"),
				name: string$2().min(1),
				arguments: string$2(),
				result: string$2().nullable(),
				isError: boolean(),
				running: boolean()
			}).strict(),
			object({
				...topicMessageIdentitySchema,
				role: literal("error"),
				text: string$2()
			}).strict()
		]);
		const questionOptionSchema = object({
			label: string$2().min(1),
			description: string$2().optional()
		}).strict();
		const questionItemSchema = object({
			id: string$2().min(1),
			question: string$2().min(1),
			header: string$2().optional(),
			options: array(questionOptionSchema).optional(),
			multiSelect: boolean().optional()
		}).strict();
		const questionAnswerSchema = object({ answers: array(object({
			id: string$2().min(1),
			selected: array(string$2()),
			custom: string$2().optional()
		}).strict()) }).strict();
		const pendingQuestionSchema = object({
			key: string$2().min(1),
			questions: array(questionItemSchema).min(1)
		}).strict();
		const topicSnapshotSchema = object({
			topic: topicSummarySchema,
			messages: array(topicMessageSchema),
			pendingQuestion: pendingQuestionSchema.nullable(),
			error: string$2().nullable()
		}).strict();
		const modelOptionSchema = object({
			id: string$2().min(1),
			name: string$2().min(1),
			description: string$2().optional(),
			reasoningEfforts: array(object({
				id: string$2().min(1),
				name: string$2().min(1)
			}).strict())
		}).strict();
		const providerOptionSchema = object({
			id: string$2().min(1),
			name: string$2().min(1),
			models: array(modelOptionSchema)
		}).strict();
		const questionSchema = string$2().trim().min(1).max(12e3);
		const topicSessionIdSchema = string$2().min(1);
		/** One strict direct-RPC command for the private CiteCiter runtime. */
		const citeCiterRequestSchema = discriminatedUnion("action", [
			object({
				action: literal("create"),
				citation: citationDraftSchema,
				question: questionSchema,
				mode: _enum([
					"observer",
					"exact-fork",
					"exact-when-available"
				])
			}).strict(),
			object({
				action: literal("list"),
				sourceSessionId: string$2().min(1),
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
				key: string$2().min(1),
				answer: questionAnswerSchema
			}).strict(),
			object({
				action: literal("cancel-question"),
				topicSessionId: topicSessionIdSchema,
				key: string$2().min(1)
			}).strict(),
			object({
				action: literal("rename"),
				topicSessionId: topicSessionIdSchema,
				title: string$2().trim().min(1).max(240)
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
				action: literal("select-model"),
				topicSessionId: topicSessionIdSchema,
				provider: string$2().min(1),
				model: string$2().min(1),
				reasoningEffort: string$2().min(1).nullable()
			}).strict()
		]);
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
				sessionId: string$2().min(1)
			}).strict()
		]);
		/** Fields whose canonical serialization defines selection identity. */
		function canonicalCitationIdentity(citation) {
			return JSON.stringify([
				citation.sourceSessionId,
				citation.anchorSeq,
				citation.startOffset,
				citation.endOffset,
				citation.sourceText,
				citation.displayText,
				citation.prefixText,
				citation.suffixText
			]);
		}
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
		//#region ../../node_modules/.pnpm/mdast-util-to-string@4.0.0/node_modules/mdast-util-to-string/lib/index.js
		/**
		* @typedef {import('mdast').Nodes} Nodes
		*
		* @typedef Options
		*   Configuration (optional).
		* @property {boolean | null | undefined} [includeImageAlt=true]
		*   Whether to use `alt` for `image`s (default: `true`).
		* @property {boolean | null | undefined} [includeHtml=true]
		*   Whether to use `value` of HTML (default: `true`).
		*/
		/** @type {Options} */
		const emptyOptions = {};
		/**
		* Get the text content of a node or list of nodes.
		*
		* Prefers the node’s plain-text fields, otherwise serializes its children,
		* and if the given value is an array, serialize the nodes in it.
		*
		* @param {unknown} [value]
		*   Thing to serialize, typically `Node`.
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {string}
		*   Serialized `value`.
		*/
		function toString(value, options) {
			const settings = options || emptyOptions;
			return one(value, typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true, typeof settings.includeHtml === "boolean" ? settings.includeHtml : true);
		}
		/**
		* One node or several nodes.
		*
		* @param {unknown} value
		*   Thing to serialize.
		* @param {boolean} includeImageAlt
		*   Include image `alt`s.
		* @param {boolean} includeHtml
		*   Include HTML.
		* @returns {string}
		*   Serialized node.
		*/
		function one(value, includeImageAlt, includeHtml) {
			if (node(value)) {
				if ("value" in value) return value.type === "html" && !includeHtml ? "" : value.value;
				if (includeImageAlt && "alt" in value && value.alt) return value.alt;
				if ("children" in value) return all(value.children, includeImageAlt, includeHtml);
			}
			if (Array.isArray(value)) return all(value, includeImageAlt, includeHtml);
			return "";
		}
		/**
		* Serialize a list of nodes.
		*
		* @param {Array<unknown>} values
		*   Thing to serialize.
		* @param {boolean} includeImageAlt
		*   Include image `alt`s.
		* @param {boolean} includeHtml
		*   Include HTML.
		* @returns {string}
		*   Serialized nodes.
		*/
		function all(values, includeImageAlt, includeHtml) {
			/** @type {Array<string>} */
			const result = [];
			let index = -1;
			while (++index < values.length) result[index] = one(values[index], includeImageAlt, includeHtml);
			return result.join("");
		}
		/**
		* Check if `value` looks like a node.
		*
		* @param {unknown} value
		*   Thing.
		* @returns {value is Nodes}
		*   Whether `value` is a node.
		*/
		function node(value) {
			return Boolean(value && typeof value === "object");
		}
		//#endregion
		//#region ../../node_modules/.pnpm/character-entities@2.0.2/node_modules/character-entities/index.js
		/**
		* Map of named character references.
		*
		* @type {Record<string, string>}
		*/
		const characterEntities = {
			AElig: "Æ",
			AMP: "&",
			Aacute: "Á",
			Abreve: "Ă",
			Acirc: "Â",
			Acy: "А",
			Afr: "𝔄",
			Agrave: "À",
			Alpha: "Α",
			Amacr: "Ā",
			And: "⩓",
			Aogon: "Ą",
			Aopf: "𝔸",
			ApplyFunction: "⁡",
			Aring: "Å",
			Ascr: "𝒜",
			Assign: "≔",
			Atilde: "Ã",
			Auml: "Ä",
			Backslash: "∖",
			Barv: "⫧",
			Barwed: "⌆",
			Bcy: "Б",
			Because: "∵",
			Bernoullis: "ℬ",
			Beta: "Β",
			Bfr: "𝔅",
			Bopf: "𝔹",
			Breve: "˘",
			Bscr: "ℬ",
			Bumpeq: "≎",
			CHcy: "Ч",
			COPY: "©",
			Cacute: "Ć",
			Cap: "⋒",
			CapitalDifferentialD: "ⅅ",
			Cayleys: "ℭ",
			Ccaron: "Č",
			Ccedil: "Ç",
			Ccirc: "Ĉ",
			Cconint: "∰",
			Cdot: "Ċ",
			Cedilla: "¸",
			CenterDot: "·",
			Cfr: "ℭ",
			Chi: "Χ",
			CircleDot: "⊙",
			CircleMinus: "⊖",
			CirclePlus: "⊕",
			CircleTimes: "⊗",
			ClockwiseContourIntegral: "∲",
			CloseCurlyDoubleQuote: "”",
			CloseCurlyQuote: "’",
			Colon: "∷",
			Colone: "⩴",
			Congruent: "≡",
			Conint: "∯",
			ContourIntegral: "∮",
			Copf: "ℂ",
			Coproduct: "∐",
			CounterClockwiseContourIntegral: "∳",
			Cross: "⨯",
			Cscr: "𝒞",
			Cup: "⋓",
			CupCap: "≍",
			DD: "ⅅ",
			DDotrahd: "⤑",
			DJcy: "Ђ",
			DScy: "Ѕ",
			DZcy: "Џ",
			Dagger: "‡",
			Darr: "↡",
			Dashv: "⫤",
			Dcaron: "Ď",
			Dcy: "Д",
			Del: "∇",
			Delta: "Δ",
			Dfr: "𝔇",
			DiacriticalAcute: "´",
			DiacriticalDot: "˙",
			DiacriticalDoubleAcute: "˝",
			DiacriticalGrave: "`",
			DiacriticalTilde: "˜",
			Diamond: "⋄",
			DifferentialD: "ⅆ",
			Dopf: "𝔻",
			Dot: "¨",
			DotDot: "⃜",
			DotEqual: "≐",
			DoubleContourIntegral: "∯",
			DoubleDot: "¨",
			DoubleDownArrow: "⇓",
			DoubleLeftArrow: "⇐",
			DoubleLeftRightArrow: "⇔",
			DoubleLeftTee: "⫤",
			DoubleLongLeftArrow: "⟸",
			DoubleLongLeftRightArrow: "⟺",
			DoubleLongRightArrow: "⟹",
			DoubleRightArrow: "⇒",
			DoubleRightTee: "⊨",
			DoubleUpArrow: "⇑",
			DoubleUpDownArrow: "⇕",
			DoubleVerticalBar: "∥",
			DownArrow: "↓",
			DownArrowBar: "⤓",
			DownArrowUpArrow: "⇵",
			DownBreve: "̑",
			DownLeftRightVector: "⥐",
			DownLeftTeeVector: "⥞",
			DownLeftVector: "↽",
			DownLeftVectorBar: "⥖",
			DownRightTeeVector: "⥟",
			DownRightVector: "⇁",
			DownRightVectorBar: "⥗",
			DownTee: "⊤",
			DownTeeArrow: "↧",
			Downarrow: "⇓",
			Dscr: "𝒟",
			Dstrok: "Đ",
			ENG: "Ŋ",
			ETH: "Ð",
			Eacute: "É",
			Ecaron: "Ě",
			Ecirc: "Ê",
			Ecy: "Э",
			Edot: "Ė",
			Efr: "𝔈",
			Egrave: "È",
			Element: "∈",
			Emacr: "Ē",
			EmptySmallSquare: "◻",
			EmptyVerySmallSquare: "▫",
			Eogon: "Ę",
			Eopf: "𝔼",
			Epsilon: "Ε",
			Equal: "⩵",
			EqualTilde: "≂",
			Equilibrium: "⇌",
			Escr: "ℰ",
			Esim: "⩳",
			Eta: "Η",
			Euml: "Ë",
			Exists: "∃",
			ExponentialE: "ⅇ",
			Fcy: "Ф",
			Ffr: "𝔉",
			FilledSmallSquare: "◼",
			FilledVerySmallSquare: "▪",
			Fopf: "𝔽",
			ForAll: "∀",
			Fouriertrf: "ℱ",
			Fscr: "ℱ",
			GJcy: "Ѓ",
			GT: ">",
			Gamma: "Γ",
			Gammad: "Ϝ",
			Gbreve: "Ğ",
			Gcedil: "Ģ",
			Gcirc: "Ĝ",
			Gcy: "Г",
			Gdot: "Ġ",
			Gfr: "𝔊",
			Gg: "⋙",
			Gopf: "𝔾",
			GreaterEqual: "≥",
			GreaterEqualLess: "⋛",
			GreaterFullEqual: "≧",
			GreaterGreater: "⪢",
			GreaterLess: "≷",
			GreaterSlantEqual: "⩾",
			GreaterTilde: "≳",
			Gscr: "𝒢",
			Gt: "≫",
			HARDcy: "Ъ",
			Hacek: "ˇ",
			Hat: "^",
			Hcirc: "Ĥ",
			Hfr: "ℌ",
			HilbertSpace: "ℋ",
			Hopf: "ℍ",
			HorizontalLine: "─",
			Hscr: "ℋ",
			Hstrok: "Ħ",
			HumpDownHump: "≎",
			HumpEqual: "≏",
			IEcy: "Е",
			IJlig: "Ĳ",
			IOcy: "Ё",
			Iacute: "Í",
			Icirc: "Î",
			Icy: "И",
			Idot: "İ",
			Ifr: "ℑ",
			Igrave: "Ì",
			Im: "ℑ",
			Imacr: "Ī",
			ImaginaryI: "ⅈ",
			Implies: "⇒",
			Int: "∬",
			Integral: "∫",
			Intersection: "⋂",
			InvisibleComma: "⁣",
			InvisibleTimes: "⁢",
			Iogon: "Į",
			Iopf: "𝕀",
			Iota: "Ι",
			Iscr: "ℐ",
			Itilde: "Ĩ",
			Iukcy: "І",
			Iuml: "Ï",
			Jcirc: "Ĵ",
			Jcy: "Й",
			Jfr: "𝔍",
			Jopf: "𝕁",
			Jscr: "𝒥",
			Jsercy: "Ј",
			Jukcy: "Є",
			KHcy: "Х",
			KJcy: "Ќ",
			Kappa: "Κ",
			Kcedil: "Ķ",
			Kcy: "К",
			Kfr: "𝔎",
			Kopf: "𝕂",
			Kscr: "𝒦",
			LJcy: "Љ",
			LT: "<",
			Lacute: "Ĺ",
			Lambda: "Λ",
			Lang: "⟪",
			Laplacetrf: "ℒ",
			Larr: "↞",
			Lcaron: "Ľ",
			Lcedil: "Ļ",
			Lcy: "Л",
			LeftAngleBracket: "⟨",
			LeftArrow: "←",
			LeftArrowBar: "⇤",
			LeftArrowRightArrow: "⇆",
			LeftCeiling: "⌈",
			LeftDoubleBracket: "⟦",
			LeftDownTeeVector: "⥡",
			LeftDownVector: "⇃",
			LeftDownVectorBar: "⥙",
			LeftFloor: "⌊",
			LeftRightArrow: "↔",
			LeftRightVector: "⥎",
			LeftTee: "⊣",
			LeftTeeArrow: "↤",
			LeftTeeVector: "⥚",
			LeftTriangle: "⊲",
			LeftTriangleBar: "⧏",
			LeftTriangleEqual: "⊴",
			LeftUpDownVector: "⥑",
			LeftUpTeeVector: "⥠",
			LeftUpVector: "↿",
			LeftUpVectorBar: "⥘",
			LeftVector: "↼",
			LeftVectorBar: "⥒",
			Leftarrow: "⇐",
			Leftrightarrow: "⇔",
			LessEqualGreater: "⋚",
			LessFullEqual: "≦",
			LessGreater: "≶",
			LessLess: "⪡",
			LessSlantEqual: "⩽",
			LessTilde: "≲",
			Lfr: "𝔏",
			Ll: "⋘",
			Lleftarrow: "⇚",
			Lmidot: "Ŀ",
			LongLeftArrow: "⟵",
			LongLeftRightArrow: "⟷",
			LongRightArrow: "⟶",
			Longleftarrow: "⟸",
			Longleftrightarrow: "⟺",
			Longrightarrow: "⟹",
			Lopf: "𝕃",
			LowerLeftArrow: "↙",
			LowerRightArrow: "↘",
			Lscr: "ℒ",
			Lsh: "↰",
			Lstrok: "Ł",
			Lt: "≪",
			Map: "⤅",
			Mcy: "М",
			MediumSpace: " ",
			Mellintrf: "ℳ",
			Mfr: "𝔐",
			MinusPlus: "∓",
			Mopf: "𝕄",
			Mscr: "ℳ",
			Mu: "Μ",
			NJcy: "Њ",
			Nacute: "Ń",
			Ncaron: "Ň",
			Ncedil: "Ņ",
			Ncy: "Н",
			NegativeMediumSpace: "​",
			NegativeThickSpace: "​",
			NegativeThinSpace: "​",
			NegativeVeryThinSpace: "​",
			NestedGreaterGreater: "≫",
			NestedLessLess: "≪",
			NewLine: "\n",
			Nfr: "𝔑",
			NoBreak: "⁠",
			NonBreakingSpace: "\xA0",
			Nopf: "ℕ",
			Not: "⫬",
			NotCongruent: "≢",
			NotCupCap: "≭",
			NotDoubleVerticalBar: "∦",
			NotElement: "∉",
			NotEqual: "≠",
			NotEqualTilde: "≂̸",
			NotExists: "∄",
			NotGreater: "≯",
			NotGreaterEqual: "≱",
			NotGreaterFullEqual: "≧̸",
			NotGreaterGreater: "≫̸",
			NotGreaterLess: "≹",
			NotGreaterSlantEqual: "⩾̸",
			NotGreaterTilde: "≵",
			NotHumpDownHump: "≎̸",
			NotHumpEqual: "≏̸",
			NotLeftTriangle: "⋪",
			NotLeftTriangleBar: "⧏̸",
			NotLeftTriangleEqual: "⋬",
			NotLess: "≮",
			NotLessEqual: "≰",
			NotLessGreater: "≸",
			NotLessLess: "≪̸",
			NotLessSlantEqual: "⩽̸",
			NotLessTilde: "≴",
			NotNestedGreaterGreater: "⪢̸",
			NotNestedLessLess: "⪡̸",
			NotPrecedes: "⊀",
			NotPrecedesEqual: "⪯̸",
			NotPrecedesSlantEqual: "⋠",
			NotReverseElement: "∌",
			NotRightTriangle: "⋫",
			NotRightTriangleBar: "⧐̸",
			NotRightTriangleEqual: "⋭",
			NotSquareSubset: "⊏̸",
			NotSquareSubsetEqual: "⋢",
			NotSquareSuperset: "⊐̸",
			NotSquareSupersetEqual: "⋣",
			NotSubset: "⊂⃒",
			NotSubsetEqual: "⊈",
			NotSucceeds: "⊁",
			NotSucceedsEqual: "⪰̸",
			NotSucceedsSlantEqual: "⋡",
			NotSucceedsTilde: "≿̸",
			NotSuperset: "⊃⃒",
			NotSupersetEqual: "⊉",
			NotTilde: "≁",
			NotTildeEqual: "≄",
			NotTildeFullEqual: "≇",
			NotTildeTilde: "≉",
			NotVerticalBar: "∤",
			Nscr: "𝒩",
			Ntilde: "Ñ",
			Nu: "Ν",
			OElig: "Œ",
			Oacute: "Ó",
			Ocirc: "Ô",
			Ocy: "О",
			Odblac: "Ő",
			Ofr: "𝔒",
			Ograve: "Ò",
			Omacr: "Ō",
			Omega: "Ω",
			Omicron: "Ο",
			Oopf: "𝕆",
			OpenCurlyDoubleQuote: "“",
			OpenCurlyQuote: "‘",
			Or: "⩔",
			Oscr: "𝒪",
			Oslash: "Ø",
			Otilde: "Õ",
			Otimes: "⨷",
			Ouml: "Ö",
			OverBar: "‾",
			OverBrace: "⏞",
			OverBracket: "⎴",
			OverParenthesis: "⏜",
			PartialD: "∂",
			Pcy: "П",
			Pfr: "𝔓",
			Phi: "Φ",
			Pi: "Π",
			PlusMinus: "±",
			Poincareplane: "ℌ",
			Popf: "ℙ",
			Pr: "⪻",
			Precedes: "≺",
			PrecedesEqual: "⪯",
			PrecedesSlantEqual: "≼",
			PrecedesTilde: "≾",
			Prime: "″",
			Product: "∏",
			Proportion: "∷",
			Proportional: "∝",
			Pscr: "𝒫",
			Psi: "Ψ",
			QUOT: "\"",
			Qfr: "𝔔",
			Qopf: "ℚ",
			Qscr: "𝒬",
			RBarr: "⤐",
			REG: "®",
			Racute: "Ŕ",
			Rang: "⟫",
			Rarr: "↠",
			Rarrtl: "⤖",
			Rcaron: "Ř",
			Rcedil: "Ŗ",
			Rcy: "Р",
			Re: "ℜ",
			ReverseElement: "∋",
			ReverseEquilibrium: "⇋",
			ReverseUpEquilibrium: "⥯",
			Rfr: "ℜ",
			Rho: "Ρ",
			RightAngleBracket: "⟩",
			RightArrow: "→",
			RightArrowBar: "⇥",
			RightArrowLeftArrow: "⇄",
			RightCeiling: "⌉",
			RightDoubleBracket: "⟧",
			RightDownTeeVector: "⥝",
			RightDownVector: "⇂",
			RightDownVectorBar: "⥕",
			RightFloor: "⌋",
			RightTee: "⊢",
			RightTeeArrow: "↦",
			RightTeeVector: "⥛",
			RightTriangle: "⊳",
			RightTriangleBar: "⧐",
			RightTriangleEqual: "⊵",
			RightUpDownVector: "⥏",
			RightUpTeeVector: "⥜",
			RightUpVector: "↾",
			RightUpVectorBar: "⥔",
			RightVector: "⇀",
			RightVectorBar: "⥓",
			Rightarrow: "⇒",
			Ropf: "ℝ",
			RoundImplies: "⥰",
			Rrightarrow: "⇛",
			Rscr: "ℛ",
			Rsh: "↱",
			RuleDelayed: "⧴",
			SHCHcy: "Щ",
			SHcy: "Ш",
			SOFTcy: "Ь",
			Sacute: "Ś",
			Sc: "⪼",
			Scaron: "Š",
			Scedil: "Ş",
			Scirc: "Ŝ",
			Scy: "С",
			Sfr: "𝔖",
			ShortDownArrow: "↓",
			ShortLeftArrow: "←",
			ShortRightArrow: "→",
			ShortUpArrow: "↑",
			Sigma: "Σ",
			SmallCircle: "∘",
			Sopf: "𝕊",
			Sqrt: "√",
			Square: "□",
			SquareIntersection: "⊓",
			SquareSubset: "⊏",
			SquareSubsetEqual: "⊑",
			SquareSuperset: "⊐",
			SquareSupersetEqual: "⊒",
			SquareUnion: "⊔",
			Sscr: "𝒮",
			Star: "⋆",
			Sub: "⋐",
			Subset: "⋐",
			SubsetEqual: "⊆",
			Succeeds: "≻",
			SucceedsEqual: "⪰",
			SucceedsSlantEqual: "≽",
			SucceedsTilde: "≿",
			SuchThat: "∋",
			Sum: "∑",
			Sup: "⋑",
			Superset: "⊃",
			SupersetEqual: "⊇",
			Supset: "⋑",
			THORN: "Þ",
			TRADE: "™",
			TSHcy: "Ћ",
			TScy: "Ц",
			Tab: "	",
			Tau: "Τ",
			Tcaron: "Ť",
			Tcedil: "Ţ",
			Tcy: "Т",
			Tfr: "𝔗",
			Therefore: "∴",
			Theta: "Θ",
			ThickSpace: "  ",
			ThinSpace: " ",
			Tilde: "∼",
			TildeEqual: "≃",
			TildeFullEqual: "≅",
			TildeTilde: "≈",
			Topf: "𝕋",
			TripleDot: "⃛",
			Tscr: "𝒯",
			Tstrok: "Ŧ",
			Uacute: "Ú",
			Uarr: "↟",
			Uarrocir: "⥉",
			Ubrcy: "Ў",
			Ubreve: "Ŭ",
			Ucirc: "Û",
			Ucy: "У",
			Udblac: "Ű",
			Ufr: "𝔘",
			Ugrave: "Ù",
			Umacr: "Ū",
			UnderBar: "_",
			UnderBrace: "⏟",
			UnderBracket: "⎵",
			UnderParenthesis: "⏝",
			Union: "⋃",
			UnionPlus: "⊎",
			Uogon: "Ų",
			Uopf: "𝕌",
			UpArrow: "↑",
			UpArrowBar: "⤒",
			UpArrowDownArrow: "⇅",
			UpDownArrow: "↕",
			UpEquilibrium: "⥮",
			UpTee: "⊥",
			UpTeeArrow: "↥",
			Uparrow: "⇑",
			Updownarrow: "⇕",
			UpperLeftArrow: "↖",
			UpperRightArrow: "↗",
			Upsi: "ϒ",
			Upsilon: "Υ",
			Uring: "Ů",
			Uscr: "𝒰",
			Utilde: "Ũ",
			Uuml: "Ü",
			VDash: "⊫",
			Vbar: "⫫",
			Vcy: "В",
			Vdash: "⊩",
			Vdashl: "⫦",
			Vee: "⋁",
			Verbar: "‖",
			Vert: "‖",
			VerticalBar: "∣",
			VerticalLine: "|",
			VerticalSeparator: "❘",
			VerticalTilde: "≀",
			VeryThinSpace: " ",
			Vfr: "𝔙",
			Vopf: "𝕍",
			Vscr: "𝒱",
			Vvdash: "⊪",
			Wcirc: "Ŵ",
			Wedge: "⋀",
			Wfr: "𝔚",
			Wopf: "𝕎",
			Wscr: "𝒲",
			Xfr: "𝔛",
			Xi: "Ξ",
			Xopf: "𝕏",
			Xscr: "𝒳",
			YAcy: "Я",
			YIcy: "Ї",
			YUcy: "Ю",
			Yacute: "Ý",
			Ycirc: "Ŷ",
			Ycy: "Ы",
			Yfr: "𝔜",
			Yopf: "𝕐",
			Yscr: "𝒴",
			Yuml: "Ÿ",
			ZHcy: "Ж",
			Zacute: "Ź",
			Zcaron: "Ž",
			Zcy: "З",
			Zdot: "Ż",
			ZeroWidthSpace: "​",
			Zeta: "Ζ",
			Zfr: "ℨ",
			Zopf: "ℤ",
			Zscr: "𝒵",
			aacute: "á",
			abreve: "ă",
			ac: "∾",
			acE: "∾̳",
			acd: "∿",
			acirc: "â",
			acute: "´",
			acy: "а",
			aelig: "æ",
			af: "⁡",
			afr: "𝔞",
			agrave: "à",
			alefsym: "ℵ",
			aleph: "ℵ",
			alpha: "α",
			amacr: "ā",
			amalg: "⨿",
			amp: "&",
			and: "∧",
			andand: "⩕",
			andd: "⩜",
			andslope: "⩘",
			andv: "⩚",
			ang: "∠",
			ange: "⦤",
			angle: "∠",
			angmsd: "∡",
			angmsdaa: "⦨",
			angmsdab: "⦩",
			angmsdac: "⦪",
			angmsdad: "⦫",
			angmsdae: "⦬",
			angmsdaf: "⦭",
			angmsdag: "⦮",
			angmsdah: "⦯",
			angrt: "∟",
			angrtvb: "⊾",
			angrtvbd: "⦝",
			angsph: "∢",
			angst: "Å",
			angzarr: "⍼",
			aogon: "ą",
			aopf: "𝕒",
			ap: "≈",
			apE: "⩰",
			apacir: "⩯",
			ape: "≊",
			apid: "≋",
			apos: "'",
			approx: "≈",
			approxeq: "≊",
			aring: "å",
			ascr: "𝒶",
			ast: "*",
			asymp: "≈",
			asympeq: "≍",
			atilde: "ã",
			auml: "ä",
			awconint: "∳",
			awint: "⨑",
			bNot: "⫭",
			backcong: "≌",
			backepsilon: "϶",
			backprime: "‵",
			backsim: "∽",
			backsimeq: "⋍",
			barvee: "⊽",
			barwed: "⌅",
			barwedge: "⌅",
			bbrk: "⎵",
			bbrktbrk: "⎶",
			bcong: "≌",
			bcy: "б",
			bdquo: "„",
			becaus: "∵",
			because: "∵",
			bemptyv: "⦰",
			bepsi: "϶",
			bernou: "ℬ",
			beta: "β",
			beth: "ℶ",
			between: "≬",
			bfr: "𝔟",
			bigcap: "⋂",
			bigcirc: "◯",
			bigcup: "⋃",
			bigodot: "⨀",
			bigoplus: "⨁",
			bigotimes: "⨂",
			bigsqcup: "⨆",
			bigstar: "★",
			bigtriangledown: "▽",
			bigtriangleup: "△",
			biguplus: "⨄",
			bigvee: "⋁",
			bigwedge: "⋀",
			bkarow: "⤍",
			blacklozenge: "⧫",
			blacksquare: "▪",
			blacktriangle: "▴",
			blacktriangledown: "▾",
			blacktriangleleft: "◂",
			blacktriangleright: "▸",
			blank: "␣",
			blk12: "▒",
			blk14: "░",
			blk34: "▓",
			block: "█",
			bne: "=⃥",
			bnequiv: "≡⃥",
			bnot: "⌐",
			bopf: "𝕓",
			bot: "⊥",
			bottom: "⊥",
			bowtie: "⋈",
			boxDL: "╗",
			boxDR: "╔",
			boxDl: "╖",
			boxDr: "╓",
			boxH: "═",
			boxHD: "╦",
			boxHU: "╩",
			boxHd: "╤",
			boxHu: "╧",
			boxUL: "╝",
			boxUR: "╚",
			boxUl: "╜",
			boxUr: "╙",
			boxV: "║",
			boxVH: "╬",
			boxVL: "╣",
			boxVR: "╠",
			boxVh: "╫",
			boxVl: "╢",
			boxVr: "╟",
			boxbox: "⧉",
			boxdL: "╕",
			boxdR: "╒",
			boxdl: "┐",
			boxdr: "┌",
			boxh: "─",
			boxhD: "╥",
			boxhU: "╨",
			boxhd: "┬",
			boxhu: "┴",
			boxminus: "⊟",
			boxplus: "⊞",
			boxtimes: "⊠",
			boxuL: "╛",
			boxuR: "╘",
			boxul: "┘",
			boxur: "└",
			boxv: "│",
			boxvH: "╪",
			boxvL: "╡",
			boxvR: "╞",
			boxvh: "┼",
			boxvl: "┤",
			boxvr: "├",
			bprime: "‵",
			breve: "˘",
			brvbar: "¦",
			bscr: "𝒷",
			bsemi: "⁏",
			bsim: "∽",
			bsime: "⋍",
			bsol: "\\",
			bsolb: "⧅",
			bsolhsub: "⟈",
			bull: "•",
			bullet: "•",
			bump: "≎",
			bumpE: "⪮",
			bumpe: "≏",
			bumpeq: "≏",
			cacute: "ć",
			cap: "∩",
			capand: "⩄",
			capbrcup: "⩉",
			capcap: "⩋",
			capcup: "⩇",
			capdot: "⩀",
			caps: "∩︀",
			caret: "⁁",
			caron: "ˇ",
			ccaps: "⩍",
			ccaron: "č",
			ccedil: "ç",
			ccirc: "ĉ",
			ccups: "⩌",
			ccupssm: "⩐",
			cdot: "ċ",
			cedil: "¸",
			cemptyv: "⦲",
			cent: "¢",
			centerdot: "·",
			cfr: "𝔠",
			chcy: "ч",
			check: "✓",
			checkmark: "✓",
			chi: "χ",
			cir: "○",
			cirE: "⧃",
			circ: "ˆ",
			circeq: "≗",
			circlearrowleft: "↺",
			circlearrowright: "↻",
			circledR: "®",
			circledS: "Ⓢ",
			circledast: "⊛",
			circledcirc: "⊚",
			circleddash: "⊝",
			cire: "≗",
			cirfnint: "⨐",
			cirmid: "⫯",
			cirscir: "⧂",
			clubs: "♣",
			clubsuit: "♣",
			colon: ":",
			colone: "≔",
			coloneq: "≔",
			comma: ",",
			commat: "@",
			comp: "∁",
			compfn: "∘",
			complement: "∁",
			complexes: "ℂ",
			cong: "≅",
			congdot: "⩭",
			conint: "∮",
			copf: "𝕔",
			coprod: "∐",
			copy: "©",
			copysr: "℗",
			crarr: "↵",
			cross: "✗",
			cscr: "𝒸",
			csub: "⫏",
			csube: "⫑",
			csup: "⫐",
			csupe: "⫒",
			ctdot: "⋯",
			cudarrl: "⤸",
			cudarrr: "⤵",
			cuepr: "⋞",
			cuesc: "⋟",
			cularr: "↶",
			cularrp: "⤽",
			cup: "∪",
			cupbrcap: "⩈",
			cupcap: "⩆",
			cupcup: "⩊",
			cupdot: "⊍",
			cupor: "⩅",
			cups: "∪︀",
			curarr: "↷",
			curarrm: "⤼",
			curlyeqprec: "⋞",
			curlyeqsucc: "⋟",
			curlyvee: "⋎",
			curlywedge: "⋏",
			curren: "¤",
			curvearrowleft: "↶",
			curvearrowright: "↷",
			cuvee: "⋎",
			cuwed: "⋏",
			cwconint: "∲",
			cwint: "∱",
			cylcty: "⌭",
			dArr: "⇓",
			dHar: "⥥",
			dagger: "†",
			daleth: "ℸ",
			darr: "↓",
			dash: "‐",
			dashv: "⊣",
			dbkarow: "⤏",
			dblac: "˝",
			dcaron: "ď",
			dcy: "д",
			dd: "ⅆ",
			ddagger: "‡",
			ddarr: "⇊",
			ddotseq: "⩷",
			deg: "°",
			delta: "δ",
			demptyv: "⦱",
			dfisht: "⥿",
			dfr: "𝔡",
			dharl: "⇃",
			dharr: "⇂",
			diam: "⋄",
			diamond: "⋄",
			diamondsuit: "♦",
			diams: "♦",
			die: "¨",
			digamma: "ϝ",
			disin: "⋲",
			div: "÷",
			divide: "÷",
			divideontimes: "⋇",
			divonx: "⋇",
			djcy: "ђ",
			dlcorn: "⌞",
			dlcrop: "⌍",
			dollar: "$",
			dopf: "𝕕",
			dot: "˙",
			doteq: "≐",
			doteqdot: "≑",
			dotminus: "∸",
			dotplus: "∔",
			dotsquare: "⊡",
			doublebarwedge: "⌆",
			downarrow: "↓",
			downdownarrows: "⇊",
			downharpoonleft: "⇃",
			downharpoonright: "⇂",
			drbkarow: "⤐",
			drcorn: "⌟",
			drcrop: "⌌",
			dscr: "𝒹",
			dscy: "ѕ",
			dsol: "⧶",
			dstrok: "đ",
			dtdot: "⋱",
			dtri: "▿",
			dtrif: "▾",
			duarr: "⇵",
			duhar: "⥯",
			dwangle: "⦦",
			dzcy: "џ",
			dzigrarr: "⟿",
			eDDot: "⩷",
			eDot: "≑",
			eacute: "é",
			easter: "⩮",
			ecaron: "ě",
			ecir: "≖",
			ecirc: "ê",
			ecolon: "≕",
			ecy: "э",
			edot: "ė",
			ee: "ⅇ",
			efDot: "≒",
			efr: "𝔢",
			eg: "⪚",
			egrave: "è",
			egs: "⪖",
			egsdot: "⪘",
			el: "⪙",
			elinters: "⏧",
			ell: "ℓ",
			els: "⪕",
			elsdot: "⪗",
			emacr: "ē",
			empty: "∅",
			emptyset: "∅",
			emptyv: "∅",
			emsp13: " ",
			emsp14: " ",
			emsp: " ",
			eng: "ŋ",
			ensp: " ",
			eogon: "ę",
			eopf: "𝕖",
			epar: "⋕",
			eparsl: "⧣",
			eplus: "⩱",
			epsi: "ε",
			epsilon: "ε",
			epsiv: "ϵ",
			eqcirc: "≖",
			eqcolon: "≕",
			eqsim: "≂",
			eqslantgtr: "⪖",
			eqslantless: "⪕",
			equals: "=",
			equest: "≟",
			equiv: "≡",
			equivDD: "⩸",
			eqvparsl: "⧥",
			erDot: "≓",
			erarr: "⥱",
			escr: "ℯ",
			esdot: "≐",
			esim: "≂",
			eta: "η",
			eth: "ð",
			euml: "ë",
			euro: "€",
			excl: "!",
			exist: "∃",
			expectation: "ℰ",
			exponentiale: "ⅇ",
			fallingdotseq: "≒",
			fcy: "ф",
			female: "♀",
			ffilig: "ﬃ",
			fflig: "ﬀ",
			ffllig: "ﬄ",
			ffr: "𝔣",
			filig: "ﬁ",
			fjlig: "fj",
			flat: "♭",
			fllig: "ﬂ",
			fltns: "▱",
			fnof: "ƒ",
			fopf: "𝕗",
			forall: "∀",
			fork: "⋔",
			forkv: "⫙",
			fpartint: "⨍",
			frac12: "½",
			frac13: "⅓",
			frac14: "¼",
			frac15: "⅕",
			frac16: "⅙",
			frac18: "⅛",
			frac23: "⅔",
			frac25: "⅖",
			frac34: "¾",
			frac35: "⅗",
			frac38: "⅜",
			frac45: "⅘",
			frac56: "⅚",
			frac58: "⅝",
			frac78: "⅞",
			frasl: "⁄",
			frown: "⌢",
			fscr: "𝒻",
			gE: "≧",
			gEl: "⪌",
			gacute: "ǵ",
			gamma: "γ",
			gammad: "ϝ",
			gap: "⪆",
			gbreve: "ğ",
			gcirc: "ĝ",
			gcy: "г",
			gdot: "ġ",
			ge: "≥",
			gel: "⋛",
			geq: "≥",
			geqq: "≧",
			geqslant: "⩾",
			ges: "⩾",
			gescc: "⪩",
			gesdot: "⪀",
			gesdoto: "⪂",
			gesdotol: "⪄",
			gesl: "⋛︀",
			gesles: "⪔",
			gfr: "𝔤",
			gg: "≫",
			ggg: "⋙",
			gimel: "ℷ",
			gjcy: "ѓ",
			gl: "≷",
			glE: "⪒",
			gla: "⪥",
			glj: "⪤",
			gnE: "≩",
			gnap: "⪊",
			gnapprox: "⪊",
			gne: "⪈",
			gneq: "⪈",
			gneqq: "≩",
			gnsim: "⋧",
			gopf: "𝕘",
			grave: "`",
			gscr: "ℊ",
			gsim: "≳",
			gsime: "⪎",
			gsiml: "⪐",
			gt: ">",
			gtcc: "⪧",
			gtcir: "⩺",
			gtdot: "⋗",
			gtlPar: "⦕",
			gtquest: "⩼",
			gtrapprox: "⪆",
			gtrarr: "⥸",
			gtrdot: "⋗",
			gtreqless: "⋛",
			gtreqqless: "⪌",
			gtrless: "≷",
			gtrsim: "≳",
			gvertneqq: "≩︀",
			gvnE: "≩︀",
			hArr: "⇔",
			hairsp: " ",
			half: "½",
			hamilt: "ℋ",
			hardcy: "ъ",
			harr: "↔",
			harrcir: "⥈",
			harrw: "↭",
			hbar: "ℏ",
			hcirc: "ĥ",
			hearts: "♥",
			heartsuit: "♥",
			hellip: "…",
			hercon: "⊹",
			hfr: "𝔥",
			hksearow: "⤥",
			hkswarow: "⤦",
			hoarr: "⇿",
			homtht: "∻",
			hookleftarrow: "↩",
			hookrightarrow: "↪",
			hopf: "𝕙",
			horbar: "―",
			hscr: "𝒽",
			hslash: "ℏ",
			hstrok: "ħ",
			hybull: "⁃",
			hyphen: "‐",
			iacute: "í",
			ic: "⁣",
			icirc: "î",
			icy: "и",
			iecy: "е",
			iexcl: "¡",
			iff: "⇔",
			ifr: "𝔦",
			igrave: "ì",
			ii: "ⅈ",
			iiiint: "⨌",
			iiint: "∭",
			iinfin: "⧜",
			iiota: "℩",
			ijlig: "ĳ",
			imacr: "ī",
			image: "ℑ",
			imagline: "ℐ",
			imagpart: "ℑ",
			imath: "ı",
			imof: "⊷",
			imped: "Ƶ",
			in: "∈",
			incare: "℅",
			infin: "∞",
			infintie: "⧝",
			inodot: "ı",
			int: "∫",
			intcal: "⊺",
			integers: "ℤ",
			intercal: "⊺",
			intlarhk: "⨗",
			intprod: "⨼",
			iocy: "ё",
			iogon: "į",
			iopf: "𝕚",
			iota: "ι",
			iprod: "⨼",
			iquest: "¿",
			iscr: "𝒾",
			isin: "∈",
			isinE: "⋹",
			isindot: "⋵",
			isins: "⋴",
			isinsv: "⋳",
			isinv: "∈",
			it: "⁢",
			itilde: "ĩ",
			iukcy: "і",
			iuml: "ï",
			jcirc: "ĵ",
			jcy: "й",
			jfr: "𝔧",
			jmath: "ȷ",
			jopf: "𝕛",
			jscr: "𝒿",
			jsercy: "ј",
			jukcy: "є",
			kappa: "κ",
			kappav: "ϰ",
			kcedil: "ķ",
			kcy: "к",
			kfr: "𝔨",
			kgreen: "ĸ",
			khcy: "х",
			kjcy: "ќ",
			kopf: "𝕜",
			kscr: "𝓀",
			lAarr: "⇚",
			lArr: "⇐",
			lAtail: "⤛",
			lBarr: "⤎",
			lE: "≦",
			lEg: "⪋",
			lHar: "⥢",
			lacute: "ĺ",
			laemptyv: "⦴",
			lagran: "ℒ",
			lambda: "λ",
			lang: "⟨",
			langd: "⦑",
			langle: "⟨",
			lap: "⪅",
			laquo: "«",
			larr: "←",
			larrb: "⇤",
			larrbfs: "⤟",
			larrfs: "⤝",
			larrhk: "↩",
			larrlp: "↫",
			larrpl: "⤹",
			larrsim: "⥳",
			larrtl: "↢",
			lat: "⪫",
			latail: "⤙",
			late: "⪭",
			lates: "⪭︀",
			lbarr: "⤌",
			lbbrk: "❲",
			lbrace: "{",
			lbrack: "[",
			lbrke: "⦋",
			lbrksld: "⦏",
			lbrkslu: "⦍",
			lcaron: "ľ",
			lcedil: "ļ",
			lceil: "⌈",
			lcub: "{",
			lcy: "л",
			ldca: "⤶",
			ldquo: "“",
			ldquor: "„",
			ldrdhar: "⥧",
			ldrushar: "⥋",
			ldsh: "↲",
			le: "≤",
			leftarrow: "←",
			leftarrowtail: "↢",
			leftharpoondown: "↽",
			leftharpoonup: "↼",
			leftleftarrows: "⇇",
			leftrightarrow: "↔",
			leftrightarrows: "⇆",
			leftrightharpoons: "⇋",
			leftrightsquigarrow: "↭",
			leftthreetimes: "⋋",
			leg: "⋚",
			leq: "≤",
			leqq: "≦",
			leqslant: "⩽",
			les: "⩽",
			lescc: "⪨",
			lesdot: "⩿",
			lesdoto: "⪁",
			lesdotor: "⪃",
			lesg: "⋚︀",
			lesges: "⪓",
			lessapprox: "⪅",
			lessdot: "⋖",
			lesseqgtr: "⋚",
			lesseqqgtr: "⪋",
			lessgtr: "≶",
			lesssim: "≲",
			lfisht: "⥼",
			lfloor: "⌊",
			lfr: "𝔩",
			lg: "≶",
			lgE: "⪑",
			lhard: "↽",
			lharu: "↼",
			lharul: "⥪",
			lhblk: "▄",
			ljcy: "љ",
			ll: "≪",
			llarr: "⇇",
			llcorner: "⌞",
			llhard: "⥫",
			lltri: "◺",
			lmidot: "ŀ",
			lmoust: "⎰",
			lmoustache: "⎰",
			lnE: "≨",
			lnap: "⪉",
			lnapprox: "⪉",
			lne: "⪇",
			lneq: "⪇",
			lneqq: "≨",
			lnsim: "⋦",
			loang: "⟬",
			loarr: "⇽",
			lobrk: "⟦",
			longleftarrow: "⟵",
			longleftrightarrow: "⟷",
			longmapsto: "⟼",
			longrightarrow: "⟶",
			looparrowleft: "↫",
			looparrowright: "↬",
			lopar: "⦅",
			lopf: "𝕝",
			loplus: "⨭",
			lotimes: "⨴",
			lowast: "∗",
			lowbar: "_",
			loz: "◊",
			lozenge: "◊",
			lozf: "⧫",
			lpar: "(",
			lparlt: "⦓",
			lrarr: "⇆",
			lrcorner: "⌟",
			lrhar: "⇋",
			lrhard: "⥭",
			lrm: "‎",
			lrtri: "⊿",
			lsaquo: "‹",
			lscr: "𝓁",
			lsh: "↰",
			lsim: "≲",
			lsime: "⪍",
			lsimg: "⪏",
			lsqb: "[",
			lsquo: "‘",
			lsquor: "‚",
			lstrok: "ł",
			lt: "<",
			ltcc: "⪦",
			ltcir: "⩹",
			ltdot: "⋖",
			lthree: "⋋",
			ltimes: "⋉",
			ltlarr: "⥶",
			ltquest: "⩻",
			ltrPar: "⦖",
			ltri: "◃",
			ltrie: "⊴",
			ltrif: "◂",
			lurdshar: "⥊",
			luruhar: "⥦",
			lvertneqq: "≨︀",
			lvnE: "≨︀",
			mDDot: "∺",
			macr: "¯",
			male: "♂",
			malt: "✠",
			maltese: "✠",
			map: "↦",
			mapsto: "↦",
			mapstodown: "↧",
			mapstoleft: "↤",
			mapstoup: "↥",
			marker: "▮",
			mcomma: "⨩",
			mcy: "м",
			mdash: "—",
			measuredangle: "∡",
			mfr: "𝔪",
			mho: "℧",
			micro: "µ",
			mid: "∣",
			midast: "*",
			midcir: "⫰",
			middot: "·",
			minus: "−",
			minusb: "⊟",
			minusd: "∸",
			minusdu: "⨪",
			mlcp: "⫛",
			mldr: "…",
			mnplus: "∓",
			models: "⊧",
			mopf: "𝕞",
			mp: "∓",
			mscr: "𝓂",
			mstpos: "∾",
			mu: "μ",
			multimap: "⊸",
			mumap: "⊸",
			nGg: "⋙̸",
			nGt: "≫⃒",
			nGtv: "≫̸",
			nLeftarrow: "⇍",
			nLeftrightarrow: "⇎",
			nLl: "⋘̸",
			nLt: "≪⃒",
			nLtv: "≪̸",
			nRightarrow: "⇏",
			nVDash: "⊯",
			nVdash: "⊮",
			nabla: "∇",
			nacute: "ń",
			nang: "∠⃒",
			nap: "≉",
			napE: "⩰̸",
			napid: "≋̸",
			napos: "ŉ",
			napprox: "≉",
			natur: "♮",
			natural: "♮",
			naturals: "ℕ",
			nbsp: "\xA0",
			nbump: "≎̸",
			nbumpe: "≏̸",
			ncap: "⩃",
			ncaron: "ň",
			ncedil: "ņ",
			ncong: "≇",
			ncongdot: "⩭̸",
			ncup: "⩂",
			ncy: "н",
			ndash: "–",
			ne: "≠",
			neArr: "⇗",
			nearhk: "⤤",
			nearr: "↗",
			nearrow: "↗",
			nedot: "≐̸",
			nequiv: "≢",
			nesear: "⤨",
			nesim: "≂̸",
			nexist: "∄",
			nexists: "∄",
			nfr: "𝔫",
			ngE: "≧̸",
			nge: "≱",
			ngeq: "≱",
			ngeqq: "≧̸",
			ngeqslant: "⩾̸",
			nges: "⩾̸",
			ngsim: "≵",
			ngt: "≯",
			ngtr: "≯",
			nhArr: "⇎",
			nharr: "↮",
			nhpar: "⫲",
			ni: "∋",
			nis: "⋼",
			nisd: "⋺",
			niv: "∋",
			njcy: "њ",
			nlArr: "⇍",
			nlE: "≦̸",
			nlarr: "↚",
			nldr: "‥",
			nle: "≰",
			nleftarrow: "↚",
			nleftrightarrow: "↮",
			nleq: "≰",
			nleqq: "≦̸",
			nleqslant: "⩽̸",
			nles: "⩽̸",
			nless: "≮",
			nlsim: "≴",
			nlt: "≮",
			nltri: "⋪",
			nltrie: "⋬",
			nmid: "∤",
			nopf: "𝕟",
			not: "¬",
			notin: "∉",
			notinE: "⋹̸",
			notindot: "⋵̸",
			notinva: "∉",
			notinvb: "⋷",
			notinvc: "⋶",
			notni: "∌",
			notniva: "∌",
			notnivb: "⋾",
			notnivc: "⋽",
			npar: "∦",
			nparallel: "∦",
			nparsl: "⫽⃥",
			npart: "∂̸",
			npolint: "⨔",
			npr: "⊀",
			nprcue: "⋠",
			npre: "⪯̸",
			nprec: "⊀",
			npreceq: "⪯̸",
			nrArr: "⇏",
			nrarr: "↛",
			nrarrc: "⤳̸",
			nrarrw: "↝̸",
			nrightarrow: "↛",
			nrtri: "⋫",
			nrtrie: "⋭",
			nsc: "⊁",
			nsccue: "⋡",
			nsce: "⪰̸",
			nscr: "𝓃",
			nshortmid: "∤",
			nshortparallel: "∦",
			nsim: "≁",
			nsime: "≄",
			nsimeq: "≄",
			nsmid: "∤",
			nspar: "∦",
			nsqsube: "⋢",
			nsqsupe: "⋣",
			nsub: "⊄",
			nsubE: "⫅̸",
			nsube: "⊈",
			nsubset: "⊂⃒",
			nsubseteq: "⊈",
			nsubseteqq: "⫅̸",
			nsucc: "⊁",
			nsucceq: "⪰̸",
			nsup: "⊅",
			nsupE: "⫆̸",
			nsupe: "⊉",
			nsupset: "⊃⃒",
			nsupseteq: "⊉",
			nsupseteqq: "⫆̸",
			ntgl: "≹",
			ntilde: "ñ",
			ntlg: "≸",
			ntriangleleft: "⋪",
			ntrianglelefteq: "⋬",
			ntriangleright: "⋫",
			ntrianglerighteq: "⋭",
			nu: "ν",
			num: "#",
			numero: "№",
			numsp: " ",
			nvDash: "⊭",
			nvHarr: "⤄",
			nvap: "≍⃒",
			nvdash: "⊬",
			nvge: "≥⃒",
			nvgt: ">⃒",
			nvinfin: "⧞",
			nvlArr: "⤂",
			nvle: "≤⃒",
			nvlt: "<⃒",
			nvltrie: "⊴⃒",
			nvrArr: "⤃",
			nvrtrie: "⊵⃒",
			nvsim: "∼⃒",
			nwArr: "⇖",
			nwarhk: "⤣",
			nwarr: "↖",
			nwarrow: "↖",
			nwnear: "⤧",
			oS: "Ⓢ",
			oacute: "ó",
			oast: "⊛",
			ocir: "⊚",
			ocirc: "ô",
			ocy: "о",
			odash: "⊝",
			odblac: "ő",
			odiv: "⨸",
			odot: "⊙",
			odsold: "⦼",
			oelig: "œ",
			ofcir: "⦿",
			ofr: "𝔬",
			ogon: "˛",
			ograve: "ò",
			ogt: "⧁",
			ohbar: "⦵",
			ohm: "Ω",
			oint: "∮",
			olarr: "↺",
			olcir: "⦾",
			olcross: "⦻",
			oline: "‾",
			olt: "⧀",
			omacr: "ō",
			omega: "ω",
			omicron: "ο",
			omid: "⦶",
			ominus: "⊖",
			oopf: "𝕠",
			opar: "⦷",
			operp: "⦹",
			oplus: "⊕",
			or: "∨",
			orarr: "↻",
			ord: "⩝",
			order: "ℴ",
			orderof: "ℴ",
			ordf: "ª",
			ordm: "º",
			origof: "⊶",
			oror: "⩖",
			orslope: "⩗",
			orv: "⩛",
			oscr: "ℴ",
			oslash: "ø",
			osol: "⊘",
			otilde: "õ",
			otimes: "⊗",
			otimesas: "⨶",
			ouml: "ö",
			ovbar: "⌽",
			par: "∥",
			para: "¶",
			parallel: "∥",
			parsim: "⫳",
			parsl: "⫽",
			part: "∂",
			pcy: "п",
			percnt: "%",
			period: ".",
			permil: "‰",
			perp: "⊥",
			pertenk: "‱",
			pfr: "𝔭",
			phi: "φ",
			phiv: "ϕ",
			phmmat: "ℳ",
			phone: "☎",
			pi: "π",
			pitchfork: "⋔",
			piv: "ϖ",
			planck: "ℏ",
			planckh: "ℎ",
			plankv: "ℏ",
			plus: "+",
			plusacir: "⨣",
			plusb: "⊞",
			pluscir: "⨢",
			plusdo: "∔",
			plusdu: "⨥",
			pluse: "⩲",
			plusmn: "±",
			plussim: "⨦",
			plustwo: "⨧",
			pm: "±",
			pointint: "⨕",
			popf: "𝕡",
			pound: "£",
			pr: "≺",
			prE: "⪳",
			prap: "⪷",
			prcue: "≼",
			pre: "⪯",
			prec: "≺",
			precapprox: "⪷",
			preccurlyeq: "≼",
			preceq: "⪯",
			precnapprox: "⪹",
			precneqq: "⪵",
			precnsim: "⋨",
			precsim: "≾",
			prime: "′",
			primes: "ℙ",
			prnE: "⪵",
			prnap: "⪹",
			prnsim: "⋨",
			prod: "∏",
			profalar: "⌮",
			profline: "⌒",
			profsurf: "⌓",
			prop: "∝",
			propto: "∝",
			prsim: "≾",
			prurel: "⊰",
			pscr: "𝓅",
			psi: "ψ",
			puncsp: " ",
			qfr: "𝔮",
			qint: "⨌",
			qopf: "𝕢",
			qprime: "⁗",
			qscr: "𝓆",
			quaternions: "ℍ",
			quatint: "⨖",
			quest: "?",
			questeq: "≟",
			quot: "\"",
			rAarr: "⇛",
			rArr: "⇒",
			rAtail: "⤜",
			rBarr: "⤏",
			rHar: "⥤",
			race: "∽̱",
			racute: "ŕ",
			radic: "√",
			raemptyv: "⦳",
			rang: "⟩",
			rangd: "⦒",
			range: "⦥",
			rangle: "⟩",
			raquo: "»",
			rarr: "→",
			rarrap: "⥵",
			rarrb: "⇥",
			rarrbfs: "⤠",
			rarrc: "⤳",
			rarrfs: "⤞",
			rarrhk: "↪",
			rarrlp: "↬",
			rarrpl: "⥅",
			rarrsim: "⥴",
			rarrtl: "↣",
			rarrw: "↝",
			ratail: "⤚",
			ratio: "∶",
			rationals: "ℚ",
			rbarr: "⤍",
			rbbrk: "❳",
			rbrace: "}",
			rbrack: "]",
			rbrke: "⦌",
			rbrksld: "⦎",
			rbrkslu: "⦐",
			rcaron: "ř",
			rcedil: "ŗ",
			rceil: "⌉",
			rcub: "}",
			rcy: "р",
			rdca: "⤷",
			rdldhar: "⥩",
			rdquo: "”",
			rdquor: "”",
			rdsh: "↳",
			real: "ℜ",
			realine: "ℛ",
			realpart: "ℜ",
			reals: "ℝ",
			rect: "▭",
			reg: "®",
			rfisht: "⥽",
			rfloor: "⌋",
			rfr: "𝔯",
			rhard: "⇁",
			rharu: "⇀",
			rharul: "⥬",
			rho: "ρ",
			rhov: "ϱ",
			rightarrow: "→",
			rightarrowtail: "↣",
			rightharpoondown: "⇁",
			rightharpoonup: "⇀",
			rightleftarrows: "⇄",
			rightleftharpoons: "⇌",
			rightrightarrows: "⇉",
			rightsquigarrow: "↝",
			rightthreetimes: "⋌",
			ring: "˚",
			risingdotseq: "≓",
			rlarr: "⇄",
			rlhar: "⇌",
			rlm: "‏",
			rmoust: "⎱",
			rmoustache: "⎱",
			rnmid: "⫮",
			roang: "⟭",
			roarr: "⇾",
			robrk: "⟧",
			ropar: "⦆",
			ropf: "𝕣",
			roplus: "⨮",
			rotimes: "⨵",
			rpar: ")",
			rpargt: "⦔",
			rppolint: "⨒",
			rrarr: "⇉",
			rsaquo: "›",
			rscr: "𝓇",
			rsh: "↱",
			rsqb: "]",
			rsquo: "’",
			rsquor: "’",
			rthree: "⋌",
			rtimes: "⋊",
			rtri: "▹",
			rtrie: "⊵",
			rtrif: "▸",
			rtriltri: "⧎",
			ruluhar: "⥨",
			rx: "℞",
			sacute: "ś",
			sbquo: "‚",
			sc: "≻",
			scE: "⪴",
			scap: "⪸",
			scaron: "š",
			sccue: "≽",
			sce: "⪰",
			scedil: "ş",
			scirc: "ŝ",
			scnE: "⪶",
			scnap: "⪺",
			scnsim: "⋩",
			scpolint: "⨓",
			scsim: "≿",
			scy: "с",
			sdot: "⋅",
			sdotb: "⊡",
			sdote: "⩦",
			seArr: "⇘",
			searhk: "⤥",
			searr: "↘",
			searrow: "↘",
			sect: "§",
			semi: ";",
			seswar: "⤩",
			setminus: "∖",
			setmn: "∖",
			sext: "✶",
			sfr: "𝔰",
			sfrown: "⌢",
			sharp: "♯",
			shchcy: "щ",
			shcy: "ш",
			shortmid: "∣",
			shortparallel: "∥",
			shy: "­",
			sigma: "σ",
			sigmaf: "ς",
			sigmav: "ς",
			sim: "∼",
			simdot: "⩪",
			sime: "≃",
			simeq: "≃",
			simg: "⪞",
			simgE: "⪠",
			siml: "⪝",
			simlE: "⪟",
			simne: "≆",
			simplus: "⨤",
			simrarr: "⥲",
			slarr: "←",
			smallsetminus: "∖",
			smashp: "⨳",
			smeparsl: "⧤",
			smid: "∣",
			smile: "⌣",
			smt: "⪪",
			smte: "⪬",
			smtes: "⪬︀",
			softcy: "ь",
			sol: "/",
			solb: "⧄",
			solbar: "⌿",
			sopf: "𝕤",
			spades: "♠",
			spadesuit: "♠",
			spar: "∥",
			sqcap: "⊓",
			sqcaps: "⊓︀",
			sqcup: "⊔",
			sqcups: "⊔︀",
			sqsub: "⊏",
			sqsube: "⊑",
			sqsubset: "⊏",
			sqsubseteq: "⊑",
			sqsup: "⊐",
			sqsupe: "⊒",
			sqsupset: "⊐",
			sqsupseteq: "⊒",
			squ: "□",
			square: "□",
			squarf: "▪",
			squf: "▪",
			srarr: "→",
			sscr: "𝓈",
			ssetmn: "∖",
			ssmile: "⌣",
			sstarf: "⋆",
			star: "☆",
			starf: "★",
			straightepsilon: "ϵ",
			straightphi: "ϕ",
			strns: "¯",
			sub: "⊂",
			subE: "⫅",
			subdot: "⪽",
			sube: "⊆",
			subedot: "⫃",
			submult: "⫁",
			subnE: "⫋",
			subne: "⊊",
			subplus: "⪿",
			subrarr: "⥹",
			subset: "⊂",
			subseteq: "⊆",
			subseteqq: "⫅",
			subsetneq: "⊊",
			subsetneqq: "⫋",
			subsim: "⫇",
			subsub: "⫕",
			subsup: "⫓",
			succ: "≻",
			succapprox: "⪸",
			succcurlyeq: "≽",
			succeq: "⪰",
			succnapprox: "⪺",
			succneqq: "⪶",
			succnsim: "⋩",
			succsim: "≿",
			sum: "∑",
			sung: "♪",
			sup1: "¹",
			sup2: "²",
			sup3: "³",
			sup: "⊃",
			supE: "⫆",
			supdot: "⪾",
			supdsub: "⫘",
			supe: "⊇",
			supedot: "⫄",
			suphsol: "⟉",
			suphsub: "⫗",
			suplarr: "⥻",
			supmult: "⫂",
			supnE: "⫌",
			supne: "⊋",
			supplus: "⫀",
			supset: "⊃",
			supseteq: "⊇",
			supseteqq: "⫆",
			supsetneq: "⊋",
			supsetneqq: "⫌",
			supsim: "⫈",
			supsub: "⫔",
			supsup: "⫖",
			swArr: "⇙",
			swarhk: "⤦",
			swarr: "↙",
			swarrow: "↙",
			swnwar: "⤪",
			szlig: "ß",
			target: "⌖",
			tau: "τ",
			tbrk: "⎴",
			tcaron: "ť",
			tcedil: "ţ",
			tcy: "т",
			tdot: "⃛",
			telrec: "⌕",
			tfr: "𝔱",
			there4: "∴",
			therefore: "∴",
			theta: "θ",
			thetasym: "ϑ",
			thetav: "ϑ",
			thickapprox: "≈",
			thicksim: "∼",
			thinsp: " ",
			thkap: "≈",
			thksim: "∼",
			thorn: "þ",
			tilde: "˜",
			times: "×",
			timesb: "⊠",
			timesbar: "⨱",
			timesd: "⨰",
			tint: "∭",
			toea: "⤨",
			top: "⊤",
			topbot: "⌶",
			topcir: "⫱",
			topf: "𝕥",
			topfork: "⫚",
			tosa: "⤩",
			tprime: "‴",
			trade: "™",
			triangle: "▵",
			triangledown: "▿",
			triangleleft: "◃",
			trianglelefteq: "⊴",
			triangleq: "≜",
			triangleright: "▹",
			trianglerighteq: "⊵",
			tridot: "◬",
			trie: "≜",
			triminus: "⨺",
			triplus: "⨹",
			trisb: "⧍",
			tritime: "⨻",
			trpezium: "⏢",
			tscr: "𝓉",
			tscy: "ц",
			tshcy: "ћ",
			tstrok: "ŧ",
			twixt: "≬",
			twoheadleftarrow: "↞",
			twoheadrightarrow: "↠",
			uArr: "⇑",
			uHar: "⥣",
			uacute: "ú",
			uarr: "↑",
			ubrcy: "ў",
			ubreve: "ŭ",
			ucirc: "û",
			ucy: "у",
			udarr: "⇅",
			udblac: "ű",
			udhar: "⥮",
			ufisht: "⥾",
			ufr: "𝔲",
			ugrave: "ù",
			uharl: "↿",
			uharr: "↾",
			uhblk: "▀",
			ulcorn: "⌜",
			ulcorner: "⌜",
			ulcrop: "⌏",
			ultri: "◸",
			umacr: "ū",
			uml: "¨",
			uogon: "ų",
			uopf: "𝕦",
			uparrow: "↑",
			updownarrow: "↕",
			upharpoonleft: "↿",
			upharpoonright: "↾",
			uplus: "⊎",
			upsi: "υ",
			upsih: "ϒ",
			upsilon: "υ",
			upuparrows: "⇈",
			urcorn: "⌝",
			urcorner: "⌝",
			urcrop: "⌎",
			uring: "ů",
			urtri: "◹",
			uscr: "𝓊",
			utdot: "⋰",
			utilde: "ũ",
			utri: "▵",
			utrif: "▴",
			uuarr: "⇈",
			uuml: "ü",
			uwangle: "⦧",
			vArr: "⇕",
			vBar: "⫨",
			vBarv: "⫩",
			vDash: "⊨",
			vangrt: "⦜",
			varepsilon: "ϵ",
			varkappa: "ϰ",
			varnothing: "∅",
			varphi: "ϕ",
			varpi: "ϖ",
			varpropto: "∝",
			varr: "↕",
			varrho: "ϱ",
			varsigma: "ς",
			varsubsetneq: "⊊︀",
			varsubsetneqq: "⫋︀",
			varsupsetneq: "⊋︀",
			varsupsetneqq: "⫌︀",
			vartheta: "ϑ",
			vartriangleleft: "⊲",
			vartriangleright: "⊳",
			vcy: "в",
			vdash: "⊢",
			vee: "∨",
			veebar: "⊻",
			veeeq: "≚",
			vellip: "⋮",
			verbar: "|",
			vert: "|",
			vfr: "𝔳",
			vltri: "⊲",
			vnsub: "⊂⃒",
			vnsup: "⊃⃒",
			vopf: "𝕧",
			vprop: "∝",
			vrtri: "⊳",
			vscr: "𝓋",
			vsubnE: "⫋︀",
			vsubne: "⊊︀",
			vsupnE: "⫌︀",
			vsupne: "⊋︀",
			vzigzag: "⦚",
			wcirc: "ŵ",
			wedbar: "⩟",
			wedge: "∧",
			wedgeq: "≙",
			weierp: "℘",
			wfr: "𝔴",
			wopf: "𝕨",
			wp: "℘",
			wr: "≀",
			wreath: "≀",
			wscr: "𝓌",
			xcap: "⋂",
			xcirc: "◯",
			xcup: "⋃",
			xdtri: "▽",
			xfr: "𝔵",
			xhArr: "⟺",
			xharr: "⟷",
			xi: "ξ",
			xlArr: "⟸",
			xlarr: "⟵",
			xmap: "⟼",
			xnis: "⋻",
			xodot: "⨀",
			xopf: "𝕩",
			xoplus: "⨁",
			xotime: "⨂",
			xrArr: "⟹",
			xrarr: "⟶",
			xscr: "𝓍",
			xsqcup: "⨆",
			xuplus: "⨄",
			xutri: "△",
			xvee: "⋁",
			xwedge: "⋀",
			yacute: "ý",
			yacy: "я",
			ycirc: "ŷ",
			ycy: "ы",
			yen: "¥",
			yfr: "𝔶",
			yicy: "ї",
			yopf: "𝕪",
			yscr: "𝓎",
			yucy: "ю",
			yuml: "ÿ",
			zacute: "ź",
			zcaron: "ž",
			zcy: "з",
			zdot: "ż",
			zeetrf: "ℨ",
			zeta: "ζ",
			zfr: "𝔷",
			zhcy: "ж",
			zigrarr: "⇝",
			zopf: "𝕫",
			zscr: "𝓏",
			zwj: "‍",
			zwnj: "‌"
		};
		//#endregion
		//#region ../../node_modules/.pnpm/decode-named-character-reference@1.3.0/node_modules/decode-named-character-reference/index.js
		const own$1 = {}.hasOwnProperty;
		/**
		* Decode a single character reference (without the `&` or `;`).
		* You probably only need this when you’re building parsers yourself that follow
		* different rules compared to HTML.
		* This is optimized to be tiny in browsers.
		*
		* @param {string} value
		*   `notin` (named), `#123` (deci), `#x123` (hexa).
		* @returns {string|false}
		*   Decoded reference.
		*/
		function decodeNamedCharacterReference(value) {
			return own$1.call(characterEntities, value) ? characterEntities[value] : false;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-util-chunked@2.0.1/node_modules/micromark-util-chunked/index.js
		/**
		* Like `Array#splice`, but smarter for giant arrays.
		*
		* `Array#splice` takes all items to be inserted as individual argument which
		* causes a stack overflow in V8 when trying to insert 100k items for instance.
		*
		* Otherwise, this does not return the removed items, and takes `items` as an
		* array instead of rest parameters.
		*
		* @template {unknown} T
		*   Item type.
		* @param {Array<T>} list
		*   List to operate on.
		* @param {number} start
		*   Index to remove/insert at (can be negative).
		* @param {number} remove
		*   Number of items to remove.
		* @param {Array<T>} items
		*   Items to inject into `list`.
		* @returns {undefined}
		*   Nothing.
		*/
		function splice(list, start, remove, items) {
			const end = list.length;
			let chunkStart = 0;
			/** @type {Array<unknown>} */
			let parameters;
			if (start < 0) start = -start > end ? 0 : end + start;
			else start = start > end ? end : start;
			remove = remove > 0 ? remove : 0;
			if (items.length < 1e4) {
				parameters = Array.from(items);
				parameters.unshift(start, remove);
				list.splice(...parameters);
			} else {
				if (remove) list.splice(start, remove);
				while (chunkStart < items.length) {
					parameters = items.slice(chunkStart, chunkStart + 1e4);
					parameters.unshift(start, 0);
					list.splice(...parameters);
					chunkStart += 1e4;
					start += 1e4;
				}
			}
		}
		/**
		* Append `items` (an array) at the end of `list` (another array).
		* When `list` was empty, returns `items` instead.
		*
		* This prevents a potentially expensive operation when `list` is empty,
		* and adds items in batches to prevent V8 from hanging.
		*
		* @template {unknown} T
		*   Item type.
		* @param {Array<T>} list
		*   List to operate on.
		* @param {Array<T>} items
		*   Items to add to `list`.
		* @returns {Array<T>}
		*   Either `list` or `items`.
		*/
		function push(list, items) {
			if (list.length > 0) {
				splice(list, list.length, 0, items);
				return list;
			}
			return items;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-util-combine-extensions@2.0.1/node_modules/micromark-util-combine-extensions/index.js
		/**
		* @import {
		*   Extension,
		*   Handles,
		*   HtmlExtension,
		*   NormalizedExtension
		* } from 'micromark-util-types'
		*/
		const hasOwnProperty = {}.hasOwnProperty;
		/**
		* Combine multiple syntax extensions into one.
		*
		* @param {ReadonlyArray<Extension>} extensions
		*   List of syntax extensions.
		* @returns {NormalizedExtension}
		*   A single combined extension.
		*/
		function combineExtensions(extensions) {
			/** @type {NormalizedExtension} */
			const all = {};
			let index = -1;
			while (++index < extensions.length) syntaxExtension(all, extensions[index]);
			return all;
		}
		/**
		* Merge `extension` into `all`.
		*
		* @param {NormalizedExtension} all
		*   Extension to merge into.
		* @param {Extension} extension
		*   Extension to merge.
		* @returns {undefined}
		*   Nothing.
		*/
		function syntaxExtension(all, extension) {
			/** @type {keyof Extension} */
			let hook;
			for (hook in extension) {
				/** @type {Record<string, unknown>} */
				const left = (hasOwnProperty.call(all, hook) ? all[hook] : void 0) || (all[hook] = {});
				/** @type {Record<string, unknown> | undefined} */
				const right = extension[hook];
				/** @type {string} */
				let code;
				if (right) for (code in right) {
					if (!hasOwnProperty.call(left, code)) left[code] = [];
					const value = right[code];
					constructs(left[code], Array.isArray(value) ? value : value ? [value] : []);
				}
			}
		}
		/**
		* Merge `list` into `existing` (both lists of constructs).
		* Mutates `existing`.
		*
		* @param {Array<unknown>} existing
		*   List of constructs to merge into.
		* @param {Array<unknown>} list
		*   List of constructs to merge.
		* @returns {undefined}
		*   Nothing.
		*/
		function constructs(existing, list) {
			let index = -1;
			/** @type {Array<unknown>} */
			const before = [];
			while (++index < list.length) (list[index].add === "after" ? existing : before).push(list[index]);
			splice(existing, 0, 0, before);
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-util-decode-numeric-character-reference@2.0.2/node_modules/micromark-util-decode-numeric-character-reference/index.js
		/**
		* Turn the number (in string form as either hexa- or plain decimal) coming from
		* a numeric character reference into a character.
		*
		* Sort of like `String.fromCodePoint(Number.parseInt(value, base))`, but makes
		* non-characters and control characters safe.
		*
		* @param {string} value
		*   Value to decode.
		* @param {number} base
		*   Numeric base.
		* @returns {string}
		*   Character.
		*/
		function decodeNumericCharacterReference(value, base) {
			const code = Number.parseInt(value, base);
			if (code < 9 || code === 11 || code > 13 && code < 32 || code > 126 && code < 160 || code > 55295 && code < 57344 || code > 64975 && code < 65008 || (code & 65535) === 65535 || (code & 65535) === 65534 || code > 1114111) return "�";
			return String.fromCodePoint(code);
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-util-normalize-identifier@2.0.1/node_modules/micromark-util-normalize-identifier/index.js
		/**
		* Normalize an identifier (as found in references, definitions).
		*
		* Collapses markdown whitespace, trim, and then lower- and uppercase.
		*
		* Some characters are considered “uppercase”, such as U+03F4 (`ϴ`), but if their
		* lowercase counterpart (U+03B8 (`θ`)) is uppercased will result in a different
		* uppercase character (U+0398 (`Θ`)).
		* So, to get a canonical form, we perform both lower- and uppercase.
		*
		* Using uppercase last makes sure keys will never interact with default
		* prototypal values (such as `constructor`): nothing in the prototype of
		* `Object` is uppercase.
		*
		* @param {string} value
		*   Identifier to normalize.
		* @returns {string}
		*   Normalized identifier.
		*/
		function normalizeIdentifier(value) {
			return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-util-character@2.1.1/node_modules/micromark-util-character/index.js
		/**
		* @import {Code} from 'micromark-util-types'
		*/
		/**
		* Check whether the character code represents an ASCII alpha (`a` through `z`,
		* case insensitive).
		*
		* An **ASCII alpha** is an ASCII upper alpha or ASCII lower alpha.
		*
		* An **ASCII upper alpha** is a character in the inclusive range U+0041 (`A`)
		* to U+005A (`Z`).
		*
		* An **ASCII lower alpha** is a character in the inclusive range U+0061 (`a`)
		* to U+007A (`z`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAlpha = regexCheck(/[A-Za-z]/);
		/**
		* Check whether the character code represents an ASCII alphanumeric (`a`
		* through `z`, case insensitive, or `0` through `9`).
		*
		* An **ASCII alphanumeric** is an ASCII digit (see `asciiDigit`) or ASCII alpha
		* (see `asciiAlpha`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
		/**
		* Check whether the character code represents an ASCII atext.
		*
		* atext is an ASCII alphanumeric (see `asciiAlphanumeric`), or a character in
		* the inclusive ranges U+0023 NUMBER SIGN (`#`) to U+0027 APOSTROPHE (`'`),
		* U+002A ASTERISK (`*`), U+002B PLUS SIGN (`+`), U+002D DASH (`-`), U+002F
		* SLASH (`/`), U+003D EQUALS TO (`=`), U+003F QUESTION MARK (`?`), U+005E
		* CARET (`^`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE
		* (`{`) to U+007E TILDE (`~`).
		*
		* See:
		* **\[RFC5322]**:
		* [Internet Message Format](https://tools.ietf.org/html/rfc5322).
		* P. Resnick.
		* IETF.
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/);
		/**
		* Check whether a character code is an ASCII control character.
		*
		* An **ASCII control** is a character in the inclusive range U+0000 NULL (NUL)
		* to U+001F (US), or U+007F (DEL).
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function asciiControl(code) {
			return code !== null && (code < 32 || code === 127);
		}
		/**
		* Check whether the character code represents an ASCII digit (`0` through `9`).
		*
		* An **ASCII digit** is a character in the inclusive range U+0030 (`0`) to
		* U+0039 (`9`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiDigit = regexCheck(/\d/);
		/**
		* Check whether the character code represents an ASCII hex digit (`a` through
		* `f`, case insensitive, or `0` through `9`).
		*
		* An **ASCII hex digit** is an ASCII digit (see `asciiDigit`), ASCII upper hex
		* digit, or an ASCII lower hex digit.
		*
		* An **ASCII upper hex digit** is a character in the inclusive range U+0041
		* (`A`) to U+0046 (`F`).
		*
		* An **ASCII lower hex digit** is a character in the inclusive range U+0061
		* (`a`) to U+0066 (`f`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiHexDigit = regexCheck(/[\dA-Fa-f]/);
		/**
		* Check whether the character code represents ASCII punctuation.
		*
		* An **ASCII punctuation** is a character in the inclusive ranges U+0021
		* EXCLAMATION MARK (`!`) to U+002F SLASH (`/`), U+003A COLON (`:`) to U+0040 AT
		* SIGN (`@`), U+005B LEFT SQUARE BRACKET (`[`) to U+0060 GRAVE ACCENT
		* (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/);
		/**
		* Check whether a character code is a markdown line ending.
		*
		* A **markdown line ending** is the virtual characters M-0003 CARRIAGE RETURN
		* LINE FEED (CRLF), M-0004 LINE FEED (LF) and M-0005 CARRIAGE RETURN (CR).
		*
		* In micromark, the actual character U+000A LINE FEED (LF) and U+000D CARRIAGE
		* RETURN (CR) are replaced by these virtual characters depending on whether
		* they occurred together.
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownLineEnding(code) {
			return code !== null && code < -2;
		}
		/**
		* Check whether a character code is a markdown line ending (see
		* `markdownLineEnding`) or markdown space (see `markdownSpace`).
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownLineEndingOrSpace(code) {
			return code !== null && (code < 0 || code === 32);
		}
		/**
		* Check whether a character code is a markdown space.
		*
		* A **markdown space** is the concrete character U+0020 SPACE (SP) and the
		* virtual characters M-0001 VIRTUAL SPACE (VS) and M-0002 HORIZONTAL TAB (HT).
		*
		* In micromark, the actual character U+0009 CHARACTER TABULATION (HT) is
		* replaced by one M-0002 HORIZONTAL TAB (HT) and between 0 and 3 M-0001 VIRTUAL
		* SPACE (VS) characters, depending on the column at which the tab occurred.
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownSpace(code) {
			return code === -2 || code === -1 || code === 32;
		}
		/**
		* Check whether the character code represents Unicode punctuation.
		*
		* A **Unicode punctuation** is a character in the Unicode `Pc` (Punctuation,
		* Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
		* (Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
		* (Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an ASCII
		* punctuation (see `asciiPunctuation`).
		*
		* See:
		* **\[UNICODE]**:
		* [The Unicode Standard](https://www.unicode.org/versions/).
		* Unicode Consortium.
		*
		* @param code
		*   Code.
		* @returns
		*   Whether it matches.
		*/
		const unicodePunctuation = regexCheck(/\p{P}|\p{S}/u);
		/**
		* Check whether the character code represents Unicode whitespace.
		*
		* Note that this does handle micromark specific markdown whitespace characters.
		* See `markdownLineEndingOrSpace` to check that.
		*
		* A **Unicode whitespace** is a character in the Unicode `Zs` (Separator,
		* Space) category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF),
		* U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).
		*
		* See:
		* **\[UNICODE]**:
		* [The Unicode Standard](https://www.unicode.org/versions/).
		* Unicode Consortium.
		*
		* @param code
		*   Code.
		* @returns
		*   Whether it matches.
		*/
		const unicodeWhitespace = regexCheck(/\s/);
		/**
		* Create a code check from a regex.
		*
		* @param {RegExp} regex
		*   Expression.
		* @returns {(code: Code) => boolean}
		*   Check.
		*/
		function regexCheck(regex) {
			return check;
			/**
			* Check whether a code matches the bound regex.
			*
			* @param {Code} code
			*   Character code.
			* @returns {boolean}
			*   Whether the character code matches the bound regex.
			*/
			function check(code) {
				return code !== null && code > -1 && regex.test(String.fromCharCode(code));
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-factory-space@2.0.1/node_modules/micromark-factory-space/index.js
		/**
		* @import {Effects, State, TokenType} from 'micromark-util-types'
		*/
		/**
		* Parse spaces and tabs.
		*
		* There is no `nok` parameter:
		*
		* *   spaces in markdown are often optional, in which case this factory can be
		*     used and `ok` will be switched to whether spaces were found or not
		* *   one line ending or space can be detected with `markdownSpace(code)` right
		*     before using `factorySpace`
		*
		* ###### Examples
		*
		* Where `␉` represents a tab (plus how much it expands) and `␠` represents a
		* single space.
		*
		* ```markdown
		* ␉
		* ␠␠␠␠
		* ␉␠
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {TokenType} type
		*   Type (`' \t'`).
		* @param {number | undefined} [max=Infinity]
		*   Max (exclusive).
		* @returns {State}
		*   Start state.
		*/
		function factorySpace(effects, ok, type, max) {
			const limit = max ? max - 1 : Number.POSITIVE_INFINITY;
			let size = 0;
			return start;
			/** @type {State} */
			function start(code) {
				if (markdownSpace(code)) {
					effects.enter(type);
					return prefix(code);
				}
				return ok(code);
			}
			/** @type {State} */
			function prefix(code) {
				if (markdownSpace(code) && size++ < limit) {
					effects.consume(code);
					return prefix;
				}
				effects.exit(type);
				return ok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark@4.0.2/node_modules/micromark/lib/initialize/content.js
		/**
		* @import {
		*   InitialConstruct,
		*   Initializer,
		*   State,
		*   TokenizeContext,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {InitialConstruct} */
		const content$1 = { tokenize: initializeContent };
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Initializer}
		*   Content.
		*/
		function initializeContent(effects) {
			const contentStart = effects.attempt(this.parser.constructs.contentInitial, afterContentStartConstruct, paragraphInitial);
			/** @type {Token} */
			let previous;
			return contentStart;
			/** @type {State} */
			function afterContentStartConstruct(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, contentStart, "linePrefix");
			}
			/** @type {State} */
			function paragraphInitial(code) {
				effects.enter("paragraph");
				return lineStart(code);
			}
			/** @type {State} */
			function lineStart(code) {
				const token = effects.enter("chunkText", {
					contentType: "text",
					previous
				});
				if (previous) previous.next = token;
				previous = token;
				return data(code);
			}
			/** @type {State} */
			function data(code) {
				if (code === null) {
					effects.exit("chunkText");
					effects.exit("paragraph");
					effects.consume(code);
					return;
				}
				if (markdownLineEnding(code)) {
					effects.consume(code);
					effects.exit("chunkText");
					return lineStart;
				}
				effects.consume(code);
				return data;
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark@4.0.2/node_modules/micromark/lib/initialize/document.js
		/**
		* @import {
		*   Construct,
		*   ContainerState,
		*   InitialConstruct,
		*   Initializer,
		*   Point,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* @typedef {[Construct, ContainerState]} StackItem
		*   Construct and its state.
		*/
		/** @type {InitialConstruct} */
		const document$2 = { tokenize: initializeDocument };
		/** @type {Construct} */
		const containerConstruct = { tokenize: tokenizeContainer };
		/**
		* @this {TokenizeContext}
		*   Self.
		* @type {Initializer}
		*   Initializer.
		*/
		function initializeDocument(effects) {
			const self = this;
			/** @type {Array<StackItem>} */
			const stack = [];
			let continued = 0;
			/** @type {TokenizeContext | undefined} */
			let childFlow;
			/** @type {Token | undefined} */
			let childToken;
			/** @type {number} */
			let lineStartOffset;
			return start;
			/** @type {State} */
			function start(code) {
				if (continued < stack.length) {
					const item = stack[continued];
					self.containerState = item[1];
					return effects.attempt(item[0].continuation, documentContinue, checkNewContainers)(code);
				}
				return checkNewContainers(code);
			}
			/** @type {State} */
			function documentContinue(code) {
				continued++;
				if (self.containerState._closeFlow) {
					self.containerState._closeFlow = void 0;
					if (childFlow) closeFlow();
					const indexBeforeExits = self.events.length;
					let indexBeforeFlow = indexBeforeExits;
					/** @type {Point | undefined} */
					let point;
					while (indexBeforeFlow--) if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
						point = self.events[indexBeforeFlow][1].end;
						break;
					}
					exitContainers(continued);
					let index = indexBeforeExits;
					while (index < self.events.length) {
						self.events[index][1].end = { ...point };
						index++;
					}
					splice(self.events, indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
					self.events.length = index;
					return checkNewContainers(code);
				}
				return start(code);
			}
			/** @type {State} */
			function checkNewContainers(code) {
				if (continued === stack.length) {
					if (!childFlow) return documentContinued(code);
					if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) return flowStart(code);
					self.interrupt = Boolean(childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack);
				}
				self.containerState = {};
				return effects.check(containerConstruct, thereIsANewContainer, thereIsNoNewContainer)(code);
			}
			/** @type {State} */
			function thereIsANewContainer(code) {
				if (childFlow) closeFlow();
				exitContainers(continued);
				return documentContinued(code);
			}
			/** @type {State} */
			function thereIsNoNewContainer(code) {
				self.parser.lazy[self.now().line] = continued !== stack.length;
				lineStartOffset = self.now().offset;
				return flowStart(code);
			}
			/** @type {State} */
			function documentContinued(code) {
				self.containerState = {};
				return effects.attempt(containerConstruct, containerContinue, flowStart)(code);
			}
			/** @type {State} */
			function containerContinue(code) {
				continued++;
				stack.push([self.currentConstruct, self.containerState]);
				return documentContinued(code);
			}
			/** @type {State} */
			function flowStart(code) {
				if (code === null) {
					if (childFlow) closeFlow();
					exitContainers(0);
					effects.consume(code);
					return;
				}
				childFlow = childFlow || self.parser.flow(self.now());
				effects.enter("chunkFlow", {
					_tokenizer: childFlow,
					contentType: "flow",
					previous: childToken
				});
				return flowContinue(code);
			}
			/** @type {State} */
			function flowContinue(code) {
				if (code === null) {
					writeToChild(effects.exit("chunkFlow"), true);
					exitContainers(0);
					effects.consume(code);
					return;
				}
				if (markdownLineEnding(code)) {
					effects.consume(code);
					writeToChild(effects.exit("chunkFlow"));
					continued = 0;
					self.interrupt = void 0;
					return start;
				}
				effects.consume(code);
				return flowContinue;
			}
			/**
			* @param {Token} token
			*   Token.
			* @param {boolean | undefined} [endOfFile]
			*   Whether the token is at the end of the file (default: `false`).
			* @returns {undefined}
			*   Nothing.
			*/
			function writeToChild(token, endOfFile) {
				const stream = self.sliceStream(token);
				if (endOfFile) stream.push(null);
				token.previous = childToken;
				if (childToken) childToken.next = token;
				childToken = token;
				childFlow.defineSkip(token.start);
				childFlow.write(stream);
				if (self.parser.lazy[token.start.line]) {
					let index = childFlow.events.length;
					while (index--) if (childFlow.events[index][1].start.offset < lineStartOffset && (!childFlow.events[index][1].end || childFlow.events[index][1].end.offset > lineStartOffset)) return;
					const indexBeforeExits = self.events.length;
					let indexBeforeFlow = indexBeforeExits;
					/** @type {boolean | undefined} */
					let seen;
					/** @type {Point | undefined} */
					let point;
					while (indexBeforeFlow--) if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
						if (seen) {
							point = self.events[indexBeforeFlow][1].end;
							break;
						}
						seen = true;
					}
					exitContainers(continued);
					index = indexBeforeExits;
					while (index < self.events.length) {
						self.events[index][1].end = { ...point };
						index++;
					}
					splice(self.events, indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
					self.events.length = index;
				}
			}
			/**
			* @param {number} size
			*   Size.
			* @returns {undefined}
			*   Nothing.
			*/
			function exitContainers(size) {
				let index = stack.length;
				while (index-- > size) {
					const entry = stack[index];
					self.containerState = entry[1];
					entry[0].exit.call(self, effects);
				}
				stack.length = size;
			}
			function closeFlow() {
				childFlow.write([null]);
				childToken = void 0;
				childFlow = void 0;
				self.containerState._closeFlow = void 0;
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*   Tokenizer.
		*/
		function tokenizeContainer(effects, ok, nok) {
			return factorySpace(effects, effects.attempt(this.parser.constructs.document, ok, nok), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-util-classify-character@2.0.1/node_modules/micromark-util-classify-character/index.js
		/**
		* @import {Code} from 'micromark-util-types'
		*/
		/**
		* Classify whether a code represents whitespace, punctuation, or something
		* else.
		*
		* Used for attention (emphasis, strong), whose sequences can open or close
		* based on the class of surrounding characters.
		*
		* > 👉 **Note**: eof (`null`) is seen as whitespace.
		*
		* @param {Code} code
		*   Code.
		* @returns {typeof constants.characterGroupWhitespace | typeof constants.characterGroupPunctuation | undefined}
		*   Group.
		*/
		function classifyCharacter(code) {
			if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return 1;
			if (unicodePunctuation(code)) return 2;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-util-resolve-all@2.0.1/node_modules/micromark-util-resolve-all/index.js
		/**
		* @import {Event, Resolver, TokenizeContext} from 'micromark-util-types'
		*/
		/**
		* Call all `resolveAll`s.
		*
		* @param {ReadonlyArray<{resolveAll?: Resolver | undefined}>} constructs
		*   List of constructs, optionally with `resolveAll`s.
		* @param {Array<Event>} events
		*   List of events.
		* @param {TokenizeContext} context
		*   Context used by `tokenize`.
		* @returns {Array<Event>}
		*   Changed events.
		*/
		function resolveAll(constructs, events, context) {
			/** @type {Array<Resolver>} */
			const called = [];
			let index = -1;
			while (++index < constructs.length) {
				const resolve = constructs[index].resolveAll;
				if (resolve && !called.includes(resolve)) {
					events = resolve(events, context);
					called.push(resolve);
				}
			}
			return events;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/attention.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Event,
		*   Point,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const attention = {
			name: "attention",
			resolveAll: resolveAllAttention,
			tokenize: tokenizeAttention
		};
		/**
		* Take all events and resolve attention to emphasis or strong.
		*
		* @type {Resolver}
		*/
		function resolveAllAttention(events, context) {
			let index = -1;
			/** @type {number} */
			let open;
			/** @type {Token} */
			let group;
			/** @type {Token} */
			let text;
			/** @type {Token} */
			let openingSequence;
			/** @type {Token} */
			let closingSequence;
			/** @type {number} */
			let use;
			/** @type {Array<Event>} */
			let nextEvents;
			/** @type {number} */
			let offset;
			while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "attentionSequence" && events[index][1]._close) {
				open = index;
				while (open--) if (events[open][0] === "exit" && events[open][1].type === "attentionSequence" && events[open][1]._open && context.sliceSerialize(events[open][1]).charCodeAt(0) === context.sliceSerialize(events[index][1]).charCodeAt(0)) {
					if ((events[open][1]._close || events[index][1]._open) && (events[index][1].end.offset - events[index][1].start.offset) % 3 && !((events[open][1].end.offset - events[open][1].start.offset + events[index][1].end.offset - events[index][1].start.offset) % 3)) continue;
					use = events[open][1].end.offset - events[open][1].start.offset > 1 && events[index][1].end.offset - events[index][1].start.offset > 1 ? 2 : 1;
					const start = { ...events[open][1].end };
					const end = { ...events[index][1].start };
					movePoint(start, -use);
					movePoint(end, use);
					openingSequence = {
						type: use > 1 ? "strongSequence" : "emphasisSequence",
						start,
						end: { ...events[open][1].end }
					};
					closingSequence = {
						type: use > 1 ? "strongSequence" : "emphasisSequence",
						start: { ...events[index][1].start },
						end
					};
					text = {
						type: use > 1 ? "strongText" : "emphasisText",
						start: { ...events[open][1].end },
						end: { ...events[index][1].start }
					};
					group = {
						type: use > 1 ? "strong" : "emphasis",
						start: { ...openingSequence.start },
						end: { ...closingSequence.end }
					};
					events[open][1].end = { ...openingSequence.start };
					events[index][1].start = { ...closingSequence.end };
					nextEvents = [];
					if (events[open][1].end.offset - events[open][1].start.offset) nextEvents = push(nextEvents, [[
						"enter",
						events[open][1],
						context
					], [
						"exit",
						events[open][1],
						context
					]]);
					nextEvents = push(nextEvents, [
						[
							"enter",
							group,
							context
						],
						[
							"enter",
							openingSequence,
							context
						],
						[
							"exit",
							openingSequence,
							context
						],
						[
							"enter",
							text,
							context
						]
					]);
					nextEvents = push(nextEvents, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + 1, index), context));
					nextEvents = push(nextEvents, [
						[
							"exit",
							text,
							context
						],
						[
							"enter",
							closingSequence,
							context
						],
						[
							"exit",
							closingSequence,
							context
						],
						[
							"exit",
							group,
							context
						]
					]);
					if (events[index][1].end.offset - events[index][1].start.offset) {
						offset = 2;
						nextEvents = push(nextEvents, [[
							"enter",
							events[index][1],
							context
						], [
							"exit",
							events[index][1],
							context
						]]);
					} else offset = 0;
					splice(events, open - 1, index - open + 3, nextEvents);
					index = open + nextEvents.length - offset - 2;
					break;
				}
			}
			index = -1;
			while (++index < events.length) if (events[index][1].type === "attentionSequence") events[index][1].type = "data";
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeAttention(effects, ok) {
			const attentionMarkers = this.parser.constructs.attentionMarkers.null;
			const previous = this.previous;
			const before = classifyCharacter(previous);
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Before a sequence.
			*
			* ```markdown
			* > | **
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				marker = code;
				effects.enter("attentionSequence");
				return inside(code);
			}
			/**
			* In a sequence.
			*
			* ```markdown
			* > | **
			*     ^^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker) {
					effects.consume(code);
					return inside;
				}
				const token = effects.exit("attentionSequence");
				const after = classifyCharacter(code);
				const open = !after || after === 2 && before || attentionMarkers.includes(code);
				const close = !before || before === 2 && after || attentionMarkers.includes(previous);
				token._open = Boolean(marker === 42 ? open : open && (before || !close));
				token._close = Boolean(marker === 42 ? close : close && (after || !open));
				return ok(code);
			}
		}
		/**
		* Move a point a bit.
		*
		* Note: `move` only works inside lines! It’s not possible to move past other
		* chunks (replacement characters, tabs, or line endings).
		*
		* @param {Point} point
		*   Point.
		* @param {number} offset
		*   Amount to move.
		* @returns {undefined}
		*   Nothing.
		*/
		function movePoint(point, offset) {
			point.column += offset;
			point.offset += offset;
			point._bufferIndex += offset;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/autolink.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const autolink = {
			name: "autolink",
			tokenize: tokenizeAutolink
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeAutolink(effects, ok, nok) {
			let size = 0;
			return start;
			/**
			* Start of an autolink.
			*
			* ```markdown
			* > | a<https://example.com>b
			*      ^
			* > | a<user@example.com>b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("autolink");
				effects.enter("autolinkMarker");
				effects.consume(code);
				effects.exit("autolinkMarker");
				effects.enter("autolinkProtocol");
				return open;
			}
			/**
			* After `<`, at protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*       ^
			* > | a<user@example.com>b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					return schemeOrEmailAtext;
				}
				if (code === 64) return nok(code);
				return emailAtext(code);
			}
			/**
			* At second byte of protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*        ^
			* > | a<user@example.com>b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function schemeOrEmailAtext(code) {
				if (code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)) {
					size = 1;
					return schemeInsideOrEmailAtext(code);
				}
				return emailAtext(code);
			}
			/**
			* In ambiguous protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*        ^
			* > | a<user@example.com>b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function schemeInsideOrEmailAtext(code) {
				if (code === 58) {
					effects.consume(code);
					size = 0;
					return urlInside;
				}
				if ((code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)) && size++ < 32) {
					effects.consume(code);
					return schemeInsideOrEmailAtext;
				}
				size = 0;
				return emailAtext(code);
			}
			/**
			* After protocol, in URL.
			*
			* ```markdown
			* > | a<https://example.com>b
			*             ^
			* ```
			*
			* @type {State}
			*/
			function urlInside(code) {
				if (code === 62) {
					effects.exit("autolinkProtocol");
					effects.enter("autolinkMarker");
					effects.consume(code);
					effects.exit("autolinkMarker");
					effects.exit("autolink");
					return ok;
				}
				if (code === null || code === 32 || code === 60 || asciiControl(code)) return nok(code);
				effects.consume(code);
				return urlInside;
			}
			/**
			* In email atext.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*              ^
			* ```
			*
			* @type {State}
			*/
			function emailAtext(code) {
				if (code === 64) {
					effects.consume(code);
					return emailAtSignOrDot;
				}
				if (asciiAtext(code)) {
					effects.consume(code);
					return emailAtext;
				}
				return nok(code);
			}
			/**
			* In label, after at-sign or dot.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*                 ^       ^
			* ```
			*
			* @type {State}
			*/
			function emailAtSignOrDot(code) {
				return asciiAlphanumeric(code) ? emailLabel(code) : nok(code);
			}
			/**
			* In label, where `.` and `>` are allowed.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*                   ^
			* ```
			*
			* @type {State}
			*/
			function emailLabel(code) {
				if (code === 46) {
					effects.consume(code);
					size = 0;
					return emailAtSignOrDot;
				}
				if (code === 62) {
					effects.exit("autolinkProtocol").type = "autolinkEmail";
					effects.enter("autolinkMarker");
					effects.consume(code);
					effects.exit("autolinkMarker");
					effects.exit("autolink");
					return ok;
				}
				return emailValue(code);
			}
			/**
			* In label, where `.` and `>` are *not* allowed.
			*
			* Though, this is also used in `emailLabel` to parse other values.
			*
			* ```markdown
			* > | a<user.name@ex-ample.com>b
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function emailValue(code) {
				if ((code === 45 || asciiAlphanumeric(code)) && size++ < 63) {
					const next = code === 45 ? emailValue : emailLabel;
					effects.consume(code);
					return next;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/blank-line.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const blankLine = {
			partial: true,
			tokenize: tokenizeBlankLine
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlankLine(effects, ok, nok) {
			return start;
			/**
			* Start of blank line.
			*
			* > 👉 **Note**: `␠` represents a space character.
			*
			* ```markdown
			* > | ␠␠␊
			*     ^
			* > | ␊
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return markdownSpace(code) ? factorySpace(effects, after, "linePrefix")(code) : after(code);
			}
			/**
			* At eof/eol, after optional whitespace.
			*
			* > 👉 **Note**: `␠` represents a space character.
			*
			* ```markdown
			* > | ␠␠␊
			*       ^
			* > | ␊
			*     ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return code === null || markdownLineEnding(code) ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/block-quote.js
		/**
		* @import {
		*   Construct,
		*   Exiter,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const blockQuote = {
			continuation: { tokenize: tokenizeBlockQuoteContinuation },
			exit: exit$1,
			name: "blockQuote",
			tokenize: tokenizeBlockQuoteStart
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlockQuoteStart(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* Start of block quote.
			*
			* ```markdown
			* > | > a
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 62) {
					const state = self.containerState;
					if (!state.open) {
						effects.enter("blockQuote", { _container: true });
						state.open = true;
					}
					effects.enter("blockQuotePrefix");
					effects.enter("blockQuoteMarker");
					effects.consume(code);
					effects.exit("blockQuoteMarker");
					return after;
				}
				return nok(code);
			}
			/**
			* After `>`, before optional whitespace.
			*
			* ```markdown
			* > | > a
			*      ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (markdownSpace(code)) {
					effects.enter("blockQuotePrefixWhitespace");
					effects.consume(code);
					effects.exit("blockQuotePrefixWhitespace");
					effects.exit("blockQuotePrefix");
					return ok;
				}
				effects.exit("blockQuotePrefix");
				return ok(code);
			}
		}
		/**
		* Start of block quote continuation.
		*
		* ```markdown
		*   | > a
		* > | > b
		*     ^
		* ```
		*
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlockQuoteContinuation(effects, ok, nok) {
			const self = this;
			return contStart;
			/**
			* Start of block quote continuation.
			*
			* Also used to parse the first block quote opening.
			*
			* ```markdown
			*   | > a
			* > | > b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function contStart(code) {
				if (markdownSpace(code)) return factorySpace(effects, contBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
				return contBefore(code);
			}
			/**
			* At `>`, after optional whitespace.
			*
			* Also used to parse the first block quote opening.
			*
			* ```markdown
			*   | > a
			* > | > b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function contBefore(code) {
				return effects.attempt(blockQuote, ok, nok)(code);
			}
		}
		/** @type {Exiter} */
		function exit$1(effects) {
			effects.exit("blockQuote");
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/character-escape.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const characterEscape = {
			name: "characterEscape",
			tokenize: tokenizeCharacterEscape
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCharacterEscape(effects, ok, nok) {
			return start;
			/**
			* Start of character escape.
			*
			* ```markdown
			* > | a\*b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("characterEscape");
				effects.enter("escapeMarker");
				effects.consume(code);
				effects.exit("escapeMarker");
				return inside;
			}
			/**
			* After `\`, at punctuation.
			*
			* ```markdown
			* > | a\*b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (asciiPunctuation(code)) {
					effects.enter("characterEscapeValue");
					effects.consume(code);
					effects.exit("characterEscapeValue");
					effects.exit("characterEscape");
					return ok;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/character-reference.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const characterReference = {
			name: "characterReference",
			tokenize: tokenizeCharacterReference
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCharacterReference(effects, ok, nok) {
			const self = this;
			let size = 0;
			/** @type {number} */
			let max;
			/** @type {(code: Code) => boolean} */
			let test;
			return start;
			/**
			* Start of character reference.
			*
			* ```markdown
			* > | a&amp;b
			*      ^
			* > | a&#123;b
			*      ^
			* > | a&#x9;b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("characterReference");
				effects.enter("characterReferenceMarker");
				effects.consume(code);
				effects.exit("characterReferenceMarker");
				return open;
			}
			/**
			* After `&`, at `#` for numeric references or alphanumeric for named
			* references.
			*
			* ```markdown
			* > | a&amp;b
			*       ^
			* > | a&#123;b
			*       ^
			* > | a&#x9;b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 35) {
					effects.enter("characterReferenceMarkerNumeric");
					effects.consume(code);
					effects.exit("characterReferenceMarkerNumeric");
					return numeric;
				}
				effects.enter("characterReferenceValue");
				max = 31;
				test = asciiAlphanumeric;
				return value(code);
			}
			/**
			* After `#`, at `x` for hexadecimals or digit for decimals.
			*
			* ```markdown
			* > | a&#123;b
			*        ^
			* > | a&#x9;b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function numeric(code) {
				if (code === 88 || code === 120) {
					effects.enter("characterReferenceMarkerHexadecimal");
					effects.consume(code);
					effects.exit("characterReferenceMarkerHexadecimal");
					effects.enter("characterReferenceValue");
					max = 6;
					test = asciiHexDigit;
					return value;
				}
				effects.enter("characterReferenceValue");
				max = 7;
				test = asciiDigit;
				return value(code);
			}
			/**
			* After markers (`&#x`, `&#`, or `&`), in value, before `;`.
			*
			* The character reference kind defines what and how many characters are
			* allowed.
			*
			* ```markdown
			* > | a&amp;b
			*       ^^^
			* > | a&#123;b
			*        ^^^
			* > | a&#x9;b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function value(code) {
				if (code === 59 && size) {
					const token = effects.exit("characterReferenceValue");
					if (test === asciiAlphanumeric && !decodeNamedCharacterReference(self.sliceSerialize(token))) return nok(code);
					effects.enter("characterReferenceMarker");
					effects.consume(code);
					effects.exit("characterReferenceMarker");
					effects.exit("characterReference");
					return ok;
				}
				if (test(code) && size++ < max) {
					effects.consume(code);
					return value;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/code-fenced.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const nonLazyContinuation = {
			partial: true,
			tokenize: tokenizeNonLazyContinuation
		};
		/** @type {Construct} */
		const codeFenced = {
			concrete: true,
			name: "codeFenced",
			tokenize: tokenizeCodeFenced
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeFenced(effects, ok, nok) {
			const self = this;
			/** @type {Construct} */
			const closeStart = {
				partial: true,
				tokenize: tokenizeCloseStart
			};
			let initialPrefix = 0;
			let sizeOpen = 0;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of code.
			*
			* ```markdown
			* > | ~~~js
			*     ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return beforeSequenceOpen(code);
			}
			/**
			* In opening fence, after prefix, at sequence.
			*
			* ```markdown
			* > | ~~~js
			*     ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function beforeSequenceOpen(code) {
				const tail = self.events[self.events.length - 1];
				initialPrefix = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
				marker = code;
				effects.enter("codeFenced");
				effects.enter("codeFencedFence");
				effects.enter("codeFencedFenceSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening fence sequence.
			*
			* ```markdown
			* > | ~~~js
			*      ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === marker) {
					sizeOpen++;
					effects.consume(code);
					return sequenceOpen;
				}
				if (sizeOpen < 3) return nok(code);
				effects.exit("codeFencedFenceSequence");
				return markdownSpace(code) ? factorySpace(effects, infoBefore, "whitespace")(code) : infoBefore(code);
			}
			/**
			* In opening fence, after the sequence (and optional whitespace), before info.
			*
			* ```markdown
			* > | ~~~js
			*        ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function infoBefore(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFencedFence");
					return self.interrupt ? ok(code) : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
				}
				effects.enter("codeFencedFenceInfo");
				effects.enter("chunkString", { contentType: "string" });
				return info(code);
			}
			/**
			* In info.
			*
			* ```markdown
			* > | ~~~js
			*        ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function info(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceInfo");
					return infoBefore(code);
				}
				if (markdownSpace(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceInfo");
					return factorySpace(effects, metaBefore, "whitespace")(code);
				}
				if (code === 96 && code === marker) return nok(code);
				effects.consume(code);
				return info;
			}
			/**
			* In opening fence, after info and whitespace, before meta.
			*
			* ```markdown
			* > | ~~~js eval
			*           ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function metaBefore(code) {
				if (code === null || markdownLineEnding(code)) return infoBefore(code);
				effects.enter("codeFencedFenceMeta");
				effects.enter("chunkString", { contentType: "string" });
				return meta(code);
			}
			/**
			* In meta.
			*
			* ```markdown
			* > | ~~~js eval
			*           ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function meta(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceMeta");
					return infoBefore(code);
				}
				if (code === 96 && code === marker) return nok(code);
				effects.consume(code);
				return meta;
			}
			/**
			* At eol/eof in code, before a non-lazy closing fence or content.
			*
			* ```markdown
			* > | ~~~js
			*          ^
			* > | alert(1)
			*             ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function atNonLazyBreak(code) {
				return effects.attempt(closeStart, after, contentBefore)(code);
			}
			/**
			* Before code content, not a closing fence, at eol.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*             ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentBefore(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return contentStart;
			}
			/**
			* Before code content, not a closing fence.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentStart(code) {
				return initialPrefix > 0 && markdownSpace(code) ? factorySpace(effects, beforeContentChunk, "linePrefix", initialPrefix + 1)(code) : beforeContentChunk(code);
			}
			/**
			* Before code content, after optional prefix.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function beforeContentChunk(code) {
				if (code === null || markdownLineEnding(code)) return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
				effects.enter("codeFlowValue");
				return contentChunk(code);
			}
			/**
			* In code content.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^^^^^^^^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentChunk(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFlowValue");
					return beforeContentChunk(code);
				}
				effects.consume(code);
				return contentChunk;
			}
			/**
			* After code.
			*
			* ```markdown
			*   | ~~~js
			*   | alert(1)
			* > | ~~~
			*        ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				effects.exit("codeFenced");
				return ok(code);
			}
			/**
			* @this {TokenizeContext}
			*   Context.
			* @type {Tokenizer}
			*/
			function tokenizeCloseStart(effects, ok, nok) {
				let size = 0;
				return startBefore;
				/**
				*
				*
				* @type {State}
				*/
				function startBefore(code) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return start;
				}
				/**
				* Before closing fence, at optional whitespace.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function start(code) {
					effects.enter("codeFencedFence");
					return markdownSpace(code) ? factorySpace(effects, beforeSequenceClose, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : beforeSequenceClose(code);
				}
				/**
				* In closing fence, after optional whitespace, at sequence.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function beforeSequenceClose(code) {
					if (code === marker) {
						effects.enter("codeFencedFenceSequence");
						return sequenceClose(code);
					}
					return nok(code);
				}
				/**
				* In closing fence sequence.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function sequenceClose(code) {
					if (code === marker) {
						size++;
						effects.consume(code);
						return sequenceClose;
					}
					if (size >= sizeOpen) {
						effects.exit("codeFencedFenceSequence");
						return markdownSpace(code) ? factorySpace(effects, sequenceCloseAfter, "whitespace")(code) : sequenceCloseAfter(code);
					}
					return nok(code);
				}
				/**
				* After closing fence sequence, after optional whitespace.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*        ^
				* ```
				*
				* @type {State}
				*/
				function sequenceCloseAfter(code) {
					if (code === null || markdownLineEnding(code)) {
						effects.exit("codeFencedFence");
						return ok(code);
					}
					return nok(code);
				}
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeNonLazyContinuation(effects, ok, nok) {
			const self = this;
			return start;
			/**
			*
			*
			* @type {State}
			*/
			function start(code) {
				if (code === null) return nok(code);
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return lineStart;
			}
			/**
			*
			*
			* @type {State}
			*/
			function lineStart(code) {
				return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/code-indented.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const codeIndented = {
			name: "codeIndented",
			tokenize: tokenizeCodeIndented
		};
		/** @type {Construct} */
		const furtherStart = {
			partial: true,
			tokenize: tokenizeFurtherStart
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeIndented(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* Start of code (indented).
			*
			* > **Parsing note**: it is not needed to check if this first line is a
			* > filled line (that it has a non-whitespace character), because blank lines
			* > are parsed already, so we never run into that.
			*
			* ```markdown
			* > |     aaa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("codeIndented");
				return factorySpace(effects, afterPrefix, "linePrefix", 5)(code);
			}
			/**
			* At start, after 1 or 4 spaces.
			*
			* ```markdown
			* > |     aaa
			*         ^
			* ```
			*
			* @type {State}
			*/
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? atBreak(code) : nok(code);
			}
			/**
			* At a break.
			*
			* ```markdown
			* > |     aaa
			*         ^  ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === null) return after(code);
				if (markdownLineEnding(code)) return effects.attempt(furtherStart, atBreak, after)(code);
				effects.enter("codeFlowValue");
				return inside(code);
			}
			/**
			* In code content.
			*
			* ```markdown
			* > |     aaa
			*         ^^^^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFlowValue");
					return atBreak(code);
				}
				effects.consume(code);
				return inside;
			}
			/** @type {State} */
			function after(code) {
				effects.exit("codeIndented");
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeFurtherStart(effects, ok, nok) {
			const self = this;
			return furtherStart;
			/**
			* At eol, trying to parse another indent.
			*
			* ```markdown
			* > |     aaa
			*            ^
			*   |     bbb
			* ```
			*
			* @type {State}
			*/
			function furtherStart(code) {
				if (self.parser.lazy[self.now().line]) return nok(code);
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return furtherStart;
				}
				return factorySpace(effects, afterPrefix, "linePrefix", 5)(code);
			}
			/**
			* At start, after 1 or 4 spaces.
			*
			* ```markdown
			* > |     aaa
			*         ^
			* ```
			*
			* @type {State}
			*/
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4 ? ok(code) : markdownLineEnding(code) ? furtherStart(code) : nok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/code-text.js
		/**
		* @import {
		*   Construct,
		*   Previous,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const codeText = {
			name: "codeText",
			previous: previous$1,
			resolve: resolveCodeText,
			tokenize: tokenizeCodeText
		};
		/** @type {Resolver} */
		function resolveCodeText(events) {
			let tailExitIndex = events.length - 4;
			let headEnterIndex = 3;
			/** @type {number} */
			let index;
			/** @type {number | undefined} */
			let enter;
			if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
				index = headEnterIndex;
				while (++index < tailExitIndex) if (events[index][1].type === "codeTextData") {
					events[headEnterIndex][1].type = "codeTextPadding";
					events[tailExitIndex][1].type = "codeTextPadding";
					headEnterIndex += 2;
					tailExitIndex -= 2;
					break;
				}
			}
			index = headEnterIndex - 1;
			tailExitIndex++;
			while (++index <= tailExitIndex) if (enter === void 0) {
				if (index !== tailExitIndex && events[index][1].type !== "lineEnding") enter = index;
			} else if (index === tailExitIndex || events[index][1].type === "lineEnding") {
				events[enter][1].type = "codeTextData";
				if (index !== enter + 2) {
					events[enter][1].end = events[index - 1][1].end;
					events.splice(enter + 2, index - enter - 2);
					tailExitIndex -= index - enter - 2;
					index = enter + 2;
				}
				enter = void 0;
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Previous}
		*/
		function previous$1(code) {
			return code !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeText(effects, ok, nok) {
			let sizeOpen = 0;
			/** @type {number} */
			let size;
			/** @type {Token} */
			let token;
			return start;
			/**
			* Start of code (text).
			*
			* ```markdown
			* > | `a`
			*     ^
			* > | \`a`
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("codeText");
				effects.enter("codeTextSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening sequence.
			*
			* ```markdown
			* > | `a`
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === 96) {
					effects.consume(code);
					sizeOpen++;
					return sequenceOpen;
				}
				effects.exit("codeTextSequence");
				return between(code);
			}
			/**
			* Between something and something else.
			*
			* ```markdown
			* > | `a`
			*      ^^
			* ```
			*
			* @type {State}
			*/
			function between(code) {
				if (code === null) return nok(code);
				if (code === 32) {
					effects.enter("space");
					effects.consume(code);
					effects.exit("space");
					return between;
				}
				if (code === 96) {
					token = effects.enter("codeTextSequence");
					size = 0;
					return sequenceClose(code);
				}
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return between;
				}
				effects.enter("codeTextData");
				return data(code);
			}
			/**
			* In data.
			*
			* ```markdown
			* > | `a`
			*      ^
			* ```
			*
			* @type {State}
			*/
			function data(code) {
				if (code === null || code === 32 || code === 96 || markdownLineEnding(code)) {
					effects.exit("codeTextData");
					return between(code);
				}
				effects.consume(code);
				return data;
			}
			/**
			* In closing sequence.
			*
			* ```markdown
			* > | `a`
			*       ^
			* ```
			*
			* @type {State}
			*/
			function sequenceClose(code) {
				if (code === 96) {
					effects.consume(code);
					size++;
					return sequenceClose;
				}
				if (size === sizeOpen) {
					effects.exit("codeTextSequence");
					effects.exit("codeText");
					return ok(code);
				}
				token.type = "codeTextData";
				return data(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-util-subtokenize@2.1.0/node_modules/micromark-util-subtokenize/lib/splice-buffer.js
		/**
		* Some of the internal operations of micromark do lots of editing
		* operations on very large arrays. This runs into problems with two
		* properties of most circa-2020 JavaScript interpreters:
		*
		*  - Array-length modifications at the high end of an array (push/pop) are
		*    expected to be common and are implemented in (amortized) time
		*    proportional to the number of elements added or removed, whereas
		*    other operations (shift/unshift and splice) are much less efficient.
		*  - Function arguments are passed on the stack, so adding tens of thousands
		*    of elements to an array with `arr.push(...newElements)` will frequently
		*    cause stack overflows. (see <https://stackoverflow.com/questions/22123769/rangeerror-maximum-call-stack-size-exceeded-why>)
		*
		* SpliceBuffers are an implementation of gap buffers, which are a
		* generalization of the "queue made of two stacks" idea. The splice buffer
		* maintains a cursor, and moving the cursor has cost proportional to the
		* distance the cursor moves, but inserting, deleting, or splicing in
		* new information at the cursor is as efficient as the push/pop operation.
		* This allows for an efficient sequence of splices (or pushes, pops, shifts,
		* or unshifts) as long such edits happen at the same part of the array or
		* generally sweep through the array from the beginning to the end.
		*
		* The interface for splice buffers also supports large numbers of inputs by
		* passing a single array argument rather passing multiple arguments on the
		* function call stack.
		*
		* @template T
		*   Item type.
		*/
		var SpliceBuffer = class {
			/**
			* @param {ReadonlyArray<T> | null | undefined} [initial]
			*   Initial items (optional).
			* @returns
			*   Splice buffer.
			*/
			constructor(initial) {
				/** @type {Array<T>} */
				this.left = initial ? [...initial] : [];
				/** @type {Array<T>} */
				this.right = [];
			}
			/**
			* Array access;
			* does not move the cursor.
			*
			* @param {number} index
			*   Index.
			* @return {T}
			*   Item.
			*/
			get(index) {
				if (index < 0 || index >= this.left.length + this.right.length) throw new RangeError("Cannot access index `" + index + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
				if (index < this.left.length) return this.left[index];
				return this.right[this.right.length - index + this.left.length - 1];
			}
			/**
			* The length of the splice buffer, one greater than the largest index in the
			* array.
			*/
			get length() {
				return this.left.length + this.right.length;
			}
			/**
			* Remove and return `list[0]`;
			* moves the cursor to `0`.
			*
			* @returns {T | undefined}
			*   Item, optional.
			*/
			shift() {
				this.setCursor(0);
				return this.right.pop();
			}
			/**
			* Slice the buffer to get an array;
			* does not move the cursor.
			*
			* @param {number} start
			*   Start.
			* @param {number | null | undefined} [end]
			*   End (optional).
			* @returns {Array<T>}
			*   Array of items.
			*/
			slice(start, end) {
				/** @type {number} */
				const stop = end === null || end === void 0 ? Number.POSITIVE_INFINITY : end;
				if (stop < this.left.length) return this.left.slice(start, stop);
				if (start > this.left.length) return this.right.slice(this.right.length - stop + this.left.length, this.right.length - start + this.left.length).reverse();
				return this.left.slice(start).concat(this.right.slice(this.right.length - stop + this.left.length).reverse());
			}
			/**
			* Mimics the behavior of Array.prototype.splice() except for the change of
			* interface necessary to avoid segfaults when patching in very large arrays.
			*
			* This operation moves cursor is moved to `start` and results in the cursor
			* placed after any inserted items.
			*
			* @param {number} start
			*   Start;
			*   zero-based index at which to start changing the array;
			*   negative numbers count backwards from the end of the array and values
			*   that are out-of bounds are clamped to the appropriate end of the array.
			* @param {number | null | undefined} [deleteCount=0]
			*   Delete count (default: `0`);
			*   maximum number of elements to delete, starting from start.
			* @param {Array<T> | null | undefined} [items=[]]
			*   Items to include in place of the deleted items (default: `[]`).
			* @return {Array<T>}
			*   Any removed items.
			*/
			splice(start, deleteCount, items) {
				/** @type {number} */
				const count = deleteCount || 0;
				this.setCursor(Math.trunc(start));
				const removed = this.right.splice(this.right.length - count, Number.POSITIVE_INFINITY);
				if (items) chunkedPush(this.left, items);
				return removed.reverse();
			}
			/**
			* Remove and return the highest-numbered item in the array, so
			* `list[list.length - 1]`;
			* Moves the cursor to `length`.
			*
			* @returns {T | undefined}
			*   Item, optional.
			*/
			pop() {
				this.setCursor(Number.POSITIVE_INFINITY);
				return this.left.pop();
			}
			/**
			* Inserts a single item to the high-numbered side of the array;
			* moves the cursor to `length`.
			*
			* @param {T} item
			*   Item.
			* @returns {undefined}
			*   Nothing.
			*/
			push(item) {
				this.setCursor(Number.POSITIVE_INFINITY);
				this.left.push(item);
			}
			/**
			* Inserts many items to the high-numbered side of the array.
			* Moves the cursor to `length`.
			*
			* @param {Array<T>} items
			*   Items.
			* @returns {undefined}
			*   Nothing.
			*/
			pushMany(items) {
				this.setCursor(Number.POSITIVE_INFINITY);
				chunkedPush(this.left, items);
			}
			/**
			* Inserts a single item to the low-numbered side of the array;
			* Moves the cursor to `0`.
			*
			* @param {T} item
			*   Item.
			* @returns {undefined}
			*   Nothing.
			*/
			unshift(item) {
				this.setCursor(0);
				this.right.push(item);
			}
			/**
			* Inserts many items to the low-numbered side of the array;
			* moves the cursor to `0`.
			*
			* @param {Array<T>} items
			*   Items.
			* @returns {undefined}
			*   Nothing.
			*/
			unshiftMany(items) {
				this.setCursor(0);
				chunkedPush(this.right, items.reverse());
			}
			/**
			* Move the cursor to a specific position in the array. Requires
			* time proportional to the distance moved.
			*
			* If `n < 0`, the cursor will end up at the beginning.
			* If `n > length`, the cursor will end up at the end.
			*
			* @param {number} n
			*   Position.
			* @return {undefined}
			*   Nothing.
			*/
			setCursor(n) {
				if (n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0) return;
				if (n < this.left.length) {
					const removed = this.left.splice(n, Number.POSITIVE_INFINITY);
					chunkedPush(this.right, removed.reverse());
				} else {
					const removed = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
					chunkedPush(this.left, removed.reverse());
				}
			}
		};
		/**
		* Avoid stack overflow by pushing items onto the stack in segments
		*
		* @template T
		*   Item type.
		* @param {Array<T>} list
		*   List to inject into.
		* @param {ReadonlyArray<T>} right
		*   Items to inject.
		* @return {undefined}
		*   Nothing.
		*/
		function chunkedPush(list, right) {
			/** @type {number} */
			let chunkStart = 0;
			if (right.length < 1e4) list.push(...right);
			else while (chunkStart < right.length) {
				list.push(...right.slice(chunkStart, chunkStart + 1e4));
				chunkStart += 1e4;
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-util-subtokenize@2.1.0/node_modules/micromark-util-subtokenize/index.js
		/**
		* @import {Chunk, Event, Token} from 'micromark-util-types'
		*/
		/**
		* Tokenize subcontent.
		*
		* @param {Array<Event>} eventsArray
		*   List of events.
		* @returns {boolean}
		*   Whether subtokens were found.
		*/
		function subtokenize(eventsArray) {
			/** @type {Record<string, number>} */
			const jumps = {};
			let index = -1;
			/** @type {Event} */
			let event;
			/** @type {number | undefined} */
			let lineIndex;
			/** @type {number} */
			let otherIndex;
			/** @type {Event} */
			let otherEvent;
			/** @type {Array<Event>} */
			let parameters;
			/** @type {Array<Event>} */
			let subevents;
			/** @type {boolean | undefined} */
			let more;
			const events = new SpliceBuffer(eventsArray);
			while (++index < events.length) {
				while (index in jumps) index = jumps[index];
				event = events.get(index);
				if (index && event[1].type === "chunkFlow" && events.get(index - 1)[1].type === "listItemPrefix") {
					subevents = event[1]._tokenizer.events;
					otherIndex = 0;
					if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") otherIndex += 2;
					if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") while (++otherIndex < subevents.length) {
						if (subevents[otherIndex][1].type === "content") break;
						if (subevents[otherIndex][1].type === "chunkText") {
							subevents[otherIndex][1]._isInFirstContentOfListItem = true;
							otherIndex++;
						}
					}
				}
				if (event[0] === "enter") {
					if (event[1].contentType) {
						Object.assign(jumps, subcontent(events, index));
						index = jumps[index];
						more = true;
					}
				} else if (event[1]._container) {
					otherIndex = index;
					lineIndex = void 0;
					while (otherIndex--) {
						otherEvent = events.get(otherIndex);
						if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
							if (otherEvent[0] === "enter") {
								if (lineIndex) events.get(lineIndex)[1].type = "lineEndingBlank";
								otherEvent[1].type = "lineEnding";
								lineIndex = otherIndex;
							}
						} else if (otherEvent[1].type === "linePrefix" || otherEvent[1].type === "listItemIndent") {} else break;
					}
					if (lineIndex) {
						event[1].end = { ...events.get(lineIndex)[1].start };
						parameters = events.slice(lineIndex, index);
						parameters.unshift(event);
						events.splice(lineIndex, index - lineIndex + 1, parameters);
					}
				}
			}
			splice(eventsArray, 0, Number.POSITIVE_INFINITY, events.slice(0));
			return !more;
		}
		/**
		* Tokenize embedded tokens.
		*
		* @param {SpliceBuffer<Event>} events
		*   Events.
		* @param {number} eventIndex
		*   Index.
		* @returns {Record<string, number>}
		*   Gaps.
		*/
		function subcontent(events, eventIndex) {
			const token = events.get(eventIndex)[1];
			const context = events.get(eventIndex)[2];
			let startPosition = eventIndex - 1;
			/** @type {Array<number>} */
			const startPositions = [];
			let tokenizer = token._tokenizer;
			if (!tokenizer) {
				tokenizer = context.parser[token.contentType](token.start);
				if (token._contentTypeTextTrailing) tokenizer._contentTypeTextTrailing = true;
			}
			const childEvents = tokenizer.events;
			/** @type {Array<[number, number]>} */
			const jumps = [];
			/** @type {Record<string, number>} */
			const gaps = {};
			/** @type {Array<Chunk>} */
			let stream;
			/** @type {Token | undefined} */
			let previous;
			let index = -1;
			/** @type {Token | undefined} */
			let current = token;
			let adjust = 0;
			let start = 0;
			const breaks = [start];
			while (current) {
				while (events.get(++startPosition)[1] !== current);
				startPositions.push(startPosition);
				if (!current._tokenizer) {
					stream = context.sliceStream(current);
					if (!current.next) stream.push(null);
					if (previous) tokenizer.defineSkip(current.start);
					if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = true;
					tokenizer.write(stream);
					if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = void 0;
				}
				previous = current;
				current = current.next;
			}
			current = token;
			while (++index < childEvents.length) if (childEvents[index][0] === "exit" && childEvents[index - 1][0] === "enter" && childEvents[index][1].type === childEvents[index - 1][1].type && childEvents[index][1].start.line !== childEvents[index][1].end.line) {
				start = index + 1;
				breaks.push(start);
				current._tokenizer = void 0;
				current.previous = void 0;
				current = current.next;
			}
			tokenizer.events = [];
			if (current) {
				current._tokenizer = void 0;
				current.previous = void 0;
			} else breaks.pop();
			index = breaks.length;
			while (index--) {
				const slice = childEvents.slice(breaks[index], breaks[index + 1]);
				const start = startPositions.pop();
				jumps.push([start, start + slice.length - 1]);
				events.splice(start, 2, slice);
			}
			jumps.reverse();
			index = -1;
			while (++index < jumps.length) {
				gaps[adjust + jumps[index][0]] = adjust + jumps[index][1];
				adjust += jumps[index][1] - jumps[index][0] - 1;
			}
			return gaps;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/content.js
		/**
		* @import {
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* No name because it must not be turned off.
		* @type {Construct}
		*/
		const content = {
			resolve: resolveContent,
			tokenize: tokenizeContent
		};
		/** @type {Construct} */
		const continuationConstruct = {
			partial: true,
			tokenize: tokenizeContinuation
		};
		/**
		* Content is transparent: it’s parsed right now. That way, definitions are also
		* parsed right now: before text in paragraphs (specifically, media) are parsed.
		*
		* @type {Resolver}
		*/
		function resolveContent(events) {
			subtokenize(events);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeContent(effects, ok) {
			/** @type {Token | undefined} */
			let previous;
			return chunkStart;
			/**
			* Before a content chunk.
			*
			* ```markdown
			* > | abc
			*     ^
			* ```
			*
			* @type {State}
			*/
			function chunkStart(code) {
				effects.enter("content");
				previous = effects.enter("chunkContent", { contentType: "content" });
				return chunkInside(code);
			}
			/**
			* In a content chunk.
			*
			* ```markdown
			* > | abc
			*     ^^^
			* ```
			*
			* @type {State}
			*/
			function chunkInside(code) {
				if (code === null) return contentEnd(code);
				if (markdownLineEnding(code)) return effects.check(continuationConstruct, contentContinue, contentEnd)(code);
				effects.consume(code);
				return chunkInside;
			}
			/**
			*
			*
			* @type {State}
			*/
			function contentEnd(code) {
				effects.exit("chunkContent");
				effects.exit("content");
				return ok(code);
			}
			/**
			*
			*
			* @type {State}
			*/
			function contentContinue(code) {
				effects.consume(code);
				effects.exit("chunkContent");
				previous.next = effects.enter("chunkContent", {
					contentType: "content",
					previous
				});
				previous = previous.next;
				return chunkInside;
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeContinuation(effects, ok, nok) {
			const self = this;
			return startLookahead;
			/**
			*
			*
			* @type {State}
			*/
			function startLookahead(code) {
				effects.exit("chunkContent");
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, prefixed, "linePrefix");
			}
			/**
			*
			*
			* @type {State}
			*/
			function prefixed(code) {
				if (code === null || markdownLineEnding(code)) return nok(code);
				const tail = self.events[self.events.length - 1];
				if (!self.parser.constructs.disable.null.includes("codeIndented") && tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4) return ok(code);
				return effects.interrupt(self.parser.constructs.flow, nok, ok)(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-factory-destination@2.0.1/node_modules/micromark-factory-destination/index.js
		/**
		* @import {Effects, State, TokenType} from 'micromark-util-types'
		*/
		/**
		* Parse destinations.
		*
		* ###### Examples
		*
		* ```markdown
		* <a>
		* <a\>b>
		* <a b>
		* <a)>
		* a
		* a\)b
		* a(b)c
		* a(b)
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type for whole (`<a>` or `b`).
		* @param {TokenType} literalType
		*   Type when enclosed (`<a>`).
		* @param {TokenType} literalMarkerType
		*   Type for enclosing (`<` and `>`).
		* @param {TokenType} rawType
		*   Type when not enclosed (`b`).
		* @param {TokenType} stringType
		*   Type for the value (`a` or `b`).
		* @param {number | undefined} [max=Infinity]
		*   Depth of nested parens (inclusive).
		* @returns {State}
		*   Start state.
		*/
		function factoryDestination(effects, ok, nok, type, literalType, literalMarkerType, rawType, stringType, max) {
			const limit = max || Number.POSITIVE_INFINITY;
			let balance = 0;
			return start;
			/**
			* Start of destination.
			*
			* ```markdown
			* > | <aa>
			*     ^
			* > | aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 60) {
					effects.enter(type);
					effects.enter(literalType);
					effects.enter(literalMarkerType);
					effects.consume(code);
					effects.exit(literalMarkerType);
					return enclosedBefore;
				}
				if (code === null || code === 32 || code === 41 || asciiControl(code)) return nok(code);
				effects.enter(type);
				effects.enter(rawType);
				effects.enter(stringType);
				effects.enter("chunkString", { contentType: "string" });
				return raw(code);
			}
			/**
			* After `<`, at an enclosed destination.
			*
			* ```markdown
			* > | <aa>
			*      ^
			* ```
			*
			* @type {State}
			*/
			function enclosedBefore(code) {
				if (code === 62) {
					effects.enter(literalMarkerType);
					effects.consume(code);
					effects.exit(literalMarkerType);
					effects.exit(literalType);
					effects.exit(type);
					return ok;
				}
				effects.enter(stringType);
				effects.enter("chunkString", { contentType: "string" });
				return enclosed(code);
			}
			/**
			* In enclosed destination.
			*
			* ```markdown
			* > | <aa>
			*      ^
			* ```
			*
			* @type {State}
			*/
			function enclosed(code) {
				if (code === 62) {
					effects.exit("chunkString");
					effects.exit(stringType);
					return enclosedBefore(code);
				}
				if (code === null || code === 60 || markdownLineEnding(code)) return nok(code);
				effects.consume(code);
				return code === 92 ? enclosedEscape : enclosed;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | <a\*a>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function enclosedEscape(code) {
				if (code === 60 || code === 62 || code === 92) {
					effects.consume(code);
					return enclosed;
				}
				return enclosed(code);
			}
			/**
			* In raw destination.
			*
			* ```markdown
			* > | aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function raw(code) {
				if (!balance && (code === null || code === 41 || markdownLineEndingOrSpace(code))) {
					effects.exit("chunkString");
					effects.exit(stringType);
					effects.exit(rawType);
					effects.exit(type);
					return ok(code);
				}
				if (balance < limit && code === 40) {
					effects.consume(code);
					balance++;
					return raw;
				}
				if (code === 41) {
					effects.consume(code);
					balance--;
					return raw;
				}
				if (code === null || code === 32 || code === 40 || asciiControl(code)) return nok(code);
				effects.consume(code);
				return code === 92 ? rawEscape : raw;
			}
			/**
			* After `\`, at special character.
			*
			* ```markdown
			* > | a\*a
			*       ^
			* ```
			*
			* @type {State}
			*/
			function rawEscape(code) {
				if (code === 40 || code === 41 || code === 92) {
					effects.consume(code);
					return raw;
				}
				return raw(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-factory-label@2.0.1/node_modules/micromark-factory-label/index.js
		/**
		* @import {
		*   Effects,
		*   State,
		*   TokenizeContext,
		*   TokenType
		* } from 'micromark-util-types'
		*/
		/**
		* Parse labels.
		*
		* > 👉 **Note**: labels in markdown are capped at 999 characters in the string.
		*
		* ###### Examples
		*
		* ```markdown
		* [a]
		* [a
		* b]
		* [a\]b]
		* ```
		*
		* @this {TokenizeContext}
		*   Tokenize context.
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type of the whole label (`[a]`).
		* @param {TokenType} markerType
		*   Type for the markers (`[` and `]`).
		* @param {TokenType} stringType
		*   Type for the identifier (`a`).
		* @returns {State}
		*   Start state.
		*/
		function factoryLabel(effects, ok, nok, type, markerType, stringType) {
			const self = this;
			let size = 0;
			/** @type {boolean} */
			let seen;
			return start;
			/**
			* Start of label.
			*
			* ```markdown
			* > | [a]
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter(type);
				effects.enter(markerType);
				effects.consume(code);
				effects.exit(markerType);
				effects.enter(stringType);
				return atBreak;
			}
			/**
			* In label, at something, before something else.
			*
			* ```markdown
			* > | [a]
			*      ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (size > 999 || code === null || code === 91 || code === 93 && !seen ||
				/* c8 ignore next 3 */
				code === 94 && !size && "_hiddenFootnoteSupport" in self.parser.constructs) return nok(code);
				if (code === 93) {
					effects.exit(stringType);
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					effects.exit(type);
					return ok;
				}
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return atBreak;
				}
				effects.enter("chunkString", { contentType: "string" });
				return labelInside(code);
			}
			/**
			* In label, in text.
			*
			* ```markdown
			* > | [a]
			*      ^
			* ```
			*
			* @type {State}
			*/
			function labelInside(code) {
				if (code === null || code === 91 || code === 93 || markdownLineEnding(code) || size++ > 999) {
					effects.exit("chunkString");
					return atBreak(code);
				}
				effects.consume(code);
				if (!seen) seen = !markdownSpace(code);
				return code === 92 ? labelEscape : labelInside;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | [a\*a]
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return labelInside;
				}
				return labelInside(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-factory-title@2.0.1/node_modules/micromark-factory-title/index.js
		/**
		* @import {
		*   Code,
		*   Effects,
		*   State,
		*   TokenType
		* } from 'micromark-util-types'
		*/
		/**
		* Parse titles.
		*
		* ###### Examples
		*
		* ```markdown
		* "a"
		* 'b'
		* (c)
		* "a
		* b"
		* 'a
		*     b'
		* (a\)b)
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type of the whole title (`"a"`, `'b'`, `(c)`).
		* @param {TokenType} markerType
		*   Type for the markers (`"`, `'`, `(`, and `)`).
		* @param {TokenType} stringType
		*   Type for the value (`a`).
		* @returns {State}
		*   Start state.
		*/
		function factoryTitle(effects, ok, nok, type, markerType, stringType) {
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of title.
			*
			* ```markdown
			* > | "a"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 34 || code === 39 || code === 40) {
					effects.enter(type);
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					marker = code === 40 ? 41 : code;
					return begin;
				}
				return nok(code);
			}
			/**
			* After opening marker.
			*
			* This is also used at the closing marker.
			*
			* ```markdown
			* > | "a"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function begin(code) {
				if (code === marker) {
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					effects.exit(type);
					return ok;
				}
				effects.enter(stringType);
				return atBreak(code);
			}
			/**
			* At something, before something else.
			*
			* ```markdown
			* > | "a"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === marker) {
					effects.exit(stringType);
					return begin(marker);
				}
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return factorySpace(effects, atBreak, "linePrefix");
				}
				effects.enter("chunkString", { contentType: "string" });
				return inside(code);
			}
			/**
			*
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker || code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					return atBreak(code);
				}
				effects.consume(code);
				return code === 92 ? escape : inside;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | "a\*b"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function escape(code) {
				if (code === marker || code === 92) {
					effects.consume(code);
					return inside;
				}
				return inside(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-factory-whitespace@2.0.1/node_modules/micromark-factory-whitespace/index.js
		/**
		* @import {Effects, State} from 'micromark-util-types'
		*/
		/**
		* Parse spaces and tabs.
		*
		* There is no `nok` parameter:
		*
		* *   line endings or spaces in markdown are often optional, in which case this
		*     factory can be used and `ok` will be switched to whether spaces were found
		*     or not
		* *   one line ending or space can be detected with
		*     `markdownLineEndingOrSpace(code)` right before using `factoryWhitespace`
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @returns {State}
		*   Start state.
		*/
		function factoryWhitespace(effects, ok) {
			/** @type {boolean} */
			let seen;
			return start;
			/** @type {State} */
			function start(code) {
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					seen = true;
					return start;
				}
				if (markdownSpace(code)) return factorySpace(effects, start, seen ? "linePrefix" : "lineSuffix")(code);
				return ok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/definition.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const definition = {
			name: "definition",
			tokenize: tokenizeDefinition
		};
		/** @type {Construct} */
		const titleBefore = {
			partial: true,
			tokenize: tokenizeTitleBefore
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeDefinition(effects, ok, nok) {
			const self = this;
			/** @type {string} */
			let identifier;
			return start;
			/**
			* At start of a definition.
			*
			* ```markdown
			* > | [a]: b "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("definition");
				return before(code);
			}
			/**
			* After optional whitespace, at `[`.
			*
			* ```markdown
			* > | [a]: b "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				return factoryLabel.call(self, effects, labelAfter, nok, "definitionLabel", "definitionLabelMarker", "definitionLabelString")(code);
			}
			/**
			* After label.
			*
			* ```markdown
			* > | [a]: b "c"
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelAfter(code) {
				identifier = normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1));
				if (code === 58) {
					effects.enter("definitionMarker");
					effects.consume(code);
					effects.exit("definitionMarker");
					return markerAfter;
				}
				return nok(code);
			}
			/**
			* After marker.
			*
			* ```markdown
			* > | [a]: b "c"
			*         ^
			* ```
			*
			* @type {State}
			*/
			function markerAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, destinationBefore)(code) : destinationBefore(code);
			}
			/**
			* Before destination.
			*
			* ```markdown
			* > | [a]: b "c"
			*          ^
			* ```
			*
			* @type {State}
			*/
			function destinationBefore(code) {
				return factoryDestination(effects, destinationAfter, nok, "definitionDestination", "definitionDestinationLiteral", "definitionDestinationLiteralMarker", "definitionDestinationRaw", "definitionDestinationString")(code);
			}
			/**
			* After destination.
			*
			* ```markdown
			* > | [a]: b "c"
			*           ^
			* ```
			*
			* @type {State}
			*/
			function destinationAfter(code) {
				return effects.attempt(titleBefore, after, after)(code);
			}
			/**
			* After definition.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return markdownSpace(code) ? factorySpace(effects, afterWhitespace, "whitespace")(code) : afterWhitespace(code);
			}
			/**
			* After definition, after optional whitespace.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function afterWhitespace(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("definition");
					self.parser.defined.push(identifier);
					return ok(code);
				}
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeTitleBefore(effects, ok, nok) {
			return titleBefore;
			/**
			* After destination, at whitespace.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*           ^
			* ```
			*
			* @type {State}
			*/
			function titleBefore(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, beforeMarker)(code) : nok(code);
			}
			/**
			* At title.
			*
			* ```markdown
			*   | [a]: b
			* > | "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function beforeMarker(code) {
				return factoryTitle(effects, titleAfter, nok, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(code);
			}
			/**
			* After title.
			*
			* ```markdown
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function titleAfter(code) {
				return markdownSpace(code) ? factorySpace(effects, titleAfterOptionalWhitespace, "whitespace")(code) : titleAfterOptionalWhitespace(code);
			}
			/**
			* After title, after optional whitespace.
			*
			* ```markdown
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function titleAfterOptionalWhitespace(code) {
				return code === null || markdownLineEnding(code) ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/hard-break-escape.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const hardBreakEscape = {
			name: "hardBreakEscape",
			tokenize: tokenizeHardBreakEscape
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHardBreakEscape(effects, ok, nok) {
			return start;
			/**
			* Start of a hard break (escape).
			*
			* ```markdown
			* > | a\
			*      ^
			*   | b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("hardBreakEscape");
				effects.consume(code);
				return after;
			}
			/**
			* After `\`, at eol.
			*
			* ```markdown
			* > | a\
			*       ^
			*   | b
			* ```
			*
			*  @type {State}
			*/
			function after(code) {
				if (markdownLineEnding(code)) {
					effects.exit("hardBreakEscape");
					return ok(code);
				}
				return nok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/heading-atx.js
		/**
		* @import {
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const headingAtx = {
			name: "headingAtx",
			resolve: resolveHeadingAtx,
			tokenize: tokenizeHeadingAtx
		};
		/** @type {Resolver} */
		function resolveHeadingAtx(events, context) {
			let contentEnd = events.length - 2;
			let contentStart = 3;
			/** @type {Token} */
			let content;
			/** @type {Token} */
			let text;
			if (events[contentStart][1].type === "whitespace") contentStart += 2;
			if (contentEnd - 2 > contentStart && events[contentEnd][1].type === "whitespace") contentEnd -= 2;
			if (events[contentEnd][1].type === "atxHeadingSequence" && (contentStart === contentEnd - 1 || contentEnd - 4 > contentStart && events[contentEnd - 2][1].type === "whitespace")) contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
			if (contentEnd > contentStart) {
				content = {
					type: "atxHeadingText",
					start: events[contentStart][1].start,
					end: events[contentEnd][1].end
				};
				text = {
					type: "chunkText",
					start: events[contentStart][1].start,
					end: events[contentEnd][1].end,
					contentType: "text"
				};
				splice(events, contentStart, contentEnd - contentStart + 1, [
					[
						"enter",
						content,
						context
					],
					[
						"enter",
						text,
						context
					],
					[
						"exit",
						text,
						context
					],
					[
						"exit",
						content,
						context
					]
				]);
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHeadingAtx(effects, ok, nok) {
			let size = 0;
			return start;
			/**
			* Start of a heading (atx).
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("atxHeading");
				return before(code);
			}
			/**
			* After optional whitespace, at `#`.
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("atxHeadingSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening sequence.
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === 35 && size++ < 6) {
					effects.consume(code);
					return sequenceOpen;
				}
				if (code === null || markdownLineEndingOrSpace(code)) {
					effects.exit("atxHeadingSequence");
					return atBreak(code);
				}
				return nok(code);
			}
			/**
			* After something, before something else.
			*
			* ```markdown
			* > | ## aa
			*       ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === 35) {
					effects.enter("atxHeadingSequence");
					return sequenceFurther(code);
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("atxHeading");
					return ok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, atBreak, "whitespace")(code);
				effects.enter("atxHeadingText");
				return data(code);
			}
			/**
			* In further sequence (after whitespace).
			*
			* Could be normal “visible” hashes in the heading or a final sequence.
			*
			* ```markdown
			* > | ## aa ##
			*           ^
			* ```
			*
			* @type {State}
			*/
			function sequenceFurther(code) {
				if (code === 35) {
					effects.consume(code);
					return sequenceFurther;
				}
				effects.exit("atxHeadingSequence");
				return atBreak(code);
			}
			/**
			* In text.
			*
			* ```markdown
			* > | ## aa
			*        ^
			* ```
			*
			* @type {State}
			*/
			function data(code) {
				if (code === null || code === 35 || markdownLineEndingOrSpace(code)) {
					effects.exit("atxHeadingText");
					return atBreak(code);
				}
				effects.consume(code);
				return data;
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-util-html-tag-name@2.0.1/node_modules/micromark-util-html-tag-name/index.js
		/**
		* List of lowercase HTML “block” tag names.
		*
		* The list, when parsing HTML (flow), results in more relaxed rules (condition
		* 6).
		* Because they are known blocks, the HTML-like syntax doesn’t have to be
		* strictly parsed.
		* For tag names not in this list, a more strict algorithm (condition 7) is used
		* to detect whether the HTML-like syntax is seen as HTML (flow) or not.
		*
		* This is copied from:
		* <https://spec.commonmark.org/0.30/#html-blocks>.
		*
		* > 👉 **Note**: `search` was added in `CommonMark@0.31`.
		*/
		const htmlBlockNames = [
			"address",
			"article",
			"aside",
			"base",
			"basefont",
			"blockquote",
			"body",
			"caption",
			"center",
			"col",
			"colgroup",
			"dd",
			"details",
			"dialog",
			"dir",
			"div",
			"dl",
			"dt",
			"fieldset",
			"figcaption",
			"figure",
			"footer",
			"form",
			"frame",
			"frameset",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"head",
			"header",
			"hr",
			"html",
			"iframe",
			"legend",
			"li",
			"link",
			"main",
			"menu",
			"menuitem",
			"nav",
			"noframes",
			"ol",
			"optgroup",
			"option",
			"p",
			"param",
			"search",
			"section",
			"summary",
			"table",
			"tbody",
			"td",
			"tfoot",
			"th",
			"thead",
			"title",
			"tr",
			"track",
			"ul"
		];
		/**
		* List of lowercase HTML “raw” tag names.
		*
		* The list, when parsing HTML (flow), results in HTML that can include lines
		* without exiting, until a closing tag also in this list is found (condition
		* 1).
		*
		* This module is copied from:
		* <https://spec.commonmark.org/0.30/#html-blocks>.
		*
		* > 👉 **Note**: `textarea` was added in `CommonMark@0.30`.
		*/
		const htmlRawNames = [
			"pre",
			"script",
			"style",
			"textarea"
		];
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/html-flow.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const htmlFlow = {
			concrete: true,
			name: "htmlFlow",
			resolveTo: resolveToHtmlFlow,
			tokenize: tokenizeHtmlFlow
		};
		/** @type {Construct} */
		const blankLineBefore = {
			partial: true,
			tokenize: tokenizeBlankLineBefore
		};
		const nonLazyContinuationStart = {
			partial: true,
			tokenize: tokenizeNonLazyContinuationStart
		};
		/** @type {Resolver} */
		function resolveToHtmlFlow(events) {
			let index = events.length;
			while (index--) if (events[index][0] === "enter" && events[index][1].type === "htmlFlow") break;
			if (index > 1 && events[index - 2][1].type === "linePrefix") {
				events[index][1].start = events[index - 2][1].start;
				events[index + 1][1].start = events[index - 2][1].start;
				events.splice(index - 2, 2);
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHtmlFlow(effects, ok, nok) {
			const self = this;
			/** @type {number} */
			let marker;
			/** @type {boolean} */
			let closingTag;
			/** @type {string} */
			let buffer;
			/** @type {number} */
			let index;
			/** @type {Code} */
			let markerB;
			return start;
			/**
			* Start of HTML (flow).
			*
			* ```markdown
			* > | <x />
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return before(code);
			}
			/**
			* At `<`, after optional whitespace.
			*
			* ```markdown
			* > | <x />
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("htmlFlow");
				effects.enter("htmlFlowData");
				effects.consume(code);
				return open;
			}
			/**
			* After `<`, at tag name or other stuff.
			*
			* ```markdown
			* > | <x />
			*      ^
			* > | <!doctype>
			*      ^
			* > | <!--xxx-->
			*      ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 33) {
					effects.consume(code);
					return declarationOpen;
				}
				if (code === 47) {
					effects.consume(code);
					closingTag = true;
					return tagCloseStart;
				}
				if (code === 63) {
					effects.consume(code);
					marker = 3;
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					buffer = String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* After `<!`, at declaration, comment, or CDATA.
			*
			* ```markdown
			* > | <!doctype>
			*       ^
			* > | <!--xxx-->
			*       ^
			* > | <![CDATA[>&<]]>
			*       ^
			* ```
			*
			* @type {State}
			*/
			function declarationOpen(code) {
				if (code === 45) {
					effects.consume(code);
					marker = 2;
					return commentOpenInside;
				}
				if (code === 91) {
					effects.consume(code);
					marker = 5;
					index = 0;
					return cdataOpenInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					marker = 4;
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				return nok(code);
			}
			/**
			* After `<!-`, inside a comment, at another `-`.
			*
			* ```markdown
			* > | <!--xxx-->
			*        ^
			* ```
			*
			* @type {State}
			*/
			function commentOpenInside(code) {
				if (code === 45) {
					effects.consume(code);
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				return nok(code);
			}
			/**
			* After `<![`, inside CDATA, expecting `CDATA[`.
			*
			* ```markdown
			* > | <![CDATA[>&<]]>
			*        ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function cdataOpenInside(code) {
				if (code === "CDATA[".charCodeAt(index++)) {
					effects.consume(code);
					if (index === 6) return self.interrupt ? ok : continuation;
					return cdataOpenInside;
				}
				return nok(code);
			}
			/**
			* After `</`, in closing tag, at tag name.
			*
			* ```markdown
			* > | </x>
			*       ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseStart(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					buffer = String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* In tag name.
			*
			* ```markdown
			* > | <ab>
			*      ^^
			* > | </ab>
			*       ^^
			* ```
			*
			* @type {State}
			*/
			function tagName(code) {
				if (code === null || code === 47 || code === 62 || markdownLineEndingOrSpace(code)) {
					const slash = code === 47;
					const name = buffer.toLowerCase();
					if (!slash && !closingTag && htmlRawNames.includes(name)) {
						marker = 1;
						return self.interrupt ? ok(code) : continuation(code);
					}
					if (htmlBlockNames.includes(buffer.toLowerCase())) {
						marker = 6;
						if (slash) {
							effects.consume(code);
							return basicSelfClosing;
						}
						return self.interrupt ? ok(code) : continuation(code);
					}
					marker = 7;
					return self.interrupt && !self.parser.lazy[self.now().line] ? nok(code) : closingTag ? completeClosingTagAfter(code) : completeAttributeNameBefore(code);
				}
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					buffer += String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* After closing slash of a basic tag name.
			*
			* ```markdown
			* > | <div/>
			*          ^
			* ```
			*
			* @type {State}
			*/
			function basicSelfClosing(code) {
				if (code === 62) {
					effects.consume(code);
					return self.interrupt ? ok : continuation;
				}
				return nok(code);
			}
			/**
			* After closing slash of a complete tag name.
			*
			* ```markdown
			* > | <x/>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeClosingTagAfter(code) {
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeClosingTagAfter;
				}
				return completeEnd(code);
			}
			/**
			* At an attribute name.
			*
			* At first, this state is used after a complete tag name, after whitespace,
			* where it expects optional attributes or the end of the tag.
			* It is also reused after attributes, when expecting more optional
			* attributes.
			*
			* ```markdown
			* > | <a />
			*        ^
			* > | <a :b>
			*        ^
			* > | <a _b>
			*        ^
			* > | <a b>
			*        ^
			* > | <a >
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeNameBefore(code) {
				if (code === 47) {
					effects.consume(code);
					return completeEnd;
				}
				if (code === 58 || code === 95 || asciiAlpha(code)) {
					effects.consume(code);
					return completeAttributeName;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeNameBefore;
				}
				return completeEnd(code);
			}
			/**
			* In attribute name.
			*
			* ```markdown
			* > | <a :b>
			*         ^
			* > | <a _b>
			*         ^
			* > | <a b>
			*         ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeName(code) {
				if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return completeAttributeName;
				}
				return completeAttributeNameAfter(code);
			}
			/**
			* After attribute name, at an optional initializer, the end of the tag, or
			* whitespace.
			*
			* ```markdown
			* > | <a b>
			*         ^
			* > | <a b=c>
			*         ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeNameAfter(code) {
				if (code === 61) {
					effects.consume(code);
					return completeAttributeValueBefore;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeNameAfter;
				}
				return completeAttributeNameBefore(code);
			}
			/**
			* Before unquoted, double quoted, or single quoted attribute value, allowing
			* whitespace.
			*
			* ```markdown
			* > | <a b=c>
			*          ^
			* > | <a b="c">
			*          ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueBefore(code) {
				if (code === null || code === 60 || code === 61 || code === 62 || code === 96) return nok(code);
				if (code === 34 || code === 39) {
					effects.consume(code);
					markerB = code;
					return completeAttributeValueQuoted;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeValueBefore;
				}
				return completeAttributeValueUnquoted(code);
			}
			/**
			* In double or single quoted attribute value.
			*
			* ```markdown
			* > | <a b="c">
			*           ^
			* > | <a b='c'>
			*           ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueQuoted(code) {
				if (code === markerB) {
					effects.consume(code);
					markerB = null;
					return completeAttributeValueQuotedAfter;
				}
				if (code === null || markdownLineEnding(code)) return nok(code);
				effects.consume(code);
				return completeAttributeValueQuoted;
			}
			/**
			* In unquoted attribute value.
			*
			* ```markdown
			* > | <a b=c>
			*          ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueUnquoted(code) {
				if (code === null || code === 34 || code === 39 || code === 47 || code === 60 || code === 61 || code === 62 || code === 96 || markdownLineEndingOrSpace(code)) return completeAttributeNameAfter(code);
				effects.consume(code);
				return completeAttributeValueUnquoted;
			}
			/**
			* After double or single quoted attribute value, before whitespace or the
			* end of the tag.
			*
			* ```markdown
			* > | <a b="c">
			*            ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueQuotedAfter(code) {
				if (code === 47 || code === 62 || markdownSpace(code)) return completeAttributeNameBefore(code);
				return nok(code);
			}
			/**
			* In certain circumstances of a complete tag where only an `>` is allowed.
			*
			* ```markdown
			* > | <a b="c">
			*             ^
			* ```
			*
			* @type {State}
			*/
			function completeEnd(code) {
				if (code === 62) {
					effects.consume(code);
					return completeAfter;
				}
				return nok(code);
			}
			/**
			* After `>` in a complete tag.
			*
			* ```markdown
			* > | <x>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeAfter(code) {
				if (code === null || markdownLineEnding(code)) return continuation(code);
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAfter;
				}
				return nok(code);
			}
			/**
			* In continuation of any HTML kind.
			*
			* ```markdown
			* > | <!--xxx-->
			*          ^
			* ```
			*
			* @type {State}
			*/
			function continuation(code) {
				if (code === 45 && marker === 2) {
					effects.consume(code);
					return continuationCommentInside;
				}
				if (code === 60 && marker === 1) {
					effects.consume(code);
					return continuationRawTagOpen;
				}
				if (code === 62 && marker === 4) {
					effects.consume(code);
					return continuationClose;
				}
				if (code === 63 && marker === 3) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				if (code === 93 && marker === 5) {
					effects.consume(code);
					return continuationCdataInside;
				}
				if (markdownLineEnding(code) && (marker === 6 || marker === 7)) {
					effects.exit("htmlFlowData");
					return effects.check(blankLineBefore, continuationAfter, continuationStart)(code);
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("htmlFlowData");
					return continuationStart(code);
				}
				effects.consume(code);
				return continuation;
			}
			/**
			* In continuation, at eol.
			*
			* ```markdown
			* > | <x>
			*        ^
			*   | asd
			* ```
			*
			* @type {State}
			*/
			function continuationStart(code) {
				return effects.check(nonLazyContinuationStart, continuationStartNonLazy, continuationAfter)(code);
			}
			/**
			* In continuation, at eol, before non-lazy content.
			*
			* ```markdown
			* > | <x>
			*        ^
			*   | asd
			* ```
			*
			* @type {State}
			*/
			function continuationStartNonLazy(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return continuationBefore;
			}
			/**
			* In continuation, before non-lazy content.
			*
			* ```markdown
			*   | <x>
			* > | asd
			*     ^
			* ```
			*
			* @type {State}
			*/
			function continuationBefore(code) {
				if (code === null || markdownLineEnding(code)) return continuationStart(code);
				effects.enter("htmlFlowData");
				return continuation(code);
			}
			/**
			* In comment continuation, after one `-`, expecting another.
			*
			* ```markdown
			* > | <!--xxx-->
			*             ^
			* ```
			*
			* @type {State}
			*/
			function continuationCommentInside(code) {
				if (code === 45) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In raw continuation, after `<`, at `/`.
			*
			* ```markdown
			* > | <script>console.log(1)<\/script>
			*                            ^
			* ```
			*
			* @type {State}
			*/
			function continuationRawTagOpen(code) {
				if (code === 47) {
					effects.consume(code);
					buffer = "";
					return continuationRawEndTag;
				}
				return continuation(code);
			}
			/**
			* In raw continuation, after `</`, in a raw tag name.
			*
			* ```markdown
			* > | <script>console.log(1)<\/script>
			*                             ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function continuationRawEndTag(code) {
				if (code === 62) {
					const name = buffer.toLowerCase();
					if (htmlRawNames.includes(name)) {
						effects.consume(code);
						return continuationClose;
					}
					return continuation(code);
				}
				if (asciiAlpha(code) && buffer.length < 8) {
					effects.consume(code);
					buffer += String.fromCharCode(code);
					return continuationRawEndTag;
				}
				return continuation(code);
			}
			/**
			* In cdata continuation, after `]`, expecting `]>`.
			*
			* ```markdown
			* > | <![CDATA[>&<]]>
			*                  ^
			* ```
			*
			* @type {State}
			*/
			function continuationCdataInside(code) {
				if (code === 93) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In declaration or instruction continuation, at `>`.
			*
			* ```markdown
			* > | <!-->
			*         ^
			* > | <?>
			*       ^
			* > | <!q>
			*        ^
			* > | <!--ab-->
			*             ^
			* > | <![CDATA[>&<]]>
			*                   ^
			* ```
			*
			* @type {State}
			*/
			function continuationDeclarationInside(code) {
				if (code === 62) {
					effects.consume(code);
					return continuationClose;
				}
				if (code === 45 && marker === 2) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In closed continuation: everything we get until the eol/eof is part of it.
			*
			* ```markdown
			* > | <!doctype>
			*               ^
			* ```
			*
			* @type {State}
			*/
			function continuationClose(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("htmlFlowData");
					return continuationAfter(code);
				}
				effects.consume(code);
				return continuationClose;
			}
			/**
			* Done.
			*
			* ```markdown
			* > | <!doctype>
			*               ^
			* ```
			*
			* @type {State}
			*/
			function continuationAfter(code) {
				effects.exit("htmlFlow");
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeNonLazyContinuationStart(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* At eol, before continuation.
			*
			* ```markdown
			* > | * ```js
			*            ^
			*   | b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return after;
				}
				return nok(code);
			}
			/**
			* A continuation.
			*
			* ```markdown
			*   | * ```js
			* > | b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlankLineBefore(effects, ok, nok) {
			return start;
			/**
			* Before eol, expecting blank line.
			*
			* ```markdown
			* > | <div>
			*          ^
			*   |
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return effects.attempt(blankLine, ok, nok);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/html-text.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const htmlText = {
			name: "htmlText",
			tokenize: tokenizeHtmlText
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHtmlText(effects, ok, nok) {
			const self = this;
			/** @type {NonNullable<Code> | undefined} */
			let marker;
			/** @type {number} */
			let index;
			/** @type {State} */
			let returnState;
			return start;
			/**
			* Start of HTML (text).
			*
			* ```markdown
			* > | a <b> c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("htmlText");
				effects.enter("htmlTextData");
				effects.consume(code);
				return open;
			}
			/**
			* After `<`, at tag name or other stuff.
			*
			* ```markdown
			* > | a <b> c
			*        ^
			* > | a <!doctype> c
			*        ^
			* > | a <!--b--> c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 33) {
					effects.consume(code);
					return declarationOpen;
				}
				if (code === 47) {
					effects.consume(code);
					return tagCloseStart;
				}
				if (code === 63) {
					effects.consume(code);
					return instruction;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return tagOpen;
				}
				return nok(code);
			}
			/**
			* After `<!`, at declaration, comment, or CDATA.
			*
			* ```markdown
			* > | a <!doctype> c
			*         ^
			* > | a <!--b--> c
			*         ^
			* > | a <![CDATA[>&<]]> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function declarationOpen(code) {
				if (code === 45) {
					effects.consume(code);
					return commentOpenInside;
				}
				if (code === 91) {
					effects.consume(code);
					index = 0;
					return cdataOpenInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return declaration;
				}
				return nok(code);
			}
			/**
			* In a comment, after `<!-`, at another `-`.
			*
			* ```markdown
			* > | a <!--b--> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function commentOpenInside(code) {
				if (code === 45) {
					effects.consume(code);
					return commentEnd;
				}
				return nok(code);
			}
			/**
			* In comment.
			*
			* ```markdown
			* > | a <!--b--> c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function comment(code) {
				if (code === null) return nok(code);
				if (code === 45) {
					effects.consume(code);
					return commentClose;
				}
				if (markdownLineEnding(code)) {
					returnState = comment;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return comment;
			}
			/**
			* In comment, after `-`.
			*
			* ```markdown
			* > | a <!--b--> c
			*             ^
			* ```
			*
			* @type {State}
			*/
			function commentClose(code) {
				if (code === 45) {
					effects.consume(code);
					return commentEnd;
				}
				return comment(code);
			}
			/**
			* In comment, after `--`.
			*
			* ```markdown
			* > | a <!--b--> c
			*              ^
			* ```
			*
			* @type {State}
			*/
			function commentEnd(code) {
				return code === 62 ? end(code) : code === 45 ? commentClose(code) : comment(code);
			}
			/**
			* After `<![`, in CDATA, expecting `CDATA[`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*          ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function cdataOpenInside(code) {
				if (code === "CDATA[".charCodeAt(index++)) {
					effects.consume(code);
					return index === 6 ? cdata : cdataOpenInside;
				}
				return nok(code);
			}
			/**
			* In CDATA.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                ^^^
			* ```
			*
			* @type {State}
			*/
			function cdata(code) {
				if (code === null) return nok(code);
				if (code === 93) {
					effects.consume(code);
					return cdataClose;
				}
				if (markdownLineEnding(code)) {
					returnState = cdata;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return cdata;
			}
			/**
			* In CDATA, after `]`, at another `]`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function cdataClose(code) {
				if (code === 93) {
					effects.consume(code);
					return cdataEnd;
				}
				return cdata(code);
			}
			/**
			* In CDATA, after `]]`, at `>`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                     ^
			* ```
			*
			* @type {State}
			*/
			function cdataEnd(code) {
				if (code === 62) return end(code);
				if (code === 93) {
					effects.consume(code);
					return cdataEnd;
				}
				return cdata(code);
			}
			/**
			* In declaration.
			*
			* ```markdown
			* > | a <!b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function declaration(code) {
				if (code === null || code === 62) return end(code);
				if (markdownLineEnding(code)) {
					returnState = declaration;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return declaration;
			}
			/**
			* In instruction.
			*
			* ```markdown
			* > | a <?b?> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function instruction(code) {
				if (code === null) return nok(code);
				if (code === 63) {
					effects.consume(code);
					return instructionClose;
				}
				if (markdownLineEnding(code)) {
					returnState = instruction;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return instruction;
			}
			/**
			* In instruction, after `?`, at `>`.
			*
			* ```markdown
			* > | a <?b?> c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function instructionClose(code) {
				return code === 62 ? end(code) : instruction(code);
			}
			/**
			* After `</`, in closing tag, at tag name.
			*
			* ```markdown
			* > | a </b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseStart(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					return tagClose;
				}
				return nok(code);
			}
			/**
			* After `</x`, in a tag name.
			*
			* ```markdown
			* > | a </b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagClose(code) {
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagClose;
				}
				return tagCloseBetween(code);
			}
			/**
			* In closing tag, after tag name.
			*
			* ```markdown
			* > | a </b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseBetween(code) {
				if (markdownLineEnding(code)) {
					returnState = tagCloseBetween;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagCloseBetween;
				}
				return end(code);
			}
			/**
			* After `<x`, in opening tag name.
			*
			* ```markdown
			* > | a <b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagOpen(code) {
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagOpen;
				}
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				return nok(code);
			}
			/**
			* In opening tag, after tag name.
			*
			* ```markdown
			* > | a <b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenBetween(code) {
				if (code === 47) {
					effects.consume(code);
					return end;
				}
				if (code === 58 || code === 95 || asciiAlpha(code)) {
					effects.consume(code);
					return tagOpenAttributeName;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenBetween;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenBetween;
				}
				return end(code);
			}
			/**
			* In attribute name.
			*
			* ```markdown
			* > | a <b c> d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeName(code) {
				if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagOpenAttributeName;
				}
				return tagOpenAttributeNameAfter(code);
			}
			/**
			* After attribute name, before initializer, the end of the tag, or
			* whitespace.
			*
			* ```markdown
			* > | a <b c> d
			*           ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeNameAfter(code) {
				if (code === 61) {
					effects.consume(code);
					return tagOpenAttributeValueBefore;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeNameAfter;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenAttributeNameAfter;
				}
				return tagOpenBetween(code);
			}
			/**
			* Before unquoted, double quoted, or single quoted attribute value, allowing
			* whitespace.
			*
			* ```markdown
			* > | a <b c=d> e
			*            ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueBefore(code) {
				if (code === null || code === 60 || code === 61 || code === 62 || code === 96) return nok(code);
				if (code === 34 || code === 39) {
					effects.consume(code);
					marker = code;
					return tagOpenAttributeValueQuoted;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeValueBefore;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenAttributeValueBefore;
				}
				effects.consume(code);
				return tagOpenAttributeValueUnquoted;
			}
			/**
			* In double or single quoted attribute value.
			*
			* ```markdown
			* > | a <b c="d"> e
			*             ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueQuoted(code) {
				if (code === marker) {
					effects.consume(code);
					marker = void 0;
					return tagOpenAttributeValueQuotedAfter;
				}
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeValueQuoted;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return tagOpenAttributeValueQuoted;
			}
			/**
			* In unquoted attribute value.
			*
			* ```markdown
			* > | a <b c=d> e
			*            ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueUnquoted(code) {
				if (code === null || code === 34 || code === 39 || code === 60 || code === 61 || code === 96) return nok(code);
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				effects.consume(code);
				return tagOpenAttributeValueUnquoted;
			}
			/**
			* After double or single quoted attribute value, before whitespace or the end
			* of the tag.
			*
			* ```markdown
			* > | a <b c="d"> e
			*               ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueQuotedAfter(code) {
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				return nok(code);
			}
			/**
			* In certain circumstances of a tag where only an `>` is allowed.
			*
			* ```markdown
			* > | a <b c="d"> e
			*               ^
			* ```
			*
			* @type {State}
			*/
			function end(code) {
				if (code === 62) {
					effects.consume(code);
					effects.exit("htmlTextData");
					effects.exit("htmlText");
					return ok;
				}
				return nok(code);
			}
			/**
			* At eol.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			* > | a <!--a
			*            ^
			*   | b-->
			* ```
			*
			* @type {State}
			*/
			function lineEndingBefore(code) {
				effects.exit("htmlTextData");
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return lineEndingAfter;
			}
			/**
			* After eol, at optional whitespace.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			*   | a <!--a
			* > | b-->
			*     ^
			* ```
			*
			* @type {State}
			*/
			function lineEndingAfter(code) {
				return markdownSpace(code) ? factorySpace(effects, lineEndingAfterPrefix, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : lineEndingAfterPrefix(code);
			}
			/**
			* After eol, after optional whitespace.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			*   | a <!--a
			* > | b-->
			*     ^
			* ```
			*
			* @type {State}
			*/
			function lineEndingAfterPrefix(code) {
				effects.enter("htmlTextData");
				return returnState(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/label-end.js
		/**
		* @import {
		*   Construct,
		*   Event,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelEnd = {
			name: "labelEnd",
			resolveAll: resolveAllLabelEnd,
			resolveTo: resolveToLabelEnd,
			tokenize: tokenizeLabelEnd
		};
		/** @type {Construct} */
		const resourceConstruct = { tokenize: tokenizeResource };
		/** @type {Construct} */
		const referenceFullConstruct = { tokenize: tokenizeReferenceFull };
		/** @type {Construct} */
		const referenceCollapsedConstruct = { tokenize: tokenizeReferenceCollapsed };
		/** @type {Resolver} */
		function resolveAllLabelEnd(events) {
			let index = -1;
			/** @type {Array<Event>} */
			const newEvents = [];
			while (++index < events.length) {
				const token = events[index][1];
				newEvents.push(events[index]);
				if (token.type === "labelImage" || token.type === "labelLink" || token.type === "labelEnd") {
					const offset = token.type === "labelImage" ? 4 : 2;
					token.type = "data";
					index += offset;
				}
			}
			if (events.length !== newEvents.length) splice(events, 0, events.length, newEvents);
			return events;
		}
		/** @type {Resolver} */
		function resolveToLabelEnd(events, context) {
			let index = events.length;
			let offset = 0;
			/** @type {Token} */
			let token;
			/** @type {number | undefined} */
			let open;
			/** @type {number | undefined} */
			let close;
			/** @type {Array<Event>} */
			let media;
			while (index--) {
				token = events[index][1];
				if (open) {
					if (token.type === "link" || token.type === "labelLink" && token._inactive) break;
					if (events[index][0] === "enter" && token.type === "labelLink") token._inactive = true;
				} else if (close) {
					if (events[index][0] === "enter" && (token.type === "labelImage" || token.type === "labelLink") && !token._balanced) {
						open = index;
						if (token.type !== "labelLink") {
							offset = 2;
							break;
						}
					}
				} else if (token.type === "labelEnd") close = index;
			}
			const group = {
				type: events[open][1].type === "labelLink" ? "link" : "image",
				start: { ...events[open][1].start },
				end: { ...events[events.length - 1][1].end }
			};
			const label = {
				type: "label",
				start: { ...events[open][1].start },
				end: { ...events[close][1].end }
			};
			const text = {
				type: "labelText",
				start: { ...events[open + offset + 2][1].end },
				end: { ...events[close - 2][1].start }
			};
			media = [[
				"enter",
				group,
				context
			], [
				"enter",
				label,
				context
			]];
			media = push(media, events.slice(open + 1, open + offset + 3));
			media = push(media, [[
				"enter",
				text,
				context
			]]);
			media = push(media, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + offset + 4, close - 3), context));
			media = push(media, [
				[
					"exit",
					text,
					context
				],
				events[close - 2],
				events[close - 1],
				[
					"exit",
					label,
					context
				]
			]);
			media = push(media, events.slice(close + 1));
			media = push(media, [[
				"exit",
				group,
				context
			]]);
			splice(events, open, events.length, media);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelEnd(effects, ok, nok) {
			const self = this;
			let index = self.events.length;
			/** @type {Token} */
			let labelStart;
			/** @type {boolean} */
			let defined;
			while (index--) if ((self.events[index][1].type === "labelImage" || self.events[index][1].type === "labelLink") && !self.events[index][1]._balanced) {
				labelStart = self.events[index][1];
				break;
			}
			return start;
			/**
			* Start of label end.
			*
			* ```markdown
			* > | [a](b) c
			*       ^
			* > | [a][b] c
			*       ^
			* > | [a][] b
			*       ^
			* > | [a] b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (!labelStart) return nok(code);
				if (labelStart._inactive) return labelEndNok(code);
				defined = self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize({
					start: labelStart.end,
					end: self.now()
				})));
				effects.enter("labelEnd");
				effects.enter("labelMarker");
				effects.consume(code);
				effects.exit("labelMarker");
				effects.exit("labelEnd");
				return after;
			}
			/**
			* After `]`.
			*
			* ```markdown
			* > | [a](b) c
			*       ^
			* > | [a][b] c
			*       ^
			* > | [a][] b
			*       ^
			* > | [a] b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (code === 40) return effects.attempt(resourceConstruct, labelEndOk, defined ? labelEndOk : labelEndNok)(code);
				if (code === 91) return effects.attempt(referenceFullConstruct, labelEndOk, defined ? referenceNotFull : labelEndNok)(code);
				return defined ? labelEndOk(code) : labelEndNok(code);
			}
			/**
			* After `]`, at `[`, but not at a full reference.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] b
			*        ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceNotFull(code) {
				return effects.attempt(referenceCollapsedConstruct, labelEndOk, labelEndNok)(code);
			}
			/**
			* Done, we found something.
			*
			* ```markdown
			* > | [a](b) c
			*           ^
			* > | [a][b] c
			*           ^
			* > | [a][] b
			*          ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEndOk(code) {
				return ok(code);
			}
			/**
			* Done, it’s nothing.
			*
			* There was an okay opening, but we didn’t match anything.
			*
			* ```markdown
			* > | [a](b c
			*        ^
			* > | [a][b c
			*        ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEndNok(code) {
				labelStart._balanced = true;
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeResource(effects, ok, nok) {
			return resourceStart;
			/**
			* At a resource.
			*
			* ```markdown
			* > | [a](b) c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function resourceStart(code) {
				effects.enter("resource");
				effects.enter("resourceMarker");
				effects.consume(code);
				effects.exit("resourceMarker");
				return resourceBefore;
			}
			/**
			* In resource, after `(`, at optional whitespace.
			*
			* ```markdown
			* > | [a](b) c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceBefore(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceOpen)(code) : resourceOpen(code);
			}
			/**
			* In resource, after optional whitespace, at `)` or a destination.
			*
			* ```markdown
			* > | [a](b) c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceOpen(code) {
				if (code === 41) return resourceEnd(code);
				return factoryDestination(effects, resourceDestinationAfter, resourceDestinationMissing, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(code);
			}
			/**
			* In resource, after destination, at optional whitespace.
			*
			* ```markdown
			* > | [a](b) c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function resourceDestinationAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceBetween)(code) : resourceEnd(code);
			}
			/**
			* At invalid destination.
			*
			* ```markdown
			* > | [a](<<) b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceDestinationMissing(code) {
				return nok(code);
			}
			/**
			* In resource, after destination and whitespace, at `(` or title.
			*
			* ```markdown
			* > | [a](b ) c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function resourceBetween(code) {
				if (code === 34 || code === 39 || code === 40) return factoryTitle(effects, resourceTitleAfter, nok, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(code);
				return resourceEnd(code);
			}
			/**
			* In resource, after title, at optional whitespace.
			*
			* ```markdown
			* > | [a](b "c") d
			*              ^
			* ```
			*
			* @type {State}
			*/
			function resourceTitleAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceEnd)(code) : resourceEnd(code);
			}
			/**
			* In resource, at `)`.
			*
			* ```markdown
			* > | [a](b) d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function resourceEnd(code) {
				if (code === 41) {
					effects.enter("resourceMarker");
					effects.consume(code);
					effects.exit("resourceMarker");
					effects.exit("resource");
					return ok;
				}
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeReferenceFull(effects, ok, nok) {
			const self = this;
			return referenceFull;
			/**
			* In a reference (full), at the `[`.
			*
			* ```markdown
			* > | [a][b] d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceFull(code) {
				return factoryLabel.call(self, effects, referenceFullAfter, referenceFullMissing, "reference", "referenceMarker", "referenceString")(code);
			}
			/**
			* In a reference (full), after `]`.
			*
			* ```markdown
			* > | [a][b] d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function referenceFullAfter(code) {
				return self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1))) ? ok(code) : nok(code);
			}
			/**
			* In reference (full) that was missing.
			*
			* ```markdown
			* > | [a][b d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceFullMissing(code) {
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeReferenceCollapsed(effects, ok, nok) {
			return referenceCollapsedStart;
			/**
			* In reference (collapsed), at `[`.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceCollapsedStart(code) {
				effects.enter("reference");
				effects.enter("referenceMarker");
				effects.consume(code);
				effects.exit("referenceMarker");
				return referenceCollapsedOpen;
			}
			/**
			* In reference (collapsed), at `]`.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] d
			*         ^
			* ```
			*
			*  @type {State}
			*/
			function referenceCollapsedOpen(code) {
				if (code === 93) {
					effects.enter("referenceMarker");
					effects.consume(code);
					effects.exit("referenceMarker");
					effects.exit("reference");
					return ok;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/label-start-image.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelStartImage = {
			name: "labelStartImage",
			resolveAll: labelEnd.resolveAll,
			tokenize: tokenizeLabelStartImage
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelStartImage(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* Start of label (image) start.
			*
			* ```markdown
			* > | a ![b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("labelImage");
				effects.enter("labelImageMarker");
				effects.consume(code);
				effects.exit("labelImageMarker");
				return open;
			}
			/**
			* After `!`, at `[`.
			*
			* ```markdown
			* > | a ![b] c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 91) {
					effects.enter("labelMarker");
					effects.consume(code);
					effects.exit("labelMarker");
					effects.exit("labelImage");
					return after;
				}
				return nok(code);
			}
			/**
			* After `![`.
			*
			* ```markdown
			* > | a ![b] c
			*         ^
			* ```
			*
			* This is needed in because, when GFM footnotes are enabled, images never
			* form when started with a `^`.
			* Instead, links form:
			*
			* ```markdown
			* ![^a](b)
			*
			* ![^a][b]
			*
			* [b]: c
			* ```
			*
			* ```html
			* <p>!<a href=\"b\">^a</a></p>
			* <p>!<a href=\"c\">^a</a></p>
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				/* c8 ignore next 3 */
				return code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/label-start-link.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelStartLink = {
			name: "labelStartLink",
			resolveAll: labelEnd.resolveAll,
			tokenize: tokenizeLabelStartLink
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelStartLink(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* Start of label (link) start.
			*
			* ```markdown
			* > | a [b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("labelLink");
				effects.enter("labelMarker");
				effects.consume(code);
				effects.exit("labelMarker");
				effects.exit("labelLink");
				return after;
			}
			/** @type {State} */
			function after(code) {
				/* c8 ignore next 3 */
				return code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/line-ending.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const lineEnding = {
			name: "lineEnding",
			tokenize: tokenizeLineEnding
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLineEnding(effects, ok) {
			return start;
			/** @type {State} */
			function start(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, ok, "linePrefix");
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/thematic-break.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const thematicBreak = {
			name: "thematicBreak",
			tokenize: tokenizeThematicBreak
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeThematicBreak(effects, ok, nok) {
			let size = 0;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of thematic break.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("thematicBreak");
				return before(code);
			}
			/**
			* After optional whitespace, at marker.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				marker = code;
				return atBreak(code);
			}
			/**
			* After something, before something else.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === marker) {
					effects.enter("thematicBreakSequence");
					return sequence(code);
				}
				if (size >= 3 && (code === null || markdownLineEnding(code))) {
					effects.exit("thematicBreak");
					return ok(code);
				}
				return nok(code);
			}
			/**
			* In sequence.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequence(code) {
				if (code === marker) {
					effects.consume(code);
					size++;
					return sequence;
				}
				effects.exit("thematicBreakSequence");
				return markdownSpace(code) ? factorySpace(effects, atBreak, "whitespace")(code) : atBreak(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/list.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Exiter,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const list = {
			continuation: { tokenize: tokenizeListContinuation },
			exit: tokenizeListEnd,
			name: "list",
			tokenize: tokenizeListStart
		};
		/** @type {Construct} */
		const listItemPrefixWhitespaceConstruct = {
			partial: true,
			tokenize: tokenizeListItemPrefixWhitespace
		};
		/** @type {Construct} */
		const indentConstruct = {
			partial: true,
			tokenize: tokenizeIndent$1
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListStart(effects, ok, nok) {
			const self = this;
			const tail = self.events[self.events.length - 1];
			let initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
			let size = 0;
			return start;
			/** @type {State} */
			function start(code) {
				const kind = self.containerState.type || (code === 42 || code === 43 || code === 45 ? "listUnordered" : "listOrdered");
				if (kind === "listUnordered" ? !self.containerState.marker || code === self.containerState.marker : asciiDigit(code)) {
					if (!self.containerState.type) {
						self.containerState.type = kind;
						effects.enter(kind, { _container: true });
					}
					if (kind === "listUnordered") {
						effects.enter("listItemPrefix");
						return code === 42 || code === 45 ? effects.check(thematicBreak, nok, atMarker)(code) : atMarker(code);
					}
					if (!self.interrupt || code === 49) {
						effects.enter("listItemPrefix");
						effects.enter("listItemValue");
						return inside(code);
					}
				}
				return nok(code);
			}
			/** @type {State} */
			function inside(code) {
				if (asciiDigit(code) && ++size < 10) {
					effects.consume(code);
					return inside;
				}
				if ((!self.interrupt || size < 2) && (self.containerState.marker ? code === self.containerState.marker : code === 41 || code === 46)) {
					effects.exit("listItemValue");
					return atMarker(code);
				}
				return nok(code);
			}
			/**
			* @type {State}
			**/
			function atMarker(code) {
				effects.enter("listItemMarker");
				effects.consume(code);
				effects.exit("listItemMarker");
				self.containerState.marker = self.containerState.marker || code;
				return effects.check(blankLine, self.interrupt ? nok : onBlank, effects.attempt(listItemPrefixWhitespaceConstruct, endOfPrefix, otherPrefix));
			}
			/** @type {State} */
			function onBlank(code) {
				self.containerState.initialBlankLine = true;
				initialSize++;
				return endOfPrefix(code);
			}
			/** @type {State} */
			function otherPrefix(code) {
				if (markdownSpace(code)) {
					effects.enter("listItemPrefixWhitespace");
					effects.consume(code);
					effects.exit("listItemPrefixWhitespace");
					return endOfPrefix;
				}
				return nok(code);
			}
			/** @type {State} */
			function endOfPrefix(code) {
				self.containerState.size = initialSize + self.sliceSerialize(effects.exit("listItemPrefix"), true).length;
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListContinuation(effects, ok, nok) {
			const self = this;
			self.containerState._closeFlow = void 0;
			return effects.check(blankLine, onBlank, notBlank);
			/** @type {State} */
			function onBlank(code) {
				self.containerState.furtherBlankLines = self.containerState.furtherBlankLines || self.containerState.initialBlankLine;
				return factorySpace(effects, ok, "listItemIndent", self.containerState.size + 1)(code);
			}
			/** @type {State} */
			function notBlank(code) {
				if (self.containerState.furtherBlankLines || !markdownSpace(code)) {
					self.containerState.furtherBlankLines = void 0;
					self.containerState.initialBlankLine = void 0;
					return notInCurrentItem(code);
				}
				self.containerState.furtherBlankLines = void 0;
				self.containerState.initialBlankLine = void 0;
				return effects.attempt(indentConstruct, ok, notInCurrentItem)(code);
			}
			/** @type {State} */
			function notInCurrentItem(code) {
				self.containerState._closeFlow = true;
				self.interrupt = void 0;
				return factorySpace(effects, effects.attempt(list, ok, nok), "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeIndent$1(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "listItemIndent", self.containerState.size + 1);
			/** @type {State} */
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "listItemIndent" && tail[2].sliceSerialize(tail[1], true).length === self.containerState.size ? ok(code) : nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Exiter}
		*/
		function tokenizeListEnd(effects) {
			effects.exit(this.containerState.type);
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListItemPrefixWhitespace(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "listItemPrefixWhitespace", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
			/** @type {State} */
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return !markdownSpace(code) && tail && tail[1].type === "listItemPrefixWhitespace" ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/lib/setext-underline.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const setextUnderline = {
			name: "setextUnderline",
			resolveTo: resolveToSetextUnderline,
			tokenize: tokenizeSetextUnderline
		};
		/** @type {Resolver} */
		function resolveToSetextUnderline(events, context) {
			let index = events.length;
			/** @type {number | undefined} */
			let content;
			/** @type {number | undefined} */
			let text;
			/** @type {number | undefined} */
			let definition;
			while (index--) if (events[index][0] === "enter") {
				if (events[index][1].type === "content") {
					content = index;
					break;
				}
				if (events[index][1].type === "paragraph") text = index;
			} else {
				if (events[index][1].type === "content") events.splice(index, 1);
				if (!definition && events[index][1].type === "definition") definition = index;
			}
			const heading = {
				type: "setextHeading",
				start: { ...events[content][1].start },
				end: { ...events[events.length - 1][1].end }
			};
			events[text][1].type = "setextHeadingText";
			if (definition) {
				events.splice(text, 0, [
					"enter",
					heading,
					context
				]);
				events.splice(definition + 1, 0, [
					"exit",
					events[content][1],
					context
				]);
				events[content][1].end = { ...events[definition][1].end };
			} else events[content][1] = heading;
			events.push([
				"exit",
				heading,
				context
			]);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeSetextUnderline(effects, ok, nok) {
			const self = this;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* At start of heading (setext) underline.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				let index = self.events.length;
				/** @type {boolean | undefined} */
				let paragraph;
				while (index--) if (self.events[index][1].type !== "lineEnding" && self.events[index][1].type !== "linePrefix" && self.events[index][1].type !== "content") {
					paragraph = self.events[index][1].type === "paragraph";
					break;
				}
				if (!self.parser.lazy[self.now().line] && (self.interrupt || paragraph)) {
					effects.enter("setextHeadingLine");
					marker = code;
					return before(code);
				}
				return nok(code);
			}
			/**
			* After optional whitespace, at `-` or `=`.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("setextHeadingLineSequence");
				return inside(code);
			}
			/**
			* In sequence.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker) {
					effects.consume(code);
					return inside;
				}
				effects.exit("setextHeadingLineSequence");
				return markdownSpace(code) ? factorySpace(effects, after, "lineSuffix")(code) : after(code);
			}
			/**
			* After sequence, after optional whitespace.
			*
			* ```markdown
			*   | aa
			* > | ==
			*       ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("setextHeadingLine");
					return ok(code);
				}
				return nok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark@4.0.2/node_modules/micromark/lib/initialize/flow.js
		/**
		* @import {
		*   InitialConstruct,
		*   Initializer,
		*   State,
		*   TokenizeContext
		* } from 'micromark-util-types'
		*/
		/** @type {InitialConstruct} */
		const flow$1 = { tokenize: initializeFlow };
		/**
		* @this {TokenizeContext}
		*   Self.
		* @type {Initializer}
		*   Initializer.
		*/
		function initializeFlow(effects) {
			const self = this;
			const initial = effects.attempt(blankLine, atBlankEnding, effects.attempt(this.parser.constructs.flowInitial, afterConstruct, factorySpace(effects, effects.attempt(this.parser.constructs.flow, afterConstruct, effects.attempt(content, afterConstruct)), "linePrefix")));
			return initial;
			/** @type {State} */
			function atBlankEnding(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEndingBlank");
				effects.consume(code);
				effects.exit("lineEndingBlank");
				self.currentConstruct = void 0;
				return initial;
			}
			/** @type {State} */
			function afterConstruct(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				self.currentConstruct = void 0;
				return initial;
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark@4.0.2/node_modules/micromark/lib/initialize/text.js
		/**
		* @import {
		*   Code,
		*   InitialConstruct,
		*   Initializer,
		*   Resolver,
		*   State,
		*   TokenizeContext
		* } from 'micromark-util-types'
		*/
		const resolver = { resolveAll: createResolver() };
		const string$1 = initializeFactory("string");
		const text$2 = initializeFactory("text");
		/**
		* @param {'string' | 'text'} field
		*   Field.
		* @returns {InitialConstruct}
		*   Construct.
		*/
		function initializeFactory(field) {
			return {
				resolveAll: createResolver(field === "text" ? resolveAllLineSuffixes : void 0),
				tokenize: initializeText
			};
			/**
			* @this {TokenizeContext}
			*   Context.
			* @type {Initializer}
			*/
			function initializeText(effects) {
				const self = this;
				const constructs = this.parser.constructs[field];
				const text = effects.attempt(constructs, start, notText);
				return start;
				/** @type {State} */
				function start(code) {
					return atBreak(code) ? text(code) : notText(code);
				}
				/** @type {State} */
				function notText(code) {
					if (code === null) {
						effects.consume(code);
						return;
					}
					effects.enter("data");
					effects.consume(code);
					return data;
				}
				/** @type {State} */
				function data(code) {
					if (atBreak(code)) {
						effects.exit("data");
						return text(code);
					}
					effects.consume(code);
					return data;
				}
				/**
				* @param {Code} code
				*   Code.
				* @returns {boolean}
				*   Whether the code is a break.
				*/
				function atBreak(code) {
					if (code === null) return true;
					const list = constructs[code];
					let index = -1;
					if (list) while (++index < list.length) {
						const item = list[index];
						if (!item.previous || item.previous.call(self, self.previous)) return true;
					}
					return false;
				}
			}
		}
		/**
		* @param {Resolver | undefined} [extraResolver]
		*   Resolver.
		* @returns {Resolver}
		*   Resolver.
		*/
		function createResolver(extraResolver) {
			return resolveAllText;
			/** @type {Resolver} */
			function resolveAllText(events, context) {
				let index = -1;
				/** @type {number | undefined} */
				let enter;
				while (++index <= events.length) if (enter === void 0) {
					if (events[index] && events[index][1].type === "data") {
						enter = index;
						index++;
					}
				} else if (!events[index] || events[index][1].type !== "data") {
					if (index !== enter + 2) {
						events[enter][1].end = events[index - 1][1].end;
						events.splice(enter + 2, index - enter - 2);
						index = enter + 2;
					}
					enter = void 0;
				}
				return extraResolver ? extraResolver(events, context) : events;
			}
		}
		/**
		* A rather ugly set of instructions which again looks at chunks in the input
		* stream.
		* The reason to do this here is that it is *much* faster to parse in reverse.
		* And that we can’t hook into `null` to split the line suffix before an EOF.
		* To do: figure out if we can make this into a clean utility, or even in core.
		* As it will be useful for GFMs literal autolink extension (and maybe even
		* tables?)
		*
		* @type {Resolver}
		*/
		function resolveAllLineSuffixes(events, context) {
			let eventIndex = 0;
			while (++eventIndex <= events.length) if ((eventIndex === events.length || events[eventIndex][1].type === "lineEnding") && events[eventIndex - 1][1].type === "data") {
				const data = events[eventIndex - 1][1];
				const chunks = context.sliceStream(data);
				let index = chunks.length;
				let bufferIndex = -1;
				let size = 0;
				/** @type {boolean | undefined} */
				let tabs;
				while (index--) {
					const chunk = chunks[index];
					if (typeof chunk === "string") {
						bufferIndex = chunk.length;
						while (chunk.charCodeAt(bufferIndex - 1) === 32) {
							size++;
							bufferIndex--;
						}
						if (bufferIndex) break;
						bufferIndex = -1;
					} else if (chunk === -2) {
						tabs = true;
						size++;
					} else if (chunk === -1) {} else {
						index++;
						break;
					}
				}
				if (context._contentTypeTextTrailing && eventIndex === events.length) size = 0;
				if (size) {
					const token = {
						type: eventIndex === events.length || tabs || size < 2 ? "lineSuffix" : "hardBreakTrailing",
						start: {
							_bufferIndex: index ? bufferIndex : data.start._bufferIndex + bufferIndex,
							_index: data.start._index + index,
							line: data.end.line,
							column: data.end.column - size,
							offset: data.end.offset - size
						},
						end: { ...data.end }
					};
					data.end = { ...token.start };
					if (data.start.offset === data.end.offset) Object.assign(data, token);
					else {
						events.splice(eventIndex, 0, [
							"enter",
							token,
							context
						], [
							"exit",
							token,
							context
						]);
						eventIndex += 2;
					}
				}
				eventIndex++;
			}
			return events;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark@4.0.2/node_modules/micromark/lib/constructs.js
		/**
		* @import {Extension} from 'micromark-util-types'
		*/
		var constructs_exports = /* @__PURE__ */ __exportAll({
			attentionMarkers: () => attentionMarkers,
			contentInitial: () => contentInitial,
			disable: () => disable,
			document: () => document$1,
			flow: () => flow,
			flowInitial: () => flowInitial,
			insideSpan: () => insideSpan,
			string: () => string,
			text: () => text$1
		});
		/** @satisfies {Extension['document']} */
		const document$1 = {
			[42]: list,
			[43]: list,
			[45]: list,
			[48]: list,
			[49]: list,
			[50]: list,
			[51]: list,
			[52]: list,
			[53]: list,
			[54]: list,
			[55]: list,
			[56]: list,
			[57]: list,
			[62]: blockQuote
		};
		/** @satisfies {Extension['contentInitial']} */
		const contentInitial = { [91]: definition };
		/** @satisfies {Extension['flowInitial']} */
		const flowInitial = {
			[-2]: codeIndented,
			[-1]: codeIndented,
			[32]: codeIndented
		};
		/** @satisfies {Extension['flow']} */
		const flow = {
			[35]: headingAtx,
			[42]: thematicBreak,
			[45]: [setextUnderline, thematicBreak],
			[60]: htmlFlow,
			[61]: setextUnderline,
			[95]: thematicBreak,
			[96]: codeFenced,
			[126]: codeFenced
		};
		/** @satisfies {Extension['string']} */
		const string = {
			[38]: characterReference,
			[92]: characterEscape
		};
		/** @satisfies {Extension['text']} */
		const text$1 = {
			[-5]: lineEnding,
			[-4]: lineEnding,
			[-3]: lineEnding,
			[33]: labelStartImage,
			[38]: characterReference,
			[42]: attention,
			[60]: [autolink, htmlText],
			[91]: labelStartLink,
			[92]: [hardBreakEscape, characterEscape],
			[93]: labelEnd,
			[95]: attention,
			[96]: codeText
		};
		/** @satisfies {Extension['insideSpan']} */
		const insideSpan = { null: [attention, resolver] };
		/** @satisfies {Extension['attentionMarkers']} */
		const attentionMarkers = { null: [42, 95] };
		/** @satisfies {Extension['disable']} */
		const disable = { null: [] };
		//#endregion
		//#region ../../node_modules/.pnpm/micromark@4.0.2/node_modules/micromark/lib/create-tokenizer.js
		/**
		* @import {
		*   Chunk,
		*   Code,
		*   ConstructRecord,
		*   Construct,
		*   Effects,
		*   InitialConstruct,
		*   ParseContext,
		*   Point,
		*   State,
		*   TokenizeContext,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* @callback Restore
		*   Restore the state.
		* @returns {undefined}
		*   Nothing.
		*
		* @typedef Info
		*   Info.
		* @property {Restore} restore
		*   Restore.
		* @property {number} from
		*   From.
		*
		* @callback ReturnHandle
		*   Handle a successful run.
		* @param {Construct} construct
		*   Construct.
		* @param {Info} info
		*   Info.
		* @returns {undefined}
		*   Nothing.
		*/
		/**
		* Create a tokenizer.
		* Tokenizers deal with one type of data (e.g., containers, flow, text).
		* The parser is the object dealing with it all.
		* `initialize` works like other constructs, except that only its `tokenize`
		* function is used, in which case it doesn’t receive an `ok` or `nok`.
		* `from` can be given to set the point before the first character, although
		* when further lines are indented, they must be set with `defineSkip`.
		*
		* @param {ParseContext} parser
		*   Parser.
		* @param {InitialConstruct} initialize
		*   Construct.
		* @param {Omit<Point, '_bufferIndex' | '_index'> | undefined} [from]
		*   Point (optional).
		* @returns {TokenizeContext}
		*   Context.
		*/
		function createTokenizer(parser, initialize, from) {
			/** @type {Point} */
			let point = {
				_bufferIndex: -1,
				_index: 0,
				line: from && from.line || 1,
				column: from && from.column || 1,
				offset: from && from.offset || 0
			};
			/** @type {Record<string, number>} */
			const columnStart = {};
			/** @type {Array<Construct>} */
			const resolveAllConstructs = [];
			/** @type {Array<Chunk>} */
			let chunks = [];
			/** @type {Array<Token>} */
			let stack = [];
			/**
			* Tools used for tokenizing.
			*
			* @type {Effects}
			*/
			const effects = {
				attempt: constructFactory(onsuccessfulconstruct),
				check: constructFactory(onsuccessfulcheck),
				consume,
				enter,
				exit,
				interrupt: constructFactory(onsuccessfulcheck, { interrupt: true })
			};
			/**
			* State and tools for resolving and serializing.
			*
			* @type {TokenizeContext}
			*/
			const context = {
				code: null,
				containerState: {},
				defineSkip,
				events: [],
				now,
				parser,
				previous: null,
				sliceSerialize,
				sliceStream,
				write
			};
			/**
			* The state function.
			*
			* @type {State | undefined}
			*/
			let state = initialize.tokenize.call(context, effects);
			if (initialize.resolveAll) resolveAllConstructs.push(initialize);
			return context;
			/** @type {TokenizeContext['write']} */
			function write(slice) {
				chunks = push(chunks, slice);
				main();
				if (chunks[chunks.length - 1] !== null) return [];
				addResult(initialize, 0);
				context.events = resolveAll(resolveAllConstructs, context.events, context);
				return context.events;
			}
			/** @type {TokenizeContext['sliceSerialize']} */
			function sliceSerialize(token, expandTabs) {
				return serializeChunks(sliceStream(token), expandTabs);
			}
			/** @type {TokenizeContext['sliceStream']} */
			function sliceStream(token) {
				return sliceChunks(chunks, token);
			}
			/** @type {TokenizeContext['now']} */
			function now() {
				const { _bufferIndex, _index, line, column, offset } = point;
				return {
					_bufferIndex,
					_index,
					line,
					column,
					offset
				};
			}
			/** @type {TokenizeContext['defineSkip']} */
			function defineSkip(value) {
				columnStart[value.line] = value.column;
				accountForPotentialSkip();
			}
			/**
			* Main loop (note that `_index` and `_bufferIndex` in `point` are modified by
			* `consume`).
			* Here is where we walk through the chunks, which either include strings of
			* several characters, or numerical character codes.
			* The reason to do this in a loop instead of a call is so the stack can
			* drain.
			*
			* @returns {undefined}
			*   Nothing.
			*/
			function main() {
				/** @type {number} */
				let chunkIndex;
				while (point._index < chunks.length) {
					const chunk = chunks[point._index];
					if (typeof chunk === "string") {
						chunkIndex = point._index;
						if (point._bufferIndex < 0) point._bufferIndex = 0;
						while (point._index === chunkIndex && point._bufferIndex < chunk.length) go(chunk.charCodeAt(point._bufferIndex));
					} else go(chunk);
				}
			}
			/**
			* Deal with one code.
			*
			* @param {Code} code
			*   Code.
			* @returns {undefined}
			*   Nothing.
			*/
			function go(code) {
				state = state(code);
			}
			/** @type {Effects['consume']} */
			function consume(code) {
				if (markdownLineEnding(code)) {
					point.line++;
					point.column = 1;
					point.offset += code === -3 ? 2 : 1;
					accountForPotentialSkip();
				} else if (code !== -1) {
					point.column++;
					point.offset++;
				}
				if (point._bufferIndex < 0) point._index++;
				else {
					point._bufferIndex++;
					if (point._bufferIndex === chunks[point._index].length) {
						point._bufferIndex = -1;
						point._index++;
					}
				}
				context.previous = code;
			}
			/** @type {Effects['enter']} */
			function enter(type, fields) {
				/** @type {Token} */
				const token = fields || {};
				token.type = type;
				token.start = now();
				context.events.push([
					"enter",
					token,
					context
				]);
				stack.push(token);
				return token;
			}
			/** @type {Effects['exit']} */
			function exit(type) {
				const token = stack.pop();
				token.end = now();
				context.events.push([
					"exit",
					token,
					context
				]);
				return token;
			}
			/**
			* Use results.
			*
			* @type {ReturnHandle}
			*/
			function onsuccessfulconstruct(construct, info) {
				addResult(construct, info.from);
			}
			/**
			* Discard results.
			*
			* @type {ReturnHandle}
			*/
			function onsuccessfulcheck(_, info) {
				info.restore();
			}
			/**
			* Factory to attempt/check/interrupt.
			*
			* @param {ReturnHandle} onreturn
			*   Callback.
			* @param {{interrupt?: boolean | undefined} | undefined} [fields]
			*   Fields.
			*/
			function constructFactory(onreturn, fields) {
				return hook;
				/**
				* Handle either an object mapping codes to constructs, a list of
				* constructs, or a single construct.
				*
				* @param {Array<Construct> | ConstructRecord | Construct} constructs
				*   Constructs.
				* @param {State} returnState
				*   State.
				* @param {State | undefined} [bogusState]
				*   State.
				* @returns {State}
				*   State.
				*/
				function hook(constructs, returnState, bogusState) {
					/** @type {ReadonlyArray<Construct>} */
					let listOfConstructs;
					/** @type {number} */
					let constructIndex;
					/** @type {Construct} */
					let currentConstruct;
					/** @type {Info} */
					let info;
					return Array.isArray(constructs) ? handleListOfConstructs(constructs) : "tokenize" in constructs ? handleListOfConstructs([constructs]) : handleMapOfConstructs(constructs);
					/**
					* Handle a list of construct.
					*
					* @param {ConstructRecord} map
					*   Constructs.
					* @returns {State}
					*   State.
					*/
					function handleMapOfConstructs(map) {
						return start;
						/** @type {State} */
						function start(code) {
							const left = code !== null && map[code];
							const all = code !== null && map.null;
							return handleListOfConstructs([...Array.isArray(left) ? left : left ? [left] : [], ...Array.isArray(all) ? all : all ? [all] : []])(code);
						}
					}
					/**
					* Handle a list of construct.
					*
					* @param {ReadonlyArray<Construct>} list
					*   Constructs.
					* @returns {State}
					*   State.
					*/
					function handleListOfConstructs(list) {
						listOfConstructs = list;
						constructIndex = 0;
						if (list.length === 0) return bogusState;
						return handleConstruct(list[constructIndex]);
					}
					/**
					* Handle a single construct.
					*
					* @param {Construct} construct
					*   Construct.
					* @returns {State}
					*   State.
					*/
					function handleConstruct(construct) {
						return start;
						/** @type {State} */
						function start(code) {
							info = store();
							currentConstruct = construct;
							if (!construct.partial) context.currentConstruct = construct;
							if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) return nok(code);
							return construct.tokenize.call(fields ? Object.assign(Object.create(context), fields) : context, effects, ok, nok)(code);
						}
					}
					/** @type {State} */
					function ok(code) {
						onreturn(currentConstruct, info);
						return returnState;
					}
					/** @type {State} */
					function nok(code) {
						info.restore();
						if (++constructIndex < listOfConstructs.length) return handleConstruct(listOfConstructs[constructIndex]);
						return bogusState;
					}
				}
			}
			/**
			* @param {Construct} construct
			*   Construct.
			* @param {number} from
			*   From.
			* @returns {undefined}
			*   Nothing.
			*/
			function addResult(construct, from) {
				if (construct.resolveAll && !resolveAllConstructs.includes(construct)) resolveAllConstructs.push(construct);
				if (construct.resolve) splice(context.events, from, context.events.length - from, construct.resolve(context.events.slice(from), context));
				if (construct.resolveTo) context.events = construct.resolveTo(context.events, context);
			}
			/**
			* Store state.
			*
			* @returns {Info}
			*   Info.
			*/
			function store() {
				const startPoint = now();
				const startPrevious = context.previous;
				const startCurrentConstruct = context.currentConstruct;
				const startEventsIndex = context.events.length;
				const startStack = Array.from(stack);
				return {
					from: startEventsIndex,
					restore
				};
				/**
				* Restore state.
				*
				* @returns {undefined}
				*   Nothing.
				*/
				function restore() {
					point = startPoint;
					context.previous = startPrevious;
					context.currentConstruct = startCurrentConstruct;
					context.events.length = startEventsIndex;
					stack = startStack;
					accountForPotentialSkip();
				}
			}
			/**
			* Move the current point a bit forward in the line when it’s on a column
			* skip.
			*
			* @returns {undefined}
			*   Nothing.
			*/
			function accountForPotentialSkip() {
				if (point.line in columnStart && point.column < 2) {
					point.column = columnStart[point.line];
					point.offset += columnStart[point.line] - 1;
				}
			}
		}
		/**
		* Get the chunks from a slice of chunks in the range of a token.
		*
		* @param {ReadonlyArray<Chunk>} chunks
		*   Chunks.
		* @param {Pick<Token, 'end' | 'start'>} token
		*   Token.
		* @returns {Array<Chunk>}
		*   Chunks.
		*/
		function sliceChunks(chunks, token) {
			const startIndex = token.start._index;
			const startBufferIndex = token.start._bufferIndex;
			const endIndex = token.end._index;
			const endBufferIndex = token.end._bufferIndex;
			/** @type {Array<Chunk>} */
			let view;
			if (startIndex === endIndex) view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
			else {
				view = chunks.slice(startIndex, endIndex);
				if (startBufferIndex > -1) {
					const head = view[0];
					if (typeof head === "string") view[0] = head.slice(startBufferIndex);
					else view.shift();
				}
				if (endBufferIndex > 0) view.push(chunks[endIndex].slice(0, endBufferIndex));
			}
			return view;
		}
		/**
		* Get the string value of a slice of chunks.
		*
		* @param {ReadonlyArray<Chunk>} chunks
		*   Chunks.
		* @param {boolean | undefined} [expandTabs=false]
		*   Whether to expand tabs (default: `false`).
		* @returns {string}
		*   Result.
		*/
		function serializeChunks(chunks, expandTabs) {
			let index = -1;
			/** @type {Array<string>} */
			const result = [];
			/** @type {boolean | undefined} */
			let atTab;
			while (++index < chunks.length) {
				const chunk = chunks[index];
				/** @type {string} */
				let value;
				if (typeof chunk === "string") value = chunk;
				else switch (chunk) {
					case -5:
						value = "\r";
						break;
					case -4:
						value = "\n";
						break;
					case -3:
						value = "\r\n";
						break;
					case -2:
						value = expandTabs ? " " : "	";
						break;
					case -1:
						if (!expandTabs && atTab) continue;
						value = " ";
						break;
					default: value = String.fromCharCode(chunk);
				}
				atTab = chunk === -2;
				result.push(value);
			}
			return result.join("");
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark@4.0.2/node_modules/micromark/lib/parse.js
		/**
		* @import {
		*   Create,
		*   FullNormalizedExtension,
		*   InitialConstruct,
		*   ParseContext,
		*   ParseOptions
		* } from 'micromark-util-types'
		*/
		/**
		* @param {ParseOptions | null | undefined} [options]
		*   Configuration (optional).
		* @returns {ParseContext}
		*   Parser.
		*/
		function parse(options) {
			/** @type {ParseContext} */
			const parser = {
				constructs: combineExtensions([constructs_exports, ...(options || {}).extensions || []]),
				content: create(content$1),
				defined: [],
				document: create(document$2),
				flow: create(flow$1),
				lazy: {},
				string: create(string$1),
				text: create(text$2)
			};
			return parser;
			/**
			* @param {InitialConstruct} initial
			*   Construct to start with.
			* @returns {Create}
			*   Create a tokenizer.
			*/
			function create(initial) {
				return creator;
				/** @type {Create} */
				function creator(from) {
					return createTokenizer(parser, initial, from);
				}
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark@4.0.2/node_modules/micromark/lib/postprocess.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @param {Array<Event>} events
		*   Events.
		* @returns {Array<Event>}
		*   Events.
		*/
		function postprocess(events) {
			while (!subtokenize(events));
			return events;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark@4.0.2/node_modules/micromark/lib/preprocess.js
		/**
		* @import {Chunk, Code, Encoding, Value} from 'micromark-util-types'
		*/
		/**
		* @callback Preprocessor
		*   Preprocess a value.
		* @param {Value} value
		*   Value.
		* @param {Encoding | null | undefined} [encoding]
		*   Encoding when `value` is a typed array (optional).
		* @param {boolean | null | undefined} [end=false]
		*   Whether this is the last chunk (default: `false`).
		* @returns {Array<Chunk>}
		*   Chunks.
		*/
		const search = /[\0\t\n\r]/g;
		/**
		* @returns {Preprocessor}
		*   Preprocess a value.
		*/
		function preprocess() {
			let column = 1;
			let buffer = "";
			/** @type {boolean | undefined} */
			let start = true;
			/** @type {boolean | undefined} */
			let atCarriageReturn;
			return preprocessor;
			/** @type {Preprocessor} */
			function preprocessor(value, encoding, end) {
				/** @type {Array<Chunk>} */
				const chunks = [];
				/** @type {RegExpMatchArray | null} */
				let match;
				/** @type {number} */
				let next;
				/** @type {number} */
				let startPosition;
				/** @type {number} */
				let endPosition;
				/** @type {Code} */
				let code;
				value = buffer + (typeof value === "string" ? value.toString() : new TextDecoder(encoding || void 0).decode(value));
				startPosition = 0;
				buffer = "";
				if (start) {
					if (value.charCodeAt(0) === 65279) startPosition++;
					start = void 0;
				}
				while (startPosition < value.length) {
					search.lastIndex = startPosition;
					match = search.exec(value);
					endPosition = match && match.index !== void 0 ? match.index : value.length;
					code = value.charCodeAt(endPosition);
					if (!match) {
						buffer = value.slice(startPosition);
						break;
					}
					if (code === 10 && startPosition === endPosition && atCarriageReturn) {
						chunks.push(-3);
						atCarriageReturn = void 0;
					} else {
						if (atCarriageReturn) {
							chunks.push(-5);
							atCarriageReturn = void 0;
						}
						if (startPosition < endPosition) {
							chunks.push(value.slice(startPosition, endPosition));
							column += endPosition - startPosition;
						}
						switch (code) {
							case 0:
								chunks.push(65533);
								column++;
								break;
							case 9:
								next = Math.ceil(column / 4) * 4;
								chunks.push(-2);
								while (column++ < next) chunks.push(-1);
								break;
							case 10:
								chunks.push(-4);
								column = 1;
								break;
							default:
								atCarriageReturn = true;
								column = 1;
						}
					}
					startPosition = endPosition + 1;
				}
				if (end) {
					if (atCarriageReturn) chunks.push(-5);
					if (buffer) chunks.push(buffer);
					chunks.push(null);
				}
				return chunks;
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-util-decode-string@2.0.1/node_modules/micromark-util-decode-string/index.js
		const characterEscapeOrReference = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
		/**
		* Decode markdown strings (which occur in places such as fenced code info
		* strings, destinations, labels, and titles).
		*
		* The “string” content type allows character escapes and -references.
		* This decodes those.
		*
		* @param {string} value
		*   Value to decode.
		* @returns {string}
		*   Decoded value.
		*/
		function decodeString(value) {
			return value.replace(characterEscapeOrReference, decode);
		}
		/**
		* @param {string} $0
		*   Match.
		* @param {string} $1
		*   Character escape.
		* @param {string} $2
		*   Character reference.
		* @returns {string}
		*   Decoded value
		*/
		function decode($0, $1, $2) {
			if ($1) return $1;
			if ($2.charCodeAt(0) === 35) {
				const head = $2.charCodeAt(1);
				const hex = head === 120 || head === 88;
				return decodeNumericCharacterReference($2.slice(hex ? 2 : 1), hex ? 16 : 10);
			}
			return decodeNamedCharacterReference($2) || $0;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/unist-util-stringify-position@4.0.0/node_modules/unist-util-stringify-position/lib/index.js
		/**
		* @typedef {import('unist').Node} Node
		* @typedef {import('unist').Point} Point
		* @typedef {import('unist').Position} Position
		*/
		/**
		* @typedef NodeLike
		* @property {string} type
		* @property {PositionLike | null | undefined} [position]
		*
		* @typedef PointLike
		* @property {number | null | undefined} [line]
		* @property {number | null | undefined} [column]
		* @property {number | null | undefined} [offset]
		*
		* @typedef PositionLike
		* @property {PointLike | null | undefined} [start]
		* @property {PointLike | null | undefined} [end]
		*/
		/**
		* Serialize the positional info of a point, position (start and end points),
		* or node.
		*
		* @param {Node | NodeLike | Point | PointLike | Position | PositionLike | null | undefined} [value]
		*   Node, position, or point.
		* @returns {string}
		*   Pretty printed positional info of a node (`string`).
		*
		*   In the format of a range `ls:cs-le:ce` (when given `node` or `position`)
		*   or a point `l:c` (when given `point`), where `l` stands for line, `c` for
		*   column, `s` for `start`, and `e` for end.
		*   An empty string (`''`) is returned if the given value is neither `node`,
		*   `position`, nor `point`.
		*/
		function stringifyPosition(value) {
			if (!value || typeof value !== "object") return "";
			if ("position" in value || "type" in value) return position(value.position);
			if ("start" in value || "end" in value) return position(value);
			if ("line" in value || "column" in value) return point$1(value);
			return "";
		}
		/**
		* @param {Point | PointLike | null | undefined} point
		* @returns {string}
		*/
		function point$1(point) {
			return index(point && point.line) + ":" + index(point && point.column);
		}
		/**
		* @param {Position | PositionLike | null | undefined} pos
		* @returns {string}
		*/
		function position(pos) {
			return point$1(pos && pos.start) + "-" + point$1(pos && pos.end);
		}
		/**
		* @param {number | null | undefined} value
		* @returns {number}
		*/
		function index(value) {
			return value && typeof value === "number" ? value : 1;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/mdast-util-from-markdown@2.0.3/node_modules/mdast-util-from-markdown/lib/index.js
		/**
		* @import {
		*   Break,
		*   Blockquote,
		*   Code,
		*   Definition,
		*   Emphasis,
		*   Heading,
		*   Html,
		*   Image,
		*   InlineCode,
		*   Link,
		*   ListItem,
		*   List,
		*   Nodes,
		*   Paragraph,
		*   PhrasingContent,
		*   ReferenceType,
		*   Root,
		*   Strong,
		*   Text,
		*   ThematicBreak
		* } from 'mdast'
		* @import {
		*   Encoding,
		*   Event,
		*   Token,
		*   Value
		* } from 'micromark-util-types'
		* @import {Point} from 'unist'
		* @import {
		*   CompileContext,
		*   CompileData,
		*   Config,
		*   Extension,
		*   Handle,
		*   OnEnterError,
		*   Options
		* } from './types.js'
		*/
		const own = {}.hasOwnProperty;
		/**
		* Turn markdown into a syntax tree.
		*
		* @overload
		* @param {Value} value
		* @param {Encoding | null | undefined} [encoding]
		* @param {Options | null | undefined} [options]
		* @returns {Root}
		*
		* @overload
		* @param {Value} value
		* @param {Options | null | undefined} [options]
		* @returns {Root}
		*
		* @param {Value} value
		*   Markdown to parse.
		* @param {Encoding | Options | null | undefined} [encoding]
		*   Character encoding for when `value` is `Buffer`.
		* @param {Options | null | undefined} [options]
		*   Configuration.
		* @returns {Root}
		*   mdast tree.
		*/
		function fromMarkdown(value, encoding, options) {
			if (encoding && typeof encoding === "object") {
				options = encoding;
				encoding = void 0;
			}
			return compiler(options)(postprocess(parse(options).document().write(preprocess()(value, encoding, true))));
		}
		/**
		* Note this compiler only understand complete buffering, not streaming.
		*
		* @param {Options | null | undefined} [options]
		*/
		function compiler(options) {
			/** @type {Config} */
			const config = {
				transforms: [],
				canContainEols: [
					"emphasis",
					"fragment",
					"heading",
					"paragraph",
					"strong"
				],
				enter: {
					autolink: opener(link),
					autolinkProtocol: onenterdata,
					autolinkEmail: onenterdata,
					atxHeading: opener(heading),
					blockQuote: opener(blockQuote),
					characterEscape: onenterdata,
					characterReference: onenterdata,
					codeFenced: opener(codeFlow),
					codeFencedFenceInfo: buffer,
					codeFencedFenceMeta: buffer,
					codeIndented: opener(codeFlow, buffer),
					codeText: opener(codeText, buffer),
					codeTextData: onenterdata,
					data: onenterdata,
					codeFlowValue: onenterdata,
					definition: opener(definition),
					definitionDestinationString: buffer,
					definitionLabelString: buffer,
					definitionTitleString: buffer,
					emphasis: opener(emphasis),
					hardBreakEscape: opener(hardBreak),
					hardBreakTrailing: opener(hardBreak),
					htmlFlow: opener(html, buffer),
					htmlFlowData: onenterdata,
					htmlText: opener(html, buffer),
					htmlTextData: onenterdata,
					image: opener(image),
					label: buffer,
					link: opener(link),
					listItem: opener(listItem),
					listItemValue: onenterlistitemvalue,
					listOrdered: opener(list, onenterlistordered),
					listUnordered: opener(list),
					paragraph: opener(paragraph),
					reference: onenterreference,
					referenceString: buffer,
					resourceDestinationString: buffer,
					resourceTitleString: buffer,
					setextHeading: opener(heading),
					strong: opener(strong),
					thematicBreak: opener(thematicBreak)
				},
				exit: {
					atxHeading: closer(),
					atxHeadingSequence: onexitatxheadingsequence,
					autolink: closer(),
					autolinkEmail: onexitautolinkemail,
					autolinkProtocol: onexitautolinkprotocol,
					blockQuote: closer(),
					characterEscapeValue: onexitdata,
					characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
					characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
					characterReferenceValue: onexitcharacterreferencevalue,
					characterReference: onexitcharacterreference,
					codeFenced: closer(onexitcodefenced),
					codeFencedFence: onexitcodefencedfence,
					codeFencedFenceInfo: onexitcodefencedfenceinfo,
					codeFencedFenceMeta: onexitcodefencedfencemeta,
					codeFlowValue: onexitdata,
					codeIndented: closer(onexitcodeindented),
					codeText: closer(onexitcodetext),
					codeTextData: onexitdata,
					data: onexitdata,
					definition: closer(),
					definitionDestinationString: onexitdefinitiondestinationstring,
					definitionLabelString: onexitdefinitionlabelstring,
					definitionTitleString: onexitdefinitiontitlestring,
					emphasis: closer(),
					hardBreakEscape: closer(onexithardbreak),
					hardBreakTrailing: closer(onexithardbreak),
					htmlFlow: closer(onexithtmlflow),
					htmlFlowData: onexitdata,
					htmlText: closer(onexithtmltext),
					htmlTextData: onexitdata,
					image: closer(onexitimage),
					label: onexitlabel,
					labelText: onexitlabeltext,
					lineEnding: onexitlineending,
					link: closer(onexitlink),
					listItem: closer(),
					listOrdered: closer(),
					listUnordered: closer(),
					paragraph: closer(),
					referenceString: onexitreferencestring,
					resourceDestinationString: onexitresourcedestinationstring,
					resourceTitleString: onexitresourcetitlestring,
					resource: onexitresource,
					setextHeading: closer(onexitsetextheading),
					setextHeadingLineSequence: onexitsetextheadinglinesequence,
					setextHeadingText: onexitsetextheadingtext,
					strong: closer(),
					thematicBreak: closer()
				}
			};
			configure(config, (options || {}).mdastExtensions || []);
			/** @type {CompileData} */
			const data = {};
			return compile;
			/**
			* Turn micromark events into an mdast tree.
			*
			* @param {Array<Event>} events
			*   Events.
			* @returns {Root}
			*   mdast tree.
			*/
			function compile(events) {
				/** @type {Root} */
				let tree = {
					type: "root",
					children: []
				};
				/** @type {Omit<CompileContext, 'sliceSerialize'>} */
				const context = {
					stack: [tree],
					tokenStack: [],
					config,
					enter,
					exit,
					buffer,
					resume,
					data
				};
				/** @type {Array<number>} */
				const listStack = [];
				let index = -1;
				while (++index < events.length) if (events[index][1].type === "listOrdered" || events[index][1].type === "listUnordered") {
					if (events[index][0] === "enter") listStack.push(index);
					else index = prepareList(events, listStack.pop(), index);
				}
				index = -1;
				while (++index < events.length) {
					const handler = config[events[index][0]];
					if (own.call(handler, events[index][1].type)) handler[events[index][1].type].call(Object.assign({ sliceSerialize: events[index][2].sliceSerialize }, context), events[index][1]);
				}
				if (context.tokenStack.length > 0) {
					const tail = context.tokenStack[context.tokenStack.length - 1];
					(tail[1] || defaultOnError).call(context, void 0, tail[0]);
				}
				tree.position = {
					start: point(events.length > 0 ? events[0][1].start : {
						line: 1,
						column: 1,
						offset: 0
					}),
					end: point(events.length > 0 ? events[events.length - 2][1].end : {
						line: 1,
						column: 1,
						offset: 0
					})
				};
				index = -1;
				while (++index < config.transforms.length) tree = config.transforms[index](tree) || tree;
				return tree;
			}
			/**
			* @param {Array<Event>} events
			* @param {number} start
			* @param {number} length
			* @returns {number}
			*/
			function prepareList(events, start, length) {
				let index = start - 1;
				let containerBalance = -1;
				let listSpread = false;
				/** @type {Token | undefined} */
				let listItem;
				/** @type {number | undefined} */
				let lineIndex;
				/** @type {number | undefined} */
				let firstBlankLineIndex;
				/** @type {boolean | undefined} */
				let atMarker;
				while (++index <= length) {
					const event = events[index];
					switch (event[1].type) {
						case "listUnordered":
						case "listOrdered":
						case "blockQuote":
							if (event[0] === "enter") containerBalance++;
							else containerBalance--;
							atMarker = void 0;
							break;
						case "lineEndingBlank":
							if (event[0] === "enter") {
								if (listItem && !atMarker && !containerBalance && !firstBlankLineIndex) firstBlankLineIndex = index;
								atMarker = void 0;
							}
							break;
						case "linePrefix":
						case "listItemValue":
						case "listItemMarker":
						case "listItemPrefix":
						case "listItemPrefixWhitespace": break;
						default: atMarker = void 0;
					}
					if (!containerBalance && event[0] === "enter" && event[1].type === "listItemPrefix" || containerBalance === -1 && event[0] === "exit" && (event[1].type === "listUnordered" || event[1].type === "listOrdered")) {
						if (listItem) {
							let tailIndex = index;
							lineIndex = void 0;
							while (tailIndex--) {
								const tailEvent = events[tailIndex];
								if (tailEvent[1].type === "lineEnding" || tailEvent[1].type === "lineEndingBlank") {
									if (tailEvent[0] === "exit") continue;
									if (lineIndex) {
										events[lineIndex][1].type = "lineEndingBlank";
										listSpread = true;
									}
									tailEvent[1].type = "lineEnding";
									lineIndex = tailIndex;
								} else if (tailEvent[1].type === "linePrefix" || tailEvent[1].type === "blockQuotePrefix" || tailEvent[1].type === "blockQuotePrefixWhitespace" || tailEvent[1].type === "blockQuoteMarker" || tailEvent[1].type === "listItemIndent") {} else break;
							}
							if (firstBlankLineIndex && (!lineIndex || firstBlankLineIndex < lineIndex)) listItem._spread = true;
							listItem.end = Object.assign({}, lineIndex ? events[lineIndex][1].start : event[1].end);
							events.splice(lineIndex || index, 0, [
								"exit",
								listItem,
								event[2]
							]);
							index++;
							length++;
						}
						if (event[1].type === "listItemPrefix") {
							/** @type {Token} */
							const item = {
								type: "listItem",
								_spread: false,
								start: Object.assign({}, event[1].start),
								end: void 0
							};
							listItem = item;
							events.splice(index, 0, [
								"enter",
								item,
								event[2]
							]);
							index++;
							length++;
							firstBlankLineIndex = void 0;
							atMarker = true;
						}
					}
				}
				events[start][1]._spread = listSpread;
				return length;
			}
			/**
			* Create an opener handle.
			*
			* @param {(token: Token) => Nodes} create
			*   Create a node.
			* @param {Handle | undefined} [and]
			*   Optional function to also run.
			* @returns {Handle}
			*   Handle.
			*/
			function opener(create, and) {
				return open;
				/**
				* @this {CompileContext}
				* @param {Token} token
				* @returns {undefined}
				*/
				function open(token) {
					enter.call(this, create(token), token);
					if (and) and.call(this, token);
				}
			}
			/**
			* @type {CompileContext['buffer']}
			*/
			function buffer() {
				this.stack.push({
					type: "fragment",
					children: []
				});
			}
			/**
			* @type {CompileContext['enter']}
			*/
			function enter(node, token, errorHandler) {
				this.stack[this.stack.length - 1].children.push(node);
				this.stack.push(node);
				this.tokenStack.push([token, errorHandler || void 0]);
				node.position = {
					start: point(token.start),
					end: void 0
				};
			}
			/**
			* Create a closer handle.
			*
			* @param {Handle | undefined} [and]
			*   Optional function to also run.
			* @returns {Handle}
			*   Handle.
			*/
			function closer(and) {
				return close;
				/**
				* @this {CompileContext}
				* @param {Token} token
				* @returns {undefined}
				*/
				function close(token) {
					if (and) and.call(this, token);
					exit.call(this, token);
				}
			}
			/**
			* @type {CompileContext['exit']}
			*/
			function exit(token, onExitError) {
				const node = this.stack.pop();
				const open = this.tokenStack.pop();
				if (!open) throw new Error("Cannot close `" + token.type + "` (" + stringifyPosition({
					start: token.start,
					end: token.end
				}) + "): it’s not open");
				else if (open[0].type !== token.type) {
					if (onExitError) onExitError.call(this, token, open[0]);
					else (open[1] || defaultOnError).call(this, token, open[0]);
				}
				node.position.end = point(token.end);
			}
			/**
			* @type {CompileContext['resume']}
			*/
			function resume() {
				return toString(this.stack.pop());
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterlistordered() {
				this.data.expectingFirstListItemValue = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterlistitemvalue(token) {
				if (this.data.expectingFirstListItemValue) {
					const ancestor = this.stack[this.stack.length - 2];
					ancestor.start = Number.parseInt(this.sliceSerialize(token), 10);
					this.data.expectingFirstListItemValue = void 0;
				}
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfenceinfo() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.lang = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfencemeta() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.meta = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfence() {
				if (this.data.flowCodeInside) return;
				this.buffer();
				this.data.flowCodeInside = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefenced() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "");
				this.data.flowCodeInside = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodeindented() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data.replace(/(\r?\n|\r)$/g, "");
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitionlabelstring(token) {
				const label = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.label = label;
				node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitiontitlestring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.title = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitiondestinationstring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.url = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitatxheadingsequence(token) {
				const node = this.stack[this.stack.length - 1];
				if (!node.depth) node.depth = this.sliceSerialize(token).length;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheadingtext() {
				this.data.setextHeadingSlurpLineEnding = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheadinglinesequence(token) {
				const node = this.stack[this.stack.length - 1];
				node.depth = this.sliceSerialize(token).codePointAt(0) === 61 ? 1 : 2;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheading() {
				this.data.setextHeadingSlurpLineEnding = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterdata(token) {
				/** @type {Array<Nodes>} */
				const siblings = this.stack[this.stack.length - 1].children;
				let tail = siblings[siblings.length - 1];
				if (!tail || tail.type !== "text") {
					tail = text();
					tail.position = {
						start: point(token.start),
						end: void 0
					};
					siblings.push(tail);
				}
				this.stack.push(tail);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdata(token) {
				const tail = this.stack.pop();
				tail.value += this.sliceSerialize(token);
				tail.position.end = point(token.end);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlineending(token) {
				const context = this.stack[this.stack.length - 1];
				if (this.data.atHardBreak) {
					const tail = context.children[context.children.length - 1];
					tail.position.end = point(token.end);
					this.data.atHardBreak = void 0;
					return;
				}
				if (!this.data.setextHeadingSlurpLineEnding && config.canContainEols.includes(context.type)) {
					onenterdata.call(this, token);
					onexitdata.call(this, token);
				}
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithardbreak() {
				this.data.atHardBreak = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithtmlflow() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithtmltext() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodetext() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlink() {
				const node = this.stack[this.stack.length - 1];
				if (this.data.inReference) {
					/** @type {ReferenceType} */
					const referenceType = this.data.referenceType || "shortcut";
					node.type += "Reference";
					node.referenceType = referenceType;
					delete node.url;
					delete node.title;
				} else {
					delete node.identifier;
					delete node.label;
				}
				this.data.referenceType = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitimage() {
				const node = this.stack[this.stack.length - 1];
				if (this.data.inReference) {
					/** @type {ReferenceType} */
					const referenceType = this.data.referenceType || "shortcut";
					node.type += "Reference";
					node.referenceType = referenceType;
					delete node.url;
					delete node.title;
				} else {
					delete node.identifier;
					delete node.label;
				}
				this.data.referenceType = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlabeltext(token) {
				const string = this.sliceSerialize(token);
				const ancestor = this.stack[this.stack.length - 2];
				ancestor.label = decodeString(string);
				ancestor.identifier = normalizeIdentifier(string).toLowerCase();
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlabel() {
				const fragment = this.stack[this.stack.length - 1];
				const value = this.resume();
				const node = this.stack[this.stack.length - 1];
				this.data.inReference = true;
				if (node.type === "link") node.children = fragment.children;
				else node.alt = value;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresourcedestinationstring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.url = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresourcetitlestring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.title = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresource() {
				this.data.inReference = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterreference() {
				this.data.referenceType = "collapsed";
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitreferencestring(token) {
				const label = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.label = label;
				node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
				this.data.referenceType = "full";
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreferencemarker(token) {
				this.data.characterReferenceType = token.type;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreferencevalue(token) {
				const data = this.sliceSerialize(token);
				const type = this.data.characterReferenceType;
				/** @type {string} */
				let value;
				if (type) {
					value = decodeNumericCharacterReference(data, type === "characterReferenceMarkerNumeric" ? 10 : 16);
					this.data.characterReferenceType = void 0;
				} else value = decodeNamedCharacterReference(data);
				const tail = this.stack[this.stack.length - 1];
				tail.value += value;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreference(token) {
				const tail = this.stack.pop();
				tail.position.end = point(token.end);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitautolinkprotocol(token) {
				onexitdata.call(this, token);
				const node = this.stack[this.stack.length - 1];
				node.url = this.sliceSerialize(token);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitautolinkemail(token) {
				onexitdata.call(this, token);
				const node = this.stack[this.stack.length - 1];
				node.url = "mailto:" + this.sliceSerialize(token);
			}
			/** @returns {Blockquote} */
			function blockQuote() {
				return {
					type: "blockquote",
					children: []
				};
			}
			/** @returns {Code} */
			function codeFlow() {
				return {
					type: "code",
					lang: null,
					meta: null,
					value: ""
				};
			}
			/** @returns {InlineCode} */
			function codeText() {
				return {
					type: "inlineCode",
					value: ""
				};
			}
			/** @returns {Definition} */
			function definition() {
				return {
					type: "definition",
					identifier: "",
					label: null,
					title: null,
					url: ""
				};
			}
			/** @returns {Emphasis} */
			function emphasis() {
				return {
					type: "emphasis",
					children: []
				};
			}
			/** @returns {Heading} */
			function heading() {
				return {
					type: "heading",
					depth: 0,
					children: []
				};
			}
			/** @returns {Break} */
			function hardBreak() {
				return { type: "break" };
			}
			/** @returns {Html} */
			function html() {
				return {
					type: "html",
					value: ""
				};
			}
			/** @returns {Image} */
			function image() {
				return {
					type: "image",
					title: null,
					url: "",
					alt: null
				};
			}
			/** @returns {Link} */
			function link() {
				return {
					type: "link",
					title: null,
					url: "",
					children: []
				};
			}
			/**
			* @param {Token} token
			* @returns {List}
			*/
			function list(token) {
				return {
					type: "list",
					ordered: token.type === "listOrdered",
					start: null,
					spread: token._spread,
					children: []
				};
			}
			/**
			* @param {Token} token
			* @returns {ListItem}
			*/
			function listItem(token) {
				return {
					type: "listItem",
					spread: token._spread,
					checked: null,
					children: []
				};
			}
			/** @returns {Paragraph} */
			function paragraph() {
				return {
					type: "paragraph",
					children: []
				};
			}
			/** @returns {Strong} */
			function strong() {
				return {
					type: "strong",
					children: []
				};
			}
			/** @returns {Text} */
			function text() {
				return {
					type: "text",
					value: ""
				};
			}
			/** @returns {ThematicBreak} */
			function thematicBreak() {
				return { type: "thematicBreak" };
			}
		}
		/**
		* Copy a point-like value.
		*
		* @param {Point} d
		*   Point-like value.
		* @returns {Point}
		*   unist point.
		*/
		function point(d) {
			return {
				line: d.line,
				column: d.column,
				offset: d.offset
			};
		}
		/**
		* @param {Config} combined
		* @param {Array<Array<Extension> | Extension>} extensions
		* @returns {undefined}
		*/
		function configure(combined, extensions) {
			let index = -1;
			while (++index < extensions.length) {
				const value = extensions[index];
				if (Array.isArray(value)) configure(combined, value);
				else extension(combined, value);
			}
		}
		/**
		* @param {Config} combined
		* @param {Extension} extension
		* @returns {undefined}
		*/
		function extension(combined, extension) {
			/** @type {keyof Extension} */
			let key;
			for (key in extension) if (own.call(extension, key)) switch (key) {
				case "canContainEols": {
					const right = extension[key];
					if (right) combined[key].push(...right);
					break;
				}
				case "transforms": {
					const right = extension[key];
					if (right) combined[key].push(...right);
					break;
				}
				case "enter":
				case "exit": {
					const right = extension[key];
					if (right) Object.assign(combined[key], right);
					break;
				}
			}
		}
		/** @type {OnEnterError} */
		function defaultOnError(left, right) {
			if (left) throw new Error("Cannot close `" + left.type + "` (" + stringifyPosition({
				start: left.start,
				end: left.end
			}) + "): a different token (`" + right.type + "`, " + stringifyPosition({
				start: right.start,
				end: right.end
			}) + ") is open");
			else throw new Error("Cannot close document, a token (`" + right.type + "`, " + stringifyPosition({
				start: right.start,
				end: right.end
			}) + ") is still open");
		}
		//#endregion
		//#region ../../node_modules/.pnpm/ccount@2.0.1/node_modules/ccount/index.js
		/**
		* Count how often a character (or substring) is used in a string.
		*
		* @param {string} value
		*   Value to search in.
		* @param {string} character
		*   Character (or substring) to look for.
		* @return {number}
		*   Number of times `character` occurred in `value`.
		*/
		function ccount(value, character) {
			const source = String(value);
			if (typeof character !== "string") throw new TypeError("Expected character");
			let count = 0;
			let index = source.indexOf(character);
			while (index !== -1) {
				count++;
				index = source.indexOf(character, index + character.length);
			}
			return count;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/escape-string-regexp@5.0.0/node_modules/escape-string-regexp/index.js
		function escapeStringRegexp(string) {
			if (typeof string !== "string") throw new TypeError("Expected a string");
			return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
		}
		//#endregion
		//#region ../../node_modules/.pnpm/unist-util-is@6.0.1/node_modules/unist-util-is/lib/index.js
		/**
		* Generate an assertion from a test.
		*
		* Useful if you’re going to test many nodes, for example when creating a
		* utility where something else passes a compatible test.
		*
		* The created function is a bit faster because it expects valid input only:
		* a `node`, `index`, and `parent`.
		*
		* @param {Test} test
		*   *   when nullish, checks if `node` is a `Node`.
		*   *   when `string`, works like passing `(node) => node.type === test`.
		*   *   when `function` checks if function passed the node is true.
		*   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
		*   *   when `array`, checks if any one of the subtests pass.
		* @returns {Check}
		*   An assertion.
		*/
		const convert = (
		/**
		* @param {Test} [test]
		* @returns {Check}
		*/
		function(test) {
			if (test === null || test === void 0) return ok;
			if (typeof test === "function") return castFactory(test);
			if (typeof test === "object") return Array.isArray(test) ? anyFactory(test) : propertiesFactory(test);
			if (typeof test === "string") return typeFactory(test);
			throw new Error("Expected function, string, or object as test");
		});
		/**
		* @param {Array<Props | TestFunction | string>} tests
		* @returns {Check}
		*/
		function anyFactory(tests) {
			/** @type {Array<Check>} */
			const checks = [];
			let index = -1;
			while (++index < tests.length) checks[index] = convert(tests[index]);
			return castFactory(any);
			/**
			* @this {unknown}
			* @type {TestFunction}
			*/
			function any(...parameters) {
				let index = -1;
				while (++index < checks.length) if (checks[index].apply(this, parameters)) return true;
				return false;
			}
		}
		/**
		* Turn an object into a test for a node with a certain fields.
		*
		* @param {Props} check
		* @returns {Check}
		*/
		function propertiesFactory(check) {
			const checkAsRecord = check;
			return castFactory(all);
			/**
			* @param {Node} node
			* @returns {boolean}
			*/
			function all(node) {
				const nodeAsRecord = node;
				/** @type {string} */
				let key;
				for (key in check) if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
				return true;
			}
		}
		/**
		* Turn a string into a test for a node with a certain type.
		*
		* @param {string} check
		* @returns {Check}
		*/
		function typeFactory(check) {
			return castFactory(type);
			/**
			* @param {Node} node
			*/
			function type(node) {
				return node && node.type === check;
			}
		}
		/**
		* Turn a custom test into a test for a node that passes that test.
		*
		* @param {TestFunction} testFunction
		* @returns {Check}
		*/
		function castFactory(testFunction) {
			return check;
			/**
			* @this {unknown}
			* @type {Check}
			*/
			function check(value, index, parent) {
				return Boolean(looksLikeANode(value) && testFunction.call(this, value, typeof index === "number" ? index : void 0, parent || void 0));
			}
		}
		function ok() {
			return true;
		}
		/**
		* @param {unknown} value
		* @returns {value is Node}
		*/
		function looksLikeANode(value) {
			return value !== null && typeof value === "object" && "type" in value;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/unist-util-visit-parents@6.0.2/node_modules/unist-util-visit-parents/lib/color.node.js
		/**
		* @param {string} d
		* @returns {string}
		*/
		function color(d) {
			return "\x1B[33m" + d + "\x1B[39m";
		}
		//#endregion
		//#region ../../node_modules/.pnpm/unist-util-visit-parents@6.0.2/node_modules/unist-util-visit-parents/lib/index.js
		/**
		* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
		*/
		/**
		* @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
		*   Test from `unist-util-is`.
		*
		*   Note: we have remove and add `undefined`, because otherwise when generating
		*   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
		*   which doesn’t work when publishing on npm.
		*/
		/**
		* @typedef {(
		*   Fn extends (value: any) => value is infer Thing
		*   ? Thing
		*   : Fallback
		* )} Predicate
		*   Get the value of a type guard `Fn`.
		* @template Fn
		*   Value; typically function that is a type guard (such as `(x): x is Y`).
		* @template Fallback
		*   Value to yield if `Fn` is not a type guard.
		*/
		/**
		* @typedef {(
		*   Check extends null | undefined // No test.
		*   ? Value
		*   : Value extends {type: Check} // String (type) test.
		*   ? Value
		*   : Value extends Check // Partial test.
		*   ? Value
		*   : Check extends Function // Function test.
		*   ? Predicate<Check, Value> extends Value
		*     ? Predicate<Check, Value>
		*     : never
		*   : never // Some other test?
		* )} MatchesOne
		*   Check whether a node matches a primitive check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test, but not arrays.
		*/
		/**
		* @typedef {(
		*   Check extends ReadonlyArray<infer T>
		*   ? MatchesOne<Value, T>
		*   : Check extends Array<infer T>
		*   ? MatchesOne<Value, T>
		*   : MatchesOne<Value, Check>
		* )} Matches
		*   Check whether a node matches a check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test.
		*/
		/**
		* @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
		*   Number; capped reasonably.
		*/
		/**
		* @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
		*   Increment a number in the type system.
		* @template {Uint} [I=0]
		*   Index.
		*/
		/**
		* @typedef {(
		*   Node extends UnistParent
		*   ? Node extends {children: Array<infer Children>}
		*     ? Child extends Children ? Node : never
		*     : never
		*   : never
		* )} InternalParent
		*   Collect nodes that can be parents of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
		*   Collect nodes in `Tree` that can be parents of `Child`.
		* @template {UnistNode} Tree
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {(
		*   Depth extends Max
		*   ? never
		*   :
		*     | InternalParent<Node, Child>
		*     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
		* )} InternalAncestor
		*   Collect nodes in `Tree` that can be ancestors of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @typedef {InternalAncestor<InclusiveDescendant<Tree>, Child>} Ancestor
		*   Collect nodes in `Tree` that can be ancestors of `Child`.
		* @template {UnistNode} Tree
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {(
		*   Tree extends UnistParent
		*     ? Depth extends Max
		*       ? Tree
		*       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
		*     : Tree
		* )} InclusiveDescendant
		*   Collect all (inclusive) descendants of `Tree`.
		*
		*   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
		*   > recurse without actually running into an infinite loop, which the
		*   > previous version did.
		*   >
		*   > Practically, a max of `2` is typically enough assuming a `Root` is
		*   > passed, but it doesn’t improve performance.
		*   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
		*   > Using up to `10` doesn’t hurt or help either.
		* @template {UnistNode} Tree
		*   Tree type.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @typedef {'skip' | boolean} Action
		*   Union of the action types.
		*
		* @typedef {number} Index
		*   Move to the sibling at `index` next (after node itself is completely
		*   traversed).
		*
		*   Useful if mutating the tree, such as removing the node the visitor is
		*   currently on, or any of its previous siblings.
		*   Results less than 0 or greater than or equal to `children.length` stop
		*   traversing the parent.
		*
		* @typedef {[(Action | null | undefined | void)?, (Index | null | undefined)?]} ActionTuple
		*   List with one or two values, the first an action, the second an index.
		*
		* @typedef {Action | ActionTuple | Index | null | undefined | void} VisitorResult
		*   Any value that can be returned from a visitor.
		*/
		/**
		* @callback Visitor
		*   Handle a node (matching `test`, if given).
		*
		*   Visitors are free to transform `node`.
		*   They can also transform the parent of node (the last of `ancestors`).
		*
		*   Replacing `node` itself, if `SKIP` is not returned, still causes its
		*   descendants to be walked (which is a bug).
		*
		*   When adding or removing previous siblings of `node` (or next siblings, in
		*   case of reverse), the `Visitor` should return a new `Index` to specify the
		*   sibling to traverse after `node` is traversed.
		*   Adding or removing next siblings of `node` (or previous siblings, in case
		*   of reverse) is handled as expected without needing to return a new `Index`.
		*
		*   Removing the children property of an ancestor still results in them being
		*   traversed.
		* @param {Visited} node
		*   Found node.
		* @param {Array<VisitedParents>} ancestors
		*   Ancestors of `node`.
		* @returns {VisitorResult}
		*   What to do next.
		*
		*   An `Index` is treated as a tuple of `[CONTINUE, Index]`.
		*   An `Action` is treated as a tuple of `[Action]`.
		*
		*   Passing a tuple back only makes sense if the `Action` is `SKIP`.
		*   When the `Action` is `EXIT`, that action can be returned.
		*   When the `Action` is `CONTINUE`, `Index` can be returned.
		* @template {UnistNode} [Visited=UnistNode]
		*   Visited node type.
		* @template {UnistParent} [VisitedParents=UnistParent]
		*   Ancestor type.
		*/
		/**
		* @typedef {Visitor<Matches<InclusiveDescendant<Tree>, Check>, Ancestor<Tree, Matches<InclusiveDescendant<Tree>, Check>>>} BuildVisitor
		*   Build a typed `Visitor` function from a tree and a test.
		*
		*   It will infer which values are passed as `node` and which as `parents`.
		* @template {UnistNode} [Tree=UnistNode]
		*   Tree type.
		* @template {Test} [Check=Test]
		*   Test type.
		*/
		/** @type {Readonly<ActionTuple>} */
		const empty = [];
		/**
		* Visit nodes, with ancestral information.
		*
		* This algorithm performs *depth-first* *tree traversal* in *preorder*
		* (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
		*
		* You can choose for which nodes `visitor` is called by passing a `test`.
		* For complex tests, you should test yourself in `visitor`, as it will be
		* faster and will have improved type information.
		*
		* Walking the tree is an intensive task.
		* Make use of the return values of the visitor when possible.
		* Instead of walking a tree multiple times, walk it once, use `unist-util-is`
		* to check if a node matches, and then perform different operations.
		*
		* You can change the tree.
		* See `Visitor` for more info.
		*
		* @overload
		* @param {Tree} tree
		* @param {Check} check
		* @param {BuildVisitor<Tree, Check>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @overload
		* @param {Tree} tree
		* @param {BuildVisitor<Tree>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @param {UnistNode} tree
		*   Tree to traverse.
		* @param {Visitor | Test} test
		*   `unist-util-is`-compatible test
		* @param {Visitor | boolean | null | undefined} [visitor]
		*   Handle each node.
		* @param {boolean | null | undefined} [reverse]
		*   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
		* @returns {undefined}
		*   Nothing.
		*
		* @template {UnistNode} Tree
		*   Node type.
		* @template {Test} Check
		*   `unist-util-is`-compatible test.
		*/
		function visitParents(tree, test, visitor, reverse) {
			/** @type {Test} */
			let check;
			if (typeof test === "function" && typeof visitor !== "function") {
				reverse = visitor;
				visitor = test;
			} else check = test;
			const is = convert(check);
			const step = reverse ? -1 : 1;
			factory(tree, void 0, [])();
			/**
			* @param {UnistNode} node
			* @param {number | undefined} index
			* @param {Array<UnistParent>} parents
			*/
			function factory(node, index, parents) {
				const value = node && typeof node === "object" ? node : {};
				if (typeof value.type === "string") {
					const name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : void 0;
					Object.defineProperty(visit, "name", { value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")" });
				}
				return visit;
				function visit() {
					/** @type {Readonly<ActionTuple>} */
					let result = empty;
					/** @type {Readonly<ActionTuple>} */
					let subresult;
					/** @type {number} */
					let offset;
					/** @type {Array<UnistParent>} */
					let grandparents;
					if (!test || is(node, index, parents[parents.length - 1] || void 0)) {
						result = toResult(visitor(node, parents));
						if (result[0] === false) return result;
					}
					if ("children" in node && node.children) {
						const nodeAsParent = node;
						if (nodeAsParent.children && result[0] !== "skip") {
							offset = (reverse ? nodeAsParent.children.length : -1) + step;
							grandparents = parents.concat(nodeAsParent);
							while (offset > -1 && offset < nodeAsParent.children.length) {
								const child = nodeAsParent.children[offset];
								subresult = factory(child, offset, grandparents)();
								if (subresult[0] === false) return subresult;
								offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
							}
						}
					}
					return result;
				}
			}
		}
		/**
		* Turn a return value into a clean result.
		*
		* @param {VisitorResult} value
		*   Valid return values from visitors.
		* @returns {Readonly<ActionTuple>}
		*   Clean result.
		*/
		function toResult(value) {
			if (Array.isArray(value)) return value;
			if (typeof value === "number") return [true, value];
			return value === null || value === void 0 ? empty : [value];
		}
		//#endregion
		//#region ../../node_modules/.pnpm/mdast-util-find-and-replace@3.0.2/node_modules/mdast-util-find-and-replace/lib/index.js
		/**
		* @import {Nodes, Parents, PhrasingContent, Root, Text} from 'mdast'
		* @import {BuildVisitor, Test, VisitorResult} from 'unist-util-visit-parents'
		*/
		/**
		* @typedef RegExpMatchObject
		*   Info on the match.
		* @property {number} index
		*   The index of the search at which the result was found.
		* @property {string} input
		*   A copy of the search string in the text node.
		* @property {[...Array<Parents>, Text]} stack
		*   All ancestors of the text node, where the last node is the text itself.
		*
		* @typedef {RegExp | string} Find
		*   Pattern to find.
		*
		*   Strings are escaped and then turned into global expressions.
		*
		* @typedef {Array<FindAndReplaceTuple>} FindAndReplaceList
		*   Several find and replaces, in array form.
		*
		* @typedef {[Find, Replace?]} FindAndReplaceTuple
		*   Find and replace in tuple form.
		*
		* @typedef {ReplaceFunction | string | null | undefined} Replace
		*   Thing to replace with.
		*
		* @callback ReplaceFunction
		*   Callback called when a search matches.
		* @param {...any} parameters
		*   The parameters are the result of corresponding search expression:
		*
		*   * `value` (`string`) — whole match
		*   * `...capture` (`Array<string>`) — matches from regex capture groups
		*   * `match` (`RegExpMatchObject`) — info on the match
		* @returns {Array<PhrasingContent> | PhrasingContent | string | false | null | undefined}
		*   Thing to replace with.
		*
		*   * when `null`, `undefined`, `''`, remove the match
		*   * …or when `false`, do not replace at all
		*   * …or when `string`, replace with a text node of that value
		*   * …or when `Node` or `Array<Node>`, replace with those nodes
		*
		* @typedef {[RegExp, ReplaceFunction]} Pair
		*   Normalized find and replace.
		*
		* @typedef {Array<Pair>} Pairs
		*   All find and replaced.
		*
		* @typedef Options
		*   Configuration.
		* @property {Test | null | undefined} [ignore]
		*   Test for which nodes to ignore (optional).
		*/
		/**
		* Find patterns in a tree and replace them.
		*
		* The algorithm searches the tree in *preorder* for complete values in `Text`
		* nodes.
		* Partial matches are not supported.
		*
		* @param {Nodes} tree
		*   Tree to change.
		* @param {FindAndReplaceList | FindAndReplaceTuple} list
		*   Patterns to find.
		* @param {Options | null | undefined} [options]
		*   Configuration (when `find` is not `Find`).
		* @returns {undefined}
		*   Nothing.
		*/
		function findAndReplace(tree, list, options) {
			const ignored = convert((options || {}).ignore || []);
			const pairs = toPairs(list);
			let pairIndex = -1;
			while (++pairIndex < pairs.length) visitParents(tree, "text", visitor);
			/** @type {BuildVisitor<Root, 'text'>} */
			function visitor(node, parents) {
				let index = -1;
				/** @type {Parents | undefined} */
				let grandparent;
				while (++index < parents.length) {
					const parent = parents[index];
					/** @type {Array<Nodes> | undefined} */
					const siblings = grandparent ? grandparent.children : void 0;
					if (ignored(parent, siblings ? siblings.indexOf(parent) : void 0, grandparent)) return;
					grandparent = parent;
				}
				if (grandparent) return handler(node, parents);
			}
			/**
			* Handle a text node which is not in an ignored parent.
			*
			* @param {Text} node
			*   Text node.
			* @param {Array<Parents>} parents
			*   Parents.
			* @returns {VisitorResult}
			*   Result.
			*/
			function handler(node, parents) {
				const parent = parents[parents.length - 1];
				const find = pairs[pairIndex][0];
				const replace = pairs[pairIndex][1];
				let start = 0;
				const index = parent.children.indexOf(node);
				let change = false;
				/** @type {Array<PhrasingContent>} */
				let nodes = [];
				find.lastIndex = 0;
				let match = find.exec(node.value);
				while (match) {
					const position = match.index;
					/** @type {RegExpMatchObject} */
					const matchObject = {
						index: match.index,
						input: match.input,
						stack: [...parents, node]
					};
					let value = replace(...match, matchObject);
					if (typeof value === "string") value = value.length > 0 ? {
						type: "text",
						value
					} : void 0;
					if (value === false) find.lastIndex = position + 1;
					else {
						if (start !== position) nodes.push({
							type: "text",
							value: node.value.slice(start, position)
						});
						if (Array.isArray(value)) nodes.push(...value);
						else if (value) nodes.push(value);
						start = position + match[0].length;
						change = true;
					}
					if (!find.global) break;
					match = find.exec(node.value);
				}
				if (change) {
					if (start < node.value.length) nodes.push({
						type: "text",
						value: node.value.slice(start)
					});
					parent.children.splice(index, 1, ...nodes);
				} else nodes = [node];
				return index + nodes.length;
			}
		}
		/**
		* Turn a tuple or a list of tuples into pairs.
		*
		* @param {FindAndReplaceList | FindAndReplaceTuple} tupleOrList
		*   Schema.
		* @returns {Pairs}
		*   Clean pairs.
		*/
		function toPairs(tupleOrList) {
			/** @type {Pairs} */
			const result = [];
			if (!Array.isArray(tupleOrList)) throw new TypeError("Expected find and replace tuple or list of tuples");
			/** @type {FindAndReplaceList} */
			const list = !tupleOrList[0] || Array.isArray(tupleOrList[0]) ? tupleOrList : [tupleOrList];
			let index = -1;
			while (++index < list.length) {
				const tuple = list[index];
				result.push([toExpression(tuple[0]), toFunction(tuple[1])]);
			}
			return result;
		}
		/**
		* Turn a find into an expression.
		*
		* @param {Find} find
		*   Find.
		* @returns {RegExp}
		*   Expression.
		*/
		function toExpression(find) {
			return typeof find === "string" ? new RegExp(escapeStringRegexp(find), "g") : find;
		}
		/**
		* Turn a replace into a function.
		*
		* @param {Replace} replace
		*   Replace.
		* @returns {ReplaceFunction}
		*   Function.
		*/
		function toFunction(replace) {
			return typeof replace === "function" ? replace : function() {
				return replace;
			};
		}
		//#endregion
		//#region ../../node_modules/.pnpm/mdast-util-gfm-autolink-literal@2.0.1/node_modules/mdast-util-gfm-autolink-literal/lib/index.js
		/**
		* @import {RegExpMatchObject, ReplaceFunction} from 'mdast-util-find-and-replace'
		* @import {CompileContext, Extension as FromMarkdownExtension, Handle as FromMarkdownHandle, Transform as FromMarkdownTransform} from 'mdast-util-from-markdown'
		* @import {ConstructName, Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
		* @import {Link, PhrasingContent} from 'mdast'
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM autolink
		* literals in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
		*/
		function gfmAutolinkLiteralFromMarkdown() {
			return {
				transforms: [transformGfmAutolinkLiterals],
				enter: {
					literalAutolink: enterLiteralAutolink,
					literalAutolinkEmail: enterLiteralAutolinkValue,
					literalAutolinkHttp: enterLiteralAutolinkValue,
					literalAutolinkWww: enterLiteralAutolinkValue
				},
				exit: {
					literalAutolink: exitLiteralAutolink,
					literalAutolinkEmail: exitLiteralAutolinkEmail,
					literalAutolinkHttp: exitLiteralAutolinkHttp,
					literalAutolinkWww: exitLiteralAutolinkWww
				}
			};
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterLiteralAutolink(token) {
			this.enter({
				type: "link",
				title: null,
				url: "",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterLiteralAutolinkValue(token) {
			this.config.enter.autolinkProtocol.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkHttp(token) {
			this.config.exit.autolinkProtocol.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkWww(token) {
			this.config.exit.data.call(this, token);
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.url = "http://" + this.sliceSerialize(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkEmail(token) {
			this.config.exit.autolinkEmail.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolink(token) {
			this.exit(token);
		}
		/** @type {FromMarkdownTransform} */
		function transformGfmAutolinkLiterals(tree) {
			findAndReplace(tree, [[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl], [/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu, findEmail]], { ignore: ["link", "linkReference"] });
		}
		/**
		* @type {ReplaceFunction}
		* @param {string} _
		* @param {string} protocol
		* @param {string} domain
		* @param {string} path
		* @param {RegExpMatchObject} match
		* @returns {Array<PhrasingContent> | Link | false}
		*/
		function findUrl(_, protocol, domain, path, match) {
			let prefix = "";
			if (!previous(match)) return false;
			if (/^w/i.test(protocol)) {
				domain = protocol + domain;
				protocol = "";
				prefix = "http://";
			}
			if (!isCorrectDomain(domain)) return false;
			const parts = splitUrl(domain + path);
			if (!parts[0]) return false;
			/** @type {Link} */
			const result = {
				type: "link",
				title: null,
				url: prefix + protocol + parts[0],
				children: [{
					type: "text",
					value: protocol + parts[0]
				}]
			};
			if (parts[1]) return [result, {
				type: "text",
				value: parts[1]
			}];
			return result;
		}
		/**
		* @type {ReplaceFunction}
		* @param {string} _
		* @param {string} atext
		* @param {string} label
		* @param {RegExpMatchObject} match
		* @returns {Link | false}
		*/
		function findEmail(_, atext, label, match) {
			if (!previous(match, true) || /[-\d_]$/.test(label)) return false;
			return {
				type: "link",
				title: null,
				url: "mailto:" + atext + "@" + label,
				children: [{
					type: "text",
					value: atext + "@" + label
				}]
			};
		}
		/**
		* @param {string} domain
		* @returns {boolean}
		*/
		function isCorrectDomain(domain) {
			const parts = domain.split(".");
			if (parts.length < 2 || parts[parts.length - 1] && (/_/.test(parts[parts.length - 1]) || !/[a-zA-Z\d]/.test(parts[parts.length - 1])) || parts[parts.length - 2] && (/_/.test(parts[parts.length - 2]) || !/[a-zA-Z\d]/.test(parts[parts.length - 2]))) return false;
			return true;
		}
		/**
		* @param {string} url
		* @returns {[string, string | undefined]}
		*/
		function splitUrl(url) {
			const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url);
			if (!trailExec) return [url, void 0];
			url = url.slice(0, trailExec.index);
			let trail = trailExec[0];
			let closingParenIndex = trail.indexOf(")");
			const openingParens = ccount(url, "(");
			let closingParens = ccount(url, ")");
			while (closingParenIndex !== -1 && openingParens > closingParens) {
				url += trail.slice(0, closingParenIndex + 1);
				trail = trail.slice(closingParenIndex + 1);
				closingParenIndex = trail.indexOf(")");
				closingParens++;
			}
			return [url, trail];
		}
		/**
		* @param {RegExpMatchObject} match
		* @param {boolean | null | undefined} [email=false]
		* @returns {boolean}
		*/
		function previous(match, email) {
			const code = match.input.charCodeAt(match.index - 1);
			return (match.index === 0 || unicodeWhitespace(code) || unicodePunctuation(code)) && (!email || code !== 47);
		}
		//#endregion
		//#region ../../node_modules/.pnpm/mdast-util-gfm-footnote@2.1.0/node_modules/mdast-util-gfm-footnote/lib/index.js
		/**
		* @import {
		*   CompileContext,
		*   Extension as FromMarkdownExtension,
		*   Handle as FromMarkdownHandle
		* } from 'mdast-util-from-markdown'
		* @import {ToMarkdownOptions} from 'mdast-util-gfm-footnote'
		* @import {
		*   Handle as ToMarkdownHandle,
		*   Map,
		*   Options as ToMarkdownExtension
		* } from 'mdast-util-to-markdown'
		* @import {FootnoteDefinition, FootnoteReference} from 'mdast'
		*/
		footnoteReference.peek = footnoteReferencePeek;
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteCallString() {
			this.buffer();
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteCall(token) {
			this.enter({
				type: "footnoteReference",
				identifier: "",
				label: ""
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteDefinitionLabelString() {
			this.buffer();
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteDefinition(token) {
			this.enter({
				type: "footnoteDefinition",
				identifier: "",
				label: "",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteCallString(token) {
			const label = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			node.label = label;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteCall(token) {
			this.exit(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteDefinitionLabelString(token) {
			const label = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			node.label = label;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteDefinition(token) {
			this.exit(token);
		}
		/** @type {ToMarkdownHandle} */
		function footnoteReferencePeek() {
			return "[";
		}
		/**
		* @type {ToMarkdownHandle}
		* @param {FootnoteReference} node
		*/
		function footnoteReference(node, _, state, info) {
			const tracker = state.createTracker(info);
			let value = tracker.move("[^");
			const exit = state.enter("footnoteReference");
			const subexit = state.enter("reference");
			value += tracker.move(state.safe(state.associationId(node), {
				after: "]",
				before: value
			}));
			subexit();
			exit();
			value += tracker.move("]");
			return value;
		}
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM footnotes
		* in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown`.
		*/
		function gfmFootnoteFromMarkdown() {
			return {
				enter: {
					gfmFootnoteCallString: enterFootnoteCallString,
					gfmFootnoteCall: enterFootnoteCall,
					gfmFootnoteDefinitionLabelString: enterFootnoteDefinitionLabelString,
					gfmFootnoteDefinition: enterFootnoteDefinition
				},
				exit: {
					gfmFootnoteCallString: exitFootnoteCallString,
					gfmFootnoteCall: exitFootnoteCall,
					gfmFootnoteDefinitionLabelString: exitFootnoteDefinitionLabelString,
					gfmFootnoteDefinition: exitFootnoteDefinition
				}
			};
		}
		//#endregion
		//#region ../../node_modules/.pnpm/mdast-util-gfm-strikethrough@2.0.0/node_modules/mdast-util-gfm-strikethrough/lib/index.js
		handleDelete.peek = peekDelete;
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM
		* strikethrough in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM strikethrough.
		*/
		function gfmStrikethroughFromMarkdown() {
			return {
				canContainEols: ["delete"],
				enter: { strikethrough: enterStrikethrough },
				exit: { strikethrough: exitStrikethrough }
			};
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterStrikethrough(token) {
			this.enter({
				type: "delete",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitStrikethrough(token) {
			this.exit(token);
		}
		/**
		* @type {ToMarkdownHandle}
		* @param {Delete} node
		*/
		function handleDelete(node, _, state, info) {
			const tracker = state.createTracker(info);
			const exit = state.enter("strikethrough");
			let value = tracker.move("~~");
			value += state.containerPhrasing(node, {
				...tracker.current(),
				before: value,
				after: "~"
			});
			value += tracker.move("~~");
			exit();
			return value;
		}
		/** @type {ToMarkdownHandle} */
		function peekDelete() {
			return "~";
		}
		//#endregion
		//#region ../../node_modules/.pnpm/mdast-util-gfm-table@2.0.0/node_modules/mdast-util-gfm-table/lib/index.js
		/**
		* @typedef {import('mdast').InlineCode} InlineCode
		* @typedef {import('mdast').Table} Table
		* @typedef {import('mdast').TableCell} TableCell
		* @typedef {import('mdast').TableRow} TableRow
		*
		* @typedef {import('markdown-table').Options} MarkdownTableOptions
		*
		* @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
		* @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
		* @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
		*
		* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
		* @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
		* @typedef {import('mdast-util-to-markdown').State} State
		* @typedef {import('mdast-util-to-markdown').Info} Info
		*/
		/**
		* @typedef Options
		*   Configuration.
		* @property {boolean | null | undefined} [tableCellPadding=true]
		*   Whether to add a space of padding between delimiters and cells (default:
		*   `true`).
		* @property {boolean | null | undefined} [tablePipeAlign=true]
		*   Whether to align the delimiters (default: `true`).
		* @property {MarkdownTableOptions['stringLength'] | null | undefined} [stringLength]
		*   Function to detect the length of table cell content, used when aligning
		*   the delimiters between cells (optional).
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM tables in
		* markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM tables.
		*/
		function gfmTableFromMarkdown() {
			return {
				enter: {
					table: enterTable,
					tableData: enterCell,
					tableHeader: enterCell,
					tableRow: enterRow
				},
				exit: {
					codeText: exitCodeText,
					table: exitTable,
					tableData: exit,
					tableHeader: exit,
					tableRow: exit
				}
			};
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterTable(token) {
			const align = token._align;
			this.enter({
				type: "table",
				align: align.map(function(d) {
					return d === "none" ? null : d;
				}),
				children: []
			}, token);
			this.data.inTable = true;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitTable(token) {
			this.exit(token);
			this.data.inTable = void 0;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterRow(token) {
			this.enter({
				type: "tableRow",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exit(token) {
			this.exit(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterCell(token) {
			this.enter({
				type: "tableCell",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitCodeText(token) {
			let value = this.resume();
			if (this.data.inTable) value = value.replace(/\\([\\|])/g, replace);
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.value = value;
			this.exit(token);
		}
		/**
		* @param {string} $0
		* @param {string} $1
		* @returns {string}
		*/
		function replace($0, $1) {
			return $1 === "|" ? $1 : $0;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/mdast-util-gfm-task-list-item@2.0.0/node_modules/mdast-util-gfm-task-list-item/lib/index.js
		/**
		* @typedef {import('mdast').ListItem} ListItem
		* @typedef {import('mdast').Paragraph} Paragraph
		* @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
		* @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
		* @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
		* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
		* @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM task
		* list items in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM task list items.
		*/
		function gfmTaskListItemFromMarkdown() {
			return { exit: {
				taskListCheckValueChecked: exitCheck,
				taskListCheckValueUnchecked: exitCheck,
				paragraph: exitParagraphWithTaskListItem
			} };
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitCheck(token) {
			const node = this.stack[this.stack.length - 2];
			node.type;
			node.checked = token.type === "taskListCheckValueChecked";
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitParagraphWithTaskListItem(token) {
			const parent = this.stack[this.stack.length - 2];
			if (parent && parent.type === "listItem" && typeof parent.checked === "boolean") {
				const node = this.stack[this.stack.length - 1];
				node.type;
				const head = node.children[0];
				if (head && head.type === "text") {
					const siblings = parent.children;
					let index = -1;
					/** @type {Paragraph | undefined} */
					let firstParaghraph;
					while (++index < siblings.length) {
						const sibling = siblings[index];
						if (sibling.type === "paragraph") {
							firstParaghraph = sibling;
							break;
						}
					}
					if (firstParaghraph === node) {
						head.value = head.value.slice(1);
						if (head.value.length === 0) node.children.shift();
						else if (node.position && head.position && typeof head.position.start.offset === "number") {
							head.position.start.column++;
							head.position.start.offset++;
							node.position.start = Object.assign({}, head.position.start);
						}
					}
				}
			}
			this.exit(token);
		}
		//#endregion
		//#region ../../node_modules/.pnpm/mdast-util-gfm@3.1.0/node_modules/mdast-util-gfm/lib/index.js
		/**
		* @import {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown'
		* @import {Options} from 'mdast-util-gfm'
		* @import {Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM (autolink
		* literals, footnotes, strikethrough, tables, tasklists).
		*
		* @returns {Array<FromMarkdownExtension>}
		*   Extension for `mdast-util-from-markdown` to enable GFM (autolink literals,
		*   footnotes, strikethrough, tables, tasklists).
		*/
		function gfmFromMarkdown() {
			return [
				gfmAutolinkLiteralFromMarkdown(),
				gfmFootnoteFromMarkdown(),
				gfmStrikethroughFromMarkdown(),
				gfmTableFromMarkdown(),
				gfmTaskListItemFromMarkdown()
			];
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-extension-gfm-autolink-literal@2.1.0/node_modules/micromark-extension-gfm-autolink-literal/lib/syntax.js
		/**
		* @import {Code, ConstructRecord, Event, Extension, Previous, State, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const wwwPrefix = {
			tokenize: tokenizeWwwPrefix,
			partial: true
		};
		const domain = {
			tokenize: tokenizeDomain,
			partial: true
		};
		const path = {
			tokenize: tokenizePath,
			partial: true
		};
		const trail = {
			tokenize: tokenizeTrail,
			partial: true
		};
		const emailDomainDotTrail = {
			tokenize: tokenizeEmailDomainDotTrail,
			partial: true
		};
		const wwwAutolink = {
			name: "wwwAutolink",
			tokenize: tokenizeWwwAutolink,
			previous: previousWww
		};
		const protocolAutolink = {
			name: "protocolAutolink",
			tokenize: tokenizeProtocolAutolink,
			previous: previousProtocol
		};
		const emailAutolink = {
			name: "emailAutolink",
			tokenize: tokenizeEmailAutolink,
			previous: previousEmail
		};
		/** @type {ConstructRecord} */
		const text = {};
		/**
		* Create an extension for `micromark` to support GitHub autolink literal
		* syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   autolink literal syntax.
		*/
		function gfmAutolinkLiteral() {
			return { text };
		}
		/** @type {Code} */
		let code = 48;
		while (code < 123) {
			text[code] = emailAutolink;
			code++;
			if (code === 58) code = 65;
			else if (code === 91) code = 97;
		}
		text[43] = emailAutolink;
		text[45] = emailAutolink;
		text[46] = emailAutolink;
		text[95] = emailAutolink;
		text[72] = [emailAutolink, protocolAutolink];
		text[104] = [emailAutolink, protocolAutolink];
		text[87] = [emailAutolink, wwwAutolink];
		text[119] = [emailAutolink, wwwAutolink];
		/**
		* Email autolink literal.
		*
		* ```markdown
		* > | a contact@example.org b
		*       ^^^^^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeEmailAutolink(effects, ok, nok) {
			const self = this;
			/** @type {boolean | undefined} */
			let dot;
			/** @type {boolean} */
			let data;
			return start;
			/**
			* Start of email autolink literal.
			*
			* ```markdown
			* > | a contact@example.org b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (!gfmAtext(code) || !previousEmail.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code);
				effects.enter("literalAutolink");
				effects.enter("literalAutolinkEmail");
				return atext(code);
			}
			/**
			* In email atext.
			*
			* ```markdown
			* > | a contact@example.org b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function atext(code) {
				if (gfmAtext(code)) {
					effects.consume(code);
					return atext;
				}
				if (code === 64) {
					effects.consume(code);
					return emailDomain;
				}
				return nok(code);
			}
			/**
			* In email domain.
			*
			* The reference code is a bit overly complex as it handles the `@`, of which
			* there may be just one.
			* Source: <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L318>
			*
			* ```markdown
			* > | a contact@example.org b
			*               ^
			* ```
			*
			* @type {State}
			*/
			function emailDomain(code) {
				if (code === 46) return effects.check(emailDomainDotTrail, emailDomainAfter, emailDomainDot)(code);
				if (code === 45 || code === 95 || asciiAlphanumeric(code)) {
					data = true;
					effects.consume(code);
					return emailDomain;
				}
				return emailDomainAfter(code);
			}
			/**
			* In email domain, on dot that is not a trail.
			*
			* ```markdown
			* > | a contact@example.org b
			*                      ^
			* ```
			*
			* @type {State}
			*/
			function emailDomainDot(code) {
				effects.consume(code);
				dot = true;
				return emailDomain;
			}
			/**
			* After email domain.
			*
			* ```markdown
			* > | a contact@example.org b
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function emailDomainAfter(code) {
				if (data && dot && asciiAlpha(self.previous)) {
					effects.exit("literalAutolinkEmail");
					effects.exit("literalAutolink");
					return ok(code);
				}
				return nok(code);
			}
		}
		/**
		* `www` autolink literal.
		*
		* ```markdown
		* > | a www.example.org b
		*       ^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeWwwAutolink(effects, ok, nok) {
			const self = this;
			return wwwStart;
			/**
			* Start of www autolink literal.
			*
			* ```markdown
			* > | www.example.com/a?b#c
			*     ^
			* ```
			*
			* @type {State}
			*/
			function wwwStart(code) {
				if (code !== 87 && code !== 119 || !previousWww.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code);
				effects.enter("literalAutolink");
				effects.enter("literalAutolinkWww");
				return effects.check(wwwPrefix, effects.attempt(domain, effects.attempt(path, wwwAfter), nok), nok)(code);
			}
			/**
			* After a www autolink literal.
			*
			* ```markdown
			* > | www.example.com/a?b#c
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function wwwAfter(code) {
				effects.exit("literalAutolinkWww");
				effects.exit("literalAutolink");
				return ok(code);
			}
		}
		/**
		* Protocol autolink literal.
		*
		* ```markdown
		* > | a https://example.org b
		*       ^^^^^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeProtocolAutolink(effects, ok, nok) {
			const self = this;
			let buffer = "";
			let seen = false;
			return protocolStart;
			/**
			* Start of protocol autolink literal.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*     ^
			* ```
			*
			* @type {State}
			*/
			function protocolStart(code) {
				if ((code === 72 || code === 104) && previousProtocol.call(self, self.previous) && !previousUnbalanced(self.events)) {
					effects.enter("literalAutolink");
					effects.enter("literalAutolinkHttp");
					buffer += String.fromCodePoint(code);
					effects.consume(code);
					return protocolPrefixInside;
				}
				return nok(code);
			}
			/**
			* In protocol.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*     ^^^^^
			* ```
			*
			* @type {State}
			*/
			function protocolPrefixInside(code) {
				if (asciiAlpha(code) && buffer.length < 5) {
					buffer += String.fromCodePoint(code);
					effects.consume(code);
					return protocolPrefixInside;
				}
				if (code === 58) {
					const protocol = buffer.toLowerCase();
					if (protocol === "http" || protocol === "https") {
						effects.consume(code);
						return protocolSlashesInside;
					}
				}
				return nok(code);
			}
			/**
			* In slashes.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*           ^^
			* ```
			*
			* @type {State}
			*/
			function protocolSlashesInside(code) {
				if (code === 47) {
					effects.consume(code);
					if (seen) return afterProtocol;
					seen = true;
					return protocolSlashesInside;
				}
				return nok(code);
			}
			/**
			* After protocol, before domain.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*             ^
			* ```
			*
			* @type {State}
			*/
			function afterProtocol(code) {
				return code === null || asciiControl(code) || markdownLineEndingOrSpace(code) || unicodeWhitespace(code) || unicodePunctuation(code) ? nok(code) : effects.attempt(domain, effects.attempt(path, protocolAfter), nok)(code);
			}
			/**
			* After a protocol autolink literal.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*                              ^
			* ```
			*
			* @type {State}
			*/
			function protocolAfter(code) {
				effects.exit("literalAutolinkHttp");
				effects.exit("literalAutolink");
				return ok(code);
			}
		}
		/**
		* `www` prefix.
		*
		* ```markdown
		* > | a www.example.org b
		*       ^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeWwwPrefix(effects, ok, nok) {
			let size = 0;
			return wwwPrefixInside;
			/**
			* In www prefix.
			*
			* ```markdown
			* > | www.example.com
			*     ^^^^
			* ```
			*
			* @type {State}
			*/
			function wwwPrefixInside(code) {
				if ((code === 87 || code === 119) && size < 3) {
					size++;
					effects.consume(code);
					return wwwPrefixInside;
				}
				if (code === 46 && size === 3) {
					effects.consume(code);
					return wwwPrefixAfter;
				}
				return nok(code);
			}
			/**
			* After www prefix.
			*
			* ```markdown
			* > | www.example.com
			*         ^
			* ```
			*
			* @type {State}
			*/
			function wwwPrefixAfter(code) {
				return code === null ? nok(code) : ok(code);
			}
		}
		/**
		* Domain.
		*
		* ```markdown
		* > | a https://example.org b
		*               ^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDomain(effects, ok, nok) {
			/** @type {boolean | undefined} */
			let underscoreInLastSegment;
			/** @type {boolean | undefined} */
			let underscoreInLastLastSegment;
			/** @type {boolean | undefined} */
			let seen;
			return domainInside;
			/**
			* In domain.
			*
			* ```markdown
			* > | https://example.com/a
			*             ^^^^^^^^^^^
			* ```
			*
			* @type {State}
			*/
			function domainInside(code) {
				if (code === 46 || code === 95) return effects.check(trail, domainAfter, domainAtPunctuation)(code);
				if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code) || code !== 45 && unicodePunctuation(code)) return domainAfter(code);
				seen = true;
				effects.consume(code);
				return domainInside;
			}
			/**
			* In domain, at potential trailing punctuation, that was not trailing.
			*
			* ```markdown
			* > | https://example.com
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function domainAtPunctuation(code) {
				if (code === 95) underscoreInLastSegment = true;
				else {
					underscoreInLastLastSegment = underscoreInLastSegment;
					underscoreInLastSegment = void 0;
				}
				effects.consume(code);
				return domainInside;
			}
			/**
			* After domain.
			*
			* ```markdown
			* > | https://example.com/a
			*                        ^
			* ```
			*
			* @type {State} */
			function domainAfter(code) {
				if (underscoreInLastLastSegment || underscoreInLastSegment || !seen) return nok(code);
				return ok(code);
			}
		}
		/**
		* Path.
		*
		* ```markdown
		* > | a https://example.org/stuff b
		*                          ^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizePath(effects, ok) {
			let sizeOpen = 0;
			let sizeClose = 0;
			return pathInside;
			/**
			* In path.
			*
			* ```markdown
			* > | https://example.com/a
			*                        ^^
			* ```
			*
			* @type {State}
			*/
			function pathInside(code) {
				if (code === 40) {
					sizeOpen++;
					effects.consume(code);
					return pathInside;
				}
				if (code === 41 && sizeClose < sizeOpen) return pathAtPunctuation(code);
				if (code === 33 || code === 34 || code === 38 || code === 39 || code === 41 || code === 42 || code === 44 || code === 46 || code === 58 || code === 59 || code === 60 || code === 63 || code === 93 || code === 95 || code === 126) return effects.check(trail, ok, pathAtPunctuation)(code);
				if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				effects.consume(code);
				return pathInside;
			}
			/**
			* In path, at potential trailing punctuation, that was not trailing.
			*
			* ```markdown
			* > | https://example.com/a"b
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function pathAtPunctuation(code) {
				if (code === 41) sizeClose++;
				effects.consume(code);
				return pathInside;
			}
		}
		/**
		* Trail.
		*
		* This calls `ok` if this *is* the trail, followed by an end, which means
		* the entire trail is not part of the link.
		* It calls `nok` if this *is* part of the link.
		*
		* ```markdown
		* > | https://example.com").
		*                        ^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTrail(effects, ok, nok) {
			return trail;
			/**
			* In trail of domain or path.
			*
			* ```markdown
			* > | https://example.com").
			*                        ^
			* ```
			*
			* @type {State}
			*/
			function trail(code) {
				if (code === 33 || code === 34 || code === 39 || code === 41 || code === 42 || code === 44 || code === 46 || code === 58 || code === 59 || code === 63 || code === 95 || code === 126) {
					effects.consume(code);
					return trail;
				}
				if (code === 38) {
					effects.consume(code);
					return trailCharacterReferenceStart;
				}
				if (code === 93) {
					effects.consume(code);
					return trailBracketAfter;
				}
				if (code === 60 || code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				return nok(code);
			}
			/**
			* In trail, after `]`.
			*
			* > 👉 **Note**: this deviates from `cmark-gfm` to fix a bug.
			* > See end of <https://github.com/github/cmark-gfm/issues/278> for more.
			*
			* ```markdown
			* > | https://example.com](
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailBracketAfter(code) {
				if (code === null || code === 40 || code === 91 || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				return trail(code);
			}
			/**
			* In character-reference like trail, after `&`.
			*
			* ```markdown
			* > | https://example.com&amp;).
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailCharacterReferenceStart(code) {
				return asciiAlpha(code) ? trailCharacterReferenceInside(code) : nok(code);
			}
			/**
			* In character-reference like trail.
			*
			* ```markdown
			* > | https://example.com&amp;).
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailCharacterReferenceInside(code) {
				if (code === 59) {
					effects.consume(code);
					return trail;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return trailCharacterReferenceInside;
				}
				return nok(code);
			}
		}
		/**
		* Dot in email domain trail.
		*
		* This calls `ok` if this *is* the trail, followed by an end, which means
		* the trail is not part of the link.
		* It calls `nok` if this *is* part of the link.
		*
		* ```markdown
		* > | contact@example.org.
		*                        ^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeEmailDomainDotTrail(effects, ok, nok) {
			return start;
			/**
			* Dot.
			*
			* ```markdown
			* > | contact@example.org.
			*                    ^   ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.consume(code);
				return after;
			}
			/**
			* After dot.
			*
			* ```markdown
			* > | contact@example.org.
			*                     ^   ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return asciiAlphanumeric(code) ? nok(code) : ok(code);
			}
		}
		/**
		* See:
		* <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L156>.
		*
		* @type {Previous}
		*/
		function previousWww(code) {
			return code === null || code === 40 || code === 42 || code === 95 || code === 91 || code === 93 || code === 126 || markdownLineEndingOrSpace(code);
		}
		/**
		* See:
		* <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L214>.
		*
		* @type {Previous}
		*/
		function previousProtocol(code) {
			return !asciiAlpha(code);
		}
		/**
		* @this {TokenizeContext}
		* @type {Previous}
		*/
		function previousEmail(code) {
			return !(code === 47 || gfmAtext(code));
		}
		/**
		* @param {Code} code
		* @returns {boolean}
		*/
		function gfmAtext(code) {
			return code === 43 || code === 45 || code === 46 || code === 95 || asciiAlphanumeric(code);
		}
		/**
		* @param {Array<Event>} events
		* @returns {boolean}
		*/
		function previousUnbalanced(events) {
			let index = events.length;
			let result = false;
			while (index--) {
				const token = events[index][1];
				if ((token.type === "labelLink" || token.type === "labelImage") && !token._balanced) {
					result = true;
					break;
				}
				if (token._gfmAutolinkLiteralWalkedInto) {
					result = false;
					break;
				}
			}
			if (events.length > 0 && !result) events[events.length - 1][1]._gfmAutolinkLiteralWalkedInto = true;
			return result;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-extension-gfm-footnote@2.1.0/node_modules/micromark-extension-gfm-footnote/lib/syntax.js
		/**
		* @import {Event, Exiter, Extension, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const indent = {
			tokenize: tokenizeIndent,
			partial: true
		};
		/**
		* Create an extension for `micromark` to enable GFM footnote syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to
		*   enable GFM footnote syntax.
		*/
		function gfmFootnote() {
			/** @type {Extension} */
			return {
				document: { [91]: {
					name: "gfmFootnoteDefinition",
					tokenize: tokenizeDefinitionStart,
					continuation: { tokenize: tokenizeDefinitionContinuation },
					exit: gfmFootnoteDefinitionEnd
				} },
				text: {
					[91]: {
						name: "gfmFootnoteCall",
						tokenize: tokenizeGfmFootnoteCall
					},
					[93]: {
						name: "gfmPotentialFootnoteCall",
						add: "after",
						tokenize: tokenizePotentialGfmFootnoteCall,
						resolveTo: resolveToPotentialGfmFootnoteCall
					}
				}
			};
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizePotentialGfmFootnoteCall(effects, ok, nok) {
			const self = this;
			let index = self.events.length;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			/** @type {Token} */
			let labelStart;
			while (index--) {
				const token = self.events[index][1];
				if (token.type === "labelImage") {
					labelStart = token;
					break;
				}
				if (token.type === "gfmFootnoteCall" || token.type === "labelLink" || token.type === "label" || token.type === "image" || token.type === "link") break;
			}
			return start;
			/**
			* @type {State}
			*/
			function start(code) {
				if (!labelStart || !labelStart._balanced) return nok(code);
				const id = normalizeIdentifier(self.sliceSerialize({
					start: labelStart.end,
					end: self.now()
				}));
				if (id.codePointAt(0) !== 94 || !defined.includes(id.slice(1))) return nok(code);
				effects.enter("gfmFootnoteCallLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallLabelMarker");
				return ok(code);
			}
		}
		/** @type {Resolver} */
		function resolveToPotentialGfmFootnoteCall(events, context) {
			let index = events.length;
			while (index--) if (events[index][1].type === "labelImage" && events[index][0] === "enter") {
				events[index][1];
				break;
			}
			events[index + 1][1].type = "data";
			events[index + 3][1].type = "gfmFootnoteCallLabelMarker";
			/** @type {Token} */
			const call = {
				type: "gfmFootnoteCall",
				start: Object.assign({}, events[index + 3][1].start),
				end: Object.assign({}, events[events.length - 1][1].end)
			};
			/** @type {Token} */
			const marker = {
				type: "gfmFootnoteCallMarker",
				start: Object.assign({}, events[index + 3][1].end),
				end: Object.assign({}, events[index + 3][1].end)
			};
			marker.end.column++;
			marker.end.offset++;
			marker.end._bufferIndex++;
			/** @type {Token} */
			const string = {
				type: "gfmFootnoteCallString",
				start: Object.assign({}, marker.end),
				end: Object.assign({}, events[events.length - 1][1].start)
			};
			/** @type {Token} */
			const chunk = {
				type: "chunkString",
				contentType: "string",
				start: Object.assign({}, string.start),
				end: Object.assign({}, string.end)
			};
			/** @type {Array<Event>} */
			const replacement = [
				events[index + 1],
				events[index + 2],
				[
					"enter",
					call,
					context
				],
				events[index + 3],
				events[index + 4],
				[
					"enter",
					marker,
					context
				],
				[
					"exit",
					marker,
					context
				],
				[
					"enter",
					string,
					context
				],
				[
					"enter",
					chunk,
					context
				],
				[
					"exit",
					chunk,
					context
				],
				[
					"exit",
					string,
					context
				],
				events[events.length - 2],
				events[events.length - 1],
				[
					"exit",
					call,
					context
				]
			];
			events.splice(index, events.length - index + 1, ...replacement);
			return events;
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeGfmFootnoteCall(effects, ok, nok) {
			const self = this;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			let size = 0;
			/** @type {boolean} */
			let data;
			return start;
			/**
			* Start of footnote label.
			*
			* ```markdown
			* > | a [^b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("gfmFootnoteCall");
				effects.enter("gfmFootnoteCallLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallLabelMarker");
				return callStart;
			}
			/**
			* After `[`, at `^`.
			*
			* ```markdown
			* > | a [^b] c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function callStart(code) {
				if (code !== 94) return nok(code);
				effects.enter("gfmFootnoteCallMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallMarker");
				effects.enter("gfmFootnoteCallString");
				effects.enter("chunkString").contentType = "string";
				return callData;
			}
			/**
			* In label.
			*
			* ```markdown
			* > | a [^b] c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function callData(code) {
				if (size > 999 || code === 93 && !data || code === null || code === 91 || markdownLineEndingOrSpace(code)) return nok(code);
				if (code === 93) {
					effects.exit("chunkString");
					const token = effects.exit("gfmFootnoteCallString");
					if (!defined.includes(normalizeIdentifier(self.sliceSerialize(token)))) return nok(code);
					effects.enter("gfmFootnoteCallLabelMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteCallLabelMarker");
					effects.exit("gfmFootnoteCall");
					return ok;
				}
				if (!markdownLineEndingOrSpace(code)) data = true;
				size++;
				effects.consume(code);
				return code === 92 ? callEscape : callData;
			}
			/**
			* On character after escape.
			*
			* ```markdown
			* > | a [^b\c] d
			*           ^
			* ```
			*
			* @type {State}
			*/
			function callEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return callData;
				}
				return callData(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDefinitionStart(effects, ok, nok) {
			const self = this;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			/** @type {string} */
			let identifier;
			let size = 0;
			/** @type {boolean | undefined} */
			let data;
			return start;
			/**
			* Start of GFM footnote definition.
			*
			* ```markdown
			* > | [^a]: b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("gfmFootnoteDefinition")._container = true;
				effects.enter("gfmFootnoteDefinitionLabel");
				effects.enter("gfmFootnoteDefinitionLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteDefinitionLabelMarker");
				return labelAtMarker;
			}
			/**
			* In label, at caret.
			*
			* ```markdown
			* > | [^a]: b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function labelAtMarker(code) {
				if (code === 94) {
					effects.enter("gfmFootnoteDefinitionMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteDefinitionMarker");
					effects.enter("gfmFootnoteDefinitionLabelString");
					effects.enter("chunkString").contentType = "string";
					return labelInside;
				}
				return nok(code);
			}
			/**
			* In label.
			*
			* > 👉 **Note**: `cmark-gfm` prevents whitespace from occurring in footnote
			* > definition labels.
			*
			* ```markdown
			* > | [^a]: b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function labelInside(code) {
				if (size > 999 || code === 93 && !data || code === null || code === 91 || markdownLineEndingOrSpace(code)) return nok(code);
				if (code === 93) {
					effects.exit("chunkString");
					const token = effects.exit("gfmFootnoteDefinitionLabelString");
					identifier = normalizeIdentifier(self.sliceSerialize(token));
					effects.enter("gfmFootnoteDefinitionLabelMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteDefinitionLabelMarker");
					effects.exit("gfmFootnoteDefinitionLabel");
					return labelAfter;
				}
				if (!markdownLineEndingOrSpace(code)) data = true;
				size++;
				effects.consume(code);
				return code === 92 ? labelEscape : labelInside;
			}
			/**
			* After `\`, at a special character.
			*
			* > 👉 **Note**: `cmark-gfm` currently does not support escaped brackets:
			* > <https://github.com/github/cmark-gfm/issues/240>
			*
			* ```markdown
			* > | [^a\*b]: c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function labelEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return labelInside;
				}
				return labelInside(code);
			}
			/**
			* After definition label.
			*
			* ```markdown
			* > | [^a]: b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function labelAfter(code) {
				if (code === 58) {
					effects.enter("definitionMarker");
					effects.consume(code);
					effects.exit("definitionMarker");
					if (!defined.includes(identifier)) defined.push(identifier);
					return factorySpace(effects, whitespaceAfter, "gfmFootnoteDefinitionWhitespace");
				}
				return nok(code);
			}
			/**
			* After definition prefix.
			*
			* ```markdown
			* > | [^a]: b
			*           ^
			* ```
			*
			* @type {State}
			*/
			function whitespaceAfter(code) {
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDefinitionContinuation(effects, ok, nok) {
			return effects.check(blankLine, ok, effects.attempt(indent, ok, nok));
		}
		/** @type {Exiter} */
		function gfmFootnoteDefinitionEnd(effects) {
			effects.exit("gfmFootnoteDefinition");
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeIndent(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "gfmFootnoteDefinitionIndent", 5);
			/**
			* @type {State}
			*/
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "gfmFootnoteDefinitionIndent" && tail[2].sliceSerialize(tail[1], true).length === 4 ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-extension-gfm-strikethrough@2.1.0/node_modules/micromark-extension-gfm-strikethrough/lib/syntax.js
		/**
		* @import {Options} from 'micromark-extension-gfm-strikethrough'
		* @import {Event, Extension, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		/**
		* Create an extension for `micromark` to enable GFM strikethrough syntax.
		*
		* @param {Options | null | undefined} [options={}]
		*   Configuration.
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions`, to
		*   enable GFM strikethrough syntax.
		*/
		function gfmStrikethrough(options) {
			let single = (options || {}).singleTilde;
			const tokenizer = {
				name: "strikethrough",
				tokenize: tokenizeStrikethrough,
				resolveAll: resolveAllStrikethrough
			};
			if (single === null || single === void 0) single = true;
			return {
				text: { [126]: tokenizer },
				insideSpan: { null: [tokenizer] },
				attentionMarkers: { null: [126] }
			};
			/**
			* Take events and resolve strikethrough.
			*
			* @type {Resolver}
			*/
			function resolveAllStrikethrough(events, context) {
				let index = -1;
				while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "strikethroughSequenceTemporary" && events[index][1]._close) {
					let open = index;
					while (open--) if (events[open][0] === "exit" && events[open][1].type === "strikethroughSequenceTemporary" && events[open][1]._open && events[index][1].end.offset - events[index][1].start.offset === events[open][1].end.offset - events[open][1].start.offset) {
						events[index][1].type = "strikethroughSequence";
						events[open][1].type = "strikethroughSequence";
						/** @type {Token} */
						const strikethrough = {
							type: "strikethrough",
							start: Object.assign({}, events[open][1].start),
							end: Object.assign({}, events[index][1].end)
						};
						/** @type {Token} */
						const text = {
							type: "strikethroughText",
							start: Object.assign({}, events[open][1].end),
							end: Object.assign({}, events[index][1].start)
						};
						/** @type {Array<Event>} */
						const nextEvents = [
							[
								"enter",
								strikethrough,
								context
							],
							[
								"enter",
								events[open][1],
								context
							],
							[
								"exit",
								events[open][1],
								context
							],
							[
								"enter",
								text,
								context
							]
						];
						const insideSpan = context.parser.constructs.insideSpan.null;
						if (insideSpan) splice(nextEvents, nextEvents.length, 0, resolveAll(insideSpan, events.slice(open + 1, index), context));
						splice(nextEvents, nextEvents.length, 0, [
							[
								"exit",
								text,
								context
							],
							[
								"enter",
								events[index][1],
								context
							],
							[
								"exit",
								events[index][1],
								context
							],
							[
								"exit",
								strikethrough,
								context
							]
						]);
						splice(events, open - 1, index - open + 3, nextEvents);
						index = open + nextEvents.length - 2;
						break;
					}
				}
				index = -1;
				while (++index < events.length) if (events[index][1].type === "strikethroughSequenceTemporary") events[index][1].type = "data";
				return events;
			}
			/**
			* @this {TokenizeContext}
			* @type {Tokenizer}
			*/
			function tokenizeStrikethrough(effects, ok, nok) {
				const previous = this.previous;
				const events = this.events;
				let size = 0;
				return start;
				/** @type {State} */
				function start(code) {
					if (previous === 126 && events[events.length - 1][1].type !== "characterEscape") return nok(code);
					effects.enter("strikethroughSequenceTemporary");
					return more(code);
				}
				/** @type {State} */
				function more(code) {
					const before = classifyCharacter(previous);
					if (code === 126) {
						if (size > 1) return nok(code);
						effects.consume(code);
						size++;
						return more;
					}
					if (size < 2 && !single) return nok(code);
					const token = effects.exit("strikethroughSequenceTemporary");
					const after = classifyCharacter(code);
					token._open = !after || after === 2 && Boolean(before);
					token._close = !before || before === 2 && Boolean(after);
					return ok(code);
				}
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-extension-gfm-table@2.1.1/node_modules/micromark-extension-gfm-table/lib/edit-map.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @typedef {[number, number, Array<Event>]} Change
		* @typedef {[number, number, number]} Jump
		*/
		/**
		* Tracks a bunch of edits.
		*/
		var EditMap = class {
			/**
			* Create a new edit map.
			*/
			constructor() {
				/**
				* Record of changes.
				*
				* @type {Array<Change>}
				*/
				this.map = [];
			}
			/**
			* Create an edit: a remove and/or add at a certain place.
			*
			* @param {number} index
			* @param {number} remove
			* @param {Array<Event>} add
			* @returns {undefined}
			*/
			add(index, remove, add) {
				addImplementation(this, index, remove, add);
			}
			/**
			* Done, change the events.
			*
			* @param {Array<Event>} events
			* @returns {undefined}
			*/
			consume(events) {
				this.map.sort(function(a, b) {
					return a[0] - b[0];
				});
				/* c8 ignore next 3 -- `resolve` is never called without tables, so without edits. */
				if (this.map.length === 0) return;
				let index = this.map.length;
				/** @type {Array<Array<Event>>} */
				const vecs = [];
				while (index > 0) {
					index -= 1;
					vecs.push(events.slice(this.map[index][0] + this.map[index][1]), this.map[index][2]);
					events.length = this.map[index][0];
				}
				vecs.push(events.slice());
				events.length = 0;
				let slice = vecs.pop();
				while (slice) {
					for (const element of slice) events.push(element);
					slice = vecs.pop();
				}
				this.map.length = 0;
			}
		};
		/**
		* Create an edit.
		*
		* @param {EditMap} editMap
		* @param {number} at
		* @param {number} remove
		* @param {Array<Event>} add
		* @returns {undefined}
		*/
		function addImplementation(editMap, at, remove, add) {
			let index = 0;
			/* c8 ignore next 3 -- `resolve` is never called without tables, so without edits. */
			if (remove === 0 && add.length === 0) return;
			while (index < editMap.map.length) {
				if (editMap.map[index][0] === at) {
					editMap.map[index][1] += remove;
					editMap.map[index][2].push(...add);
					return;
				}
				index += 1;
			}
			editMap.map.push([
				at,
				remove,
				add
			]);
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-extension-gfm-table@2.1.1/node_modules/micromark-extension-gfm-table/lib/infer.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @typedef {'center' | 'left' | 'none' | 'right'} Align
		*/
		/**
		* Figure out the alignment of a GFM table.
		*
		* @param {Readonly<Array<Event>>} events
		*   List of events.
		* @param {number} index
		*   Table enter event.
		* @returns {Array<Align>}
		*   List of aligns.
		*/
		function gfmTableAlign(events, index) {
			let inDelimiterRow = false;
			/** @type {Array<Align>} */
			const align = [];
			while (index < events.length) {
				const event = events[index];
				if (inDelimiterRow) {
					if (event[0] === "enter") {
						if (event[1].type === "tableContent") align.push(events[index + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
					} else if (event[1].type === "tableContent") {
						if (events[index - 1][1].type === "tableDelimiterMarker") {
							const alignIndex = align.length - 1;
							align[alignIndex] = align[alignIndex] === "left" ? "center" : "right";
						}
					} else if (event[1].type === "tableDelimiterRow") break;
				} else if (event[0] === "enter" && event[1].type === "tableDelimiterRow") inDelimiterRow = true;
				index += 1;
			}
			return align;
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-extension-gfm-table@2.1.1/node_modules/micromark-extension-gfm-table/lib/syntax.js
		/**
		* @import {Event, Extension, Point, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		/**
		* @typedef {[number, number, number, number]} Range
		*   Cell info.
		*
		* @typedef {0 | 1 | 2 | 3} RowKind
		*   Where we are: `1` for head row, `2` for delimiter row, `3` for body row.
		*/
		/**
		* Create an HTML extension for `micromark` to support GitHub tables syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   table syntax.
		*/
		function gfmTable() {
			return { flow: { null: {
				name: "table",
				tokenize: tokenizeTable,
				resolveAll: resolveTable
			} } };
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTable(effects, ok, nok) {
			const self = this;
			let size = 0;
			let sizeB = 0;
			/** @type {boolean | undefined} */
			let seen;
			return start;
			/**
			* Start of a GFM table.
			*
			* If there is a valid table row or table head before, then we try to parse
			* another row.
			* Otherwise, we try to parse a head.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			* > | | b |
			*     ^
			* ```
			* @type {State}
			*/
			function start(code) {
				let index = self.events.length - 1;
				while (index > -1) {
					const type = self.events[index][1].type;
					if (type === "lineEnding" || type === "linePrefix") index--;
					else break;
				}
				const tail = index > -1 ? self.events[index][1].type : null;
				const next = tail === "tableHead" || tail === "tableRow" ? bodyRowStart : headRowBefore;
				if (next === bodyRowStart && self.parser.lazy[self.now().line]) return nok(code);
				return next(code);
			}
			/**
			* Before table head row.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowBefore(code) {
				effects.enter("tableHead");
				effects.enter("tableRow");
				return headRowStart(code);
			}
			/**
			* Before table head row, after whitespace.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowStart(code) {
				if (code === 124) return headRowBreak(code);
				seen = true;
				sizeB += 1;
				return headRowBreak(code);
			}
			/**
			* At break in table head row.
			*
			* ```markdown
			* > | | a |
			*     ^
			*       ^
			*         ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowBreak(code) {
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					if (sizeB > 1) {
						sizeB = 0;
						self.interrupt = true;
						effects.exit("tableRow");
						effects.enter("lineEnding");
						effects.consume(code);
						effects.exit("lineEnding");
						return headDelimiterStart;
					}
					return nok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, headRowBreak, "whitespace")(code);
				sizeB += 1;
				if (seen) {
					seen = false;
					size += 1;
				}
				if (code === 124) {
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					seen = true;
					return headRowBreak;
				}
				effects.enter("data");
				return headRowData(code);
			}
			/**
			* In table head row data.
			*
			* ```markdown
			* > | | a |
			*       ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowData(code) {
				if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
					effects.exit("data");
					return headRowBreak(code);
				}
				effects.consume(code);
				return code === 92 ? headRowEscape : headRowData;
			}
			/**
			* In table head row escape.
			*
			* ```markdown
			* > | | a\-b |
			*         ^
			*   | | ---- |
			*   | | c    |
			* ```
			*
			* @type {State}
			*/
			function headRowEscape(code) {
				if (code === 92 || code === 124) {
					effects.consume(code);
					return headRowData;
				}
				return headRowData(code);
			}
			/**
			* Before delimiter row.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*     ^
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headDelimiterStart(code) {
				self.interrupt = false;
				if (self.parser.lazy[self.now().line]) return nok(code);
				effects.enter("tableDelimiterRow");
				seen = false;
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
				return headDelimiterBefore(code);
			}
			/**
			* Before delimiter row, after optional whitespace.
			*
			* Reused when a `|` is found later, to parse another cell.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*     ^
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headDelimiterBefore(code) {
				if (code === 45 || code === 58) return headDelimiterValueBefore(code);
				if (code === 124) {
					seen = true;
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					return headDelimiterCellBefore;
				}
				return headDelimiterNok(code);
			}
			/**
			* After `|`, before delimiter cell.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*      ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterCellBefore(code) {
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterValueBefore, "whitespace")(code);
				return headDelimiterValueBefore(code);
			}
			/**
			* Before delimiter cell value.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterValueBefore(code) {
				if (code === 58) {
					sizeB += 1;
					seen = true;
					effects.enter("tableDelimiterMarker");
					effects.consume(code);
					effects.exit("tableDelimiterMarker");
					return headDelimiterLeftAlignmentAfter;
				}
				if (code === 45) {
					sizeB += 1;
					return headDelimiterLeftAlignmentAfter(code);
				}
				if (code === null || markdownLineEnding(code)) return headDelimiterCellAfter(code);
				return headDelimiterNok(code);
			}
			/**
			* After delimiter cell left alignment marker.
			*
			* ```markdown
			*   | | a  |
			* > | | :- |
			*        ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterLeftAlignmentAfter(code) {
				if (code === 45) {
					effects.enter("tableDelimiterFiller");
					return headDelimiterFiller(code);
				}
				return headDelimiterNok(code);
			}
			/**
			* In delimiter cell filler.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterFiller(code) {
				if (code === 45) {
					effects.consume(code);
					return headDelimiterFiller;
				}
				if (code === 58) {
					seen = true;
					effects.exit("tableDelimiterFiller");
					effects.enter("tableDelimiterMarker");
					effects.consume(code);
					effects.exit("tableDelimiterMarker");
					return headDelimiterRightAlignmentAfter;
				}
				effects.exit("tableDelimiterFiller");
				return headDelimiterRightAlignmentAfter(code);
			}
			/**
			* After delimiter cell right alignment marker.
			*
			* ```markdown
			*   | |  a |
			* > | | -: |
			*         ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterRightAlignmentAfter(code) {
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterCellAfter, "whitespace")(code);
				return headDelimiterCellAfter(code);
			}
			/**
			* After delimiter cell.
			*
			* ```markdown
			*   | |  a |
			* > | | -: |
			*          ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterCellAfter(code) {
				if (code === 124) return headDelimiterBefore(code);
				if (code === null || markdownLineEnding(code)) {
					if (!seen || size !== sizeB) return headDelimiterNok(code);
					effects.exit("tableDelimiterRow");
					effects.exit("tableHead");
					return ok(code);
				}
				return headDelimiterNok(code);
			}
			/**
			* In delimiter row, at a disallowed byte.
			*
			* ```markdown
			*   | | a |
			* > | | x |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterNok(code) {
				return nok(code);
			}
			/**
			* Before table body row.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*     ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowStart(code) {
				effects.enter("tableRow");
				return bodyRowBreak(code);
			}
			/**
			* At break in table body row.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*     ^
			*       ^
			*         ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowBreak(code) {
				if (code === 124) {
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					return bodyRowBreak;
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("tableRow");
					return ok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, bodyRowBreak, "whitespace")(code);
				effects.enter("data");
				return bodyRowData(code);
			}
			/**
			* In table body row data.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowData(code) {
				if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
					effects.exit("data");
					return bodyRowBreak(code);
				}
				effects.consume(code);
				return code === 92 ? bodyRowEscape : bodyRowData;
			}
			/**
			* In table body row escape.
			*
			* ```markdown
			*   | | a    |
			*   | | ---- |
			* > | | b\-c |
			*         ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowEscape(code) {
				if (code === 92 || code === 124) {
					effects.consume(code);
					return bodyRowData;
				}
				return bodyRowData(code);
			}
		}
		/** @type {Resolver} */
		function resolveTable(events, context) {
			let index = -1;
			let inFirstCellAwaitingPipe = true;
			/** @type {RowKind} */
			let rowKind = 0;
			/** @type {Range} */
			let lastCell = [
				0,
				0,
				0,
				0
			];
			/** @type {Range} */
			let cell = [
				0,
				0,
				0,
				0
			];
			let afterHeadAwaitingFirstBodyRow = false;
			let lastTableEnd = 0;
			/** @type {Token | undefined} */
			let currentTable;
			/** @type {Token | undefined} */
			let currentBody;
			/** @type {Token | undefined} */
			let currentCell;
			const map = new EditMap();
			while (++index < events.length) {
				const event = events[index];
				const token = event[1];
				if (event[0] === "enter") {
					if (token.type === "tableHead") {
						afterHeadAwaitingFirstBodyRow = false;
						if (lastTableEnd !== 0) {
							flushTableEnd(map, context, lastTableEnd, currentTable, currentBody);
							currentBody = void 0;
							lastTableEnd = 0;
						}
						currentTable = {
							type: "table",
							start: Object.assign({}, token.start),
							end: Object.assign({}, token.end)
						};
						map.add(index, 0, [[
							"enter",
							currentTable,
							context
						]]);
					} else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
						inFirstCellAwaitingPipe = true;
						currentCell = void 0;
						lastCell = [
							0,
							0,
							0,
							0
						];
						cell = [
							0,
							index + 1,
							0,
							0
						];
						if (afterHeadAwaitingFirstBodyRow) {
							afterHeadAwaitingFirstBodyRow = false;
							currentBody = {
								type: "tableBody",
								start: Object.assign({}, token.start),
								end: Object.assign({}, token.end)
							};
							map.add(index, 0, [[
								"enter",
								currentBody,
								context
							]]);
						}
						rowKind = token.type === "tableDelimiterRow" ? 2 : currentBody ? 3 : 1;
					} else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) {
						inFirstCellAwaitingPipe = false;
						if (cell[2] === 0) {
							if (lastCell[1] !== 0) {
								cell[0] = cell[1];
								currentCell = flushCell(map, context, lastCell, rowKind, void 0, currentCell);
								lastCell = [
									0,
									0,
									0,
									0
								];
							}
							cell[2] = index;
						}
					} else if (token.type === "tableCellDivider") {
						if (inFirstCellAwaitingPipe) inFirstCellAwaitingPipe = false;
						else {
							if (lastCell[1] !== 0) {
								cell[0] = cell[1];
								currentCell = flushCell(map, context, lastCell, rowKind, void 0, currentCell);
							}
							lastCell = cell;
							cell = [
								lastCell[1],
								index,
								0,
								0
							];
						}
					}
				} else if (token.type === "tableHead") {
					afterHeadAwaitingFirstBodyRow = true;
					lastTableEnd = index;
				} else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
					lastTableEnd = index;
					if (lastCell[1] !== 0) {
						cell[0] = cell[1];
						currentCell = flushCell(map, context, lastCell, rowKind, index, currentCell);
					} else if (cell[1] !== 0) currentCell = flushCell(map, context, cell, rowKind, index, currentCell);
					rowKind = 0;
				} else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) cell[3] = index;
			}
			if (lastTableEnd !== 0) flushTableEnd(map, context, lastTableEnd, currentTable, currentBody);
			map.consume(context.events);
			index = -1;
			while (++index < context.events.length) {
				const event = context.events[index];
				if (event[0] === "enter" && event[1].type === "table") event[1]._align = gfmTableAlign(context.events, index);
			}
			return events;
		}
		/**
		* Generate a cell.
		*
		* @param {EditMap} map
		* @param {Readonly<TokenizeContext>} context
		* @param {Readonly<Range>} range
		* @param {RowKind} rowKind
		* @param {number | undefined} rowEnd
		* @param {Token | undefined} previousCell
		* @returns {Token | undefined}
		*/
		function flushCell(map, context, range, rowKind, rowEnd, previousCell) {
			const groupName = rowKind === 1 ? "tableHeader" : rowKind === 2 ? "tableDelimiter" : "tableData";
			const valueName = "tableContent";
			if (range[0] !== 0) {
				previousCell.end = Object.assign({}, getPoint(context.events, range[0]));
				map.add(range[0], 0, [[
					"exit",
					previousCell,
					context
				]]);
			}
			const now = getPoint(context.events, range[1]);
			previousCell = {
				type: groupName,
				start: Object.assign({}, now),
				end: Object.assign({}, now)
			};
			map.add(range[1], 0, [[
				"enter",
				previousCell,
				context
			]]);
			if (range[2] !== 0) {
				const relatedStart = getPoint(context.events, range[2]);
				const relatedEnd = getPoint(context.events, range[3]);
				/** @type {Token} */
				const valueToken = {
					type: valueName,
					start: Object.assign({}, relatedStart),
					end: Object.assign({}, relatedEnd)
				};
				map.add(range[2], 0, [[
					"enter",
					valueToken,
					context
				]]);
				if (rowKind !== 2) {
					const start = context.events[range[2]];
					const end = context.events[range[3]];
					start[1].end = Object.assign({}, end[1].end);
					start[1].type = "chunkText";
					start[1].contentType = "text";
					if (range[3] > range[2] + 1) {
						const a = range[2] + 1;
						const b = range[3] - range[2] - 1;
						map.add(a, b, []);
					}
				}
				map.add(range[3] + 1, 0, [[
					"exit",
					valueToken,
					context
				]]);
			}
			if (rowEnd !== void 0) {
				previousCell.end = Object.assign({}, getPoint(context.events, rowEnd));
				map.add(rowEnd, 0, [[
					"exit",
					previousCell,
					context
				]]);
				previousCell = void 0;
			}
			return previousCell;
		}
		/**
		* Generate table end (and table body end).
		*
		* @param {Readonly<EditMap>} map
		* @param {Readonly<TokenizeContext>} context
		* @param {number} index
		* @param {Token} table
		* @param {Token | undefined} tableBody
		*/
		function flushTableEnd(map, context, index, table, tableBody) {
			/** @type {Array<Event>} */
			const exits = [];
			const related = getPoint(context.events, index);
			if (tableBody) {
				tableBody.end = Object.assign({}, related);
				exits.push([
					"exit",
					tableBody,
					context
				]);
			}
			table.end = Object.assign({}, related);
			exits.push([
				"exit",
				table,
				context
			]);
			map.add(index + 1, 0, exits);
		}
		/**
		* @param {Readonly<Array<Event>>} events
		* @param {number} index
		* @returns {Readonly<Point>}
		*/
		function getPoint(events, index) {
			const event = events[index];
			const side = event[0] === "enter" ? "start" : "end";
			return event[1][side];
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-extension-gfm-task-list-item@2.1.0/node_modules/micromark-extension-gfm-task-list-item/lib/syntax.js
		/**
		* @import {Extension, State, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const tasklistCheck = {
			name: "tasklistCheck",
			tokenize: tokenizeTasklistCheck
		};
		/**
		* Create an HTML extension for `micromark` to support GFM task list items
		* syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `htmlExtensions` to
		*   support GFM task list items when serializing to HTML.
		*/
		function gfmTaskListItem() {
			return { text: { [91]: tasklistCheck } };
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTasklistCheck(effects, ok, nok) {
			const self = this;
			return open;
			/**
			* At start of task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (self.previous !== null || !self._gfmTasklistFirstContentOfListItem) return nok(code);
				effects.enter("taskListCheck");
				effects.enter("taskListCheckMarker");
				effects.consume(code);
				effects.exit("taskListCheckMarker");
				return inside;
			}
			/**
			* In task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*        ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (markdownLineEndingOrSpace(code)) {
					effects.enter("taskListCheckValueUnchecked");
					effects.consume(code);
					effects.exit("taskListCheckValueUnchecked");
					return close;
				}
				if (code === 88 || code === 120) {
					effects.enter("taskListCheckValueChecked");
					effects.consume(code);
					effects.exit("taskListCheckValueChecked");
					return close;
				}
				return nok(code);
			}
			/**
			* At close of task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*         ^
			* ```
			*
			* @type {State}
			*/
			function close(code) {
				if (code === 93) {
					effects.enter("taskListCheckMarker");
					effects.consume(code);
					effects.exit("taskListCheckMarker");
					effects.exit("taskListCheck");
					return after;
				}
				return nok(code);
			}
			/**
			* @type {State}
			*/
			function after(code) {
				if (markdownLineEnding(code)) return ok(code);
				if (markdownSpace(code)) return effects.check({ tokenize: spaceThenNonSpace }, ok, nok)(code);
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function spaceThenNonSpace(effects, ok, nok) {
			return factorySpace(effects, after, "whitespace");
			/**
			* After whitespace, after task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*           ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return code === null ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region ../../node_modules/.pnpm/micromark-extension-gfm@3.0.0/node_modules/micromark-extension-gfm/index.js
		/**
		* @typedef {import('micromark-extension-gfm-footnote').HtmlOptions} HtmlOptions
		* @typedef {import('micromark-extension-gfm-strikethrough').Options} Options
		* @typedef {import('micromark-util-types').Extension} Extension
		* @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
		*/
		/**
		* Create an extension for `micromark` to enable GFM syntax.
		*
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		*
		*   Passed to `micromark-extens-gfm-strikethrough`.
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   syntax.
		*/
		function gfm(options) {
			return combineExtensions([
				gfmAutolinkLiteral(),
				gfmFootnote(),
				gfmStrikethrough(options),
				gfmTable(),
				gfmTaskListItem()
			]);
		}
		//#endregion
		//#region lib/types/client/markdown-source-map.js
		const MARKDOWN_DECODE_TOKEN = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/giu;
		function children(node) {
			return "children" in node ? node.children : [];
		}
		function offsets(node) {
			const start = node.position?.start.offset;
			const end = node.position?.end.offset;
			if (start === void 0 || end === void 0) throw new Error("Markdown parser omitted source offsets");
			return [start, end];
		}
		function directUnits(value, startOffset) {
			const units = [];
			let cursor = startOffset;
			for (const text of value) {
				units.push({
					text,
					startOffset: cursor,
					endOffset: cursor + text.length
				});
				cursor += text.length;
			}
			return units;
		}
		function visibleText(units) {
			return units.map((unit) => unit.text).join("");
		}
		function decodedUnits(markdown, value, startOffset, endOffset) {
			const source = markdown.slice(startOffset, endOffset);
			const units = [];
			let cursor = 0;
			for (const match of source.matchAll(MARKDOWN_DECODE_TOKEN)) {
				const index = match.index;
				units.push(...directUnits(source.slice(cursor, index), startOffset + cursor));
				const raw = match[0];
				const decoded = decodeString(raw);
				if (decoded === raw) units.push(...directUnits(raw, startOffset + index));
				else for (const text of decoded) units.push({
					text,
					startOffset: startOffset + index,
					endOffset: startOffset + index + raw.length
				});
				cursor = index + raw.length;
			}
			units.push(...directUnits(source.slice(cursor), startOffset + cursor));
			return visibleText(units) === value ? units : [];
		}
		function literalUnits(source, startOffset, newline) {
			const units = [];
			for (let cursor = 0; cursor < source.length;) {
				const text = source[cursor];
				if (text === "\r") {
					const length = source[cursor + 1] === "\n" ? 2 : 1;
					units.push({
						text: newline,
						startOffset: startOffset + cursor,
						endOffset: startOffset + cursor + length
					});
					cursor += length;
					continue;
				}
				if (text === "\n") {
					units.push({
						text: newline,
						startOffset: startOffset + cursor,
						endOffset: startOffset + cursor + 1
					});
					cursor++;
					continue;
				}
				const codePoint = String.fromCodePoint(source.codePointAt(cursor));
				units.push({
					text: codePoint,
					startOffset: startOffset + cursor,
					endOffset: startOffset + cursor + codePoint.length
				});
				cursor += codePoint.length;
			}
			return units;
		}
		function inlineCodeUnits(node, markdown) {
			const [start, end] = offsets(node);
			const source = markdown.slice(start, end);
			const opening = /^`+/u.exec(source)?.[0];
			const closing = /`+$/u.exec(source)?.[0];
			if (opening === void 0 || closing === void 0 || opening.length !== closing.length) return [];
			let units = literalUnits(source.slice(opening.length, source.length - closing.length), start + opening.length, " ");
			const value = node.value.replace(/\r\n|\r|\n/gu, " ");
			if (visibleText(units) !== value && units[0]?.text === " " && units.at(-1)?.text === " ") {
				const interior = units.slice(1, -1);
				if (interior.some((unit) => unit.text !== " ")) units = interior;
			}
			return visibleText(units) === value ? units : [];
		}
		function codeBodyOffsets(node, markdown) {
			const [start, end] = offsets(node);
			const source = markdown.slice(start, end);
			const opening = /^(?: {0,3})(`{3,}|~{3,})[^\r\n]*(?:\r\n|\r|\n)/u.exec(source);
			if (opening === null) return [start, end];
			const fence = opening[1];
			const bodyStart = start + opening[0].length;
			const tail = source.slice(opening[0].length);
			const marker = fence[0];
			const closing = new RegExp(`(?:^|\\r\\n|\\r|\\n)[ \\t]{0,3}${marker}{${fence.length},}[ \\t]*(?:\\r\\n|\\r|\\n)?$`, "u").exec(tail);
			return [bodyStart, closing === null ? end : bodyStart + closing.index];
		}
		function rawLines(source, startOffset) {
			const lines = [];
			for (let cursor = 0; cursor < source.length;) {
				let lineEnd = cursor;
				while (lineEnd < source.length && source[lineEnd] !== "\r" && source[lineEnd] !== "\n") lineEnd++;
				let newlineEnd = lineEnd;
				if (source[newlineEnd] === "\r") newlineEnd++;
				if (source[newlineEnd] === "\n") newlineEnd++;
				lines.push({
					text: source.slice(cursor, lineEnd),
					startOffset: startOffset + cursor,
					newlineStart: startOffset + lineEnd,
					newlineEnd: startOffset + newlineEnd
				});
				cursor = newlineEnd;
			}
			return lines;
		}
		function codeUnits(node, markdown) {
			const [start, end] = codeBodyOffsets(node, markdown);
			const lines = rawLines(markdown.slice(start, end), start);
			const value = node.value.replace(/\r\n|\r/gu, "\n");
			const valueLines = value === "" ? [] : value.split("\n");
			if (valueLines.length > lines.length) return [];
			const units = [];
			for (const [index, value] of valueLines.entries()) {
				const line = lines[index];
				const at = line.text.length - value.length;
				if (at < 0 || line.text.slice(at) !== value || !/^[ \t]*$/u.test(line.text.slice(0, at))) return [];
				units.push(...directUnits(value, line.startOffset + at));
				if (index < valueLines.length - 1) {
					if (line.newlineEnd === line.newlineStart) return [];
					units.push({
						text: "\n",
						startOffset: line.newlineStart,
						endOffset: line.newlineEnd
					});
				}
			}
			if (lines.slice(valueLines.length).some((line) => line.text.trim() !== "")) return [];
			return units;
		}
		function imageAltUnits(node, markdown) {
			const [start, end] = offsets(node);
			const source = markdown.slice(start, end);
			if (!source.startsWith("![")) return [];
			let depth = 1;
			for (let cursor = 2; cursor < source.length; cursor++) {
				if (source[cursor] === "\\") {
					cursor++;
					continue;
				}
				if (source[cursor] === "[") depth++;
				if (source[cursor] !== "]") continue;
				depth--;
				if (depth === 0) return decodedUnits(markdown, node.alt ?? "", start + 2, start + cursor);
			}
			return [];
		}
		function leafText(node, markdown) {
			switch (node.type) {
				case "text": {
					const [start, end] = offsets(node);
					return decodedUnits(markdown, node.value, start, end);
				}
				case "inlineCode": return inlineCodeUnits(node, markdown);
				case "code": return codeUnits(node, markdown);
				case "image":
				case "imageReference": return imageAltUnits(node, markdown);
				case "break": {
					const [start, end] = offsets(node);
					return [{
						text: "\n",
						startOffset: start,
						endOffset: end
					}];
				}
				default: return [];
			}
		}
		function inlineText(node, markdown) {
			switch (node.type) {
				case "text":
				case "inlineCode":
				case "image":
				case "imageReference":
				case "break": return leafText(node, markdown);
				case "html": return [];
				default: return children(node).flatMap((child) => inlineText(child, markdown));
			}
		}
		function isWhitespace(unit) {
			return /^\s+$/u.test(unit.text);
		}
		function trimMapped(units) {
			let start = 0;
			let end = units.length;
			while (start < end && isWhitespace(units[start])) start++;
			while (end > start && isWhitespace(units[end - 1])) end--;
			return units.slice(start, end);
		}
		function compactMapped(units) {
			const compact = [];
			for (const unit of trimMapped(units)) {
				if (!isWhitespace(unit)) {
					compact.push(unit);
					continue;
				}
				const previous = compact.at(-1);
				if (previous === void 0 || previous.text !== " ") compact.push({
					...unit,
					text: " "
				});
				else compact[compact.length - 1] = {
					...previous,
					endOffset: unit.endOffset
				};
			}
			return compact;
		}
		function joinMapped(parts, separator) {
			const present = parts.filter((part) => part.length > 0);
			const joined = [];
			for (const [index, part] of present.entries()) {
				if (index > 0) {
					const before = joined.at(-1)?.endOffset ?? part[0].startOffset;
					const after = part[0].startOffset;
					for (const text of separator) joined.push({
						text,
						startOffset: before,
						endOffset: after
					});
				}
				joined.push(...part);
			}
			return joined;
		}
		function blockText(node, markdown) {
			switch (node.type) {
				case "root":
				case "blockquote": return joinMapped(children(node).map((child) => blockText(child, markdown)), "\n\n");
				case "paragraph":
				case "heading":
				case "tableCell": return compactMapped(inlineText(node, markdown));
				case "code": return leafText(node, markdown);
				case "list":
				case "table": return joinMapped(children(node).map((child) => blockText(child, markdown)), "\n");
				case "listItem": return joinMapped(children(node).map((child) => blockText(child, markdown)), " ");
				case "tableRow": return joinMapped(children(node).map((child) => blockText(child, markdown)), "	");
				case "thematicBreak":
				case "definition":
				case "footnoteDefinition":
				case "html": return [];
				default: return compactMapped(inlineText(node, markdown));
			}
		}
		function sourceRange(units, start, end) {
			let visibleOffset = 0;
			let first;
			let last;
			for (const unit of units) {
				const next = visibleOffset + unit.text.length;
				if (next > start && visibleOffset < end) {
					first ??= unit;
					last = unit;
				}
				visibleOffset = next;
			}
			if (first === void 0 || last === void 0 || first.startOffset >= last.endOffset) return null;
			return [first.startOffset, last.endOffset];
		}
		function candidatesFromProjection(markdown, projection, needle) {
			const rendered = visibleText(projection);
			const candidates = [];
			for (let at = rendered.indexOf(needle); at >= 0; at = rendered.indexOf(needle, at + 1)) {
				const rawRange = sourceRange(projection, at, at + needle.length);
				if (rawRange === null) continue;
				const [startOffset, endOffset] = rawRange;
				candidates.push({
					startOffset,
					endOffset,
					sourceText: markdown.slice(startOffset, endOffset),
					displayPrefix: rendered.slice(Math.max(0, at - 240), at),
					displaySuffix: rendered.slice(at + needle.length, at + needle.length + 240)
				});
			}
			return candidates;
		}
		/**
		* Locate every GFM source range that renders as one browser-visible selection.
		*
		* @param markdown - committed assistant/message Markdown source.
		* @param displayText - trimmed text returned by the browser Selection.
		* @returns raw ranges plus rendered context for caller-side disambiguation.
		*/
		function markdownSourceCandidates(markdown, displayText) {
			const projection = trimMapped(blockText(fromMarkdown(markdown, {
				extensions: [gfm()],
				mdastExtensions: [gfmFromMarkdown()]
			}), markdown));
			const needle = displayText.trim();
			if (needle === "") return [];
			const exact = candidatesFromProjection(markdown, projection, needle);
			if (exact.length > 0) return exact;
			return candidatesFromProjection(markdown, compactMapped(projection), needle.replace(/\s+/gu, " "));
		}
		//#endregion
		//#region lib/types/client/citation.js
		function toHex(bytes) {
			return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
		}
		function decodedContext(text) {
			return text.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", "\"").replaceAll("&#39;", "'").toLocaleLowerCase().replaceAll(/[\s`*_~[\]()<>#+.!,:;"'\\/|=-]+/gu, "");
		}
		function commonEdge(left, right, fromEnd) {
			const limit = Math.min(left.length, right.length);
			let matched = 0;
			while (matched < limit) {
				const leftIndex = fromEnd ? left.length - matched - 1 : matched;
				const rightIndex = fromEnd ? right.length - matched - 1 : matched;
				if (left[leftIndex] !== right[rightIndex]) break;
				matched++;
			}
			return matched;
		}
		/** Map rendered Markdown selection context back to one exact raw answer range. */
		function normalizeSelectionAgainstAnswer(selection, answer) {
			const candidates = [...markdownSourceCandidates(answer, selection.displayText)];
			if (candidates.length === 0) throw new Error("选区无法映射到已提交的模型回答，请重新选择正文后重试");
			const prefix = decodedContext(selection.prefixText);
			const suffix = decodedContext(selection.suffixText);
			const ranked = candidates.map((candidate) => ({
				candidate,
				score: commonEdge(prefix, decodedContext(candidate.displayPrefix), true) + commonEdge(suffix, decodedContext(candidate.displaySuffix), false)
			})).sort((left, right) => right.score - left.score);
			const first = ranked[0];
			if (first === void 0 || ranked[1]?.score === first.score) throw new Error("选区无法唯一映射到已提交的模型回答，请缩小或扩大选区后重试");
			const { startOffset, endOffset, sourceText } = first.candidate;
			return {
				...selection,
				startOffset,
				endOffset,
				sourceText,
				prefixText: answer.slice(Math.max(0, startOffset - 240), startOffset),
				suffixText: answer.slice(endOffset, endOffset + 240)
			};
		}
		/** Build the browser claim that the Host later checks against one committed model call. */
		async function createCitationDraft(selection, assistantMessageSeq) {
			if (selection.endOffset <= selection.startOffset || selection.endOffset - selection.startOffset !== selection.sourceText.length) throw new Error("选中文字与其 UTF-16 来源范围不一致");
			const identity = {
				sourceSessionId: selection.sourceSessionId,
				anchorSeq: assistantMessageSeq,
				startOffset: selection.startOffset,
				endOffset: selection.endOffset,
				sourceText: selection.sourceText,
				displayText: selection.displayText,
				prefixText: selection.prefixText,
				suffixText: selection.suffixText
			};
			const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonicalCitationIdentity(identity)));
			return {
				...identity,
				selectionFingerprint: toHex(digest)
			};
		}
		//#endregion
		//#region lib/types/client/prompt.js
		/** Maximum genuine user-question length admitted by the Citation Thread UI. */
		const MAX_QUESTION_CHARS = 12e3;
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
		//#endregion
		//#region lib/types/client/response-guard.js
		/** Return whether an asynchronous Topic response still belongs to the visible source and request. */
		function isCurrentTopicResponse(operationEpoch, currentEpoch, currentSourceSessionId, responseSourceSessionId, responseSessionId, expectedSessionId) {
			return operationEpoch === currentEpoch && responseSourceSessionId === currentSourceSessionId && (expectedSessionId === void 0 || responseSessionId === expectedSessionId);
		}
		/** Return whether an idle source may restore its remembered Topic. */
		function shouldReopenLastTopic(hasActiveTopic, phaseIsIdle, reopenLastTopic) {
			return !hasActiveTopic && phaseIsIdle && reopenLastTopic;
		}
		//#endregion
		//#region lib/types/client/companion-controller.js
		const EMPTY = {
			sourceSessionId: null,
			phase: "idle",
			draftQuote: null,
			active: null,
			topics: [],
			providers: [],
			settings: DEFAULT_CITECITER_SETTINGS,
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
		/** Bind private Topic Remote calls to one browser snapshot and polling lifecycle. */
		function createCompanionController(sessions, settingsScope, request, store = (0, _deepseek_ai_dsh_client_runtime_client.createSnapshotStore)(EMPTY)) {
			let disposed = false;
			let visible = false;
			let epoch = 0;
			let pollTimer = null;
			let polling = false;
			let pollCount = 0;
			const update = (mutator) => {
				if (!disposed) store.update(mutator);
			};
			const fail = (error, operationEpoch = epoch) => {
				if (disposed || operationEpoch !== epoch) return;
				update((draft) => {
					draft.phase = "error";
					draft.error = error instanceof Error ? error.message : String(error);
				});
			};
			const acceptTopic = (topic, operationEpoch, expectedSessionId) => {
				const current = store.getSnapshot();
				if (disposed || !isCurrentTopicResponse(operationEpoch, epoch, current.sourceSessionId, topic.topic.sourceSessionId, topic.topic.sessionId, expectedSessionId)) return;
				update((draft) => {
					draft.active = topic;
					draft.draftQuote = null;
					draft.phase = topic.topic.running ? "running" : topic.error === null ? "ready" : "error";
					draft.error = topic.error;
				});
				writeLastTopic(topic.topic.sourceSessionId, topic.topic.sessionId);
			};
			const call = async (command) => remoteValue(await request(command));
			const openTopic = async (sessionId, operationEpoch = epoch) => {
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
					acceptTopic(response.topic, operationEpoch, sessionId);
				} catch (error) {
					fail(error, operationEpoch);
				}
			};
			const refreshTopics = async (operationEpoch = epoch) => {
				const snapshot = store.getSnapshot();
				if (snapshot.sourceSessionId === null) return;
				const response = await call({
					action: "list",
					sourceSessionId: snapshot.sourceSessionId,
					includeArchived: snapshot.includeArchived
				});
				if (response.kind !== "topics" || operationEpoch !== epoch || disposed) return;
				update((draft) => {
					draft.topics = response.topics;
				});
				const current = store.getSnapshot();
				if (!shouldReopenLastTopic(current.active !== null, current.phase === "idle", current.settings.reopenLastTopic)) return;
				const remembered = readLastTopic(snapshot.sourceSessionId);
				const target = response.topics.find((topic) => topic.sessionId === remembered) ?? response.topics[0];
				if (target !== void 0) await openTopic(target.sessionId, operationEpoch);
			};
			const refreshActive = async (operationEpoch = epoch) => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const response = await call({
					action: "get",
					topicSessionId: active.topic.sessionId
				});
				if (response.kind === "topic") acceptTopic(response.topic, operationEpoch, active.topic.sessionId);
			};
			const poll = async () => {
				if (!visible || disposed || polling) return;
				polling = true;
				const operationEpoch = epoch;
				try {
					await refreshActive(operationEpoch);
					if (pollCount++ % 6 === 0) await refreshTopics(operationEpoch);
				} catch (error) {
					fail(error, operationEpoch);
				} finally {
					polling = false;
				}
			};
			const loadModels = async () => {
				if (store.getSnapshot().providers.length > 0) return;
				const operationEpoch = epoch;
				try {
					const response = await call({ action: "models" });
					if (response.kind === "models") update((draft) => {
						draft.providers = response.providers;
					});
				} catch (error) {
					fail(error, operationEpoch);
				}
			};
			const initialSettings = settingsScope.getSnapshot().value ?? DEFAULT_CITECITER_SETTINGS;
			update((draft) => {
				draft.settings = initialSettings;
			});
			const unsubscribeSettings = settingsScope.subscribe(() => {
				const value = settingsScope.getSnapshot().value;
				if (value !== void 0) update((draft) => {
					draft.settings = value;
				});
			});
			const setSource = (sessionId) => {
				if (disposed || store.getSnapshot().sourceSessionId === sessionId) return;
				epoch++;
				update((draft) => {
					draft.sourceSessionId = sessionId;
					draft.phase = "idle";
					draft.draftQuote = null;
					draft.active = null;
					draft.topics = [];
					draft.error = null;
				});
				if (visible && sessionId !== null) refreshTopics().catch(fail);
			};
			const setVisible = (next) => {
				if (disposed || visible === next) return;
				visible = next;
				if (!visible) {
					if (pollTimer !== null) clearInterval(pollTimer);
					pollTimer = null;
					return;
				}
				refreshTopics().catch(fail);
				loadModels();
				pollTimer = setInterval(() => {
					poll();
				}, 700);
			};
			const create = async (selection, rawQuestion, mode) => {
				const question = normalizeQuestion(rawQuestion);
				epoch++;
				const operationEpoch = epoch;
				update((draft) => {
					draft.sourceSessionId = selection.sourceSessionId;
					draft.phase = "creating";
					draft.draftQuote = selection.displayText;
					draft.active = null;
					draft.error = null;
				});
				try {
					const node = sessions.binding(selection.sourceSessionId)?.session.getSnapshot().chat.nodes.get(selection.anchorKey);
					if (node === void 0 || node.kind !== "assistant-step") throw new Error("选中的模型回答已不在当前会话快照中");
					const answer = readAssistantAnswer(node.data);
					if (answer === null || answer.status !== "settled") throw new Error("请在一次模型调用完成后引用；无需等待整轮长任务结束");
					const citation = await createCitationDraft(normalizeSelectionAgainstAnswer(selection, answer.text), node.anchorSeq);
					const response = await call({
						action: "create",
						citation,
						question,
						mode: mode ?? store.getSnapshot().settings.defaultMode
					});
					if (response.kind !== "topic") throw new Error("CiteCiter 返回了错误的创建响应");
					acceptTopic(response.topic, operationEpoch);
					await refreshTopics(operationEpoch);
				} catch (error) {
					fail(error, operationEpoch);
				}
			};
			const ask = async (rawQuestion) => {
				const active = store.getSnapshot().active;
				if (active === null) {
					fail("请先从选区创建 Topic，或打开一个旧 Topic");
					return;
				}
				const question = normalizeQuestion(rawQuestion);
				const operationEpoch = ++epoch;
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
					if (response.kind === "topic") acceptTopic(response.topic, operationEpoch, active.topic.sessionId);
				} catch (error) {
					fail(error, operationEpoch);
				}
			};
			const stop = async () => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const operationEpoch = ++epoch;
				try {
					const response = await call({
						action: "stop",
						topicSessionId: active.topic.sessionId
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationEpoch, active.topic.sessionId);
				} catch (error) {
					fail(error, operationEpoch);
				}
			};
			const answerQuestion = async (key, answer) => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const operationEpoch = ++epoch;
				try {
					const response = await call({
						action: "answer-question",
						topicSessionId: active.topic.sessionId,
						key,
						answer
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationEpoch, active.topic.sessionId);
				} catch (error) {
					fail(error, operationEpoch);
				}
			};
			const cancelQuestion = async (key) => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const operationEpoch = ++epoch;
				try {
					const response = await call({
						action: "cancel-question",
						topicSessionId: active.topic.sessionId,
						key
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationEpoch, active.topic.sessionId);
				} catch (error) {
					fail(error, operationEpoch);
				}
			};
			const rename = async (rawTitle) => {
				const active = store.getSnapshot().active;
				const title = rawTitle.trim();
				if (active === null || title === "") return;
				const operationEpoch = ++epoch;
				try {
					const response = await call({
						action: "rename",
						topicSessionId: active.topic.sessionId,
						title
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationEpoch, active.topic.sessionId);
					await refreshTopics(operationEpoch);
				} catch (error) {
					fail(error, operationEpoch);
				}
			};
			const archive = async (archived) => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const operationEpoch = ++epoch;
				try {
					const response = await call({
						action: "archive",
						topicSessionId: active.topic.sessionId,
						archived
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationEpoch, active.topic.sessionId);
					if (archived !== store.getSnapshot().includeArchived) update((draft) => {
						draft.active = null;
						draft.phase = "idle";
					});
					await refreshTopics(operationEpoch);
				} catch (error) {
					fail(error, operationEpoch);
				}
			};
			const selectModel = async (provider, model, reasoningEffort) => {
				const active = store.getSnapshot().active;
				if (active === null) return;
				const operationEpoch = ++epoch;
				try {
					const response = await call({
						action: "select-model",
						topicSessionId: active.topic.sessionId,
						provider,
						model,
						reasoningEffort
					});
					if (response.kind === "topic") acceptTopic(response.topic, operationEpoch, active.topic.sessionId);
				} catch (error) {
					fail(error, operationEpoch);
				}
			};
			return {
				getSnapshot: store.getSnapshot,
				subscribe: store.subscribe,
				setSource,
				setVisible,
				create,
				openTopic: (sessionId) => openTopic(sessionId, ++epoch),
				ask,
				answerQuestion,
				cancelQuestion,
				stop,
				rename,
				archive,
				setIncludeArchived: (include) => {
					const operationEpoch = ++epoch;
					update((draft) => {
						draft.includeArchived = include;
						draft.active = null;
						draft.topics = [];
						draft.phase = "idle";
					});
					refreshTopics(operationEpoch).catch((error) => fail(error, operationEpoch));
				},
				selectModel,
				setSetting: (key, value) => settingsScope.set(key, value),
				dispose: async () => {
					if (disposed) return;
					disposed = true;
					if (pollTimer !== null) clearInterval(pollTimer);
					unsubscribeSettings();
				}
			};
		}
		//#endregion
		//#region \0citeciter-png:src/client/assets/citeciter-mascot.png
		var citeciter_mascot_default = "data:image/png;base64,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";
		//#endregion
		//#region \0dsh-css:src/client/components/CiteCiter.module.css.mjs
		const css = "[data-citeciter-docked=true]{grid-template-columns:var(--citeciter-sidebar-width) minmax(0, 1fr) var(--citeciter-dock-width)!important}[data-citeciter-docked=true]>[data-side=details]{display:none!important}._1Fxyxa_selectionPopover{z-index:9999;box-sizing:border-box;width:min(378px,100vw - 24px);color:var(--dsw-alias-label-primary,#20232a);background:color-mix(in srgb, var(--dsw-alias-bg-module,#fff) 96%, #fff);border:1px solid var(--dsw-alias-border-l2,#d9dde5);pointer-events:auto;border-radius:14px;padding:10px;position:fixed;box-shadow:0 16px 44px #191f2c33,0 2px 8px #191f2c14}._1Fxyxa_popoverQuote{color:var(--dsw-alias-label-secondary,#5c6472);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}._1Fxyxa_popoverQuote:before{vertical-align:1px;content:\"\";background:#3478f6;border-radius:999px;width:6px;height:6px;margin-right:7px;display:inline-block}._1Fxyxa_popoverComposer{grid-template-columns:minmax(0,1fr) auto;gap:7px;margin-top:8px;display:grid}._1Fxyxa_popoverComposer input,._1Fxyxa_topicToolbar input,._1Fxyxa_topicToolbar select,._1Fxyxa_composer textarea{box-sizing:border-box;min-width:0;color:var(--dsw-alias-label-primary,#20232a);background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l1,#dfe3ea);outline:none}._1Fxyxa_popoverComposer input{height:36px;font:inherit;border-radius:9px;padding:0 11px;font-size:13px}._1Fxyxa_popoverComposer button,._1Fxyxa_sendButton{color:#fff;cursor:pointer;background:linear-gradient(135deg,#3478f6,#245fd1);border:0;border-radius:9px;padding:0 14px;font-weight:650;box-shadow:0 4px 12px #3478f638}._1Fxyxa_popoverComposer button:disabled,._1Fxyxa_sendButton:disabled{cursor:default;filter:grayscale(.45);opacity:.52;box-shadow:none}._1Fxyxa_popoverComposer input:focus,._1Fxyxa_topicToolbar input:focus,._1Fxyxa_topicToolbar select:focus,._1Fxyxa_composer textarea:focus{border-color:#3478f6;box-shadow:0 0 0 3px #3478f621}._1Fxyxa_popoverMode{color:var(--dsw-alias-label-tertiary,#858c98);margin-top:8px;font-size:11px}._1Fxyxa_popoverMode summary{cursor:pointer;user-select:none}._1Fxyxa_popoverMode select{width:100%;height:30px;color:var(--dsw-alias-label-secondary,#535b68);background:var(--dsw-specific-bubble,#f5f7fa);border:1px solid var(--dsw-alias-border-l1,#dfe3ea);border-radius:7px;margin-top:6px;padding:0 7px}._1Fxyxa_topicLauncher{z-index:200;color:#fff;cursor:pointer;background:color-mix(in srgb, var(--dsw-alias-bg-module,#fff) 90%, #dceaff);border:1px solid color-mix(in srgb, var(--dsw-alias-border-l2,#d9dde5) 65%, #3478f6);pointer-events:auto;border-radius:999px;align-items:center;width:46px;height:46px;padding:3px;display:flex;position:fixed;bottom:76px;right:22px;box-shadow:0 10px 28px #245fd13d}._1Fxyxa_topicLauncher img{object-fit:contain;width:38px;height:38px;display:block}._1Fxyxa_launcherCount{border:2px solid var(--dsw-alias-bg-base,#fff);background:#245fd1;border-radius:999px;place-items:center;min-width:17px;height:17px;padding:0 3px;font-size:9px;line-height:1;display:grid;position:absolute;top:-4px;right:-4px}._1Fxyxa_topicLauncher:hover{transform:translateY(-1px)}._1Fxyxa_dock{--citeciter-accent:#3478f6;z-index:1;box-sizing:border-box;min-width:360px;color:var(--dsw-alias-label-primary,#20232a);background:var(--dsw-alias-bg-base,#fff);border-left:1px solid var(--dsw-alias-border-l2,#d9dde5);pointer-events:auto;grid-template-columns:clamp(138px,24%,210px) minmax(0,1fr);display:grid;position:absolute;top:0;bottom:0;right:0;overflow:hidden;box-shadow:-12px 0 32px #1a1f2c14}._1Fxyxa_resizeHandle{z-index:3;cursor:col-resize;touch-action:none;width:10px;position:absolute;top:0;bottom:0;left:-5px}._1Fxyxa_resizeHandle:after{content:\"\";background:var(--dsw-alias-border-l2,#d9dde5);border-radius:999px;width:3px;height:42px;transition:background .12s,width .12s;position:absolute;top:50%;left:3px;transform:translateY(-50%)}._1Fxyxa_resizeHandle:hover:after,._1Fxyxa_resizeHandle:focus-visible:after{background:var(--citeciter-accent);width:4px}._1Fxyxa_topicRail{background:color-mix(in srgb, var(--dsw-specific-sidebar-fill,#f7f8fa) 94%, #edf5ff);border-right:1px solid var(--dsw-alias-border-l1,#e4e7ec);flex-direction:column;min-width:0;min-height:0;display:flex}._1Fxyxa_brand{border-bottom:1px solid var(--dsw-alias-border-l1,#e4e7ec);flex:none;align-items:center;gap:9px;min-height:65px;padding:0 13px;display:flex}._1Fxyxa_brandMark,._1Fxyxa_settingsWhale{background:linear-gradient(145deg,#f4f9ff,#dceaff);border:1px solid #3478f633;border-radius:10px;flex:none;place-items:center;width:32px;height:32px;display:grid;overflow:hidden;box-shadow:inset 0 1px #ffffffb8}._1Fxyxa_brandMark img,._1Fxyxa_settingsWhale img{object-fit:contain;width:100%;height:100%}._1Fxyxa_brand div{flex-direction:column;min-width:0;display:flex}._1Fxyxa_brand strong{text-overflow:ellipsis;font-size:14px;overflow:hidden}._1Fxyxa_brand span:not(._1Fxyxa_brandMark){color:var(--dsw-alias-label-tertiary,#858c98);font-size:10px}._1Fxyxa_railCaption,._1Fxyxa_railFoot{color:var(--dsw-alias-label-tertiary,#858c98);flex:none;justify-content:space-between;align-items:center;gap:6px;padding:10px 11px 7px;font-size:10px;display:flex}._1Fxyxa_railCaption button,._1Fxyxa_topicToolbar button,._1Fxyxa_composerActions button:not(._1Fxyxa_sendButton){color:var(--dsw-alias-label-secondary,#58606d);cursor:pointer;background:0 0;border:0;border-radius:6px}._1Fxyxa_railCaption button:hover,._1Fxyxa_topicToolbar button:hover,._1Fxyxa_composerActions button:not(._1Fxyxa_sendButton):hover,._1Fxyxa_closeButton:hover{background:var(--dsw-alias-interactive-bg-hover,#0000000f)}._1Fxyxa_topicList{flex-direction:column;flex:1;gap:4px;min-height:0;padding:0 7px;display:flex;overflow-y:auto}._1Fxyxa_topicItem{width:100%;color:inherit;text-align:left;cursor:pointer;background:0 0;border:1px solid #0000;border-radius:9px;grid-template-columns:7px minmax(0,1fr);align-items:start;gap:7px;padding:9px 8px;display:grid}._1Fxyxa_topicItem:hover{background:var(--dsw-alias-interactive-bg-hover,#0000000b)}._1Fxyxa_topicItem[data-active]{background:color-mix(in srgb, var(--dsw-alias-bg-module,#fff) 88%, #eaf3ff);border-color:color-mix(in srgb, var(--dsw-alias-border-l1,#dde1e8) 72%, #7ca8ff);box-shadow:0 2px 7px #1c222f0d}._1Fxyxa_topicItem[data-archived]{opacity:.58}._1Fxyxa_topicStatus{background:#99a1ae;border-radius:999px;width:6px;height:6px;margin-top:5px}._1Fxyxa_topicStatus[data-running]{background:var(--citeciter-accent);animation:1.2s ease-in-out infinite _1Fxyxa_citeciterPulse;box-shadow:0 0 0 3px #3478f629}@keyframes _1Fxyxa_citeciterPulse{50%{opacity:.42}}._1Fxyxa_topicCopy{flex-direction:column;gap:3px;min-width:0;display:flex}._1Fxyxa_topicCopy strong,._1Fxyxa_topicCopy small{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}._1Fxyxa_topicCopy strong{font-size:12px;font-weight:590}._1Fxyxa_topicCopy strong[data-pending]{color:var(--dsw-alias-label-secondary,#606875);font-style:italic}._1Fxyxa_topicCopy small{color:var(--dsw-alias-label-tertiary,#858c98);font-size:10px}._1Fxyxa_railEmpty{color:var(--dsw-alias-label-tertiary,#858c98);margin:9px 6px;font-size:11px;line-height:17px}._1Fxyxa_railFoot{border-top:1px solid var(--dsw-alias-border-l1,#e4e7ec);padding-top:8px;padding-bottom:9px}._1Fxyxa_learningWorkspace{background:var(--dsw-alias-bg-base,#fff);flex-direction:column;min-width:0;min-height:0;display:flex}._1Fxyxa_dockHeader{border-bottom:1px solid var(--dsw-alias-border-l1,#e4e7ec);flex:none;justify-content:space-between;align-items:center;gap:12px;min-height:64px;padding:0 15px;display:flex}._1Fxyxa_dockHeading{grid-template-columns:auto minmax(0,1fr);align-items:center;gap:2px 7px;min-width:0;display:grid}._1Fxyxa_dockHeading strong{text-overflow:ellipsis;white-space:nowrap;font-size:14px;overflow:hidden}._1Fxyxa_dockHeading>span:last-child{color:var(--dsw-alias-label-tertiary,#858c98);grid-column:1/-1;font-size:10px}._1Fxyxa_modeBadge{color:#245fd1;letter-spacing:.02em;white-space:nowrap;background:#edf5ff;border:1px solid #c9dcff;border-radius:999px;padding:2px 6px;font-size:9px;font-weight:700}._1Fxyxa_closeButton{width:30px;height:30px;color:var(--dsw-alias-label-secondary,#606875);cursor:pointer;background:0 0;border:0;border-radius:999px;flex:none;place-items:center;padding:0;font-size:21px;display:grid}._1Fxyxa_emptyState{box-sizing:border-box;text-align:center;flex-direction:column;flex:1;justify-content:center;align-items:center;padding:34px 24px;display:flex}._1Fxyxa_emptyWhale{background:radial-gradient(circle at 32% 25%,#fff,#dceaff);border:1px solid #c9dcff;border-radius:22px;place-items:center;width:68px;height:68px;margin-bottom:13px;display:grid;overflow:hidden;box-shadow:0 14px 35px #245fd124}._1Fxyxa_emptyWhale img{object-fit:contain;width:100%;height:100%}._1Fxyxa_emptyState h2{margin:0;font-size:17px}._1Fxyxa_emptyState>p{max-width:430px;color:var(--dsw-alias-label-secondary,#606875);margin:9px 0 0;font-size:12px;line-height:20px}._1Fxyxa_contextBar{background:color-mix(in srgb, var(--dsw-specific-bubble,#f6f7f9) 90%, #edf5ff);border-bottom:1px solid var(--dsw-alias-border-l1,#e4e7ec);flex:none;padding:10px 14px}._1Fxyxa_contextBar blockquote{max-height:57px;color:var(--dsw-alias-label-secondary,#59616e);border-left:3px solid var(--citeciter-accent);margin:0;padding-left:9px;font-size:11px;line-height:18px;overflow:auto}._1Fxyxa_contextMeta{color:var(--dsw-alias-label-tertiary,#858c98);gap:9px;margin-top:6px;font-size:9px;display:flex}._1Fxyxa_contextMeta span:first-child:before{content:\"\";vertical-align:1px;background:#b3bac5;border-radius:999px;width:5px;height:5px;margin-right:4px;display:inline-block}._1Fxyxa_contextMeta span[data-ok]:before{background:#27a96b}._1Fxyxa_topicToolbar{border-bottom:1px solid var(--dsw-alias-border-l1,#e4e7ec);flex:none;align-items:center;gap:6px;padding:7px 11px;display:flex;overflow-x:auto}._1Fxyxa_topicToolbar form{flex:180px;min-width:130px;display:flex}._1Fxyxa_topicToolbar input,._1Fxyxa_topicToolbar select{border-radius:7px;height:30px;padding:0 7px;font-size:10px}._1Fxyxa_topicToolbar input{flex:1}._1Fxyxa_topicToolbar form button,._1Fxyxa_topicToolbar>button{white-space:nowrap;flex:none;padding:5px 7px;font-size:10px}._1Fxyxa_archiveButton{align-items:center;gap:3px;display:inline-flex}._1Fxyxa_topicToolbar form button:disabled{opacity:.42}._1Fxyxa_transcript{flex-direction:column;flex:1;gap:14px;min-height:0;padding:17px clamp(12px,4%,28px) 24px;display:flex;overflow:hidden auto}._1Fxyxa_assistantTurn,._1Fxyxa_userTurn,._1Fxyxa_errorTurn{overflow-wrap:anywhere;min-width:0;font-size:13px;line-height:21px}._1Fxyxa_assistantTurn{border-bottom:1px solid color-mix(in srgb, var(--dsw-alias-border-l1,#e4e7ec) 72%, transparent);padding-bottom:14px}._1Fxyxa_userTurn{background:var(--dsw-specific-bubble,#f1f3f7);border-radius:12px 12px 3px;align-self:flex-end;max-width:86%;padding:8px 11px}._1Fxyxa_errorTurn,._1Fxyxa_panelError{color:var(--dsw-alias-state-error-primary,#c93f3f);background:#feebeb;border:1px solid #c93f3f33;border-radius:8px}._1Fxyxa_errorTurn{padding:8px 10px}._1Fxyxa_assistantTurn p,._1Fxyxa_userTurn p,._1Fxyxa_errorTurn p{margin-top:0;margin-bottom:8px}._1Fxyxa_turnRole{color:var(--dsw-alias-label-tertiary,#858c98);margin-bottom:5px;font-size:10px;font-weight:650}._1Fxyxa_flowDisclosure{min-width:0;color:var(--dsw-alias-label-secondary,#606875);font-size:12px}._1Fxyxa_flowRow,._1Fxyxa_flowRowRunning{align-items:center;min-width:0;height:26px;display:flex;position:relative;overflow:hidden}._1Fxyxa_flowRowRunning:after{content:\"\";pointer-events:none;background:linear-gradient(90deg,#0000 20%,#ffffff94 48%,#0000 76%);animation:1.7s linear infinite _1Fxyxa_citeciterSweep;position:absolute;inset:0;transform:translate(-100%)}@keyframes _1Fxyxa_citeciterSweep{to{transform:translate(100%)}}._1Fxyxa_flowDot{color:var(--dsw-alias-label-tertiary,#858c98);flex:none;margin:0 6px}._1Fxyxa_flowSummary{min-width:0;color:var(--dsw-alias-label-tertiary,#78808e);white-space:nowrap;overflow-x:hidden}._1Fxyxa_flowBody{max-height:320px;color:var(--dsw-alias-label-secondary,#606875);background:var(--dsw-specific-bubble,#f5f6f8);font:inherit;white-space:pre-wrap;border-radius:7px;margin:5px 0 5px 22px;padding:7px 9px;font-size:11px;line-height:18px;overflow:auto}._1Fxyxa_toolPreview{background:var(--dsw-specific-bubble,#f5f6f8);border-radius:7px;gap:5px;max-height:360px;margin:5px 0 5px 22px;padding:8px;display:grid;overflow:auto}._1Fxyxa_toolPreview>strong{color:var(--dsw-alias-label-tertiary,#858c98);text-transform:uppercase;font-size:9px}._1Fxyxa_toolPreview pre{overflow-wrap:anywhere;white-space:pre-wrap;margin:0;font:10px/17px ui-monospace,SFMono-Regular,Menlo,monospace}._1Fxyxa_loadingCard{color:var(--dsw-alias-label-secondary,#606875);background:#edf5ff;border-radius:9px;align-self:flex-start;padding:8px 10px;font-size:11px}._1Fxyxa_panelError{overflow-wrap:anywhere;margin:0;padding:8px 10px;font-size:11px;line-height:17px}._1Fxyxa_composer{background:var(--dsw-alias-bg-module,#fff);border:1px solid var(--dsw-alias-border-l2,#d9dde5);border-radius:13px;flex:none;margin:0 12px 12px;padding:8px;box-shadow:0 5px 18px #1d222f14}._1Fxyxa_composer textarea{resize:vertical;width:100%;min-height:58px;max-height:150px;font:inherit;border:0;padding:6px 7px;font-size:12px;line-height:19px;display:block}._1Fxyxa_composer textarea:focus{box-shadow:none}._1Fxyxa_composerActions{align-items:center;gap:6px;margin-top:5px;display:flex}._1Fxyxa_composerActions span{color:var(--dsw-alias-label-tertiary,#858c98);margin-right:auto;font-size:9px}._1Fxyxa_composerActions button{min-height:29px;padding:0 10px;font-size:10px}._1Fxyxa_questionFrame{background:var(--dsw-alias-bg-module,#fff);border:1px solid var(--dsw-alias-border-l2,#d9dde5);border-radius:14px;flex:none;margin:0 12px 12px;padding:12px;box-shadow:0 6px 20px #1d222f1a}._1Fxyxa_questionHeader{color:var(--dsw-alias-label-secondary,#606875);grid-template-columns:auto minmax(0,1fr) auto;align-items:start;gap:8px;display:grid}._1Fxyxa_questionHeader>div{flex-direction:column;gap:2px;min-width:0;display:flex}._1Fxyxa_questionHeader span{color:var(--dsw-alias-label-tertiary,#858c98);font-size:9px}._1Fxyxa_questionHeader strong{color:var(--dsw-alias-label-primary,#20232a);font-size:12px;line-height:18px}._1Fxyxa_questionOptions{gap:6px;margin-top:10px;display:grid}._1Fxyxa_questionOptions>button{color:inherit;text-align:left;cursor:pointer;background:var(--dsw-specific-bubble,#f5f6f8);border:1px solid #0000;border-radius:8px;grid-template-columns:20px minmax(0,1fr);align-items:start;gap:6px;padding:8px;display:grid}._1Fxyxa_questionOptions>button[data-selected]{background:#edf5ff;border-color:#8eb4ff}._1Fxyxa_questionOptions>button>span:first-child{color:#245fd1;background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l2,#d9dde5);border-radius:5px;place-items:center;width:18px;height:18px;font-size:9px;display:grid}._1Fxyxa_questionOptions>button>span:last-child{flex-direction:column;min-width:0;display:flex}._1Fxyxa_questionOptions strong{font-size:11px}._1Fxyxa_questionOptions small{color:var(--dsw-alias-label-tertiary,#858c98);margin-top:2px;font-size:9px;line-height:14px}._1Fxyxa_questionCustom{box-sizing:border-box;resize:vertical;width:100%;color:inherit;background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l1,#dfe3ea);font:inherit;border-radius:8px;outline:0;margin-top:8px;padding:7px 8px;font-size:10px}._1Fxyxa_questionCustom:focus{border-color:#3478f6;box-shadow:0 0 0 3px #3478f61f}._1Fxyxa_questionFooter{align-items:center;gap:6px;margin-top:9px;display:flex}._1Fxyxa_questionFooter span{flex:1}._1Fxyxa_questionFooter button{min-height:28px;color:var(--dsw-alias-label-secondary,#606875);cursor:pointer;background:0 0;border:0;border-radius:7px;padding:0 9px;font-size:10px}._1Fxyxa_questionFooter button:last-child{color:#fff;background:#3478f6}._1Fxyxa_questionFooter button:disabled{cursor:default;opacity:.45}._1Fxyxa_richAnswer{min-width:0}._1Fxyxa_richFigure{background:var(--dsw-specific-bubble,#f5f6f8);border:1px solid var(--dsw-alias-border-l1,#e4e7ec);border-radius:9px;margin:10px 0;overflow:hidden}._1Fxyxa_richSvg{width:100%;height:auto;display:block}._1Fxyxa_richHtml{border:0;width:100%;min-height:240px;display:block}._1Fxyxa_settingsPage{width:min(760px,100%);color:var(--dsw-alias-label-primary,#20232a);flex-direction:column;gap:14px;padding-bottom:32px;display:flex}._1Fxyxa_settingsHero{background:linear-gradient(130deg, #edf5ff, var(--dsw-alias-bg-module,#fff) 72%);border:1px solid color-mix(in srgb, var(--dsw-alias-border-l1,#e4e7ec) 72%, #8eb4ff);border-radius:14px;align-items:center;gap:13px;padding:17px;display:flex}._1Fxyxa_settingsWhale{width:42px;height:42px;font-size:21px}._1Fxyxa_settingsHero h2,._1Fxyxa_settingsHero p,._1Fxyxa_settingsGroup h3{margin:0}._1Fxyxa_settingsHero h2{font-size:17px}._1Fxyxa_settingsHero p{color:var(--dsw-alias-label-secondary,#606875);margin-top:3px;font-size:11px}._1Fxyxa_settingsGroup{background:var(--dsw-alias-bg-module,#fff);border:1px solid var(--dsw-alias-border-l1,#e4e7ec);border-radius:13px;flex-direction:column;gap:8px;padding:15px;display:flex}._1Fxyxa_settingsGroup h3{margin-bottom:3px;font-size:13px}._1Fxyxa_settingChoice,._1Fxyxa_settingToggle{cursor:pointer;border:1px solid var(--dsw-alias-border-l1,#e4e7ec);border-radius:10px;align-items:center;gap:10px;padding:10px;display:flex}._1Fxyxa_settingChoice[data-selected]{background:#edf5ff;border-color:#8eb4ff}._1Fxyxa_settingChoice>span,._1Fxyxa_settingToggle>span{flex-direction:column;flex:1;gap:2px;min-width:0;display:flex}._1Fxyxa_settingChoice strong,._1Fxyxa_settingToggle strong,._1Fxyxa_widthSetting strong{font-size:12px}._1Fxyxa_settingChoice small,._1Fxyxa_settingToggle small{color:var(--dsw-alias-label-secondary,#606875);font-size:10px;line-height:16px}._1Fxyxa_settingChoice input,._1Fxyxa_settingToggle input{accent-color:var(--citeciter-accent,#3478f6)}._1Fxyxa_settingToggle>input{width:17px;height:17px}._1Fxyxa_widthSetting{flex-direction:column;gap:8px;padding:5px 2px 9px;display:flex}._1Fxyxa_widthSetting>span{justify-content:space-between;display:flex}._1Fxyxa_widthSetting output{color:#245fd1;font-size:11px;font-weight:650}._1Fxyxa_widthSetting input{accent-color:#3478f6;width:100%}._1Fxyxa_dockPreview{height:72px;color:var(--dsw-alias-label-tertiary,#858c98);background:var(--dsw-alias-bg-base,#fff);border:1px solid var(--dsw-alias-border-l1,#e4e7ec);border-radius:9px;font-size:9px;display:flex;overflow:hidden}._1Fxyxa_previewSidebar{background:var(--dsw-specific-sidebar-fill,#f5f6f8);border-right:1px solid var(--dsw-alias-border-l1,#e4e7ec);width:16%}._1Fxyxa_previewCoding,._1Fxyxa_previewDock{place-items:center;min-width:0;display:grid}._1Fxyxa_previewCoding{flex:1}._1Fxyxa_previewDock{color:#245fd1;background:#edf5ff;border-left:1px solid #c9dcff;max-width:55%}@media (width<=720px){._1Fxyxa_dock{grid-template-columns:128px minmax(0,1fr);min-width:100%}._1Fxyxa_brand{padding:0 8px}._1Fxyxa_brandMark,._1Fxyxa_topicToolbar form{display:none}}@media (prefers-reduced-motion:reduce){._1Fxyxa_topicStatus[data-running]{animation:none}._1Fxyxa_topicLauncher:hover{transform:none}}";
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
			"brandMark": "_1Fxyxa_brandMark",
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
			"modeBadge": "_1Fxyxa_modeBadge",
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
			creating: "正在创建独立 Topic…",
			ready: "可以继续追问",
			running: "CiteCiter 正在回答…",
			error: "需要处理"
		};
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
		function CitePanel({ bus, companion, closePanel }) {
			const overlay = (0, react.useSyncExternalStore)(bus.subscribe, bus.getSnapshot);
			const snapshot = (0, react.useSyncExternalStore)(companion.subscribe, companion.getSnapshot);
			const [question, setQuestion] = (0, react.useState)("");
			const [title, setTitle] = (0, react.useState)("");
			const [widthPercent, setWidthPercent] = (0, react.useState)(snapshot.settings.panelWidthPercent);
			const resizeOrigin = (0, react.useRef)(null);
			const open = overlay.panelOpen;
			const [panelWidth, docked] = useDockColumn(open, widthPercent);
			const active = snapshot.active;
			(0, react.useEffect)(() => companion.setVisible(open), [companion, open]);
			(0, react.useEffect)(() => setWidthPercent(snapshot.settings.panelWidthPercent), [snapshot.settings.panelWidthPercent]);
			(0, react.useEffect)(() => setTitle(active?.topic.title ?? ""), [active?.topic.sessionId, active?.topic.title]);
			const selectedModel = snapshot.providers.find((provider) => provider.id === active?.topic.modelConfig.provider)?.models.find((model) => model.id === active?.topic.modelConfig.model);
			const models = (0, react.useMemo)(() => snapshot.providers.flatMap((provider) => provider.models.map((model) => ({
				provider: provider.id,
				providerName: provider.name,
				model
			}))), [snapshot.providers]);
			if (!open) return null;
			const submit = (event) => {
				event.preventDefault();
				const value = question.trim();
				if (value === "") return;
				setQuestion("");
				companion.ask(value);
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
					(0, react_jsx_runtime.jsxs)("nav", {
						className: CiteCiter_module_css_default.topicRail,
						"aria-label": "CiteCiter Topics",
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.brand,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: CiteCiter_module_css_default.brandMark,
									"aria-hidden": "true",
									children: (0, react_jsx_runtime.jsx)("img", {
										src: citeciter_mascot_default,
										alt: ""
									})
								}), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "CiteCiter" }), (0, react_jsx_runtime.jsx)("span", { children: "学习伴侣" })] })]
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
								children: [snapshot.topics.map((topic) => (0, react_jsx_runtime.jsxs)("button", {
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
								}, topic.sessionId)), snapshot.topics.length === 0 && (0, react_jsx_runtime.jsx)("p", {
									className: CiteCiter_module_css_default.railEmpty,
									children: snapshot.includeArchived ? "当前来源还没有归档 Topic。" : "在中央编程对话中选中文字，右键即可开始。"
								})]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.railFoot,
								children: [(0, react_jsx_runtime.jsxs)("span", { children: [snapshot.topics.length, " 个 Topic"] }), (0, react_jsx_runtime.jsxs)("span", { children: [widthPercent, "%"] })]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: CiteCiter_module_css_default.learningWorkspace,
						children: [(0, react_jsx_runtime.jsxs)("header", {
							className: CiteCiter_module_css_default.dockHeader,
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: CiteCiter_module_css_default.dockHeading,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: CiteCiter_module_css_default.modeBadge,
										children: active?.topic.mode === "exact-fork" ? "Exact Fork" : "Observer"
									}),
									(0, react_jsx_runtime.jsx)("strong", { children: active?.topic.title ?? "新的学习讨论" }),
									(0, react_jsx_runtime.jsx)("span", { children: PHASE_LABEL[snapshot.phase] })
								]
							}), (0, react_jsx_runtime.jsx)("button", {
								className: CiteCiter_module_css_default.closeButton,
								type: "button",
								onClick: closePanel,
								"aria-label": "关闭 CiteCiter",
								children: "×"
							})]
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
									children: snapshot.error
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
											companion.rename(title);
										},
										children: [(0, react_jsx_runtime.jsx)("input", {
											value: title,
											onChange: (event) => setTitle(event.currentTarget.value),
											"aria-label": "Topic 标题"
										}), (0, react_jsx_runtime.jsx)("button", {
											type: "submit",
											disabled: title.trim() === "" || title === active.topic.title,
											children: "保存标题"
										})]
									}),
									(0, react_jsx_runtime.jsxs)("select", {
										"aria-label": "CiteCiter 模型",
										value: modelValue(active.topic.modelConfig.provider, active.topic.modelConfig.model),
										onChange: (event) => {
											const [provider, model] = parseModelValue(event.currentTarget.value);
											companion.selectModel(provider, model, null);
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
										onChange: (event) => {
											companion.selectModel(active.topic.modelConfig.provider, active.topic.modelConfig.model, event.currentTarget.value === "" ? null : event.currentTarget.value);
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
										onClick: () => {
											companion.archive(!active.topic.archived);
										},
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconArchiveOutline20, { size: 14 }), active.topic.archived ? "恢复" : "归档"]
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
										if (message.role === "error") return (0, react_jsx_runtime.jsxs)("article", {
											className: CiteCiter_module_css_default.errorTurn,
											children: [(0, react_jsx_runtime.jsx)("div", {
												className: CiteCiter_module_css_default.turnRole,
												children: "错误"
											}), (0, react_jsx_runtime.jsx)("p", { children: message.text })]
										}, message.id);
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
												message.text !== "" && (0, react_jsx_runtime.jsx)(RichAnswer, {
													text: message.text,
													streaming: message.streaming
												})
											]
										}, message.id);
									}),
									snapshot.phase === "creating" && (0, react_jsx_runtime.jsx)("div", {
										className: CiteCiter_module_css_default.loadingCard,
										children: "正在建立只读上下文与独立 Topic…"
									}),
									snapshot.error !== null && (0, react_jsx_runtime.jsx)("p", {
										className: CiteCiter_module_css_default.panelError,
										"data-citeciter-error": true,
										children: snapshot.error
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
									children: [
										(0, react_jsx_runtime.jsx)("span", { children: "只读 · 不干预主 Agent" }),
										snapshot.phase === "running" && (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => {
												companion.stop();
											},
											children: "停止"
										}),
										(0, react_jsx_runtime.jsx)("button", {
											className: CiteCiter_module_css_default.sendButton,
											type: "submit",
											disabled: active === null || question.trim() === "",
											children: "发送"
										})
									]
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
			const settings = (0, react.useSyncExternalStore)(companion.subscribe, companion.getSnapshot).settings;
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
								children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "默认宽度" }), (0, react_jsx_runtime.jsxs)("output", { children: [settings.panelWidthPercent, "%"] })] }), (0, react_jsx_runtime.jsx)("input", {
									type: "range",
									min: 28,
									max: 55,
									step: 1,
									value: settings.panelWidthPercent,
									onChange: (event) => {
										companion.setSetting("panelWidthPercent", Number(event.currentTarget.value));
									}
								})]
							}),
							(0, react_jsx_runtime.jsxs)("label", {
								className: CiteCiter_module_css_default.settingToggle,
								children: [(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("strong", { children: "重新打开上次 Topic" }), (0, react_jsx_runtime.jsx)("small", { children: "再次展开学习栏时，回到当前来源最近查看的讨论。" })] }), (0, react_jsx_runtime.jsx)("input", {
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
										style: { width: settings.panelWidthPercent + "%" },
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
		/** Resolve a DOM Node to its nearest Element parent. */
		function parentElement(node) {
			return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
		}
		/**
		* Resolve the current DOM selection into a CiteSelection.
		*
		* The complete Range must belong to one finalized assistant flow. The returned
		* offsets are measured against that flow's plain text and adjusted after
		* trimming, so identical quotations at different locations remain distinct.
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
			if (startFlow === null || startFlow === void 0 || endFlow !== startFlow) return null;
			for (const reasoning of startFlow.querySelectorAll("[data-variant=\"think\"]")) if (range.intersectsNode(reasoning)) return null;
			for (const generated of startFlow.querySelectorAll("button, .katex, [data-footnotes], sup")) if (range.intersectsNode(generated)) return null;
			for (const endpoint of [range.startContainer, range.endContainer]) {
				const element = parentElement(endpoint);
				if (element?.closest(".md-code-block") !== null && element?.closest("pre") === null) return null;
			}
			const kind = startFlow.dataset.chatFlowKind;
			const anchorKey = startFlow.dataset.chatAnchorKey;
			if (kind !== "assistant-step" || anchorKey === void 0 || anchorKey === "") return null;
			const rawText = range.toString();
			const text = rawText.trim();
			if (text === "") return null;
			const before = range.cloneRange();
			before.selectNodeContents(startFlow);
			before.setEnd(range.startContainer, range.startOffset);
			const leadingWhitespace = rawText.length - rawText.trimStart().length;
			const trailingWhitespace = rawText.length - rawText.trimEnd().length;
			const startOffset = before.toString().length + leadingWhitespace;
			const endOffset = before.toString().length + rawText.length - trailingWhitespace;
			const flowText = startFlow.textContent ?? "";
			if (startOffset < 0 || endOffset < startOffset || endOffset > flowText.length) return null;
			return {
				sourceSessionId,
				displayText: text,
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
				const companion = createCompanionController(sessions, settings, (request) => remoteCtx.remote.citeciter.request(request));
				const openPanel = () => {
					remoteCtx.layout.closeDetails();
					bus.setPanelOpen(true);
				};
				const closePanel = () => {
					remoteCtx.layout.closeDetails();
					bus.setPanelOpen(false);
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
						closePanel
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
