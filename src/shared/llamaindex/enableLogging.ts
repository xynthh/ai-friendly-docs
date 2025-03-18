import { Settings } from "llamaindex";

export function enableLogging(
  events = [
    "llm-start",
    "llm-end",
    "llm-tool-call",
    "llm-tool-result",
    "llm-stream",
    "chunking-start",
    "chunking-end",
    "node-parsing-start",
    "node-parsing-end",
    "query-start",
    "query-end",
    "synthesize-start",
    "synthesize-end",
    "retrieve-start",
    "retrieve-end",
    "agent-start",
    "agent-end",
  ] as const
) {
  // List of events: \node_modules\@llamaindex\core\global\dist\index.d.ts
  events.forEach((eventKey) => {
    Settings.callbackManager.on(eventKey, (event) => {
      console.log("---", event, event.detail);
    });
  });
}
