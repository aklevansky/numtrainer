import DataController from './DataController';
import writtenNumber from 'written-number';

export default class PlayerController {
	constructor(data) {
		
		this._dataSrc = null;
		this._paused = false;
		this._stopped = false;

		this._initialize(data);

		document.addEventListener('userEvent', this._userEvent.bind(this));
		console.log('%cIn case you are wondering why are SpeechSynthesisUtterance objects logged to the console:\nIt\'s due to a Google Chrome bug: unless something is done with this object (eg, console log), onend event may not fire consistently', 'color: blue; font-weight: bold');
	}

	_dispatchPlayerEvent(event, data = null) {
		let e = new CustomEvent('playerEvent', {
			detail: {
				event,
				data
			}
		});
		document.dispatchEvent(e);
	}

	_userEvent(e) {
		let action = e.detail.action;
		let sessionNumber = e.detail.data;

		if (action in this) {
			this[action](sessionNumber);
		};
	}

	_initialize(data) {

		if (!('speechSynthesis' in window)) {
			this._dispatchPlayerEvent('supportError');
			return;
		}

		this._dataSrc = new DataController(data);
	}

	play(sessionNumber = this._dataSrc.lastSessionPosition) {
		this._stopped = false;
		let session = this._dataSrc.getSession(sessionNumber);
		this._dataSrc.nowPlaying = sessionNumber;

		this._dispatchPlayerEvent('playing', sessionNumber);

		let utterances = session.numbers.map((num, i) => {
			console.log(writtenNumber(num));
			let msg = null;

			if ( (session.lang === 'en-UK' || session.lang === 'en-US' ) && num >= 1000000) { // English speech synthesis doesn't support long numbers
				msg = new SpeechSynthesisUtterance(writtenNumber(num));
			} else {
				msg = new SpeechSynthesisUtterance(num);
			}

			msg.lang = session.lang;
			msg.rate = session.rate;

			return msg
		});

		this._speechEngine(utterances);
	}

	createSession() {
		let session = this._dataSrc.createSession();
		this._dispatchPlayerEvent('newSession', session);
	}

	pause() {
		if (this._paused === false); {
			this._paused = true;
			speechSynthesis.pause();
		}
		this._dispatchPlayerEvent('paused', this._dataSrc.nowPlaying);
	}

	stop() {
		speechSynthesis.cancel();
		this._stopped = true;
		this._dispatchPlayerEvent('stopped', this._dataSrc.nowPlaying);
		this._dataSrc.nowPlaying = null;
	}

	resume() {
		speechSynthesis.resume();
		this._paused = false;
		this._dispatchPlayerEvent('resumed', this._dataSrc.nowPlaying);
	}

	// delete all sessions
	clearSessions() {
		speechSynthesis.cancel();
		this.stop();

		this._dataSrc.clearAll();
		this._dispatchPlayerEvent('deleteAll', null);
	}


	_speechEngine(utterances) {

		let gen = genSpeech(this, utterances); // ugly, think how to fix
		executor.call(this, gen);

		function* genSpeech(that, speech) {

			for (let i = 0; i < speech.length; i++) {
				let msg = speech[i];

				yield new Promise(resolve => {
					msg.addEventListener('start', e => {
						that._dispatchPlayerEvent('playingSpan', i);
					});
					msg.addEventListener('end', e => {
						resolve(i)
					});
					speechSynthesis.cancel();
					console.log(msg); // in google chrome for some reason onend event may not fire without this line
					speechSynthesis.speak(msg);
				});
			}
			return null;
		}

		function executor(gen) {
			let span = gen.next();

			if (!span.done) {
				span.value.then(stopIfPaused.bind(this)).then(result => {
					if (this._stopped) {
						return;
					}
					executor.call(this, gen);
				}, reject => {
					console.log('Error');
				});
			} else {
				this.stop();
			}

			function stopIfPaused(result) {

				if (!this._paused) {
					return result;
				} else {
					return new Promise(resolve => {
						document.addEventListener('playerEvent', waitForResume);

						function waitForResume(e) {
							if (e.detail.event === 'resumed') {
								document.removeEventListener('playerEvent', waitForResume);

								resolve(result);
							}
						}
					});
				}
			}

		}
	}
}