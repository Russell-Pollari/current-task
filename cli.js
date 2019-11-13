#!/usr/bin/env node
const program = require('commander');

const Task = require('./models/Task');
const TaskList = require('./models/TaskList');

const BASE_PATH = '/home/russell/projects/current-task/';

const { spawn } = require('child_process')
const taskList = new TaskList(BASE_PATH);

const edit = filename => {
	const child = spawn('vim', [`${BASE_PATH}/${filename}`], {
		stdio: 'inherit'
	});

	child.on('exit', (e) => {
		console.log('edited', filename);
	})
}

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
	.option('-o <offset>')
	.action((options) => taskList.pause(options.O));

program
	.command('note <note>')
	.action((note) => taskList.addNote(note));

program
	.command('edit [type]')
	.action((type => {
		switch(type) {
			case 'todos':
				edit('todos.json');
				break;
			case 'done':
				edit('previousTasks.json');
				break;
			default:
				edit('currentTask.json');
		}
	}))

program
	.option('-a, --all', 'Show all tasks')

program.parse(process.argv);

if (program.all) {
	taskList.show();
} else {
	if (taskList.currentTask) {
		console.log(taskList.currentTask.getStyledString())
	} else {
		console.log('No task set');
	}
}
