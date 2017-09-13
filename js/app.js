//import "babel-polyfill";
import FormValidator from './UserInput/FormValidator';
import PlayerController from './Ctrls/PlayerController';
import UserActionController from './Ctrls/UserActionController';
import polyfills from './HelperFunctions/polyfills';

polyfills();
let app = new UserActionController(document.getElementById('js-numTrainer'));
let validator = new FormValidator(document.querySelector('.js-userInput') );
let player = new PlayerController(validator);