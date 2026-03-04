from flask import Flask, render_template, request, jsonify, send_from_directory, abort
import json
import os

app = Flask(__name__)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
CERT_DIR = os.path.join(BASE_DIR, "certificates")
CODES_FILE = os.path.join(BASE_DIR, "codes.json")


def load_certificates():
    if not os.path.exists(CODES_FILE):
        return {}
    with open(CODES_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data.get("certificates", {})


def safe_filename(name):
    if "/" in name or "\\" in name or name.startswith("."):
        return ""
    return name


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/certifications")
def certifications():
    return render_template("certifications.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/certificate-verification")
def certificate_verification():
    return render_template("verify.html")


@app.route("/verify", methods=["POST"])
def verify():
    data = request.get_json(silent=True) or {}
    code = (data.get("code") or "").strip()

    if not code:
        return jsonify({"ok": False, "message": "Please enter company code."}), 400

    certs = load_certificates()
    match = None
    for key, filename in certs.items():
        if key.lower() == code.lower():
            match = filename
            break

    if not match:
        return jsonify({"ok": False, "message": "Invalid company code."}), 404

    filename = safe_filename(match)
    if not filename:
        return jsonify({"ok": False, "message": "Invalid certificate file."}), 500

    path = os.path.join(CERT_DIR, filename)
    if not os.path.exists(path):
        return jsonify({"ok": False, "message": "Certificate not found on server."}), 500

    return jsonify({
        "ok": True,
        "fileUrl": f"/certificates/{filename}"
    })


@app.route("/certificates/<filename>")
def certificate(filename):
    filename = safe_filename(filename)
    if not filename:
        abort(404)
    return send_from_directory(CERT_DIR, filename)


if __name__ == "__main__":
    app.run(debug=True)
