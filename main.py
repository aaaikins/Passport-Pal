import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, EmailStr
from openai import OpenAI
from email_validator import validate_email, EmailNotValidError
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware to allow requests from your frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files and templates directory
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


class TravelData(BaseModel):
    nationality: str
    passport_expiration: str
    leaving_from: str
    going_to: str
    departure_date: str
    email: EmailStr
    visa_type: str
    purpose_of_travel: str


def generate_checklist(data: TravelData):
    prompt = (
        f"Create a detailed and specific travel documents checklist for a student studying in the US. "
        f"The checklist should ensure the student has all necessary documents to travel without stress. "
        f"Consider the student's nationality, passport expiration date, visa type, and purpose of travel. "
        f"Provide any additional information if a specific Visa type is need for the trip, feel free to add accurate links"
        f"Provide the checklist in the following format: each item should be preceded by a checkmark emoji. "
        f"Use clear and concise language.\n\n"
        f"Nationality: {data.nationality}\n"
        f"Passport Expiration Date: {data.passport_expiration}\n"
        f"Leaving From: {data.leaving_from}\n"
        f"Going To: {data.going_to}\n"
        f"Departure Date: {data.departure_date}\n"
        f"Visa Type: {data.visa_type}\n"
        f"Purpose of Travel: {data.purpose_of_travel}\n\n"
        f"Example format: \n"
        f"✅ Item 1\n"
        f"✅ Item 2\n"
        f"...\n\n"
        f"Provide the detailed checklist below: "
    )
    try:
        client = OpenAI(api_key='sk-proj-loUZ0f123OisT7bYwoUIT3BlbkFJf0ldijMgB4RDTn1ZNAcT')
        completion = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system",
                 "content": "You are an experienced travel specialist"
                            " that provides tailored and specific travel documents checklists."},
                {"role": "user", "content": prompt}
            ]
        )
        content = completion.choices[0].message.content
        plain_text_content = (content.replace("### ", "").replace("**", "")
                              .replace("-", "").replace("  ", " ")
                              .replace("#","")).replace("*", "")
        with open("checklist.txt", "w") as checklist:
            checklist.write(plain_text_content)

        with open("checklist.txt", "r") as checklist:
            text = checklist.readlines()[1:]
            text = "".join(text)
        return text

    except Exception as e:
        return str(e)


def send_email(to_email: str, checklist: str):
    from_email = "passportpal.business@gmail.com"
    password = "xjje uovq hryk wqph"

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = "Your Travel Checklist"

    body = f'Hey, \n{checklist}'
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_email, password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        return "Checklist sent successfully!"
    except Exception as e:
        return f"Failed to send email: {e}"


@app.get("/", response_class=HTMLResponse)
async def read_form(request: Request):
    return templates.TemplateResponse("form.html", {"request": request})


@app.post("/preview", response_class=HTMLResponse)
async def preview_form(request: Request,
                       nationality: str = Form(...),
                       passport_expiration: str = Form(...),
                       leaving_from: str = Form(...),
                       going_to: str = Form(...),
                       departure_date: str = Form(...),
                       email: str = Form(...),
                       visa_type: str = Form(...),
                       purpose_of_travel: str = Form(...)):
    try:
        validate_email(email)
    except EmailNotValidError as e:
        return templates.TemplateResponse("form.html", {"request": request, "error": str(e)})

    data = TravelData(
        nationality=nationality,
        passport_expiration=passport_expiration,
        leaving_from=leaving_from,
        going_to=going_to,
        departure_date=departure_date,
        email=email,
        visa_type=visa_type,
        purpose_of_travel=purpose_of_travel
    )

    checklist = generate_checklist(data)

    return templates.TemplateResponse("preview.html", {"request": request, "checklist": checklist, "email": email})


@app.post("/send_email", response_class=HTMLResponse)
async def send_email_form(request: Request, email: str = Form(...), checklist: str = Form(...)):
    email_status = send_email(email, checklist)
    return templates.TemplateResponse("result.html", {"request": request, "email_status": email_status})
