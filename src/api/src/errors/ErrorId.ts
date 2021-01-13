enum ErrorId {
  // GetScreenById
  GetScreenById_NoScreenExistsWithId = 'GetScreenById_NoScreenExistsWithId',

  // AddPath
  AddPath_CommandAlreadyExistsForScreen = 'AddPath_CommandAlreadyExistsForScreen',
  AddPath_NoSourceScreenExistsWithId = 'AddPath_NoSourceScreenExistsWithId',
  AddPath_NoDestinationScreenExistsWithId = 'AddPath_NoDestinationScreenExistsWithId',

  // Command
  Command_NoContextScreenExistsWithId = 'Command_NoContextScreenExistsWithId',
}

export default ErrorId;
