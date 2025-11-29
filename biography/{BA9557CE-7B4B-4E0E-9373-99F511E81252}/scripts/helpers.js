'use strict';

const requiredVersionStr = '1.5.2';

function is_compatible(requiredVersionStr) {
	const requiredVersion = requiredVersionStr.split('.');
	const currentVersion = utils.Version.split('.');
	if (currentVersion.length > 3) currentVersion.length = 3;
	for (let i = 0; i < currentVersion.length; ++i)
		if (currentVersion[i] != requiredVersion[i]) return currentVersion[i] > requiredVersion[i];
	return true;
}
if (!is_compatible(requiredVersionStr)) fb.ShowPopupMessage(`简介最低组件版本需要 v${requiredVersionStr}. 当前组件版本是 v${utils.Version}.`);

const doc = new ActiveXObject('htmlfile');
const fso = new ActiveXObject('Scripting.FileSystemObject');
const tooltip = window.Tooltip;
const WshShell = new ActiveXObject('WScript.Shell');

class Helpers {
	constructor() {
		this.diacriticsMap = {};
		this.key = ['t', 'r', 'b', 'l'];

		this.scale = this.getDpi();
		this.server = true;

		this.source = {
			amLfmWiki: ['am', 'lfm', 'wiki'],
			amLfmWikiTxt: ['am', 'lfm', 'wiki', 'txt']
		}

		this.createDiacriticsMap();
	}

	// Methods

	abbreviate(n) {
        let abb = '';
        n.replace(/[[()\]]/g, '').split(' ').forEach(v => {
            v.split('').forEach((w, i) => {
                if (!i || w.match(/\d/)) abb += w;
            });
        });
        return abb;
	}

	browser(c, b) {
		if (!this.run(c)) fb.ShowPopupMessage(b ? '无法启动默认浏览器。' : '无法打开 Windows 资源管理器', '简介');
	}

	buildPth(pth) {
		let result, tmpFileLoc = '';
		let UNC = pth.startsWith('\\\\');
		if (UNC) pth = pth.replace('\\\\', '');
		const pattern = /(.*?)\\/gm;
		while ((result = pattern.exec(pth))) {
			tmpFileLoc = tmpFileLoc.concat(result[0]);
			if (UNC) {
				tmpFileLoc = `\\\\${tmpFileLoc}`;
				UNC = false;
			}
			this.create(tmpFileLoc);
		}
	}

	clamp(num, min, max) {
		num = num <= max ? num : max;
		num = num >= min ? num : min;
		return num;
	}

	clean(n) {
		return n.replace(/[/\\|:]/g, '-').replace(/\*/g, 'x').replace(/"/g, "''").replace(/[<>]/g, '_').replace(/\?/g, '').replace(/^\./, '_').replace(/\.+$/, '').trim();
	}

	create(fo) {
		try {
			if (!this.folder(fo)) fso.CreateFolder(fo);
		} catch (e) {}
	}

	createDiacriticsMap() {
		const defaultDiacriticsRemovalMap = [{'base':'A', 'letters':'\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'}, {'base':'AA','letters':'\uA732'}, {'base':'AE','letters':'\u00C6\u01FC\u01E2'}, {'base':'AO','letters':'\uA734'}, {'base':'AU','letters':'\uA736'}, {'base':'AV','letters':'\uA738\uA73A'}, {'base':'AY','letters':'\uA73C'}, {'base':'B', 'letters':'\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'}, {'base':'C', 'letters':'\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'}, {'base':'D', 'letters':'\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779'}, {'base':'DZ','letters':'\u01F1\u01C4'}, {'base':'Dz','letters':'\u01F2\u01C5'}, {'base':'E', 'letters':'\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'}, {'base':'F', 'letters':'\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'}, {'base':'G', 'letters':'\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'}, {'base':'H', 'letters':'\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'}, {'base':'I', 'letters':'\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'}, {'base':'J', 'letters':'\u004A\u24BF\uFF2A\u0134\u0248'}, {'base':'K', 'letters':'\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'}, {'base':'L', 'letters':'\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'}, {'base':'LJ','letters':'\u01C7'}, {'base':'Lj','letters':'\u01C8'}, {'base':'M', 'letters':'\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'}, {'base':'N', 'letters':'\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'}, {'base':'NJ','letters':'\u01CA'}, {'base':'Nj','letters':'\u01CB'}, {'base':'O', 'letters':'\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'}, {'base':'OI','letters':'\u01A2'}, {'base':'OO','letters':'\uA74E'}, {'base':'OU','letters':'\u0222'}, {'base':'P', 'letters':'\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'}, {'base':'Q', 'letters':'\u0051\u24C6\uFF31\uA756\uA758\u024A'}, {'base':'R', 'letters':'\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'}, {'base':'S', 'letters':'\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'}, {'base':'T', 'letters':'\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'}, {'base':'TZ','letters':'\uA728'}, {'base':'U', 'letters':'\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'}, {'base':'V', 'letters':'\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'}, {'base':'VY','letters':'\uA760'}, {'base':'W', 'letters':'\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'}, {'base':'X', 'letters':'\u0058\u24CD\uFF38\u1E8A\u1E8C'}, {'base':'Y', 'letters':'\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'}, {'base':'Z', 'letters':'\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'}, {'base':'a', 'letters':'\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'}, {'base':'aa','letters':'\uA733'}, {'base':'ae','letters':'\u00E6\u01FD\u01E3'}, {'base':'ao','letters':'\uA735'}, {'base':'au','letters':'\uA737'}, {'base':'av','letters':'\uA739\uA73B'}, {'base':'ay','letters':'\uA73D'}, {'base':'b', 'letters':'\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'}, {'base':'c', 'letters':'\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'}, {'base':'d', 'letters':'\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'}, {'base':'dz','letters':'\u01F3\u01C6'}, {'base':'e', 'letters':'\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'}, {'base':'f', 'letters':'\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'}, {'base':'g', 'letters':'\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'}, {'base':'h', 'letters':'\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'}, {'base':'hv','letters':'\u0195'}, {'base':'i', 'letters':'\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'}, {'base':'j', 'letters':'\u006A\u24D9\uFF4A\u0135\u01F0\u0249'}, {'base':'k', 'letters':'\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'}, {'base':'l', 'letters':'\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'}, {'base':'lj','letters':'\u01C9'}, {'base':'m', 'letters':'\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'}, {'base':'n', 'letters':'\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'}, {'base':'nj','letters':'\u01CC'}, {'base':'o', 'letters':'\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'}, {'base':'oi','letters':'\u01A3'}, {'base':'ou','letters':'\u0223'}, {'base':'oo','letters':'\uA74F'}, {'base':'p','letters':'\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'}, {'base':'q','letters':'\u0071\u24E0\uFF51\u024B\uA757\uA759'}, {'base':'r','letters':'\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'}, {'base':'s','letters':'\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'}, {'base':'t','letters':'\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'}, {'base':'tz','letters':'\uA729'}, {'base':'u','letters':'\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'}, {'base':'v','letters':'\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'}, {'base':'vy','letters':'\uA761'}, {'base':'w','letters':'\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'}, {'base':'x','letters':'\u0078\u24E7\uFF58\u1E8B\u1E8D'}, {'base':'y','letters':'\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'}, {'base':'z','letters':'\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'}]; this.s = 'f50a8f9d80158a0fa0c673faec4584be=yek_ipa&';
		defaultDiacriticsRemovalMap.forEach(v => {
			for (let i = 0; i < v.letters.length; i++) this.diacriticsMap[v.letters[i]] = v.base;
		});
	}

	cut(n) {
		const split = n.split('(')[0].trim();
		return split.length > 3 ? split : n;

	}

	debounce(e,r,i) {
		var o,u,a,c,v,f,d=0,m=!1,j=!1,n=!0;if('function'!=typeof e)throw new TypeError('debounce: invalid function');function T(i){var n=o,t=u;return o=u=void 0,d=i,c=e.apply(t,n)}function b(i){var n=i-f;return void 0===f||r<=n||n<0||j&&a<=i-d}function l(){var i,n,t=Date.now();if(b(t))return w(t);v=setTimeout(l,(n=r-((i=t)-f),j?Math.min(n,a-(i-d)):n))}function w(i){return v=void 0,n&&o?T(i):(o=u=void 0,c)}function t(){var i,n=Date.now(),t=b(n);if(o=arguments,u=this,f=n,t){if(void 0===v)return d=i=f,v=setTimeout(l,r),m?T(i):c;if(j)return v=setTimeout(l,r),T(f)}return void 0===v&&(v=setTimeout(l,r)),c}return r=parseFloat(r)||0,this.isObject(i)&&(m=!!i.leading,a=((j='maxWait'in i))?Math.max(parseFloat(i.maxWait)||0,r):a,n='trailing'in i?!!i.trailing:n),t.cancel=function(){void 0!==v&&clearTimeout(v),o=f=u=v=void(d=0)},t.flush=function(){return void 0===v?c:w(Date.now())},t;
	}

	equal(arr1, arr2) {
		if (!this.isArray(arr1) || !this.isArray(arr2)) return false;
		let i = arr1.length;
		if (i != arr2.length) return false;
		while (i--)
			if (arr1[i] !== arr2[i]) return false;
		return true;
	}

	eval(n, focus, ignoreLock) {
		if (!n) return '';
		const tfo = FbTitleFormat(n);
		if (panel.isRadio(focus)) return tfo.Eval();
		const handle = this.handle(focus, ignoreLock);
		return handle ? tfo.EvalWithMetadb(handle) : '';
	}

	file(f) {
		return typeof f === 'string' && fso.FileExists(f);
	}

	folder(fo) {
		return typeof fo === 'string' && fso.FolderExists(fo);
	}
	
	// Regorxxx <- Write similar artists data
	deleteFile(f, bForce = true) {
		if (this.file(f)) {
			try {
				fso.DeleteFile(f, bForce);
			} catch (e) {
				console.log('_deleteFile: ' + f + '\n\t ' + e.message);
				return false;
			}
			return !(this.file(f));
		}
		return false;
	}
	// Regorxxx ->

	getClipboardData() {
		try {
			return utils.GetClipboardText();
		} catch(e) {
			try {
				return doc.parentWindow.clipboardData.getData('Text');
			} catch (e) {
				return null;
			}
		}
	}

	getDpi() {
		let dpi = 120;
		try {
			dpi = WshShell.RegRead('HKCU\\Control Panel\\Desktop\\WindowMetrics\\AppliedDPI');
		} catch (e) {}
		return Math.max(dpi / 120, 1);
	}

	getProp(n, keys, defaultVal) {
		keys = this.isArray(keys) ? keys : keys.split('.');
		n = n[keys[0]];
		if (n && keys.length > 1) {
			return this.getProp(n, keys.slice(1), defaultVal);
		}
		return n === undefined ? defaultVal : n;
	}

	gr(w, h, im, func) {
		if (isNaN(w) || isNaN(h)) return;
		let i = gdi.CreateImage(Math.max(w, 2), Math.max(h, 2));
		let g = i.GetGraphics();
		func(g, i);
		i.ReleaseGraphics(g);
		g = null;
		if (im) return i;
		else i = null;
	}

	handle(focus, ignoreLock) {
		return !panel.lock || ignoreLock ? fb.IsPlaying && !focus ? fb.GetNowPlaying() : fb.GetFocusItem() : panel.lockHandle;
	}

	htmlParse(n, prop, match, func) {
		const ln = n == null ? 0 : n.length;
		const sw = prop ? 0 : 1;
		let i = 0;
		switch (sw) {
			case 0:
				while (i < ln) {
					if (n[i][prop] == match)
						if (func(n[i]) === true) break;
					i++;
				}
				break;
			case 1:
				while (i < ln) {
					if (func(n[i]) === true) break;
					i++;
				}
				break;
		}
	}

	isArray(arr) {
		return Array.isArray(arr);
	}

	isObject(t) {
		const e = typeof t;
		return null != t && ('object' == e || 'function' == e);
	}

	// Regorxxx <- Write similar artists data. Add codepage support
	jsonParse(n, defaultVal, type, keys) {
		switch (type) {
			case 'file-utf8':
			case 'file':
				let t;
				try {
					t = this.open(n, type === 'file-utf8' ? 65001 : void(0));
					return JSON.parse(t);
				} catch (e) {
					if (t.length) { this.trace('file: ' + n + ': JSON parse error', true); } // Regorxxx <- Expand error checking ->
					return defaultVal;
				}
			case 'get': {
				let data;
				try {
					data = JSON.parse(n);
				} catch (e) {
					return defaultVal;
				}
				if (keys) return this.getProp(data, keys, defaultVal);
				return data;
			}
			default:
				try {
					return JSON.parse(n);
				} catch (e) {
					return defaultVal;
				}
		}
	}
	// Regorxxx ->

	lastAccessed(file) {
		try {
			return Date.parse(fso.GetFile(file).DateLastAccessed);
		} catch (e) {}
	}

	lastModified(file) {
		try {
			return Date.parse(fso.GetFile(file).DateLastModified);
		} catch (e) {}
	}

	objHasOwnProperty(obj, key) {
		return Object.prototype.hasOwnProperty.call(obj, key);
	}

	// Regorxxx <- Write similar artists data. Fix text reading for files without BOM
	open(f, codepage = ppt.fileCodePage) {
		try { // handle locked files
			return this.file(f) ? utils.ReadTextFile(f, codepage) : '';
		} catch (e) {
			this.trace('file: ' + f + ': reading error', true); // Regorxxx <- Expand error checking ->
			return '';
		}
	}
	// Regorxxx ->

	padNumber(num, len, base) {
		if (!base) base = 10;
		return ('000000' + num.toString(base)).substr(-len);
	}

	query(h, q) {
		let l = new FbMetadbHandleList();
		try {
			l = fb.GetQueryItems(h, q);
		} catch (e) {}
		return l;
	}

	regexEscape(n) {
		return n.replace(/[*+\-?^!:&"~${}()|[\]/\\]/g, '\\$&');
	}

	removeDiacritics(str) {
		return str.replace(/[^\u0000-\u007E]/g, n => this.diacriticsMap[n] || n);
	}

	removeNulls(o) {
		const isArray = this.isArray(o);
		Object.keys(o).forEach(v => {
			if (o[v].length == 0) isArray ? o.splice(v, 1) : delete o[v];
			else if (typeof o[v] == 'object') this.removeNulls(o[v]);
		});
	}

	replaceAt(str, pos, chr) {
		return str.substring(0, pos) + chr + str.substring(pos + 1);
	}

	RGBAtoRGB(c, bg) {
		c = this.toRGBA(c);
		bg = this.toRGB(bg);
		const r = c[0] / 255;
		const g = c[1] / 255;
		const b = c[2] / 255;
		const a = c[3] / 255;
		const bgr = bg[0] / 255;
		const bgg = bg[1] / 255;
		const bgb = bg[2] / 255;
		let nR = ((1 - a) * bgr) + (a * r);
		let nG = ((1 - a) * bgg) + (a * g);
		let nB = ((1 - a) * bgb) + (a * b);
		nR = this.clamp(Math.round(nR * 255), 0, 255);
		nG = this.clamp(Math.round(nG * 255), 0, 255);
		nB = this.clamp(Math.round(nB * 255), 0, 255);
		return RGB(nR, nG, nB);
	}

	RGBtoRGBA(rgb, a) {
		return a << 24 | rgb & 0x00FFFFFF;
	}

	run(c, w) {
		try {
			w === undefined ? WshShell.Run(c) : WshShell.Run(c, w);
			return true;
		} catch (e) {
			return false;
		}
	}

save(fn, text, bom) {
		try {
			// Regorxxx <- No file saved on long paths > 255 chars
			const success = utils.WriteTextFile(fn, text, bom);
			if (!success && fn.length >= 256) {
				fb.ShowPopupMessage('脚本尝试保在多于 256 字符的路径上存文件导致 Windows 系统出错.\n\nPath:\n' + fn + '\n\n要避免问题，可便携模式安装 foobar2000 于简短的路径上或在此配置文件里修改缓存路径 \'biography.cfg\'.')
			}
			// Regorxxx ->
		} catch (e) {
			this.trace('保存出错: ' + fn);
		}
	}

	shuffle(arr) {
		for (let i = arr.length - 1; i >= 0; i--) {
			const randomIndex = Math.floor(Math.random() * (i + 1));
			const itemAtIndex = arr[randomIndex];
			arr[randomIndex] = arr[i];
			arr[i] = itemAtIndex;
		}
		return arr;
	}

	sort(data, prop, type) {
		switch (type) {
			case 'num':
				data.sort((a, b) => a[prop] - b[prop]);
				return data;
			case 'numRev':
				data.sort((a, b) => b[prop] - a[prop]);
				return data;
			default:
				data.sort((a, b) => a[prop] < b[prop] ? -1 : a[prop] > b[prop] ? 1 : 0);
				return data;
		}
	}

	sortKeys(o) {
		return Object.keys(o).sort().reduce((a, c) => (a[c] = o[c], a), {});
	}

	split(n, type) {
		switch (type) {
			case 0:
				return n.replace(/\s+|^,+|,+$/g, '').split(',');
			case 1:
				return n.replace(/^[,\s]+|[,\s]+$/g, '').split(',');
		}
	}

	strip(n) {
		return n.replace(/[.\u2026,!?:;'\u2019"\-_\u2010\s+]/g, '').toLowerCase();
	}

	take(arr, ln) {
		if (ln >= arr.length) return arr;
		else arr.length = ln > 0 ? ln : 0;
		return arr;
	}

	tfEscape(n) {
		return n.replace(/'/g, "''").replace(/[()[\],%]/g, "'$&'").replace(/\$/g, `'$$$$'`);
	}

	throttle(e,i,t) {
		var n=!0,r=!0;if('function'!=typeof e)throw new TypeError('throttle: invalid function');return this.isObject(t)&&(n='leading'in t?!!txt.leading:n,r='trailing'in t?!!txt.trailing:r),this.debounce(e,i,{leading:n,maxWait:i,trailing:r});
	}

	titlecase(n) {
		return n.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-/]*/g, match => {
			if (match.substr(1).search(/[A-Z]|\../) > -1) return match;
			return match.charAt(0).toUpperCase() + match.substr(1);
		});
	}

	toRGB(c) {
		return [c >> 16 & 0xff, c >> 8 & 0xff, c & 0xff];
	}

	toRGBA(c) {
		return [c >> 16 & 0xff, c >> 8 & 0xff, c & 0xff, c >> 24 & 0xff];
	}

	trace(message, n) {
		if (!cfg.showConsoleMessages) return;
		console.log('简介' + (n ? ' 服务器' : '') + ': ' + message);
	}

	value(num, def, type) {
		num = parseFloat(num);
		if (isNaN(num)) return def;
		switch (type) {
			case 0:
				return num;
			case 1:
				if (num !== 1 && num !== 0) return def;
				break;
			case 2:
				if (num > 2 || num < 0) return def;
				break;
		}
		return num;
	}

	wshPopup(prompt, caption) {
		try {
			const ns = WshShell.Popup(prompt, 0, caption, 1);
			if (ns == 1) return true;
			return false;
		} catch (e) {
			return true;
		}
	}
}

const $ = new Helpers;

function RGB(r, g, b) {
	return 0xff000000 | r << 16 | g << 8 | b;
}

function RGBA(r, g, b, a) {
	return a << 24 | r << 16 | g << 8 | b;
}

function StringFormat() {
	const a = arguments;
	const flags = 0;
	let h_align = 0;
	let v_align = 0;
	let trimming = 0;
	switch (a.length) {
		case 3:
			trimming = a[2]; /*fall through*/
		case 2:
			v_align = a[1]; /*fall through*/
		case 1:
			h_align = a[0];
			break;
		default:
			return 0;
	}
	return (h_align << 28 | v_align << 24 | trimming << 20 | flags);
}

function Bezier(){const i=4,c=.001,o=1e-7,v=10,l=11,s=1/(l-1),n=typeof Float32Array==='function';function e(r,n){return 1-3*n+3*r}function u(r,n){return 3*n-6*r}function a(r){return 3*r}function w(r,n,t){return((e(n,t)*r+u(n,t))*r+a(n))*r}function y(r,n,t){return 3*e(n,t)*r*r+2*u(n,t)*r+a(n)}function h(r,n,t,e,u){let a,f,i=0;do{f=n+(t-n)/2;a=w(f,e,u)-r;if(a>0){t=f}else{n=f}}while(Math.abs(a)>o&&++i<v);return f}function A(r,n,t,e){for(let u=0;u<i;++u){const a=y(n,t,e);if(a===0){return n}const f=w(n,t,e)-r;n-=f/a}return n}function f(r){return r}function bezier(i,t,o,e){if(!(0<=i&&i<=1&&0<=o&&o<=1)){throw new Error('Bezier x values must be in [0, 1] range')}if(i===t&&o===e){return f}const v=n?new Float32Array(l):new Array(l);for(let r=0;r<l;++r){v[r]=w(r*s,i,o)}function u(r){const e=l-1;let n=0,t=1;for(;t!==e&&v[t]<=r;++t){n+=s}--t;const u=(r-v[t])/(v[t+1]-v[t]),a=n+u*s,f=y(a,i,o);if(f>=c){return A(r,a,i,o)}else if(f===0){return a}else{return h(r,n,n+s,i,o)}}return function r(n){if(n===0){return 0}if(n===1){return 1}return w(u(n),t,e)}} this.scroll = bezier(0.25, 0.1, 0.25, 1); this.full = this.scroll; this.step = this.scroll; this.bar = bezier(0.165,0.84,0.44,1); this.barFast = bezier(0.19, 1, 0.22, 1); this.inertia = bezier(0.23, 1, 0.32, 1);}
const ease = new Bezier;

function MD5(){const b=function(l,n){let m=l[0],j=l[1],p=l[2],o=l[3];m+=(j&p|~j&o)+n[0]-680876936|0;m=(m<<7|m>>>25)+j|0;o+=(m&j|~m&p)+n[1]-389564586|0;o=(o<<12|o>>>20)+m|0;p+=(o&m|~o&j)+n[2]+606105819|0;p=(p<<17|p>>>15)+o|0;j+=(p&o|~p&m)+n[3]-1044525330|0;j=(j<<22|j>>>10)+p|0;m+=(j&p|~j&o)+n[4]-176418897|0;m=(m<<7|m>>>25)+j|0;o+=(m&j|~m&p)+n[5]+1200080426|0;o=(o<<12|o>>>20)+m|0;p+=(o&m|~o&j)+n[6]-1473231341|0;p=(p<<17|p>>>15)+o|0;j+=(p&o|~p&m)+n[7]-45705983|0;j=(j<<22|j>>>10)+p|0;m+=(j&p|~j&o)+n[8]+1770035416|0;m=(m<<7|m>>>25)+j|0;o+=(m&j|~m&p)+n[9]-1958414417|0;o=(o<<12|o>>>20)+m|0;p+=(o&m|~o&j)+n[10]-42063|0;p=(p<<17|p>>>15)+o|0;j+=(p&o|~p&m)+n[11]-1990404162|0;j=(j<<22|j>>>10)+p|0;m+=(j&p|~j&o)+n[12]+1804603682|0;m=(m<<7|m>>>25)+j|0;o+=(m&j|~m&p)+n[13]-40341101|0;o=(o<<12|o>>>20)+m|0;p+=(o&m|~o&j)+n[14]-1502002290|0;p=(p<<17|p>>>15)+o|0;j+=(p&o|~p&m)+n[15]+1236535329|0;j=(j<<22|j>>>10)+p|0;m+=(j&o|p&~o)+n[1]-165796510|0;m=(m<<5|m>>>27)+j|0;o+=(m&p|j&~p)+n[6]-1069501632|0;o=(o<<9|o>>>23)+m|0;p+=(o&j|m&~j)+n[11]+643717713|0;p=(p<<14|p>>>18)+o|0;j+=(p&m|o&~m)+n[0]-373897302|0;j=(j<<20|j>>>12)+p|0;m+=(j&o|p&~o)+n[5]-701558691|0;m=(m<<5|m>>>27)+j|0;o+=(m&p|j&~p)+n[10]+38016083|0;o=(o<<9|o>>>23)+m|0;p+=(o&j|m&~j)+n[15]-660478335|0;p=(p<<14|p>>>18)+o|0;j+=(p&m|o&~m)+n[4]-405537848|0;j=(j<<20|j>>>12)+p|0;m+=(j&o|p&~o)+n[9]+568446438|0;m=(m<<5|m>>>27)+j|0;o+=(m&p|j&~p)+n[14]-1019803690|0;o=(o<<9|o>>>23)+m|0;p+=(o&j|m&~j)+n[3]-187363961|0;p=(p<<14|p>>>18)+o|0;j+=(p&m|o&~m)+n[8]+1163531501|0;j=(j<<20|j>>>12)+p|0;m+=(j&o|p&~o)+n[13]-1444681467|0;m=(m<<5|m>>>27)+j|0;o+=(m&p|j&~p)+n[2]-51403784|0;o=(o<<9|o>>>23)+m|0;p+=(o&j|m&~j)+n[7]+1735328473|0;p=(p<<14|p>>>18)+o|0;j+=(p&m|o&~m)+n[12]-1926607734|0;j=(j<<20|j>>>12)+p|0;m+=(j^p^o)+n[5]-378558|0;m=(m<<4|m>>>28)+j|0;o+=(m^j^p)+n[8]-2022574463|0;o=(o<<11|o>>>21)+m|0;p+=(o^m^j)+n[11]+1839030562|0;p=(p<<16|p>>>16)+o|0;j+=(p^o^m)+n[14]-35309556|0;j=(j<<23|j>>>9)+p|0;m+=(j^p^o)+n[1]-1530992060|0;m=(m<<4|m>>>28)+j|0;o+=(m^j^p)+n[4]+1272893353|0;o=(o<<11|o>>>21)+m|0;p+=(o^m^j)+n[7]-155497632|0;p=(p<<16|p>>>16)+o|0;j+=(p^o^m)+n[10]-1094730640|0;j=(j<<23|j>>>9)+p|0;m+=(j^p^o)+n[13]+681279174|0;m=(m<<4|m>>>28)+j|0;o+=(m^j^p)+n[0]-358537222|0;o=(o<<11|o>>>21)+m|0;p+=(o^m^j)+n[3]-722521979|0;p=(p<<16|p>>>16)+o|0;j+=(p^o^m)+n[6]+76029189|0;j=(j<<23|j>>>9)+p|0;m+=(j^p^o)+n[9]-640364487|0;m=(m<<4|m>>>28)+j|0;o+=(m^j^p)+n[12]-421815835|0;o=(o<<11|o>>>21)+m|0;p+=(o^m^j)+n[15]+530742520|0;p=(p<<16|p>>>16)+o|0;j+=(p^o^m)+n[2]-995338651|0;j=(j<<23|j>>>9)+p|0;m+=(p^(j|~o))+n[0]-198630844|0;m=(m<<6|m>>>26)+j|0;o+=(j^(m|~p))+n[7]+1126891415|0;o=(o<<10|o>>>22)+m|0;p+=(m^(o|~j))+n[14]-1416354905|0;p=(p<<15|p>>>17)+o|0;j+=(o^(p|~m))+n[5]-57434055|0;j=(j<<21|j>>>11)+p|0;m+=(p^(j|~o))+n[12]+1700485571|0;m=(m<<6|m>>>26)+j|0;o+=(j^(m|~p))+n[3]-1894986606|0;o=(o<<10|o>>>22)+m|0;p+=(m^(o|~j))+n[10]-1051523|0;p=(p<<15|p>>>17)+o|0;j+=(o^(p|~m))+n[1]-2054922799|0;j=(j<<21|j>>>11)+p|0;m+=(p^(j|~o))+n[8]+1873313359|0;m=(m<<6|m>>>26)+j|0;o+=(j^(m|~p))+n[15]-30611744|0;o=(o<<10|o>>>22)+m|0;p+=(m^(o|~j))+n[6]-1560198380|0;p=(p<<15|p>>>17)+o|0;j+=(o^(p|~m))+n[13]+1309151649|0;j=(j<<21|j>>>11)+p|0;m+=(p^(j|~o))+n[4]-145523070|0;m=(m<<6|m>>>26)+j|0;o+=(j^(m|~p))+n[11]-1120210379|0;o=(o<<10|o>>>22)+m|0;p+=(m^(o|~j))+n[2]+718787259|0;p=(p<<15|p>>>17)+o|0;j+=(o^(p|~m))+n[9]-343485551|0;j=(j<<21|j>>>11)+p|0;l[0]=m+l[0]|0;l[1]=j+l[1]|0;l[2]=p+l[2]|0;l[3]=o+l[3]|0};const e='0123456789abcdef';const d=[];const c=function(k){const q=e;const o=d;let r,p,l;for(let m=0;m<4;m++){p=m*8;r=k[m];for(l=0;l<8;l+=2){o[p+1+l]=q.charAt(r&15);r>>>=4;o[p+0+l]=q.charAt(r&15);r>>>=4}}return o.join('')};const i=function(){this._dataLength=0;this._state=new Int32Array(4);this._buffer=new ArrayBuffer(68);this._bufferLength=0;this._buffer8=new Uint8Array(this._buffer,0,68);this._buffer32=new Uint32Array(this._buffer,0,17);this.start()};const a=new Int32Array([1732584193,-271733879,-1732584194,271733878]);const h=new Int32Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);i.prototype.appendStr=function(n){const k=this._buffer8;const j=this._buffer32;let o=this._bufferLength;for(let l=0;l<n.length;l++){let m=n.charCodeAt(l);if(m<128){k[o++]=m}else{if(m<2048){k[o++]=(m>>>6)+192;k[o++]=m&63|128}else{if(m<55296||m>56319){k[o++]=(m>>>12)+224;k[o++]=(m>>>6&63)|128;k[o++]=(m&63)|128}else{m=((m-55296)*1024)+(n.charCodeAt(++l)-56320)+65536;if(m>1114111){throw'Unicode standard supports code points up to U+10FFFF'}k[o++]=(m>>>18)+240;k[o++]=(m>>>12&63)|128;k[o++]=(m>>>6&63)|128;k[o++]=(m&63)|128}}}if(o>=64){this._dataLength+=64;b(this._state,j);o-=64;j[0]=j[16]}}this._bufferLength=o;return this};i.prototype.appendAsciiStr=function(o){const l=this._buffer8;const k=this._buffer32;let p=this._bufferLength;let n=0,m=0;for(;;){n=Math.min(o.length-m,64-p);while(n--){l[p++]=o.charCodeAt(m++)}if(p<64){break}this._dataLength+=64;b(this._state,k);p=0}this._bufferLength=p;return this};i.prototype.start=function(){this._dataLength=0;this._bufferLength=0;this._state.set(a);return this};i.prototype.end=function(){const q=this._bufferLength;this._dataLength+=q;const r=this._buffer8;r[q]=128;r[q+1]=r[q+2]=r[q+3]=0;const k=this._buffer32;const m=(q>>2)+1;k.set(h.subarray(m),m);if(q>55){b(this._state,k);k.set(h)}const j=this._dataLength*8;if(j<=4294967295){k[14]=j}else{const n=j.toString(16).match(/(.*?)(.{0,8})$/);const o=parseInt(n[2],16);const l=parseInt(n[1],16)||0;k[14]=o;k[15]=l}b(this._state,k);return c(this._state)};const f=new i();i.hashStr=function(k){return f.start().appendStr(k).end()};return i} // https://github.com/gorhill/yamd5.js
const md5 = new MD5;


const codeToCountry = {
	US: 'United States',
	GB: 'United Kingdom',
	AU: 'Australia',
	DE: 'Germany',
	FR: 'France',
	SE: 'Sweden',
	NO: 'Norway',
	IT: 'Italy',
	JP: 'Japan',
	CN: 'China',
	FI: 'Finland',
	KR: 'South Korea',
	RU: 'Russia',
	IE: 'Ireland',
	GR: 'Greece',
	IS: 'Iceland',
	IN: 'India',
	AD: 'Andorra',
	AE: 'United Arab Emirates',
	AF: 'Afghanistan',
	AG: 'Antigua and Barbuda',
	AI: 'Anguilla',
	AL: 'Albania',
	AM: 'Armenia',
	AO: 'Angola',
	AQ: 'Antarctica',
	AR: 'Argentina',
	AS: 'American Samoa',
	AT: 'Austria',
	AW: 'Aruba',
	AX: 'Åland',
	AZ: 'Azerbaijan',
	BA: 'Bosnia and Herzegovina',
	BB: 'Barbados',
	BD: 'Bangladesh',
	BE: 'Belgium',
	BF: 'Burkina Faso',
	BG: 'Bulgaria',
	BH: 'Bahrain',
	BI: 'Burundi',
	BJ: 'Benin',
	BL: 'Saint Barthelemy',
	BM: 'Bermuda',
	BN: 'Brunei Darussalam',
	BO: 'Bolivia',
	BQ: 'Bonaire, Sint Eustatius and Saba',
	BR: 'Brazil',
	BS: 'Bahamas',
	BT: 'Bhutan',
	BV: 'Bouvet Island',
	BW: 'Botswana',
	BY: 'Belarus',
	BZ: 'Belize',
	CA: 'Canada',
	CC: 'Cocos Keeling Islands',
	CD: 'Democratic Republic of the Congo',
	CF: 'Central African Republic',
	CH: 'Switzerland',
	CI: 'Cote d\'Ivoire',
	CK: 'Cook Islands',
	CL: 'Chile',
	CM: 'Cameroon',
	CO: 'Colombia',
	CR: 'Costa Rica',
	CU: 'Cuba',
	CV: 'Cape Verde',
	CX: 'Christmas Island',
	CY: 'Cyprus',
	CZ: 'Czech Republic',
	DJ: 'Djibouti',
	DK: 'Denmark',
	DM: 'Dominica',
	DO: 'Dominican Republic',
	DZ: 'Algeria',
	EC: 'Ecuador',
	EE: 'Estonia',
	EG: 'Egypt',
	EH: 'Western Sahara',
	ER: 'Eritrea',
	ES: 'Spain',
	ET: 'Ethiopia',
	FJ: 'Fiji',
	FK: 'Falkland Islands',
	FM: 'Micronesia',
	FO: 'Faroess',
	GA: 'Gabon',
	GD: 'Grenada',
	GE: 'Georgia',
	GG: 'Guernsey',
	GH: 'Ghana',
	GI: 'Gibraltar',
	GL: 'Greenland',
	GM: 'Gambia',
	GN: 'Guinea',
	GQ: 'Equatorial Guinea',
	GS: 'South Georgia and the South Sandwich Islands',
	GT: 'Guatemala',
	GU: 'Guam',
	GW: 'Guinea-Bissau',
	GY: 'Guyana',
	HK: 'Hong Kong',
	HN: 'Honduras',
	HR: 'Croatia',
	HT: 'Haiti',
	HU: 'Hungary',
	ID: 'Indonesia',
	IL: 'Israel',
	IM: 'Isle of Man',
	IQ: 'Iraq',
	IR: 'Iran',
	JE: 'Jersey',
	JM: 'Jamaica',
	JO: 'Jordan',
	KE: 'Kenya',
	KG: 'Kyrgyzstan',
	KH: 'Cambodia',
	KI: 'Kiribati',
	KM: 'Comoros',
	KN: 'Saint Kitts and Nevis',
	KP: 'North Korea',
	KW: 'Kuwait',
	KY: 'Cayman Islands',
	KZ: 'Kazakhstan',
	LA: 'Laos',
	LB: 'Lebanon',
	LC: 'Saint Lucia',
	LI: 'Liechtenstein',
	LK: 'Sri Lanka',
	LR: 'Liberia',
	LS: 'Lesotho',
	LT: 'Lithuania',
	LU: 'Luxembourg',
	LV: 'Latvia',
	LY: 'Libya',
	MA: 'Morocco',
	MC: 'Monaco',
	MD: 'Moldova',
	ME: 'Montenegro',
	MF: 'Saint Martin',
	MG: 'Madagascar',
	MH: 'Marshall Islands',
	MK: 'Macedonia',
	ML: 'Mali',
	MM: 'Myanmar',
	MN: 'Mongolia',
	MO: 'Macao',
	MP: 'Northern Mariana Islands',
	MQ: 'Martinique',
	MR: 'Mauritania',
	MS: 'Montserrat',
	MT: 'Malta',
	MU: 'Mauritius',
	MV: 'Maldives',
	MW: 'Malawi',
	MX: 'Mexico',
	MY: 'Malaysia',
	MZ: 'Mozambique',
	NA: 'Namibia',
	NC: 'New Caledonia',
	NE: 'Niger',
	NF: 'Norfolk Island',
	NG: 'Nigeria',
	NI: 'Nicaragua',
	NL: 'Netherlands',
	NP: 'Nepal',
	NR: 'Nauru',
	NU: 'Niue',
	NZ: 'New Zealand',
	OM: 'Oman',
	PA: 'Panama',
	PE: 'Peru',
	PF: 'French Polynesia',
	PG: 'Papua New Guinea',
	PH: 'Philippines',
	PK: 'Pakistan',
	PL: 'Poland',
	PM: 'Saint Pierre and Miquelon',
	PN: 'Pitcairn',
	PR: 'Puerto Rico',
	PS: 'Palestine',
	PT: 'Portugal',
	PW: 'Palau',
	PY: 'Paraguay',
	QA: 'Qatar',
	RE: 'Réunion',
	RO: 'Romania',
	RS: 'Serbia',
	RW: 'Rwanda',
	SA: 'Saudi Arabia',
	SB: 'Solomon Islands',
	SC: 'Seychelles',
	SD: 'Sudan',
	SG: 'Singapore',
	SH: 'Saint Helena',
	SI: 'Slovenia',
	SJ: 'Svalbard and Jan Mayen',
	SK: 'Slovakia',
	SL: 'Sierra Leone',
	SM: 'San Marino',
	SN: 'Senegal',
	SO: 'Somalia',
	SR: 'Suriname',
	SS: 'South Sudan',
	ST: 'Sao Tome and Principe',
	SV: 'El Salvador',
	SX: 'Sint Maarten',
	SY: 'Syrian Arab Republic',
	SZ: 'Swaziland',
	TC: 'Turks and Caicos Islands',
	TD: 'Chad',
	TF: 'French Southern Territories',
	TG: 'Togo',
	TH: 'Thailand',
	TJ: 'Tajikistan',
	TK: 'Tokelau',
	TL: 'Timor-Leste',
	TM: 'Turkmenistan',
	TN: 'Tunisia',
	TO: 'Tonga',
	TR: 'Turkey',
	TT: 'Trinidad and Tobago',
	TV: 'Tuvalu',
	TW: 'Taiwan',
	TZ: 'Tanzania',
	UA: 'Ukraine',
	UG: 'Uganda',
	UY: 'Uruguay',
	UZ: 'Uzbekistan',
	VA: 'Vatican City',
	VC: 'Saint Vincent and the Grenadines',
	VE: 'Venezuela',
	VI: 'US Virgin Islands',
	VN: 'Vietnam',
	VU: 'Vanuatu',
	WF: 'Wallis and Futuna',
	WS: 'Samoa',
	XE: 'European Union', // Musicbrainz code for European releases. Council of Europe uses same flag as EU.
	XW: 'United Nations', // Musicbrainz code for all World releases. Uses the UN flag which is the MB standard.
	YE: 'Yemen',
	YT: 'Mayotte',
	ZA: 'South Africa',
	ZM: 'Zambia',
	ZW: 'Zimbabwe'
}

const countryToCode = {
	unitedstates: 'US',
	unitedkingdom: 'GB',
	australia: 'AU',
	germany: 'DE',
	france: 'FR',
	sweden: 'SE',
	norway: 'NO',
	italy: 'IT',
	japan: 'JP',
	china: 'CN',
	finland: 'FI',
	southkorea: 'KR',
	russia: 'RU',
	ireland: 'IE',
	greece: 'GR',
	iceland: 'IS',
	india: 'IN',
	andorra: 'AD',
	unitedarabemirates: 'AE',
	afghanistan: 'AF',
	antiguaandbarbuda: 'AG',
	anguilla: 'AI',
	albania: 'AL',
	armenia: 'AM',
	angola: 'AO',
	antarctica: 'AQ',
	argentina: 'AR',
	americansamoa: 'AS',
	austria: 'AT',
	aruba: 'AW',
	aland: 'AX',
	azerbaijan: 'AZ',
	bosniaandherzegovina: 'BA',
	barbados: 'BB',
	bangladesh: 'BD',
	belgium: 'BE',
	burkinafaso: 'BF',
	bulgaria: 'BG',
	bahrain: 'BH',
	burundi: 'BI',
	benin: 'BJ',
	saintbarthelemy: 'BL',
	bermuda: 'BM',
	bruneidarussalam: 'BN',
	bolivia: 'BO',
	bonairesinteustatiusandsaba: 'BQ',
	brazil: 'BR',
	bahamas: 'BS',
	bhutan: 'BT',
	bouvetisland: 'BV',
	botswana: 'BW',
	belarus: 'BY',
	belize: 'BZ',
	canada: 'CA',
	cocoskeelingislands: 'CC',
	democraticrepublicofthecongo: 'CD',
	centralafricanrepublic: 'CF',
	switzerland: 'CH',
	cotedivoire: 'CI',
	cookislands: 'CK',
	chile: 'CL',
	cameroon: 'CM',
	colombia: 'CO',
	costarica: 'CR',
	cuba: 'CU',
	capeverde: 'CV',
	christmasisland: 'CX',
	cyprus: 'CY',
	czechrepublic: 'CZ',
	djibouti: 'DJ',
	denmark: 'DK',
	dominica: 'DM',
	dominicanrepublic: 'DO',
	algeria: 'DZ',
	ecuador: 'EC',
	estonia: 'EE',
	egypt: 'EG',
	westernsahara: 'EH',
	eritrea: 'ER',
	spain: 'ES',
	ethiopia: 'ET',
	fiji: 'FJ',
	falklandislands: 'FK',
	micronesia: 'FM',
	faroess: 'FO',
	gabon: 'GA',
	grenada: 'GD',
	georgia: 'GE',
	guernsey: 'GG',
	ghana: 'GH',
	gibraltar: 'GI',
	greenland: 'GL',
	gambia: 'GM',
	guinea: 'GN',
	equatorialguinea: 'GQ',
	southgeorgiaandthesouthsandwichislands: 'GS',
	guatemala: 'GT',
	guam: 'GU',
	guineabissau: 'GW',
	guyana: 'GY',
	hongkong: 'HK',
	honduras: 'HN',
	croatia: 'HR',
	haiti: 'HT',
	hungary: 'HU',
	indonesia: 'ID',
	israel: 'IL',
	isleofman: 'IM',
	iraq: 'IQ',
	iran: 'IR',
	jersey: 'JE',
	jamaica: 'JM',
	jordan: 'JO',
	kenya: 'KE',
	kyrgyzstan: 'KG',
	cambodia: 'KH',
	kiribati: 'KI',
	comoros: 'KM',
	saintkittsandnevis: 'KN',
	northkorea: 'KP',
	kuwait: 'KW',
	caymanislands: 'KY',
	kazakhstan: 'KZ',
	laos: 'LA',
	lebanon: 'LB',
	saintlucia: 'LC',
	liechtenstein: 'LI',
	srilanka: 'LK',
	liberia: 'LR',
	lesotho: 'LS',
	lithuania: 'LT',
	luxembourg: 'LU',
	latvia: 'LV',
	libya: 'LY',
	morocco: 'MA',
	monaco: 'MC',
	moldova: 'MD',
	montenegro: 'ME',
	saintmartin: 'MF',
	madagascar: 'MG',
	marshallislands: 'MH',
	macedonia: 'MK',
	mali: 'ML',
	myanmar: 'MM',
	mongolia: 'MN',
	macao: 'MO',
	northernmarianaislands: 'MP',
	martinique: 'MQ',
	mauritania: 'MR',
	montserrat: 'MS',
	malta: 'MT',
	mauritius: 'MU',
	maldives: 'MV',
	malawi: 'MW',
	mexico: 'MX',
	malaysia: 'MY',
	mozambique: 'MZ',
	namibia: 'NA',
	newcaledonia: 'NC',
	niger: 'NE',
	norfolkisland: 'NF',
	nigeria: 'NG',
	nicaragua: 'NI',
	netherlands: 'NL',
	nepal: 'NP',
	nauru: 'NR',
	niue: 'NU',
	newzealand: 'NZ',
	oman: 'OM',
	panama: 'PA',
	peru: 'PE',
	frenchpolynesia: 'PF',
	papuanewguinea: 'PG',
	philippines: 'PH',
	pakistan: 'PK',
	poland: 'PL',
	saintpierreandmiquelon: 'PM',
	pitcairn: 'PN',
	puertorico: 'PR',
	palestine: 'PS',
	portugal: 'PT',
	palau: 'PW',
	paraguay: 'PY',
	qatar: 'QA',
	reunion: 'RE',
	romania: 'RO',
	serbia: 'RS',
	rwanda: 'RW',
	saudiarabia: 'SA',
	solomonislands: 'SB',
	seychelles: 'SC',
	sudan: 'SD',
	singapore: 'SG',
	sainthelena: 'SH',
	slovenia: 'SI',
	svalbardandjanmayen: 'SJ',
	slovakia: 'SK',
	sierraleone: 'SL',
	sanmarino: 'SM',
	senegal: 'SN',
	somalia: 'SO',
	suriname: 'SR',
	southsudan: 'SS',
	saotomeandprincipe: 'ST',
	elsalvador: 'SV',
	sintmaarten: 'SX',
	syrianarabrepublic: 'SY',
	swaziland: 'SZ',
	turksandcaicosislands: 'TC',
	chad: 'TD',
	frenchsouthernterritories: 'TF',
	togo: 'TG',
	thailand: 'TH',
	tajikistan: 'TJ',
	tokelau: 'TK',
	timorleste: 'TL',
	turkmenistan: 'TM',
	tunisia: 'TN',
	tonga: 'TO',
	turkey: 'TR',
	trinidadandtobago: 'TT',
	tuvalu: 'TV',
	taiwan: 'TW',
	tanzania: 'TZ',
	ukraine: 'UA',
	uganda: 'UG',
	uruguay: 'UY',
	uzbekistan: 'UZ',
	vaticancity: 'VA',
	saintvincentandthegrenadines: 'VC',
	venezuela: 'VE',
	usvirginislands: 'VI',
	vietnam: 'VN',
	vanuatu: 'VU',
	wallisandfutuna: 'WF',
	samoa: 'WS',
	europeanunion: 'XE',
	unitednations: 'XW',
	yemen: 'YE',
	mayotte: 'YT',
	southafrica: 'ZA',
	zambia: 'ZM',
	zimbabwe: 'ZW'
}

// Regorxxx <- utils.HTTPRequestAsync, it works as 1:1 replacement for XMLHttp and WinHttp.WinHttpRequest.5.1 ActiveX objects.
const XMLHttpRequests = [];
function XMLHttpRequest() {
	return {
		url: void(0), type: void(0), onreadystatechange: void(0), headers: void(0), 
		id: null, readyState: 0, status: 0, responseText: null,
		get Status() { return this.status; },
		get ResponseText() { return this.responseText; },
		get ReadyState() { return this.readyState; },
		open: function (type, url) { 
			this.url = url; 
			this.type = type.toUpperCase() === 'GET' ? 0 : 1; 
			this.readyState = 1;
		},
		get Open() { return this.open; },
		setRequestHeader: function (key, value) {
			if (!this.headers) { this.headers = {}; }
			this.headers[key] = value;
		},
		get SetRequestHeader() { return this.setRequestHeader; },
		abort: function () {
			this.readyState = 0;
			this.status = 0;
			this.id = null;
			this.responseText = null;
			XMLHttpRequests.splice(XMLHttpRequests.indexOf(this), 1);
		},
		get Abort() { return this.abort; },
		send: function (body) {
			XMLHttpRequests.push(this);
			this.id = utils.HTTPRequestAsync(
				this.type, 
				this.url, 
				this.headers ? JSON.stringify(this.headers) : void(0), 
				this.type === 1 ? body : void(0)
			);
			this.readyState = 2;
		},
		get Send() { return this.send; },
		SetTimeouts: () => void(0),
		WaitForResponse: () => void(0),
	}
}
// Regorxxx ->

// Regorxxx <- Write similar artists data
function updateSimilarDataFile(file, newData) {
	if (!$.file(file)) {
		$.save(file, JSON.stringify(newData, null, '\t').replace(/\n/g, '\r\n'));
	} else {
		let data = $.jsonParse(file, null, 'file-utf8'); // Regorxxx <- Force UTF-8 ->
		if (!hasSimilarData(data, newData)) {
			data = getSimilarDataFromFile(data, newData);
			$.deleteFile(file);
			$.save(file, JSON.stringify(data, null, '\t').replace(/\n/g, '\r\n'));
		}
	}
}

function hasSimilarData(fileOrData, newData) {
	const data = typeof fileOrData === 'string'
		? $.jsonParse(data, null, 'file-utf8') // Regorxxx <- Force UTF-8 ->
		: fileOrData;
	if (data) {
		if (newData) {
			const toVisit = new Set();
			newData.forEach((obj) => {
				toVisit.add(obj.artist).add(obj.artist + '|' + (obj.mbid || ''));
			});
			for (let obj of data) {
				if (!toVisit.size) { break; }
				if (toVisit.has(obj.artist + '|' + (obj.mbid || ''))) { 
					toVisit.delete(obj.artist);
					toVisit.delete(obj.artist + '|' + (obj.mbid || ''));
				} else if (toVisit.has(obj.artist)) { 
					toVisit.delete(obj.artist);
					toVisit.delete(obj.artist + '|');
				}
			}
			return toVisit.size === 0;
		}

	}
	return false;
}

function getSimilarDataFromFile(fileOrData, newData = null) {
	const data = typeof fileOrData === 'string'
		? $.jsonParse(data, null, 'file-utf8') // Regorxxx <- Force UTF-8 ->
		: fileOrData;
	if (data) {
		if (newData) {
			const idxMap = new Map();
			const idxMapFallback = new Map();
			data.forEach((obj, idx) => {
				idxMap.set(obj.artist + '|' + (obj.mbid || ''), idx);
				idxMapFallback.set(obj.artist, idx);
			});
			newData.forEach((obj) => {
				let idx = idxMap.get(obj.artist + '|' + (obj.mbid || ''));
				if (typeof idx === 'undefined') { idx = idxMapFallback.get(obj.artist); }
				if (idx >= 0) { data[idx] = obj; }
				else { data.push(obj); }
			});
		}
		data.forEach((obj) => {
			obj.val.sort((a, b) => { return b.score - a.score; });
		});

	}
	return data || newData;
}
// Regorxxx ->