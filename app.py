from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import base64
import cv2
import numpy as np
import traceback
import os

app = Flask(__name__)
CORS(app)

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "Emotion AI API Running 🚀"
    })

@app.route("/detect-emotion", methods=["POST"])
def detect_emotion():
    try:
        data = request.get_json()

        if not data or "image" not in data:
            return jsonify({
                "success": False,
                "emotion": "error",
                "message": "No image received"
            }), 400

        image_base64 = data["image"]

        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]

        image_bytes = base64.b64decode(image_base64)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({
                "success": False,
                "emotion": "error",
                "message": "Image decoding failed"
            }), 400

        result = DeepFace.analyze(
            img_path=frame,
            actions=["emotion"],
            enforce_detection=False
        )

        if isinstance(result, list):
            face = result[0]
        else:
            face = result

        emotion = face.get("dominant_emotion", "unknown")

        return jsonify({
            "success": True,
            "emotion": str(emotion)
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({
            "success": False,
            "emotion": "error",
            "message": str(e)
        }), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
