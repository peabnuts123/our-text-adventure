# Our Text Adventure

It's a text-based adventure. You can play it, but you can also contribute to it.

## Questions
  - Some kind of rate limiting?
  - A maintenance mode for the site?

## Backlog / @TODO
  - [ ] (API) Upgrade to v3 AWS SDK (and only included as-needed)
  - [ ] Document each component
  - [ ] Document that you need an AWS CLI profile named `our-text-adventure` for deployments
  - [ ] Mobile nav
  - [ ] line-wrap on prompt input

  - [x] ~~Make the terminal write text and then prompt you~~
  - [x] ~~Implement slash commands e.g. `/path`~~
  - [x] ~~`/path` command opens form for creating pathway~~
    - ~~Command~~
    - ~~Items taken~~
    - ~~Items given~~
    - ~~Items required~~
    - ~~Target screen (new / existing)~~
  - [x] ~~Form validation for create-path form~~
  - [ ] Create `/api/command` endpoint
    - Takes:
      - State
      - Command
    - Returns:
      - Error OR
      - Screen
      - Updated State
  - [ ] (API) Restrict commands to be unique per screen
  - [x] ~~Update `/api/path` endpoint to handle item requirements~~
  - [ ] Make the terminal submit the command to the API
  - [ ] Make terminal print command result
  - [ ] Terminal hydrates state from the URL whenever an command is issued
  - [ ] Make `/inventory` list your inventory
  - [ ] Make `/help` list commands and stuff

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