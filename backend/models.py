from pydantic import BaseModel


class TravelData(BaseModel):
    nationality: str
    passportExpiration: str
    leavingFrom: str
    goingTo: str
    departureDate: str
    email: str
    visaType: str
    purposeOfTravel: str
    phoneNumber: str | None = None


class EmailRequest(BaseModel):
    email: str
    checklist: str
    userName: str | None = None


class WhatsAppRequest(BaseModel):
    phoneNumber: str
    departureDate: str
    travelDetails: str
