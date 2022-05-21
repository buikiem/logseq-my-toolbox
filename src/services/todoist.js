import axios from "axios";
import { getScheduledDeadlineDateDay } from "logseq-dateutils";
import _ from "lodash";

import { TODOIST_API_KEY } from "../constants";

export const getProjectName = async (projectId) => {
  const project = await axios.get(
    `https://api.todoist.com/rest/v1/projects/${projectId}`,
    {
      headers: {
        Authorization: `Bearer ${logseq.settings?.[TODOIST_API_KEY]}`,
      },
    }
  );
};

export const pullFilters = async () => {
  try {
    const response = await axios.post(
      "https://api.todoist.com/sync/v8/sync",
      {
        sync_token: "*",
        resource_types: '["filters"]',
      },
      {
        headers: {
          Authorization: `Bearer ${logseq.settings?.[TODOIST_API_KEY]}`,
        },
      }
    );

    if (response.data?.["filters"].length === 0) {
      logseq.App.showMsg("There are no filters found");
    } else {
      return {
        filtersArray: response.data?.["filters"].map((filter) => ({
          content: `${filter.id} - ${filter.name}`,
        })),
      };
    }
  } catch (e) {
    console.error(e);
  }
};

export const pullTodayTasks = async () => {
  try {
    const response = await axios.get("https://api.todoist.com/rest/v1/tasks", {
      params: {
        filter: "(overdue | today) & ##personal",
      },
      headers: {
        Authorization: `Bearer ${logseq.settings?.[TODOIST_API_KEY]}`,
      },
    });

    if (response.data.length === 0) {
      logseq.App.showMsg("There are no tasks due today");
    } else {
      const sortedTasks = _.sortBy(response.data, [
        (task) =>
          task.due.datetime
            ? new Date(task.due.datetime)
            : new Date(task.due.date),
      ]);
      return {
        tasksArray: sortedTasks.map((task) => ({
          content: `TODO ${task.content} [src](${
            task.url
          })\nSCHEDULED: <${getScheduledDeadlineDateDay(
            new Date(task.due.date)
          )}${task.due.datetime ? ` ${task.due.string.slice(-5)}` : ""}>`,
        })),
        taskIdsArray: response.data.map((task) => task.id),
      };
    }
  } catch (e) {
    console.error(e);
  }
};