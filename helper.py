import csv
questions = []
questions_dict = {}
with open('questions.csv', 'rb') as csvfile:
	spamreader = csv.reader(csvfile, delimiter=',', quotechar='"')
	for row in spamreader:
		questions.append(row)

for i in range(len(questions)):
	if not questions[i][1]+questions[i][2] in questions_dict.keys():
		questions_dict[questions[i][1]+questions[i][2]] = []
	questions_dict[questions[i][1]+questions[i][2]].append(questions[i][0])
		

import json
with open('questions_dict.txt', 'w') as outfile:
    json.dump(questions_dict, outfile)


questions_dict2 = []
for key in questions_dict.keys():
	questions_dict2.append(questions_dict[key])

with open('questions_dict2.txt', 'w') as outfile:
    json.dump(questions_dict2, outfile)