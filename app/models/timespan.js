
var ts = [
	{ string: "30 min", duration: 1800,        default: false},
	{ string: "1 day",  duration: 86400,       default: false},
	{ string: "1 hour", duration: 3600,        default: false},
	{ string: "1 week", duration: 86400 * 7,   default: true},
	{ string: "1 year", duration: 86400 * 365, default: false}];

var expiryToSecondsTable = {};
var secondsToExpiry = {};

ts.forEach(function(ts) {
	expiryToSecondsTable[ts.string] = ts.duration;
	secondsToExpiry[ts.duration] = ts.string;
});

// We work in ms
exports.convertPostToDuration = function(expiryAsString, never) {
	if (never)
		return -1;
	return Date.now() + (expiryToSecondsTable[expiryAsString] * 1000);
}

