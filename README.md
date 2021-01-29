# Our Text Adventure

It's a text-based adventure. You can play it, but you can also contribute to it.

## Questions
  - Some kind of rate limiting?
  - A maintenance mode for the site?

## Backlog / @TODO
  - [x] ~~Add "limit given items" checkbox to frontend~~
  - [x] ~~Add "print message" option to frontend~~
  - [ ] Make API validate and store actionType, printMessage, limitItemsGiven
  - [ ] Update command endpoint to
    - Change a bunch of logic to switch on `actionType` i.e. put all existing logic under code path `actionType === 'navigate'`
    - Implement "limit items given" logic based on command field
    - Implement actionType 'print' and return necessary data
  - [ ] Make WWW respond to updated `command` endpoint payloads
    - Print messages returned in response
  - [x] ~~Items are not case sensitive~~
  - [x] ~~Command to re-print the current screen~~
  - [x] ~~Command to print the current screen's ID~~
  - [x] ~~Add spinner / loading state to things loading~~
  - [x] ~~Persist state when navigating around the site~~
  - [x] ~~Clicking on fake radio button does not work~~
  - [x] ~~Click on terminal to focus command-input~~
  - [ ] BUG: Clicking "Home" while on Home wipes out URL state
  - [ ] line-wrap on various inputs
    - ~~prompt~~
    - path form: command
    - path form: items taken
    - path form: items given
    - path form: items required
  - [x] ~~Up to go through command history~~
  - [x] ~~Remove stupid crap from create-path copy~~
  - [ ] Gracefully handle uncaught errors in the frontend
  - [ ] Store some stuff globally for production debugging (e.g. `window.ota.config`)
  - [ ] Update Insomnia.json
    - Add Command handler
    - Add new exceptions for add-path
  - [x] ~~Mobile nav~~
  - [ ] Make a utility for wrapping words or something
  - [ ] Remove path params from test handler and make it more "debug"-y or something
  - [ ] (API) Upgrade to v3 AWS SDK (and only included as-needed)
  - [ ] Document each component
  - [ ] Document that you need an AWS CLI profile named `our-text-adventure` for deployments
  - [ ] Feedback command

  - [x] ~~Make the terminal write text and then prompt you~~
  - [x] ~~Implement slash commands e.g. `/path`~~
  - [x] ~~`/path` command opens form for creating pathway~~
    - ~~Command~~
    - ~~Items taken~~
    - ~~Items given~~
    - ~~Items required~~
    - ~~Target screen (new / existing)~~
  - [x] ~~Form validation for create-path form~~
  - [x] ~~Add concept of state to frontend~~
    - ~~State store (current screen, inventory, etc, methods to stringify state)~~
    - ~~Commands can update state~~
    - ~~State store will either update the URL with state string or give out a shareable URL or something~~
    - ~~When sending commands to the API also end the state string~~
    - ~~API will need to unencode and decompress the state string into JSON~~
    - ~~Load state from URL when first loading the page~~
  - [x] ~~Create `/api/command` endpoint~~
    - ~~Takes:~~
      - ~~State~~
      - ~~Command~~
    - ~~Returns:~~
      - ~~Error OR~~
      - ~~Screen~~
      - ~~Updated State~~
  - [x] ~~(API) Restrict commands to be unique per screen~~
  - [x] ~~Update `/api/path` endpoint to handle item requirements~~
  - [x] ~~Make the terminal submit the command to the API~~
  - [x] ~~Make terminal print command result~~
  - [x] ~~Make `/inventory` list your inventory~~
  - [x] ~~Make `/help` list commands and stuff~~

### Terminal
  - Shows text
  - Prompts you
  - Appends text to the screen and updates the URL when you issue a command

### Commands
  - Have a command i.e. a string e.g. `look bone`
    - Might fuzzy match on that later
  - May have an item requirement
  - May remove items (which implies requirement)
  - May give items

### Items
  - Are just strings
  - (?) Are not case sensitive (Maybe they are?)
  - There is no limit to inventory
  - You can view your inventory with `/inventory` or something