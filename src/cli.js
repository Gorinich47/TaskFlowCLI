#!/usr/bin/env node

const { DEFAULT_TASKS_FILE, addTask, listTasks } = require('./tasks');

const HELP = `TaskFlow - a simple command-line task manager

Usage:
  taskflow add "Task title"
  taskflow list
  taskflow --help

Commands:
  add <title>  Add a task
  list         Show saved tasks
  --help       Show this help message

Examples:
  taskflow add "Buy groceries"
  taskflow list
`;

function main(argv = process.argv.slice(2), options = {}) {
  const stdout = options.stdout || process.stdout;
  const stderr = options.stderr || process.stderr;
  const filePath = options.filePath || DEFAULT_TASKS_FILE;
  const [command, ...args] = argv;

  if (command === '--help' || command === 'help') {
    stdout.write(HELP);
    return 0;
  }

  try {
    if (command === 'add') {
      if (args.length !== 1 || !args[0].trim()) {
        throw new Error('add requires exactly one non-empty task title');
      }
      const task = addTask(args[0], filePath);
      stdout.write(`Added task #${task.id}: ${task.title}\n`);
      return 0;
    }

    if (command === 'list') {
      if (args.length !== 0) {
        throw new Error('list does not accept arguments');
      }
      const tasks = listTasks(filePath);
      if (tasks.length === 0) {
        stdout.write('No tasks yet. Add one with: taskflow add "Task title"\n');
        return 0;
      }
      for (const task of tasks) {
        stdout.write(`#${task.id} ${task.title}\n`);
      }
      return 0;
    }

    throw new Error(command ? `Unknown command: ${command}` : 'A command is required');
  } catch (error) {
    stderr.write(`${error.message}\nUse --help to see available commands.\n`);
    return 1;
  }
}

if (require.main === module) {
  process.exitCode = main();
}

module.exports = { main };
