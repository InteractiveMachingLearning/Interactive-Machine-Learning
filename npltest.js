
var nlp = require("./checkNaturalLanguage");

var chinese = "你好";
var english = "hello";

//nlp.test();

console.log(chinese+ " " + nlp.isSentenceValid(chinese));
console.log(english+ " " + nlp.isSentenceValid(english));
