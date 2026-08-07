from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import base64
import cv2
import numpy as np
import traceback

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "Emotion AI API Running 🚀"
    })

@app.route("/detect", methods=["POST"])
def detect():
    try:
        data = request.get_json()

        if not data or "image" not in data:
            return jsonify({
                "success": False,
                "emotion": "error",
                "message": "No image received"
            }), 400

        image_base64 = data["image"]
        print("\n📸 Image received")

        # Remove base64 header if present
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        # Decode image
        image_bytes = base64.b64decode(image_base64)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({
                "success": False,
                "emotion": "error",
                "message": "Image decoding failed"
            }), 400

        print("✅ Image decoded:", frame.shape)

        # DeepFace analysis
        result = DeepFace.analyze(
            img_path=frame,
            actions=["emotion"],
            enforce_detection=False
        )

        print("🧠 RAW RESULT:", result)

        if isinstance(result, list):
            face = result[0]
        else:
            face = result

        emotion = face.get("dominant_emotion", "unknown")
        print("😊 FINAL EMOTION:", emotion)

        return jsonify({
            "success": True,
            "emotion": str(emotion)
        })

    except Exception as e:
        print("❌ ERROR:", str(e))
        traceback.print_exc()
        return jsonify({
            "success": False,
            "emotion": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    print("🚀 Emotion AI Server Started")
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=False
    )
