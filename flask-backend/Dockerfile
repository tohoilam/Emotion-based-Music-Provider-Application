FROM python:3.8.7
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6 -y
RUN apt-get install fluidsynth -y
RUN apt-get install build-essential libasound2-dev libjack-dev portaudio19-dev -y
RUN pip install magenta
RUN python -m spacy download en_core_web_sm
RUN python -m spacy download en_core_web_md
COPY . .

CMD ["python", "app.py"]
