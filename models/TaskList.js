const chalk = require('chalk');
const fs = require('fs');
const fse = require('fs-extra');

const Task = require('./Task');

class TaskList {
	constructor(dir) {
		this.currentTaskPath = `${dir}/currentTask.json`;
		this.finishedTasksPath = `${dir}/previousTasks.json`;
		this.toDosPath = `${dir}/todos.json`;

		this.currentTask = null;
		this.finishedTasks = [];
		this.toDos = [];

		this.load();
	}

	load() {
		if (fs.existsSync(this.toDosPath)) {
			this.loadTodos(this.toDosPath);
		}
		if (fs.existsSync(this.finishedTasksPath)) {
			this.loadFinishedTasks(this.finishedTasksPath);
		}
		if (fs.existsSync(this.currentTaskPath)) {
			this.loadCurrentTask(this.currentTaskPath);
		}
	}

	loadCurrentTask(path) {
		this.currentTask = Task.fromFile(path);
	}

	loadFinishedTasks(path) {
		const tasks = JSON.parse(fs.readFileSync(path), 'utf8');
		tasks.forEach(task => {
			this.finishedTasks.push(new Task(task));
		});
	}

	loadTodos(path) {
		const tasks = JSON.parse(fs.readFileSync(path), 'utf8');
		tasks.forEach(task => {
			this.toDos.push(new Task(task));
		});
	}

	add(title, type) {
		const todo = new Task({ title, type });
		this.toDos.push(todo);
		this.save();
	}

	remove(index) {
		try {
			this.toDos.splice(Number(index), 1);
		} catch (error) {
			console.error('invalid index');
		}
		this.save();
	}

	save() {
		const finishedTasksArray = this.finishedTasks.map(task => task.getObject());
		fs.writeFileSync(this.finishedTasksPath, JSON.stringify(finishedTasksArray, null, 2));

		const todoArray = this.toDos.map(task => task.getObject());
		fs.writeFileSync(this.toDosPath, JSON.stringify(todoArray, null, 2));

		const taskObject = this.currentTask ? this.currentTask.getObject() : {};
		fs.writeFileSync(this.currentTaskPath, JSON.stringify(taskObject, null, 2));

		this.save_day();
	}

	save_day() {
		const fileName = this.finishedTasks[0].startDate.toISOString().slice(0, 10);
		const finishedTasksArray = this.finishedTasks.map(task => task.getObject());
		fs.writeFileSync(`data/${fileName}`, JSON.stringify(finishedTasksArray, null, 2));
	}

	clear() {
		this.finishedTasks = [];
		this.save();
	}

	show() {
		if (this.finishedTasks.length > 0) {
			console.log(chalk.bold.underline(this.finishedTasks[0].startDate.toDateString()));
		}

		let previousEndDate = null;
		this.finishedTasks.forEach(task => {
			const idleMinutes = previousEndDate ? (task.startDate - previousEndDate) / 1000 / 60  : 0;
			if (idleMinutes > 3) {
				let minutes = idleMinutes
				while (minutes > 30) {
					console.log(Array(Math.round(30)).join('.'));
					minutes = minutes - 30;
				}
				console.log(Array(Math.round(minutes)).join('.'));
			}
			previousEndDate = task.endDate;
			console.log(task.getStyledString());
		});

		if (this.currentTask) {
			console.log(this.currentTask.getStyledString(), '<=');
		} else {
			console.log('<=')
		}

		this.showTypeBreakdown();

		console.log(`\n${chalk.bold.underline('Todo')}`)
		this.toDos.forEach((todo, index) => {
			console.log(`${index}: ${todo.getStyledTodoString()}`);
		})
	}

	setCurrentTask(title, type, offset = 0) {
		const startedAt = new Date(Date.now() - 1000 * 60 * offset);
		try {
			const index = Number(title);
			this.currentTask = new Task({
				...this.toDos[index].getObject(),
				startedAt,
				endedAt: null,
			});
			this.toDos.splice(index, 1);
		} catch (error) {
			this.currentTask = new Task({ title, type, startedAt });
		}
		this.save();
	}

	done(offset = 0) {
		const finishedAt = new Date(new Date() - 1000 * 60 * offset);
		if (!this.currentTask) {
			console.error('No task set');
			return;
		}
		this.currentTask.done(finishedAt);
		this.finishedTasks.push(this.currentTask);
		this.currentTask = null;
		this.save();
	}

	addNote(message) {
		if (!this.currentTask) {
			this.currentTask = new Task({
				title: '',
				type: 'note',
				notes: [{ date: new Date(), message }]
			});
			this.done();
		} else {
			this.currentTask.addNote(message);
		}
		this.save();
	}

	pause(offset = 0) {
		const finishedAt = new Date(new Date() - 1000 * 60 * offset);
		if (!this.currentTask) {
			console.error('No task set');
		}

		this.currentTask.pause(finishedAt);
		this.finishedTasks.push(this.currentTask);

		this.toDos.push(new Task(({ ...this.currentTask.getObject(), notes: [] })));
		this.currentTask = null;
		this.save();
	}

	showTypeBreakdown() {
		let totalTime = 0;
		const typeSummary = {};
		this.finishedTasks.forEach(task => {
			const type = task.getType();
			totalTime = totalTime + task.getMinutes();
			typeSummary[type] = (typeSummary[type] || 0) + task.getMinutes();
		});
		const typeSummaryArray = Object.keys(typeSummary).map(type => ({
			label: type,
			minutes: typeSummary[type]
		}));

		typeSummaryArray.sort((a, b) => b.minutes - a.minutes);
		const totalMinuteString = `[${chalk.cyan(totalTime < 10 ? `0${totalTime} mins` : `${totalTime} mins`)}]`;
		const hourString = `(${(totalTime / 60).toFixed(2)} hrs)`;
		console.log(chalk.bold.underline('\nSummary'), totalMinuteString, hourString);

		typeSummaryArray.forEach(({ label, minutes }) => {
			const barLength = Math.round(minutes / 2);
			const minuteString = `[${chalk.cyan(minutes < 10 ? `0${minutes} mins` : `${minutes} mins`)}]`;
			if (barLength > label.length) {
				const padding = Array(barLength - label.length).join(' ');
				console.log(chalk.bgBlue.white.bold(label + padding), minuteString);
			} else {
				const coloredString = label.slice(0, barLength);
				const remainingString = label.slice(barLength);
				console.log(`${chalk.bgBlue.white.bold(coloredString)}${chalk.bold(remainingString)}`, minuteString);
			}
		})
	}
}

module.exports = TaskList;
