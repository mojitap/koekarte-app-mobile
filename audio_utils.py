from pydub import AudioSegment
import wave

def convert_webm_to_wav(input_path, output_path):
    """webm形式の音声ファイルをwavに変換する"""
    audio = AudioSegment.from_file(input_path, format="webm")
    audio.export(output_path, format="wav")

def is_valid_wav(wav_path, min_duration_sec=1.5):
    """wavファイルが正常か＆一定時間以上あるかチェック"""
    try:
        with wave.open(wav_path, 'rb') as wav_file:
            frames = wav_file.getnframes()
            rate = wav_file.getframerate()
            duration = frames / float(rate)
            return duration >= min_duration_sec
    except Exception as e:
        print("❌ WAVファイル検証エラー:", e)
        return False