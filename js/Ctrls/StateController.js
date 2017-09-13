export default class StateController {
	constructor(container, stateString = 'reset') {
		this._display = container.querySelector('.js-displayResult');

		this._mainBtns = {};
		this._mainBtns.play = container.querySelector('.js-playBtn');
		this._mainBtns.pause = container.querySelector('.js-pauseBtn');
		this._mainBtns.stop = container.querySelector('.js-stopBtn');

		this._state = stateString;
		this.setState(stateString);	// also creates this._ctrlBtn object
	}

	getState() {
		return this._state;
	}

	setState(stateString, activeSession) {
		this._state = stateString;

		switch (stateString) {
			case 'playing':
				this._playing(activeSession);
				break;
			case 'paused':
				this._paused(activeSession);
				break;
			case 'stopped':
				this._stopped(activeSession);
				break;
			case 'reset':
				this._reset();
				break;
		}
	}

	_playing(active = -1) { // block all buttons except for the active session, switch play button to pause button
		this._ctrlBtnsUpToDate();

		this._mainBtns.play.classList.add('js-hidden');
		this._mainBtns.pause.classList.remove('js-hidden');

		this._ctrlBtnsBlock(active);
		this._switchPlayToPause(active);

	}

	_paused(active = -1) { // switch main active session pause button to play button
		this._ctrlBtnsUpToDate();

		this._mainBtns.play.classList.remove('js-hidden');
		this._mainBtns.pause.classList.add('js-hidden');

		this._switchPauseToPlay(active); // changes main button and active button
	}

	_stopped(active = -1) { // switch play button to pause button; unblock all buttons
		this._ctrlBtnsUpToDate();

		this._mainBtns.play.classList.remove('js-hidden');
		this._mainBtns.pause.classList.add('js-hidden');

		if (active !== null) {
			this._switchPauseToPlay(active); // changes main button + active button
		}
		this._ctrlBtnsUnblock();

	}

	_getCtrlBtns() {
		this._ctrlBtns.play = Array.from(this._display.querySelectorAll('[data-action="play"]'));
		this._ctrlBtns.pause = Array.from(this._display.querySelectorAll('[data-action="pause"]'));
		this._ctrlBtns.stop = Array.from(this._display.querySelectorAll('[data-action="stop"]'));
	}

	_ctrlBtnsUpToDate() {
		if (this._display.children.length !== this._ctrlBtns.play.length) {
			this._ctrlBtns.play = [];
			this._ctrlBtns.pause = [];
			this._ctrlBtns.stop = [];

			this._getCtrlBtns();
		}
	}

	_ctrlBtnsBlock(active) {

		if (active === -1) {
			return;
		}

		for (let i = 0; i < this._ctrlBtns.play.length; i++) {
			if (i !== active) {
				this._ctrlBtns.play[i].disabled = true;
				this._ctrlBtns.pause[i].disabled = true;
				this._ctrlBtns.stop[i].disabled = true;
			}
		}
	}

	_ctrlBtnsUnblock() {
		Array.from(this._display.querySelectorAll('button:disabled')).forEach(btn => {
			btn.disabled = false;
		})
	}

	_switchPauseToPlay(active) {
		if (active === -1) {
			return;
		}

		this._ctrlBtns.play[active].classList.remove('js-hidden');
		this._ctrlBtns.pause[active].classList.add('js-hidden');
	}

	_switchPlayToPause(active) {
		if (active === -1) {
			return;
		}

		this._ctrlBtns.play[active].classList.add('js-hidden');
		this._ctrlBtns.pause[active].classList.remove('js-hidden');
	}

	_reset() {
		this._ctrlBtns = {
			play: [],
			pause: [],
			stop: []
		}
		this._stopped();
	}
}