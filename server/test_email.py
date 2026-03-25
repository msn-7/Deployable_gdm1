import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))

# Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

def test_email():
    print("--- Testing Email Configuration ---")
    
    # 1. Check Environment Variables
    email_user = os.environ.get("EMAIL_USER")
    email_pass = os.environ.get("EMAIL_PASS")
    
    print(f"EMAIL_USER: {'Set' if email_user else 'NOT SET'} ({email_user if email_user else 'None'})")
    print(f"EMAIL_PASS: {'Set' if email_pass else 'NOT SET'} ({'******' if email_pass else 'None'})")
    
    if not email_user or not email_pass:
        print("\nERROR: Environment variables are missing.")
        print("Please set them in your terminal before running this script.")
        print("Windows: set EMAIL_USER=your_email@gmail.com")
        print("         set EMAIL_PASS=your_app_password")
        return

    # 2. Try Connecting
    print(f"\nConnecting to {SMTP_SERVER}:{SMTP_PORT}...")
    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.set_debuglevel(1) # See full SMTP conversation
        server.starttls()
        print("TLS Connection established.")
        
        # 3. Try Login
        print("Attempting login...")
        server.login(email_user, email_pass)
        print("Login SUCCESSFUL!")
        
        # 4. Try Sending
        print(f"Sending test email to {email_user}...")
        msg = MIMEMultipart()
        msg['From'] = email_user
        msg['To'] = email_user
        msg['Subject'] = "GDM App - Test Email"
        msg.attach(MIMEText("This is a test email to verify your SMTP configuration works.", 'plain'))
        
        server.send_message(msg)
        print("Test email SENT successfully!")
        
        server.quit()
        
    except smtplib.SMTPAuthenticationError:
        print("\nAUTH ERROR: Login failed. Please check your App Password.")
        print("Note: You CANNOT use your regular Gmail password. You must generate an App Password.")
        print("Go to: Google Account -> Security -> 2-Step Verification -> App passwords")
    except Exception as e:
        print(f"\nERROR: {e}")

if __name__ == "__main__":
    test_email()
