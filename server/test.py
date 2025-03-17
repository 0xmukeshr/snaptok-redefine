from google.cloud import speech
import io

# Initialize Google Cloud Speech client
client = speech.SpeechClient()

# Path to your local audio file (Converted to mono, 16kHz)
audio_file_path = "/home/toji/snaptok/proj/server/converted/uploaded_audio.wav"

# Read the audio file as binary data
with io.open(audio_file_path, "rb") as audio_file:
    content = audio_file.read()

# Configure Speech-to-Text settings
config = speech.RecognitionConfig(
    encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
    sample_rate_hertz=16000,  # Use the correct sample rate
    language_code="en-US",
    enable_automatic_punctuation=True,
    enable_word_time_offsets=True,
    enable_word_confidence=True,
    diarization_config=speech.SpeakerDiarizationConfig(
        enable_speaker_diarization=True,
        min_speaker_count=1,
        max_speaker_count=5
    )
)

# Create RecognitionAudio object
audio = speech.RecognitionAudio(content=content)

# Send request to Google Cloud
response = client.recognize(config=config, audio=audio)

# Print the transcript
for result in response.results:
    print(result.alternatives[0].transcript)
    
for result in response.results:
    print(f"Confidence: {result.alternatives[0].confidence}")


# Print speaker diarization info
if response.results and response.results[-1].alternatives:
    words_info = response.results[-1].alternatives[0].words
    for word in words_info:
        print(f"Word: {word.word}, Speaker: {word.speaker_tag}, Start: {word.start_time.total_seconds()}, End: {word.end_time.total_seconds()}")
