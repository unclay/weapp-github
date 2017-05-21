const base64hash = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function _atob (s) {
  s = s.replace(/\s|=/g, '');
  var cur,
    prev,
    mod,
    i = 0,
    result = [];

  while (i < s.length) {
    cur = base64hash.indexOf(s.charAt(i));
    mod = i % 4;

    switch (mod) {
      case 0:
        //TODO
        break;
      case 1:
        result.push(String.fromCharCode(prev << 2 | cur >> 4));
        break;
      case 2:
        result.push(String.fromCharCode((prev & 0x0f) << 4 | cur >> 2));
        break;
      case 3:
        result.push(String.fromCharCode((prev & 3) << 6 | cur));
        break;
    }
    prev = cur;
    i ++;
  }

  return result.join('');
}

module.exports = _atob;