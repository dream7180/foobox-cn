function Memoize(func, hasher){
	var memo = function(key){
		var cache = memo.cache;
		var addr = '' + (hasher ? hasher.apply(this, arguments): key);
		if(!cache[addr]){
			cache[addr] = func.apply(this, arguments);
		}
		return cache[addr];
	};
	memo.cache = {};
	return memo;
}

var GdiFont = Memoize(function(name, size, style){
	return gdi.Font(name, size, style);
}, function(){
	var args = [].slice.call(arguments);
	return args.join('^^');
});