///////////////Google Translate API
// Imports the Google Cloud client library
const Translate = require('@google-cloud/translate');

	// Your Google Cloud Platform project ID
const projectId = 'dotted-rookery-188008';

	// Instantiates a client
const translate = new Translate({
	projectId: projectId,
});


module.exports =
{
	/*
	test:function()
	{
		console.log("hello");
	}
	*/

	isSentenceValid:function(text) // test if userA input a natural language
	{
	  var isValid;

	  var userAInputConfidence;
	  var userAInputDetectedLanguage;
	  /////////////////////////////////

		return new Promise((resolve, reject) => {
			translate
				.detect(text)
					.then(results => {
						let detections = results[0];
						detections = Array.isArray(detections) ? detections : [detections];

					  console.log('Detections:');
					  detections.forEach(detection => {
							userAInputConfidence = `${detection.confidence}`;
							userAInputDetectedLanguage = `${detection.language}`;

							console.log(userAInputConfidence);
							console.log(userAInputDetectedLanguage);
							//terminate = true;

							isValid = (userAInputConfidence > 0.8) && (userAInputDetectedLanguage == "en");
							//console.log('Confidence: ' + userAInputConfidence + ', Language: ' + userAInputDetectedLanguage);
							//console.log(`Text: ${text}`);
							resolve(isValid);
					  });
					})
					.catch(err => {
					  console.error('ERROR:', err);
						reject(err);
					});

		});

	}

}

// test = "Newsletter goggle venmo iphone";
// isSentenceValid(test).then((isValid)=>{
// 	if(isValid== true)
// 	{
// 		console.log('英文');
// 	}
// 	else{
// 		console.log('不是英文');
// 	}
// })
