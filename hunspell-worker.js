var Module = {
  preRun: [],
  postRun: [],
  print: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    console.log(text);
  },
  printErr: function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    console.error(text);
  },
  onRuntimeInitialized: function() {
    postMessage({action: 'ready'});
  }
};

var meminitXHR = Module['memoryInitializerRequest'] = new XMLHttpRequest();
meminitXHR.open('GET', 'embuild/hunspell.js.mem', false);
meminitXHR.responseType = 'arraybuffer';
meminitXHR.send(null);
if (meminitXHR.status !== 200) {
  throw new Error('Downloading memory file failed, status = ' + meminitXHR.status);
}

importScripts('embuild/hunspell.js');

function downloadFile(from, to) {
  var dicXHR = new XMLHttpRequest();
  dicXHR.open('GET', from, false);
  dicXHR.send(null);
  if (dicXHR.status !== 200) {
    throw new Error('Downloading file failed, status = ' + dicXHR.status);
  }
  FS.writeFile(to, dicXHR.response);
}

function Hunspell() {
  var _Hunspell_create = getCFunc('Hunspell_create');
  var _Hunspell_spell = getCFunc('Hunspell_spell');
  var _Hunspell_suggest = getCFunc('Hunspell_suggest');
  var _Hunspell_free_list = getCFunc('Hunspell_free_list');
  var _Hunspell_destroy = getCFunc('Hunspell_destroy');

  function allocStr(str) {
    var len = (str.length<<2)+1;
    var ret = Runtime.stackAlloc(len);
    stringToUTF8(str, ret, len);
    return ret;
  }

  //Hunspell_create
  var handle = (function(aff, dic) {
    var stack = Runtime.stackSave();
    var affPtr = allocStr(aff);
    var dicPtr = allocStr(dic);
    var ret = _Hunspell_create(affPtr, dicPtr);
    Runtime.stackRestore(stack);
    return ret
  })('index.aff', 'index.dic')

  this.spell = function (word) {
    var stack = Runtime.stackSave();
    var wordPtr = allocStr(word);
    var ret = _Hunspell_spell(handle, wordPtr);
    Runtime.stackRestore(stack);
    return !!ret;
  }

  this.suggest = function (word) {
    var stack = Runtime.stackSave();
    var wordPtr = allocStr(word);
    var slst = Runtime.stackAlloc(4);
    var count = _Hunspell_suggest(handle, slst, wordPtr);
    var results = [];
    var strArrayPtr = getValue(slst, "*");
    for(var i = 0; i < count; i++) {
      results.push(Pointer_stringify(getValue(strArrayPtr + i * 4, "*")));
    }
    _Hunspell_free_list(handle, slst, count);
    Runtime.stackRestore(stack);
    return results;
  }
  this.destory = function () {
    _Hunspell_destroy(handle);
  }
}

var hunspell;
onmessage = function(e) {
  var data = e.data;
  switch(data.action) {
    case 'create':
      downloadFile(data.aff, 'index.aff');
      downloadFile(data.dic, 'index.dic');
      hunspell = new Hunspell();
      postMessage({action: 'create', word: data.word, correct: correct});
      break;
    case 'spell':
      var correct = hunspell.spell(data.word);
      postMessage({action: 'spell', word: data.word, correct: correct});
      break;
    case 'suggest':
      var suggestions = hunspell.suggest(data.word);
      postMessage({action: 'suggest', word: data.word, suggestions: suggestions});
      break;
    default:
      console.error('unknown action', data.action);
  }
}

