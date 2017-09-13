import lodashTemplate from 'lodash.template';
import formTemplate from '../../resources/Templates/formTemplate.html';
import languageSelectTemplate from '../../resources/Templates/languageSelectTemplate.html';

// a map preserves the necessary order
const LANG = new Map([
	['en-GB', 'English UK'],
	['en-US', 'English US'],
	['fr-FR', 'French'],
	['de-DE', 'German'],
	['it-IT', 'Italian'],
	['ja-JP', 'Japanese'],
	['pl-PL', 'Polish'],
	['pt-BR', 'Portuguese'],
	['ru-RU', 'Russian'],
	['es-ES', 'Spanish']
]);

const DEFAULT_SPACING = '3';

export default class FormController {
	constructor(container) {
		this._form = this._createForm(container);
		this._inputs = new Map([
			['min', this._form['min']],
			['max', this._form['max']],
			['quantity', this._form['quantity']]
		]);
		this._errorMessage = this._form.querySelector('.js-error');
		this._spacing = this._form.querySelector('.js-digitGroup');
	}

	getInputsData() {
		let defaults = {};
		for (let [name, input] of this._inputs) {
			defaults[name] = {
				min: +input.dataset.min,
				max: +input.dataset.max,
				value: +input.value
			}
		}

		return defaults;
	}

	// necessary to check for onblur event
	getInputElements() {
		let inputs = {}
		for (let input of document.querySelectorAll('.js-numbers') ) {
			inputs[input.name] = input;
		}

		return inputs;
	}

	// input - string,name of the input field
	setInput(input, value) {
			this._inputs.get(input).value = value;
	}

	// returns input as a string
	getInput(input) {
		return this._inputs.get(input).value;
	}

	get separator() {
		return this._form.querySelector('input[name="digitSep"]:checked').value;
	}

	get spacing() {
		let selector = this._form.querySelector('input[name="digitGroup"]:checked');
		return +selector.value || 3;
	}

	get lang() {
		return this._form.lang.value;
	}


	getFieldsData() {
		let data = {
			separator: this.separator,
			spacing: this.spacing,
			lang: this.lang,
			rate: this._form.rate.value,
			wrapped: !this._form.displayCurrent.checked
		};

		return data;
	}

	hideField(selector) {
		this._form.querySelector(selector).classList.add('js-hidden');
	}

	unhideField(selector) {
		this._form.querySelector(selector).classList.remove('js-hidden');
	}

	blockForm() {
		this._form.querySelector('.js-input-form').disabled = true;
	}

	unBlockForm() {
		this._form.querySelector('.js-input-form').disabled = false;
	}

	showSpacing() {
		this._spacing.classList.remove('js-invisible');
	}

	hideSpacing() {
		this._spacing.classList.add('js-invisible');
	}

	setSwitchError() {
			this._errorMessage.classList.remove('js-invisible');
			this._inputs.get('min').classList.add('js-invalid-input');
			this._inputs.get('max').classList.add('js-invalid-input');
	}

	removeSwitchError() {
			this._errorMessage.classList.add('js-invisible');
			this._inputs.get('min').classList.remove('js-invalid-input');
			this._inputs.get('max').classList.remove('js-invalid-input');
	}


	_spacingDefault() {
		for (let select of this._form['digitGroup']) {
			if (select.value === DEFAULT_SPACING) {
				select.checked = true;
			} else {
				select.checked = false;
			}
		}	
	}

	_createForm(container) {
		let form = document.createElement('form');
		form.name = "js-userInput";
		form.innerHTML = lodashTemplate(formTemplate)();
		container.appendChild(form);
		// adding a droplist of languages
		this._languageDropList();
		return form;
	}

	_languageDropList() {
		// adding a droplist of languages
		// a two-stop procedure is necessary to reconcile Chrome and Firefox
		return new Promise((resolve, reject) => {
			let voices = speechSynthesis.getVoices();
			if (Array.isArray(voices) && voices.length) {
				resolve(voices);
			} else {
				speechSynthesis.onvoiceschanged = (e) => {
					resolve(speechSynthesis.getVoices());
				}
			}
		}).then(voices => {
			let supportedLang = new Set();
			voices.forEach(voice => supportedLang.add(voice.lang));
			let availableLang = new Map();
			for (let lang of LANG) {
				if (supportedLang.has(lang[0])) {
					availableLang.set(lang[0], lang[1]);
				}
			}
			let langSelect = lodashTemplate(languageSelectTemplate)({
				availableLang
			});
			let dropList = this._form.querySelector('.js-lang');
			if (dropList) {
				dropList.innerHTML = langSelect;
			}
		});
	}
}