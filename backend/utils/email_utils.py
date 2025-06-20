import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def send_verification_email(to_email, token):
    try:
        verify_url = f"http://localhost:5000/verify-email/{token}"  # Replace with actual domain in production
        subject = "Verify your email - InstaGuard"
        html_content = f"""
        <html>
        <body>
            <h3>Hello!</h3>
            <p>Thanks for registering on <b>InstaGuard</b>.</p>
            <p>Please click the button below to verify your email:</p>
            <a href="{verify_url}" style="padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none;">Verify Email</a>
            <p>If you didn’t create this account, please ignore this email.</p>
        </body>
        </html>
        """

        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = to_email
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
            smtp.starttls()
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.send_message(msg)
            print(f"Verification email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send verification email: {str(e)}")
