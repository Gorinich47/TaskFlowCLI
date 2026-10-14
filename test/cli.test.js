const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { main } = require('../src/cli');

function temporaryDirectory() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'taskflow-cli-'));
}

function streams() {
  let stdout = '';
  let stderr = '';
  return {
    stdout: { write: (text) => { stdout += text; } },
    stderr: { write: (text) => { stderr += text; } },
    getStdout: () => stdout,
    getStderr: () => stderr,
  };
}

test('--help prints usage and succeeds', () => {
  const output = streams();
  const status = main(['--help'], output);

  assert.equal(status, 0);
  assert.match(output.getStdout(), /Usage:/i);
  assert.match(output.getStdout(), /add <title>/);
  assert.equal(output.getStderr(), '');
});

test('add persists a task and list prints its title', () => {
  const filePath = path.join(temporaryDirectory(), 'tasks.json');
  const addOutput = streams();
  const listOutput = streams();

  assert.equal(main(['add', 'Buy groceries'], { ...addOutput, filePath }), 0);
  assert.match(addOutput.getStdout(), /Buy groceries/);
  assert.equal(main(['list'], { ...listOutput, filePath }), 0);
  assert.match(listOutput.getStdout(), /Buy groceries/);
});

test('list reports when there are no tasks', () => {
  const output = streams();
  const status = main(['list'], { ...output, filePath: path.join(temporaryDirectory(), 'tasks.json') });

  assert.equal(status, 0);
  assert.match(output.getStdout(), /no tasks/i);
});

test('missing title and unknown command report errors and fail', () => {
  for (const args of [['add'], ['unknown']]) {
    const output = streams();
    assert.equal(main(args, output), 1);
    assert.notEqual(output.getStderr(), '');
  }
});

test('uses the package data file regardless of the caller working directory', () => {
  const packageDirectory = temporaryDirectory();
  const callerDirectory = temporaryDirectory();
  const sourceDirectory = path.join(packageDirectory, 'src');
  fs.mkdirSync(sourceDirectory);
  fs.copyFileSync(path.join(__dirname, '..', 'src', 'cli.js'), path.join(sourceDirectory, 'cli.js'));
  fs.copyFileSync(path.join(__dirname, '..', 'src', 'tasks.js'), path.join(sourceDirectory, 'tasks.js'));
  fs.writeFileSync(path.join(packageDirectory, 'tasks.json'), '[]\n');
  const cliPath = path.join(sourceDirectory, 'cli.js');

  const added = spawnSync(process.execPath, [cliPath, 'add', 'Outside project'], {
    cwd: callerDirectory,
    encoding: 'utf8',
  });
  assert.equal(added.status, 0, added.stderr);

  const listed = spawnSync(process.execPath, [cliPath, 'list'], {
    cwd: callerDirectory,
    encoding: 'utf8',
  });
  assert.equal(listed.status, 0, listed.stderr);
  assert.match(listed.stdout, /Outside project/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(packageDirectory, 'tasks.json'), 'utf8'))[0].title, 'Outside project');
});
