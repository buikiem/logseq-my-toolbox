/**
 * entry
 */
/* eslint no-console: off */
/* eslint no-restricted-globals: off */

import "@logseq/libs";
import React from "react";
import ReactDOM from "react-dom";
import { App } from "./app";
import { TODOIST_API_KEY } from "./constants";
import {
  pullTodayPersonalTasks,
  pullTomorrowPersonalTasks,
} from "./features/tasks";

function onSettingsChange() {
  const apiKey = logseq.settings?.[TODOIST_API_KEY] ?? "API key not found";
  console.info(`API key: ${apiKey}`);
}

function main() {
  console.info("BuiKiem todoist plugin loaded");
  onSettingsChange();
  logseq.onSettingsChanged(onSettingsChange);

  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("app")
  );

  // Register pull tasks command
  logseq.Editor.registerSlashCommand("buikiem - pull today tasks", async () => {
    const tasksArray = await pullTodayPersonalTasks();
    const currentBlock = await logseq.Editor.getCurrentBlock();

    if (currentBlock && tasksArray) {
      await logseq.Editor.updateBlock(currentBlock.uuid, "Tasks for today");

      await logseq.Editor.insertBatchBlock(
        currentBlock.uuid,
        tasksArray.tasksArray,
        {
          sibling: !parent,
          before: true,
        }
      );
    }
  });

  logseq.Editor.registerSlashCommand(
    "buikiem - pull tomorrow tasks",
    async () => {
      const tasksArray = await pullTomorrowPersonalTasks();
      const currentBlock = await logseq.Editor.getCurrentBlock();

      if (currentBlock && tasksArray) {
        await logseq.Editor.updateBlock(currentBlock.uuid, "Tasks for today");

        await logseq.Editor.insertBatchBlock(
          currentBlock.uuid,
          tasksArray.tasksArray,
          {
            sibling: !parent,
            before: true,
          }
        );
      }
    }
  );
}

// bootstrap
logseq
  .useSettingsSchema([
    {
      key: TODOIST_API_KEY,
      default: "",
      description: "Todoist API key",
      title: "Todoist API Key",
      type: "string",
    },
  ])
  .ready(main)
  .catch(console.error);
