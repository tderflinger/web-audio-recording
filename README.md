# web-audio-recording

This is a simple demo for how to record audio
using the web. The audio data is then sent for
further processing to a Flask backend where it
is saved to a file.

## JavaScript Frontend

npm i http-server -g

http-server .

Open in browser http://localhost:8080.

The following Flask webservice needs to run
for data processing. If your IP or port is different
then change FLASK_ENDPOINT in main.js

## Flask Webservice

python3 -m venv venv

. venv/bin/activate

pip3 install -r requirements.txt

export FLASK_ENV=development
export FLASK_APP=app-audio.py

flask run --host=0.0.0.0

When you hit the "Stop Recording" button
on the frontend, the data is sent to the Flask
webservice and a file audio.webm is created.

## Prior Work

Demo based on: https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/record

## License

BSD License
