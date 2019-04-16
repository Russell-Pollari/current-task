#!/usr/bin/env node
const program = require('commander');

const Task = require('./models/Task');
const TaskList = require('./models/TaskList');

const task_dir = '/home/russell/projects/current-task';
const dir = process.cwd();
console.log(dir);
const taskList = new TaskList(task_dir);

program
	.command('set <title>')
	.option('-t <type>')
	.option('-o <offset>')
	.action((title, options) => {
		taskList.setCurrentTask(title, options.T, options.O);
	});

program
	.command('add <title>')
	.option('-t <type>')
	.action((title, options) => taskList.add(title, options.T));

program
	.command('remove <index>')
	.action((index) => taskList.remove(index));

program
	.command('clear')
	.action(() => taskList.clear());

program
	.command('done')
	.option('-o <offset>')
	.action((options) => taskList.done(options.O));

program
	.command('pause')
	.action(() => taskList.pause());

program
	.command('note <note>')
	.action((note) => taskList.addNote(note));

program.parse(process.argv);
taskList.show();
