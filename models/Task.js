const fs = require('fs');
const chalk = require('chalk');

class Task {
	constructor(options) {
		this.defaultOptions = {
			title: 'Add a task',
			type: 'task',
			startedAt: new Date(),
			endedAt: null,
			done: false,
			notes: []
		};

		this.task = { ...this.defaultOptions, ...options };
		this.startDate = this.task.startedAt ? new Date(this.task.startedAt) : null;
		this.endDate = this.task.endedAt ? new Date(this.task.endedAt) : null;
	}

	static fromFile(path) {
		const options = JSON.parse(fs.readFileSync(path,'utf8'));
		if (options.title) {
			return new Task(options);
		} else {
			return null;
		}
	}

	start() {
		this.startDate = new Date();
		this.task.startedAt = this.startDate;
	}

	done(endedAt) {
		this.task.endedAt = endedAt || new Date();
		this.task.done = true;
	}

	addNote(message) {
		this.task.notes.push({ date: new Date(), message });
	}

	clearNotes() {
		this.task.notes = [];
	}

	pause(endedAt) {
		this.task.endedAt = endedAt || new Date();
	}

	getObject () {
		return this.task;
	}

	getMinutes() {
		const end = this.endDate || new Date();
		return Math.round(Math.abs(end - this.startDate) / 60  / 1000);
	}

	getType() {
		return this.task.type;
	}

	getStyledNotes() {
		return this.task.notes.map(({ date, message }) => {
			const noteDate = new Date(date);
			return `\n\t=> ${noteDate.toTimeString().slice(0, 5)} - ${message}`
		});
	}

	getStyledString() {
		const styledTimeString = this.getStyledTimeString();
		const styledMinuteString = this.getStyledMinuteString();
		const styledTaskString = this.getStyledTaskString();
		const notes = this.getStyledNotes();

		return `${styledTimeString} ${styledMinuteString} ${styledTaskString}${notes}`;
	}

	getStyledMinuteString() {
		const minutes = this.getMinutes();
		const minuteString =`[${minutes < 10 ? '0' : ''}${minutes} mins]`;
		return chalk.cyan(minuteString);
	}

	getStyledTimeString() {
		const startTime = this.startDate.toTimeString().slice(0,5)
		const endDate = this.endDate || new Date();
		const endTime = endDate.toTimeString().slice(0,5);
		return `${startTime}-${endTime}`;
	}

	getStyledTodoString() {
		const { type, title } = this.task;
		return `${chalk.white.bold(`(${type})`)} ${chalk.blue(title)}`;
	}

	getStyledTaskString() {
		const { type, title, done } = this.task;

		const typeString = `(${type})`;
		const titleString = `${title} ${done ? '\u2713' : ''}`;
		const taskString = `${typeString} ${titleString}`;

		const minutes = this.getMinutes();
		if (minutes > taskString.length) {
			const styledTypeString = chalk.white(typeString);
			const styledTitleString = done ?
 				chalk.green(titleString) :
				chalk.yellow(titleString);
			const padding = Array(minutes - taskString.length).join(' ');

			return chalk.bgBlue.bold(`${styledTypeString} ${styledTitleString}${padding}`);
		} else if (minutes < typeString.length) {
			const styledTypeString =
				chalk.bgBlue.white.bold(typeString.slice(0, minutes)) +
				chalk.white.bold(typeString.slice(minutes));
			const styledTitleString = done ?
				chalk.green.bold(titleString) :
				chalk.yellow.bold(titleString);

			return `${styledTypeString} ${styledTitleString}`;
		} else {
			const styledTypeString = chalk.bgBlue.white.bold(typeString);
			const titleFilledSubsString = ' ' + titleString.slice(0, minutes - typeString.length);
			const titleRemainderString = titleString.slice(minutes - typeString.length);
			const styledTitleString = done ?
				`${chalk.green.bgBlue.bold(titleFilledSubsString)}${chalk.green.bold(titleRemainderString)}` :
				`${chalk.yellow.bgBlue.bold(titleFilledSubsString)}${chalk.yellow.bold(titleRemainderString)}`;

			return `${styledTypeString}${styledTitleString}`
		}
	}
}

module.exports = Task;
