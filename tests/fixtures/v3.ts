import { emptyIssue, Issue, NeedsAction } from "../../src/domain/types";

const mk = (id: string, title: string, tags: string[], isRoot: boolean, causedBy: string[], needsAction: NeedsAction): Issue =>
  ({ ...emptyIssue("d2", title), id, description: "x", tags, isRoot, causedBy, needsAction, canBeAddressed: "y" });

export const V3: Issue[] = [
  mk("1", "Too many ideas lessening the intensity of one idea", ["Structure","Theme"], true, [], "yes"),
  mk("2", "Lack of Focused setup", ["Structure"], true, [], "yes"),
  mk("3", "What are we laughing at in this film", ["Theme"], true, [], "yes"),
  mk("4", "The ghosts problem", ["Theme","Character","Logic"], true, [], "yes"),
  mk("5", "Perspective and who is this story about", ["Structure","Theme"], false, ["2"], "yes"),
  mk("6", "The anto problem", ["Character","Structure"], false, ["2","5"], "yes"),
  mk("7", "Anto was searching is not clear", ["Character","Arc","Structure"], false, ["2","1"], "yes"),
  mk("8", "Too many characters", ["Character","Arc"], false, ["1","5"], "no"),
  mk("9", "Bobbing heads", ["Tone"], false, ["3"], "yes"),
  mk("10", "The villain problem", ["Character","Tone"], false, ["3"], "yes"),
  mk("11", "Should shaji be mythified", ["Character","Theme"], false, ["4"], "yes"),
  mk("12", "Main conflict only comes in by the 50th page", ["Structure"], false, ["9"], "no"),
  mk("13", "Risk in simon being seen with shaji", ["Logic"], true, [], "no"),
];
