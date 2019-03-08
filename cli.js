#!/usr/bin/env node
const program = require('commander');
const mongoose = require('mongoose');

const Task = require('./models/Task.js');
const {
	getTask,
	setTask,
	done,
	add,
	remove,
	clear,
	pause,
} = require('./currentTask.js');


// mongoose.connect('mongodb://localhost:27017/tasks');
//
// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
// 	console.log('Connected to Mongo')
//   // we're connected!
// });
//
// const set = (title, tag) => {
// 	const task = new Task();
// 	task.set(title, [tag]);
// 	console.error(Task.getRecent());
// }
//
// const show = () => {
// 	console.log('showing');
// 	Task.getRecent((error, tasks) => {
// 		if (error) {
// 			console.log(error);
// 			return;
// 		}
//
// 		tasks.forEach(task => {
// 			console.log(task.title);
// 		});
// 	});
// }

program
	.command('set <task>')
	.option('-t <tag>', 'Add a tag')
	.action((task, options) => {
		setTask(task, options.T);
	})

program
	.command('add <task>')
	.option('-t <tag>', 'Add a tag')
	.action((task, options) => {
		add(task, options.T);
	})

program.command('done').action(done);
program.command('show').action(getTask);
program.command('clear').action(clear);
program.command('pause').action(pause)

program
.command('remove <index>')
	.action((index) => remove(index))


program.parse(process.argv);

mongoose.connection.close();
