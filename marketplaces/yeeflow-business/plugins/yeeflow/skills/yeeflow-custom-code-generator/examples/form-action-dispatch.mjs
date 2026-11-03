// Copy into the component's module scope; bind the actual host context at usage.
// This helper does not implement Yeeflow action lookup or variable propagation.
export function createFormActionDispatcher(context) {
  let busy = false;
  return async function dispatch(action, prepareContext) {
    if (busy) throw new Error('FORM_ACTION_BUSY');
    const validString = value => typeof value === 'string' && value.trim().length > 0;
    const validObject = action && typeof action === 'object' && !Array.isArray(action)
      && Object.keys(action).length === 1
      && (validString(action.id) || validString(action.name));
    if (!validString(action) && !validObject) throw new Error('FORM_ACTION_REFERENCE_INVALID');
    if (!context || typeof context.executeAction !== 'function') throw new Error('FORM_ACTION_API_UNAVAILABLE');
    if (prepareContext !== undefined && typeof prepareContext !== 'function') throw new Error('FORM_ACTION_PREPARE_INVALID');
    busy = true;
    try {
      // Must resolve only after variables are visible to the native action.
      if (prepareContext) await prepareContext();
      await context.executeAction(action);
    } finally {
      busy = false;
    }
  };
}
