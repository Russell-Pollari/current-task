const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
	title: String,
	done: Boolean,
	startedAt: { type: Date, index: true },
	finishedAt: { type: Date, index: true },
	tags: [String],
	_createdAt: Date,
	_updatedAt: Date,
});

taskSchema.statics.getRecent = function(cb) {
	return this.find({}, {
		sort: {
			_startedAt: -1
		}
	}, cb);
}

taskSchema.methods.set = function(title, tags, cb) {
	return this.save({
		title,
		tags,
		done: false,
		startedAt: new Date(),
		_createdAt: new Date(),
		_updatedAt: null,
	}, cb);
}

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
