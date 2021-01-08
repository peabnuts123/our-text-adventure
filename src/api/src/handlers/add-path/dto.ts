import { PathDestinationType } from "../../constants/PathDestinationType";

export interface AddPathDto {
  /** Screen that this command will be added to */
  sourceScreenId?: string;
  /** Command the user must type */
  command?: string;

  /** Items taken (and required) from the player to use this command */
  itemsTaken?: string[];
  /** Items given to the player if this command is successfully executed */
  itemsGiven?: string[];
  /** Items required that the player have (but not removed) in order to successfully execute this command */
  itemsRequired?: string[];

  /** Whether the command links to a new or existing screen */
  destinationType?: PathDestinationType;
  /** (If `destinationType === 'new'`) The body of the new screen that will be created */
  newScreenBody?: string[];
  /** (If `destinationType === 'existing'`) The ID of the existing screen to link to */
  existingScreenId?: string;
}
