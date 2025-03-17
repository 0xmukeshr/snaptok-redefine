import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from google.cloud import speech
from collections import Counter
import re
import language_tool_python
import os
from pydub import AudioSegment
import io
import wave

UPLOAD_FOLDER = "uploads"
CONVERTED_FOLDER = "converted"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app)

# Initialize Google Cloud Speech client
client = speech.SpeechClient()

# Initialize grammar checker
tool = language_tool_python.LanguageTool("en-US")

@app.route("/api/home", methods=["GET"])
def return_home():
    return jsonify({"message": "Hello World"})

@app.route("/api/upload", methods=['POST'])
def upload():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    audio_file = request.files['audio']
    webm_filename = "uploaded_audio.webm"
    wav_filename = "uploaded_audio.wav"
    webm_path = os.path.join(UPLOAD_FOLDER, webm_filename)
    wav_path = os.path.join(CONVERTED_FOLDER, wav_filename)

    # Save the uploaded WebM file
    audio_file.save(webm_path)

    try:
        # Convert the WebM file to WAV using pydub with 16000 Hz sample rate
        audio = AudioSegment.from_file(webm_path, format="webm")

        # **Check if the audio is stereo (2 channels)**
        if audio.channels != 1:
            print(f"⚠️ Audio is stereo ({audio.channels} channels), converting to mono...")
            audio = audio.set_channels(1)  # Convert to mono

        # Set the frame rate to 16000 Hz
        audio = audio.set_frame_rate(16000).set_sample_width(2)
        audio.export(wav_path, format="wav")
    except Exception as e:
        return jsonify({'error': f"Conversion failed: {str(e)}"}), 500

    return jsonify({
        'message': 'Audio file received and converted successfully',
        'wav_path': wav_path
    }), 200

@app.route("/api/analyze", methods=["GET"])
def analyze_speech():
    # Use the local WAV file generated from /api/upload
    wav_path = os.path.join(CONVERTED_FOLDER, "uploaded_audio.wav")

    try:
        # **Verify that the WAV file is mono before processing**
        with wave.open(wav_path, "rb") as wf:
            channels = wf.getnchannels()
            if channels != 1:
                return jsonify({'error': f"Google API requires mono audio, but file has {channels} channels."}), 400
            print(f"✅ Verified: Audio is mono ({channels} channel). Processing...")

        with io.open(wav_path, "rb") as audio_file:
            content = audio_file.read()
    except Exception as e:
        return jsonify({'error': f"Could not read WAV file: {str(e)}"}), 500

    # Configure Speech-to-Text settings
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="en-US",
        enable_automatic_punctuation=True,
        enable_word_time_offsets=True,
        enable_word_confidence=True,
        enable_spoken_punctuation=True,
        enable_spoken_emojis=True,
        diarization_config=speech.SpeakerDiarizationConfig(
            enable_speaker_diarization=True,
            min_speaker_count=1,
            max_speaker_count=5
        )
    )

    # Create RecognitionAudio object with the binary content
    audio = speech.RecognitionAudio(content=content)
    
    # Process the audio file
    response = client.recognize(config=config, audio=audio)

    disfluency_words = ["um", "uh", "like", "you know", "hmm", "ah", "uhh", "huh", "er", "mmm", "okay"]
    word_count = Counter()
    disfluency_count = Counter()
    full_transcript = ""

    def remove_disfluencies(text, disfluency_list):
        pattern = r'\b(' + '|'.join(re.escape(word) for word in disfluency_list) + r')\b'
        return re.sub(pattern, '', text, flags=re.IGNORECASE).strip()

    # Process transcript
    for result in response.results:
        transcript = result.alternatives[0].transcript
        full_transcript += transcript + " "
        words = re.findall(r'\b\w+\b', transcript.lower())
        word_count.update(words)
        for word in disfluency_words:
            disfluency_count[word] += transcript.lower().count(word)

    cleaned_transcript = remove_disfluencies(full_transcript, disfluency_words)
    corrected_text = tool.correct(cleaned_transcript)

    # Prepare JSON output
    output = {
        "transcript": full_transcript.strip(),
        "correctedText": corrected_text.strip(),
        "disfluencyAnalysis": dict(disfluency_count),
        "repeatedWords": dict(word_count.most_common(5))
    }

    return jsonify(output)

if __name__ == "__main__":
    app.run(debug=True, port=8080)
