
var cnl = require('./checkNaturalLanguage');

function validateRecords(serviceCodes)
{
	const serviceCodeLength = 11;
	var rewards = [];
	for(var i = 0; i < serviceCodes.length; i++)
	{
		rewards[i] = 0;
		var len = serviceCodes[i].length;
		if(len==serviceCodeLength&&(serviceCodes[i][len-1]=='A'||serviceCodes[i][len-1]=='B'))
		{
			rewards[i]=validate(serviceCode[i]);
		}
	}
	return rewards;
}

function validate(serviceCode)
{
	const fs = require('fs');
	var len = serviceCode.length;
	var isUserA = serviceCode[len-1]=='A';
	var reward = 0;
	var recordName = serviceCode.substring(0,len-1) + '.txt';
	const dir = "records/";

	//reward calculation factor
	////////////////////////////////////////
	var rewardBase = 0.05; //reward of completing <= $lowerBound 
	var lowerBound = 5;	//minimum number of questions to gain reward
	var rewardPerExtraRound = 0.04; //reward per extra question above $lowerBound 
	var GQPenalty = -0.05; //garbage quesiton penalty
	var invalidLanguagePenalty = -0.05;
	///////////////////////////////////////


	var fileContents;
	try
	{
		fileContents = fs.readFileSync(dir+recordName).toString();
		var contents = JSON.parse(fileContents);
		var records = contents.records;
		//console.log(records);
		if(isUserA)
		{
			//TODO
			reward = rewardBase;
			var num = 0;
			for(var i =0; i < records.length; i++)
			{
				if(i%2==0)
				{
					var sentence = records[i][1][0];
					isSentenceValid(test).then((isValid)=>{
						console.log(sentence + " " + isValid);
						if(!isValid)
						{
							reward+=invalidLanguagePenalty;
						}
						else if(num > lowerBound)
						{
							reward += rewardPerExtraRound;
						}
					});
				}
			}
		}
		else
		{
			reward = rewardBase;
			var num = 0;
			for(var i = 0; i < records.length;i++)
			{
				if(i%2==1)
				{
					num++;
					if(records[i][1][1]=="Garbage")
					{
						//console.log("Garbage Detected")
						reward += GQPenalty;
					}
					else if(num > lowerBound)
					{
						reward += rewardPerExtraRound;
					}
				}
			}
		}
		
	}catch(err)
	{
		if(err.code === 'ENOENT')
		{
			console.log(dir+recordName+" not found!");
		}
	}

	return Math.max(reward,0);

}

var serviceCode = ["AZeSdVZngFA"];
var rewards = validateRecords(serviceCode);
console.log("user A reward: "+rewards);
var serviceCode = ["AZeSdVZngFB"];
var rewards = validateRecords(serviceCode);
console.log("user B reward: " + rewards);
