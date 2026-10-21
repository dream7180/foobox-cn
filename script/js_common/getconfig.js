//common script
var cfgexist = 1;
var common_cfg_map = {};
function assignDefault() {
	let common_cfg_keys = ["winFrame", "LineHeight", "ScrollStep", "sys_scrollbar", "color_bycover", "cbkg_bycover", "color_noesl", "color_threshold", "cbkg_chroma", "rating2tag", "show_menu", "show_extrabtn", "libbtn_fuc", "colorful_seek", "track_edit_app", "title_add"];
	let common_cfg_defaults = [2, 33, 3, 0, 1, 1, 0, 5, 4, 0, 1, 1, 1, 1, "", "$if2(%codec_profile% | ,)$info(encoding) | %channels% | $if2($info(bitspersample) bits | ,)%bitrate% kbps | %samplerate% Hz"];
	for (var i = 0; i < common_cfg_keys.length; i++) common_cfg_map[common_cfg_keys[i]] = common_cfg_defaults[i];
}
assignDefault();
try {
	var db = utils.OpenDatabase(fb.ProfilePath + "foobox\\config\\config.db");
	var rows = db.Query('SELECT name, value FROM "common"');
	for (var k = 0; k < rows.length; k++) {
		if (typeof common_cfg_map[rows[k].name] != 'undefined') common_cfg_map[rows[k].name] = rows[k].value;
	}
} catch (e) {
	console.log('foobox: read cofig failed, will try to create it: ' + e.message);
	cfgexist = 0;
}
var winFrame = Number(common_cfg_map.winFrame);
if(winFrame != fb.Window.FrameStyle) fb.Window.FrameStyle = winFrame;
if(!fb.Window.MainMenuHidden) fb.Window.MainMenuHidden = true;
if(!fb.Window.StatusBarHidden) fb.Window.StatusBarHidden = true;
