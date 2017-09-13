/*
Formats and validates user input
*/

import FormController from './FormController';
import {
	formatNumber
} from '../HelperFunctions/helperFunctions';

const DEFAULT_QUANTITY = 10;

export default class FormValidator {
	constructor(container) {
		this._formCtrl = new FormController(container);
		this._inputValues = this._formCtrl.getInputsData();
		this._previousInput = '';
		this._inputs = this._formCtrl.getInputElements();
		this._formatInputFields();
		this._addListeners();
	}

	getData() {
		let fields = this._formCtrl.getFieldsData();
		let data = {
			min: this._inputValues.min.value,
			max: this._inputValues.max.value,
			quantity: this._inputValues.quantity.value,
		}
		return Object.assign(data, fields);
	}

	_addListeners() {

		document.addEventListener('paste', (e) => {
			if (e.target.classList.contains('js-numbers')) {
				e.preventDefault();
			}
		});

		document.addEventListener('keydown', (e) => {
			if (e.target.classList.contains('js-numbers')) {
				if (e.key === '-') {
					e.preventDefault();
					this._changeSign(e.target.name);
				} else {
					this._previousInput = e.target.value;
				}
			}
		});


		document.addEventListener('input', (e) => {
			this._inputNumber(e);
		});

		document.addEventListener('change', (e) => {

			if (e.target.closest('.js-separ')) {

				this._formatInputFields();

			}
		});

		Object.keys(this._inputs).forEach(input => {
			this._inputs[input].addEventListener('blur', (e) => {
				this._inputValidate(e);
			});
		});

		document.addEventListener('playerEvent', (e) => {
			switch (e.detail.event) {
				case 'playing':
				case 'supportError':
					this._formCtrl.blockForm();
					break;
				case 'stopped':
					this._formCtrl.unBlockForm();
					break;
			}
		});

		document.addEventListener('click', (e) => {
			if (e.target.classList.contains('js-switchButton')) {
				e.preventDefault();
				this.switchMinMax();
				this._formCtrl.removeSwitchError();
			}
		});

		document.addEventListener('change', (e) => {
			if (e.target.classList.contains('js-lang')) {
				let lang = this._formCtrl.lang;

				if (lang === 'ja-JP') {
					this._formCtrl.showSpacing();
				} else {
					this._formCtrl.hideSpacing();
					this._formCtrl._spacingDefault();
				}

			}
		});
	}

	// converts value this._inputValues[input].value to digit and updates input
	updateInput(input, value) {
		let separator = this._formCtrl.separator;
		value = formatNumber(value, separator);
		this._formCtrl.setInput(input, value);
	}

	// updates input with raw value;
	restoreInput(input, value) {
		this._formCtrl.setInput(input, value);
	}

	_formatInputFields() {
		Object.keys(this._inputValues).forEach(input => {
			this.updateInput(input, this._inputValues[input].value);
		});
	}

	_changeSign(field) {
		let newValueStr = this._formCtrl.getInput(field);
		let newValueInt = null;
		let {
			min,
			max,
			value
		} = this._inputValues[field]
		

		if ( newValueStr === '-' ) {

			this._inputValues[field].value = 0;
			this.restoreInput(field, '');
		} else if ( newValueStr === '' ) {

			this._inputValues[field].value = 0;
			this.restoreInput(field, '-');
		} else {

			newValueInt = 0 - value;

			if (checkIntervals(newValueInt)) {
				this._inputValues[field].value = newValueInt;
				this.updateInput(field, newValueInt);
			}
		}

		function checkIntervals(value) {
				return value >= min && value <= max;
		}
	};

	_inputNumber(e) {
		let field = e.target.name;
		let separator = this._formCtrl.separator;
		let {
			min,
			max,
			value
		} = this._inputValues[field]
		let newValueStr = this._formCtrl.getInput(field);
		let newValueInt = +newValueStr.split(separator).join('');

		if (newValueInt) {

			if (checkIntervals(newValueInt)) {
			this._inputValues[field].value = newValueInt;
			this.updateInput(field, newValueInt);

			} else {
				this.updateInput(field, this._inputValues[field].value);				
			}

			return;
		} 

		if (newValueStr === '' || newValueStr === '-') {
			this._inputValues[field].value = 0;
		} else {
			this.restoreInput(field, this._previousInput);
		}

		function checkIntervals(value) {
				return value >= min && value <= max;
		}
	}


	// if input empty - correct
	_inputValidate(e) {

		let field = e.target.name;
		let newValueStr = this._formCtrl.getInput(field);

		if (newValueStr === '' || newValueStr === '-') {

			switch (field) {
				case 'min':
					this.updateInput(field, this._inputValues[field].min);
					this._inputValues[field].value = this._inputValues[field].min;
					break;
				case 'max':
					this.updateInput(field, this._inputValues[field].max);
					this._inputValues[field].value = this._inputValues[field].max;
					break;
				case 'quantity':
					this.updateInput(field, DEFAULT_QUANTITY);
					this._inputValues[field].value = DEFAULT_QUANTITY;
					break;
			}
		}

		if (+this._inputValues.min.value > +this._inputValues.max.value) {
			this._formCtrl.setSwitchError();
		} else {
			this._formCtrl.removeSwitchError();
		}
	}

	switchMinMax() {
		let temp = this._inputValues.min.value;
		this._inputValues.min.value = this._inputValues.max.value;
		this._inputValues.max.value = temp;

		this.updateInput('min', this._inputValues.min.value);
		this.updateInput('max', this._inputValues.max.value);
	}

}