import type { RouterOutput } from ".";

export type CalendarEvent =
  RouterOutput["calendar"]["events"]["getEventDetailsById"];

export type Position =
  RouterOutput["calendar"]["positions"]["listAllPositions"][number];

export type Shift =
  RouterOutput["calendar"]["shifts"]["getShiftsByEventId"][number];

export type Template =
  RouterOutput["calendar"]["templates"]["listAllTemplates"][number];

export type TemplatePosition =
  RouterOutput["calendar"]["templates"]["getTemplatePositionsByTemplateId"][number];
