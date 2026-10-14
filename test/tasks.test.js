const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { addTask, listTasks } = require('../src/tasks');

function temporaryTasksFile() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-'));
  return path.join(directory, 'tasks.json');
}

test('lists an empty array when the data file does not exist', () => {
  assert.deepEqual(listTasks(temporaryTasksFile()), []);
});

test('adds a task with a numeric ID, exact title, and ISO timestamp', () => {
  const filePath = temporaryTasksFile();
  const task = addTask('Buy groceries', filePath);

  assert.equal(task.id, 1);
  assert.equal(task.title, 'Buy groceries');
  assert.equal(new Date(task.createdAt).toISOString(), task.createdAt);
  assert.deepEqual(JSON.parse(fs.readFileSync(filePath, 'utf8')), [task]);
});

test('assigns sequential IDs and preserves nonblank title text', () => {
  const filePath = temporaryTasksFile();

  const first = addTask('  First task  ', filePath);
  const second = addTask('Second task', filePath);

  assert.equal(first.title, '  First task  ');
  assert.equal(second.id, 2);
  assert.deepEqual(listTasks(filePath), [first, second]);
});

test('rejects empty and whitespace-only titles without changing stored data', () => {
  const filePath = temporaryTasksFile();
  addTask('Existing task', filePath);
  const before = fs.readFileSync(filePath, 'utf8');

  assert.throws(() => addTask('', filePath), /title/i);
  assert.throws(() => addTask('   ', filePath), /title/i);
  assert.equal(fs.readFileSync(filePath, 'utf8'), before);
});

test('rejects malformed JSON without overwriting it', () => {
  const filePath = temporaryTasksFile();
  fs.writeFileSync(filePath, '{broken', 'utf8');

  assert.throws(() => listTasks(filePath), /invalid|json|parse/i);
  assert.equal(fs.readFileSync(filePath, 'utf8'), '{broken');
});

test('rejects valid JSON that is not an array without overwriting it', () => {
  const filePath = temporaryTasksFile();
  fs.writeFileSync(filePath, '{}', 'utf8');

  assert.throws(() => listTasks(filePath), /array/i);
  assert.equal(fs.readFileSync(filePath, 'utf8'), '{}');
});
