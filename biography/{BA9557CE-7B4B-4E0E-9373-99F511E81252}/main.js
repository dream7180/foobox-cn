'use strict';

if (typeof my_utils === 'undefined') include('utils.js');

let isRadioStreamParser = false;
const loadAsync = false; // window.GetProperty('Load Biography Asynchronously', true); // changed to false: issue on loading fth with many panels

async function readFiles(files) {
		for (const file of files) {
		if (window.ID) { // fix pss issue
			await include(my_utils.getScriptPath + file);
		}
	}
}

const files = [
	'helpers.js',
	'properties.js',
	'settings.js',
	'interface.js',
	'language.js',
	'panel.js',
	'server.js',
	'allmusic.js',
	'lastfm.js',
	'wikipedia.js',
	'names.js',
	'scrollbar.js',
	'buttons.js',
	'menu.js',
	'text.js',
	'lyrics.js',
	'tagger.js',
	'resize.js',
	'library.js',
	'images.js',
	'filmstrip.js',
	'timers.js',
	'popupbox.js',
	'initialise.js',
	'callbacks.js'
];

if (loadAsync) {
	readFiles(files).then(() => {
		if (!window.ID) return; // fix pss issue
		on_size();
		window.Repaint();
	});
} else {
	files.forEach(v => include(my_utils.getScriptPath + v));
}