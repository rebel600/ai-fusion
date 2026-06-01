import { WorkflowManager } from "./manager";

import { globalEventBus } from "./event-emitter";

export const workflowManager = new WorkflowManager();

export { globalEventBus };
