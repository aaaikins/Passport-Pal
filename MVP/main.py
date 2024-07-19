import tkinter as tk
from tkinter import font, messagebox, ttk
from tkcalendar import DateEntry
import json
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from openai import OpenAI

# Configure OpenAI API Key
# api_key = 'sk-proj-loUZ0f123OisT7bYwoUIT3BlbkFJf0ldijMgB4RDTn1ZNAcT'

# Function to generate checklist using OpenAI
def generate_checklist(data):
    prompt = (
        f"Generate a travel documents checklist using checkmark emojis for a user with the following details:\n"
        f"Nationality: {data['nationality']}\n"
        f"Passport Expiration Date: {data['passport_expiration']}\n"
        f"Leaving From: {data['leaving_from']}\n"
        f"Going To: {data['going_to']}\n"
        f"Departure Date: {data['departure_date']}\n"
    )
    try:
        client = OpenAI(api_key='sk-proj-loUZ0f123OisT7bYwoUIT3BlbkFJf0ldijMgB4RDTn1ZNAcT')
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system",
                 "content": "You are a helpful assistant that generates necessary travel documents checklists."},
                {"role": "user", "content": prompt}
            ]
        )
        content = completion.choices[0].message.content
        plain_text_content = content.replace("### ", "").replace("**", "").replace("-", "").replace("  ", " ")
        return plain_text_content

    except Exception as e:
        messagebox.showerror(title='Error', message=f"Failed to generate checklist: {e}")
        return None


# Function to send email
def send_email(to_email, checklist):
    from_email = "aaache20@gmail.com"
    password = "lkbq bzar gyvw anlv"

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = "Your Travel Checklist"

    body = checklist
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_email, password)
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        messagebox.showinfo(title='Success', message="Checklist sent successfully!")
    except Exception as e:
        messagebox.showerror(title='Error', message=f"Failed to send email: {e}")

# Function to save data and generate checklist
def save():
    nationality = nationality_var.get()
    passport_expiration = passport_date_picker.get()
    leaving_from = leaving_from_var.get()
    going_to = going_to_var.get()
    departure_date = departure_date_picker.get()
    email = email_entry.get()
    new_data = {
        "nationality": nationality,
        "passport_expiration": passport_expiration,
        "leaving_from": leaving_from,
        "going_to": going_to,
        "departure_date": departure_date
    }

    if not nationality or not passport_expiration or not leaving_from or not going_to or not departure_date or not email:
        messagebox.showwarning(title='Oops', message="Please don't leave any fields empty!")
    else:
        try:
            with open("data.json", "r") as data_file:
                file_content = data_file.read()
                if file_content.strip():
                    data = json.loads(file_content)
                else:
                    data = {}
        except (FileNotFoundError, json.JSONDecodeError):
            data = {}

        data.update({f"Travel_Info_{len(data)+1}": new_data})

        with open("data.json", "w") as data_file:
            json.dump(data, data_file, indent=4)

        nationality_dropdown.set('')
        passport_date_picker.set_date(datetime.today())
        leaving_from_dropdown.set('')
        going_to_dropdown.set('')
        departure_date_picker.set_date(datetime.today())
        email_entry.delete(0, tk.END)

        checklist = generate_checklist(new_data)
        send_email(email, checklist)

# ---------------------------- UI SETUP ------------------------------- #
window = tk.Tk()
window.title("Passport Pal")
window.config(padx=50, pady=50, bg='cyan')

# Custom fonts
title_font = font.Font(family="Helvetica", size=24, weight="bold")
label_font = font.Font(family="Helvetica", size=12, weight="bold")
entry_font = font.Font(family="Helvetica", size=12)
button_font = font.Font(family="Helvetica", size=12, weight="bold")

# Canvas for logo
canvas = tk.Canvas(width=350, height=350, highlightthickness=0, bg="cyan")
logo_img = tk.PhotoImage(file="logo.png")
canvas.create_image(175, 175, image=logo_img)
canvas.grid(row=0, column=0, columnspan=3, pady=10)

# Labels and entries
labels = ["Nationality:", "Passport Expiration Date:", "Leaving from?", "Going to?", "Departure Date", "Email"]
entries = []

# Nationality dropdown
nationality_label = tk.Label(text=labels[0], bg="cyan", fg="purple", font=label_font)
nationality_label.grid(row=1, column=0, sticky='e', padx=10, pady=10)
nationalities = ["Select", "American", "British", "Canadian", "Australian"]
nationality_var = tk.StringVar(value=nationalities[0])
nationality_dropdown = ttk.Combobox(window, textvariable=nationality_var, values=nationalities, font=entry_font)
nationality_dropdown.grid(row=1, column=1, columnspan=2, padx=10, pady=10)
entries.append(nationality_dropdown)

# Passport expiration date picker
passport_label = tk.Label(text=labels[1], bg="cyan", fg="purple", font=label_font)
passport_label.grid(row=2, column=0, sticky='e', padx=10, pady=10)
passport_date_picker = DateEntry(window, width=18, font=entry_font)
passport_date_picker.grid(row=2, column=1, columnspan=2, padx=10, pady=10)
entries.append(passport_date_picker)

# Leaving from dropdown
leaving_from_label = tk.Label(text=labels[2], bg="cyan", fg="purple", font=label_font)
leaving_from_label.grid(row=3, column=0, sticky='e', padx=10, pady=10)
locations = ["Select", "New York", "Los Angeles", "London", "Sydney"]
leaving_from_var = tk.StringVar(value=locations[0])
leaving_from_dropdown = ttk.Combobox(window, textvariable=leaving_from_var, values=locations, font=entry_font)
leaving_from_dropdown.grid(row=3, column=1, columnspan=2, padx=10, pady=10)
entries.append(leaving_from_dropdown)

# Going to dropdown
going_to_label = tk.Label(text=labels[3], bg="cyan", fg="purple", font=label_font)
going_to_label.grid(row=4, column=0, sticky='e', padx=10, pady=10)
going_to_var = tk.StringVar(value=locations[0])
going_to_dropdown = ttk.Combobox(window, textvariable=going_to_var, values=locations, font=entry_font)
going_to_dropdown.grid(row=4, column=1, columnspan=2, padx=10, pady=10)
entries.append(going_to_dropdown)

# Departure date picker
departure_label = tk.Label(text=labels[4], bg="cyan", fg="purple", font=label_font)
departure_label.grid(row=5, column=0, sticky='e', padx=10, pady=10)
departure_date_picker = DateEntry(window, width=18, font=entry_font)
departure_date_picker.grid(row=5, column=1, columnspan=2, padx=10, pady=10)
entries.append(departure_date_picker)

# Email entry
email_label = tk.Label(text=labels[5], bg="cyan", fg="purple", font=label_font)
email_label.grid(row=6, column=0, sticky='e', padx=10, pady=10)
email_entry = tk.Entry(window, width=35, font=entry_font)
email_entry.grid(row=6, column=1, columnspan=2, padx=10, pady=10)
entries.append(email_entry)

# Set focus to the first entry
nationality_dropdown.focus()

# Submit button
submit_button = tk.Button(text="Submit", width=33, command=save, highlightthickness=0, fg="purple", font=button_font)
submit_button.grid(row=7, column=0, columnspan=3, pady=20)

window.mainloop()
