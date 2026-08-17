//#region lib/types/index.js
/**
* Host loader entry for the browser-only CiteCiter plugin.
* Deliberately no-op: the browser half (`./client`) owns the whole feature,
* and the plugin registers no process-level Host service (the known
* Cordis duplicate-service trap therefore cannot trigger).
*/
const name = "@deepseek-ai/dsh-citeciter";
const inject = [];
function apply() {}
//#endregion
export { apply, inject, name };
