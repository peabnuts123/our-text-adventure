enum ErrorId {
  // GetScreenById
  GetScreenById_NoScreenExistsWithId = 'GetScreenById_NoScreenExistsWithId',

  // AddPath
  AddPath_NoSourceScreenExistsWithId = 'AddPath_NoSourceScreenExistsWithId',
  AddPath_NoDestinationScreenExistsWithId = 'AddPath_NoDestinationScreenExistsWithId',
}

export default ErrorId;
