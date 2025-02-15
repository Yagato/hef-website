// Packages
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMedia {
	type: 'image' | 'video' | 'text',
	src?: string,
	message?: string,
}

export interface ILink {
	name: string,
	link: string,
}

export interface IEvent {
	type: undefined, // Placeholder, make sure to update the database schema if changing this
	date: Date,
	shortDescription: string,
	longDescription: string,
}

export interface ICredit {
	type: 'artwork' | 'code' | 'music' | 'organization',
	user: string,
	pfp: string,
	github?: string,
	twitter?: string,
	youtube?: string,
}

export interface IProject {
	_id?: number,
	status: 'ongoing' | 'past',
	guild: string,
	media?: IMedia[],
	title: string,
	shortDescription: string,
	description: string,
	links?: ILink[],
	date: Date,
	flags?: string[],
	ogImage?: string,
	timeline?: IEvent[],
	backgroundMusic?: string,
	credits?: ICredit[],
}

interface IProjectDocument extends IProject, Document {
	_id: number,
}

interface ICounter extends Document {
	_id: string,
	seq: number,
}

const CounterSchema: Schema = new Schema({
	_id: { type: String, required: true },
	seq: { type: Number, default: 0 },
});

let CounterModel: mongoose.Model<ICounter, {}>;
try {
	CounterModel = mongoose.model<ICounter>('Counter');
} catch {
	CounterModel = mongoose.model<ICounter>('Counter', CounterSchema, 'counters');
}

const GallerySchema: Schema = new Schema({
	type: { type: String, enum: ['image', 'video', 'text'], required: true },
	src: { type: String },
	message: { type: String },
});

const LinkSchema: Schema = new Schema({
	name: { type: String, required: true },
	link: { type: String, required: true },
});

const EventSchema: Schema = new Schema({
	date: { type: Date, required: true },
	shortDescription: { type: String, required: true },
	longDescription: { type: String, required: false },
});

const CreditSchema: Schema = new Schema({
	type: { type: String, enum: ['artwork', 'code', 'music', 'organization'], required: true },
	user: { type: String, required: true },
	pfp: { type: String, required: true },
	github: { type: String },
	twitter: { type: String },
	youtube: { type: String },
});

const ProjectSchema: Schema = new Schema({
	_id: { type: Number },
	status: { type: String, required: true, enum: ['ongoing', 'past'] },
	guild: { type: String, required: true },
	media: { type: [GallerySchema], default: undefined },
	title: { type: String, required: true },
	shortDescription: { type: String, required: true },
	description: { type: String, required: true },
	links: { type: [LinkSchema], default: undefined },
	date: { type: Date, default: new Date() },
	flags: { type: [String], default: undefined },
	ogImage: { type: String },
	timeline: { type: [EventSchema], default: undefined },
	backgroundMusic: { type: String },
	credits: { type: [CreditSchema], default: undefined },
});

// eslint-disable-next-line func-names
ProjectSchema.pre('save', function (next) {
	const doc = this;
	CounterModel.findByIdAndUpdate({ _id: 'projectCounter' }, { $inc: { seq: 1 } }, { new: true, upsert: true }, (error, counter: ICounter) => { // eslint-disable-line consistent-return
		if (error) { return next(error); }
		doc._id = counter.seq;
		next();
	});
});

let model;
try {
	model = mongoose.model<IProjectDocument>('Project');
} catch {
	model = mongoose.model<IProjectDocument>('Project', ProjectSchema, 'projects');
}
export default <Model<IProjectDocument>>model;
