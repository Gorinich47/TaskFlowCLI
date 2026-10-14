# TaskFlow

TaskFlow is a small command-line task manager built with Node.js. It has no third-party dependencies and stores tasks in `tasks.json` in the project root.

## Requirements

- Node.js 18 or newer

## Setup

Clone or download this project and open a terminal in its directory. No dependency installation is needed.

Run the CLI directly with Node:

```sh
node src/cli.js --help
```

Optionally make the `taskflow` command available through npm's global link:

```sh
npm link
```

## Commands

Add a task (quote titles that contain spaces):

```sh
node src/cli.js add "Buy groceries"
```

List saved tasks:

```sh
node src/cli.js list
```

Show help:

```sh
node src/cli.js --help
```

After running `npm link`, the same commands can use `taskflow` instead of `node src/cli.js`:

```sh
taskflow add "Buy groceries"
taskflow list
```

Tasks are saved as a JSON array in the project-root `tasks.json` file and remain available between runs.

## Tests

Run the built-in Node.js test suite with:

```sh
npm test
```
