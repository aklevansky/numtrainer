import StateController from './StateController';
import ViewController from './ViewController';

export default class UserActionController {
	constructor(appContainer) {
		this._appContainer = appContainer;
		this._display = appContainer.querySelector('.js-displayResult');
		this._state = new StateController(appContainer);
		this._view = new ViewController(appContainer);

		this._initializeListeners();
	}


	_initializeListeners() {

		document.addEventListener('click', (e) => {
			let btn = e.target.closest('.js-controls');

			if (btn && !btn.disabled) {

				let sessionPosition = this._view.getPosition(btn.closest('.js-session')); // returns -1 in case of error
				let action = btn.dataset.action;

				this._dispatchUserEvent(action, sessionPosition);

			}
		});

		document.addEventListener('playerEvent', (e) => {
			switch (e.detail.event) {
				case 'playing':
					this._state.setState('playing', e.detail.data);
					this._view.activateSession(e.detail.data);
					break;
				case 'playingSpan':
					this._view.activateSpan(e.detail.data);
					break;
				case 'stopped':
					this._state.setState('stopped', e.detail.data);
					this._view.deactivateSession(e.detail.data);
					break;
				case 'paused':
					this._state.setState('paused', e.detail.data);
					break;
				case 'resumed':
					this._state.setState('playing', e.detail.data);
					break;
				case 'deleteAll':
					this._view.resetAll();
					this._state.setState('reset');
					break;
				case 'supportError':
					this._view._supportError();
					break;
				case 'newSession':
					let session = this._view.createSession(e.detail.data.numbers, e.detail.data.viewData);
					let playNew = new CustomEvent('userEvent', {
						detail: {
							action: 'play',
							data: session
						}
					});
					this._dispatchPlayEvent(playNew);
			}
		})
	}

	_dispatchUserEvent(action, data) {

		let e = new CustomEvent('userEvent', {
			detail: {
				action,
				data
			}
		});

		action === 'play' ? this._dispatchPlayEvent(e) : document.dispatchEvent(e);
	}


	_dispatchPlayEvent(e) {

		if (this._state.getState() === 'paused') {
			this._dispatchUserEvent('resume', null);

		} else if (e.detail.data !== -1) {

			document.dispatchEvent(e);

		} else { // no session, main play button clicked - create session first

			let createSession = new CustomEvent('userEvent', {
				detail: {
					action: 'createSession',
					data: null
				}
			});

			document.dispatchEvent(createSession);
		}
	}
}