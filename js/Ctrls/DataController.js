export default class DataController {
	constructor(form) {
		this._form = form;
		this._sessions = [];
		this._current = -1;

	}

	get lastSessionPosition() {
		return this._sessions.length - 1;
	}

	get nowPlaying() {
		return this._current;
	}

	set nowPlaying(pos) {
		this._current = pos;
	}

	getSession(pos) {
		return this._sessions[pos];
	}

	createSession() {
		let session = {};
		let settings = this._form.getData();

		session.numbers = this._generateNumberList(settings);
		session.lang = settings.lang;
		session.rate = settings.rate;
		session.spacing = settings.spacing;
		this._sessions.push(session);

		return {
			numbers: session.numbers,
			viewData: {
				wrapped: settings.wrapped,
				separator: settings.separator,
				japStyle: (settings.spacing === 4) ? true : false,
			}
		}
	}

	clearAll() {
		this._sessions = [];
		this._current = -1;
	}

	_generateNumberList({
		min = 1000,
		max = 1000000,
		quantity = 100
	}) {

		let numbers = [];

		for (let i = 0; i < quantity; i++) {
			numbers.push(randomInteger(min, max));
		}

		return numbers;

		// helper function

		function randomInteger(min, max) {
			var rand = min - 0.5 + Math.random() * (max - min + 1)
			rand = Math.round(rand);
			return rand;
		}
	}
}