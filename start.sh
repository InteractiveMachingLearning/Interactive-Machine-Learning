#avtivate service account with key file
gcloud auth activate-service-account --key-file Chatbot-1261fee7b8c8.json
#set environment variable
export GOOGLE_APPLICATION_CREDENTIALS=Chatbot-1261fee7b8c8.json
#start server, console output will be saved in log.txt
node index.js |& tee -a log.txt