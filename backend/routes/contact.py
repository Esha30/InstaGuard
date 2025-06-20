import os
from flask import Blueprint, request, jsonify, current_app
from pymongo import MongoClient
from datetime import datetime
import smtplib
from email.mime.text import MIMEText

contact_bp = Blueprint('contact_bp', __name__)

# Load MongoDB from env
client = MongoClient(os.getenv("MONGO_URL"))
db = client["users"]
users_collection = db["register"]
contact_collection = db["contact_messages"]

@contact_bp.route('/contact', methods=['POST'])
def handle_contact():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        message = data.get('message')

        if not all([name, email, message]):
            return jsonify({"message": "All fields are required."}), 400

        # Save to MongoDB
        contact_doc = {
            "name": name,
            "email": email,
            "message": message,
            "createdAt": datetime.utcnow()
        }
        contact_collection.insert_one(contact_doc)

        # Send email
        send_email_to_support(name, email, message)

        return jsonify({"message": "Message sent successfully!"}), 200

    except Exception as e:
        current_app.logger.exception("Error in contact form:")
        return jsonify({"message": "Something went wrong. Try again later."}), 500

def send_email_to_support(name, email, message):
    support_email = os.environ.get("EMAIL_USER")
    support_password = os.environ.get("EMAIL_PASS")
    smtp_server = "smtp.gmail.com"
    smtp_port = 587

    subject = "User Support"
    body = f"Name: {name}\nEmail: {email}\nMessage:\n{message}"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = support_email
    msg["To"] = support_email

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(support_email, support_password)
        server.sendmail(support_email, support_email, msg.as_string())
