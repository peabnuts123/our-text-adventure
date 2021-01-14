# Our Text Adventure

It's a text-based adventure. You can play it, but you can also contribute to it.

## Questions
  - Some kind of rate limiting?
  - A maintenance mode for the site?

## Backlog / @TODO
  - [ ] line-wrap on prompt input
  - [ ] Add spinner / loading state to terminal onSubmit
  - [x] ~~Up to go through command history~~
  - [x] ~~Remove stupid crap from create-path copy~~
  - [ ] (?) Command to re-print the current screen
  - [ ] Command to print the current screen's ID
  - [ ] Gracefully handle errors in the frontend
  - [ ] Update Insomnia.json
    - Add Command handler
    - Add new exceptions for add-path
  - [ ] Mobile nav
  - [ ] Make a utility to wrap words or something
  - [ ] Remove path params from test handler and make it more "debug"-y or something
  - [ ] Persist state when navigating around the site
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