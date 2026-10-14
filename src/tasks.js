const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_TASKS_FILE = path.join(__dirname, '..', 'tasks.json');

function listTasks(filePath = DEFAULT_TASKS_FILE) {
  let contents;

  try {
    contents = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  let tasks;
  try {
    tasks = JSON.parse(contents);
  } catch (error) {
    throw new Error(`Invalid tasks JSON in ${filePath}: ${error.message}`);
  }

  if (!Array.isArray(tasks)) {
    throw new Error(`Tasks data in ${filePath} must be a JSON array`);
  }

  return tasks;
}

function addTask(title, filePath = DEFAULT_TASKS_FILE) {
  if (typeof title !== 'string' || !title.trim()) {
    throw new Error('Task title must not be empty');
  }

  const tasks = listTasks(filePath);
  const id = Math.max(0, ...tasks.map((task) => task.id)) + 1;
  const task = {
    id,
    title,
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);
  fs.writeFileSync(filePath, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');

  return task;
}

module.exports = {
  DEFAULT_TASKS_FILE,
  addTask,
  listTasks,
};
