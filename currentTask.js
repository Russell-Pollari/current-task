const chalk = require('chalk');
const fs = require('fs');
const notifer = require('node-notifier');

const currentTaskFileName = "/home/russell/projects/current-task/currentTask.json";
const previousTasksFileName = "/home/russell/projects/current-task/previousTasks.json";
const todoFileName = "/home/russell/projects/current-task/todos.json"

const getTask = () => {
	const previousTasks = JSON.parse(fs.readFileSync(previousTasksFileName, 'utf8'));
	const toDos = JSON.parse(fs.readFileSync(todoFileName, 'utf8'));

	let lastStartDate = null;
	previousTasks.forEach(({ task, finishedAt, startedAt, done, tag }, index) => {
		const startDate = new Date(startedAt)
		const finishDate = new Date(finishedAt);
		if (index === 0) {
			console.log(`\n${chalk.bold.underline(startDate.toDateString())}`)
		} else if (lastStartDate.getDay() !== startDate.getDay()) {
			console.log(`\n${chalk.bold.underline(startDate.toDateString())}`)
		}
		const minutes = Math.round(Math.abs(finishDate - startDate) / 60  / 1000);
		const minuteString = minutes < 10 ? `0${minutes}` : `${minutes}`;
		const timeString =`${startDate.toTimeString().slice(0,5)}-${finishDate.toTimeString().slice(0,5)} [${chalk.cyan(`${minuteString} mins`)}]`;
		const tagString = tag ? chalk.bgBlue.white.bold(tag) : '';
		let taskString;
		if (done) {
			taskString = `${chalk.green(task)} ${chalk.green.bold('\u2713')}`;
		} else {
			taskString = `${chalk.yellow(task)}`;
		}
		lastStartDate = startDate;
		console.log(timeString, tagString, taskString)
	});

	const currentTask = JSON.parse(fs.readFileSync(currentTaskFileName, 'utf8'));

	const currentTaskStartDate = new Date(currentTask.startedAt);
	const minutes = Math.round(Math.abs(new Date() - currentTaskStartDate) / 60  / 1000);
	const minuteString = minutes < 10 ? `0${minutes}` : `${minutes}`;
	const timeString =`${currentTaskStartDate.toTimeString().slice(0,5)}-NOW   [${chalk.cyan(`${minuteString} mins`)}]`;
	console.log(timeString, `${currentTask.tag ? `${chalk.bgBlue.white.bold(currentTask.tag)} ` : ''}${chalk.red.bold(currentTask.task)}`);

	console.log(chalk.bold('\nTODO:'))
	toDos.forEach(({ task, tag }, index) => {
		console.log(`${index}: ${tag ? chalk.bgWhite.black.bold(tag) : ''} ${chalk.blue(task)}`);
	});

	notifer.notify({
		title: 'Current task',
		message: currentTask.task,
		reply: true,
		timeout: 3600,
	});
};

const setTask = (task, tag) => {
	const toDos = JSON.parse(fs.readFileSync(todoFileName, 'utf8'));
	if (Number(task) !== NaN && Number(task) < toDos.length) {
		taskToSet = toDos.splice(Number(task), 1)[0];
		fs.writeFileSync(todoFileName, JSON.stringify(toDos));
	} else {
		taskToSet = { task, tag };
	}
	fs.writeFileSync(currentTaskFileName, JSON.stringify({
		...taskToSet,
		startedAt: new Date(),
	}));

	getTask();
}

const done = () => {
	const task = JSON.parse(fs.readFileSync(currentTaskFileName, 'utf8'));
	if (task.task === "No task set") {
		return console.log('No task to mark as done')
	}
	const previousTasks = JSON.parse(fs.readFileSync(previousTasksFileName, 'utf8'));

	previousTasks.push({ ...task, finishedAt: new Date(), done: true });
	fs.writeFileSync(previousTasksFileName, JSON.stringify(previousTasks));
	fs.writeFileSync(currentTaskFileName, JSON.stringify({ task: 'No task set' }));

	getTask();
}

const add = (task, tag) => {
	const todos = JSON.parse(fs.readFileSync(todoFileName, 'utf8'));
	todos.push({ task, tag });
	fs.writeFileSync(todoFileName, JSON.stringify(todos));

	getTask();
}

const pause = () => {
	const task = JSON.parse(fs.readFileSync(currentTaskFileName, 'utf8'));
	const previousTasks = JSON.parse(fs.readFileSync(previousTasksFileName, 'utf8'));
	if (task.task === "No task set") {
		return console.log('No task to pause')
	}
	previousTasks.push({ ...task, finishedAt: new Date(), done: false });
	fs.writeFileSync(previousTasksFileName, JSON.stringify(previousTasks));
	fs.writeFileSync(currentTaskFileName, JSON.stringify({ task: 'No task set' }));
	add(task.task, task.tag);
	getTask();
}

const remove = index => {
	const toDos = JSON.parse(fs.readFileSync(todoFileName, 'utf8'));
	toDos.splice(Number(index), 1);
	fs.writeFileSync(todoFileName, JSON.stringify(toDos));

	getTask();
}

const clear = () => {
	fs.writeFileSync(previousTasksFileName, JSON.stringify([]));
}

module.exports = {
	getTask,
	setTask,
	done,
	add,
	remove,
	clear,
	pause,
};
