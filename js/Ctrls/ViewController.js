import lodashTemplate from 'lodash.template';
import sessionTemplate from '../../resources/Templates/sessionTemplate.html';
import errorTemplate from '../../resources/Templates/errorTemplate.html';
import {
	formatNumber
} from '../HelperFunctions/helperFunctions';

export default class ViewController {
	constructor(container) {
		this._display = container.querySelector('.js-displayResult');
		this._errorDisplay = container.querySelector('.js-displayError');
		this._clearBtn = container.querySelector('.js-clearBtn');

		// to facilitate and optimize some operations
		this._counter = 0;
		this._sessions = [];
		this._currentSpans = [];
		this._currentSpan = -1;

		document.addEventListener('userEvent', (e) => {
			if (e.detail.action === 'wrap') {
				this._wrapSession(e.detail.data);
			}
		});
	}

	getPosition(session) {

		return this._sessions.indexOf(session);
	}

	// returns session position (in this._display.children array);
	createSession(numberArray, {
		wrapped,
		separator,
		japStyle,
	} = {
		wrapped: false,
		separator: ' ',
		japStyle: false
	}) {

		let article = document.createElement('article');
		article.classList.add('js-session');

		let position = this._counter;
		this._counter++;

		let numbers = numberArray.map(num => formatNumber(num, separator, japStyle));
		article.innerHTML = lodashTemplate(sessionTemplate)({num: this._counter, numbers, wrapped});

		this._display.appendChild(article);

		this._sessions.push(article);
		this._clearBtn.disabled = false;

		return position;
	}

	resetAll() {
		this._display.innerHTML = '';
		this._counter = 0;
		this._clearBtn.disabled = true;

		this._sessions = [];

		this._currentSpans = [];
		this._currentSpan = -1;
	}

	activateSession(num) {
		let session = this._display.children[num];

		if (session) {
			session.classList.add('js-active');

			let spans = session.querySelector('.js-numbers').children;

			for(let i = 0; i < spans.length; i++) {
				this._currentSpans.push(spans[i]);
			}
		}
	}

	activateSpan(num) {
		this.deactivateSpan();

		this._currentSpans[num].classList.add('js-activeSpan');
		this._currentSpan = num;		
	}

	deactivateSpan() {
		if ( this._currentSpan !== -1 ) {
			this._currentSpans[this._currentSpan].classList.remove('js-activeSpan');
			
		} 		
	}

	deactivateSession(num) {
		this.deactivateSpan();

		let session = this._display.children[num];

		if (session) {
			session.classList.remove('js-active');
		}

		this._currentSpans = [];
		this._currentSpan = -1;
	}

	_wrapSession(num) {

		let session = this._sessions[num];
		let btns = session.querySelectorAll('[data-action="wrap"]');
		let list = session.querySelector('.js-numbers');

		if (list) {
			list.classList.toggle('js-hidden');
		}

		if (btns) {
			Array.from(btns).forEach(btn => {
				btn.classList.toggle('js-hidden')
			});
		}
	}

	_supportError() {
		this._errorDisplay.innerHTML = errorTemplate;
	}
}