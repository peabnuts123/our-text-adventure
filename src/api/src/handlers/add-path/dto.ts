import { PathDestinationType } from "@app/constants/PathDestinationType";
import { CommandActionType } from "@app/constants/CommandActionType";

export interface AddPathDto {
  /** Screen that this command will be added to */
  sourceScreenId?: string;
  /** Command the user must type */
  command?: string;

  /** Items taken (and required) from the player to use this command */
  itemsTaken?: string[];
  /** Items given to the player if this command is successfully executed */
  itemsGiven?: string[];
  /** Whether to limit the items given by only giving them to the player if they don't already have them */
  limitItemsGiven?: boolean;
  /** Items required that the player have (but not removed) in order to successfully execute this command */
  itemsRequired?: string[];

  /** What kind of action this Command performs */
  actionType?: CommandActionType;

  /* NAVIGATION ACTIONS */
  /** (If `actionType === 'navigate'`) Whether the command navigates to a new or existing screen */
  destinationType?: PathDestinationType;
  /** (If `destinationType === 'new'`) The body of the new screen that will be created */
  newScreenBody?: string[];
  /** (If `destinationType === 'existing'`) The ID of the existing screen to link to */
  existingScreenId?: string;

  /* PRINT ACTIONS */
  printMessage?: string[];
}
