from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List

class CustomField(BaseModel):
    key: str = Field(min_length=1, max_length=50)
    value: str = Field(min_length=1, max_length=200)

class SocialLink(BaseModel):
    network: str = Field(min_length=1, max_length=20)
    url: str = Field(min_length=1, max_length=500)

class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    image_url: Optional[str] = Field(default="", max_length=500)
    price: Optional[float] = Field(default=None, ge=0)
    currency: Optional[str] = "EUR"
    link: Optional[str] = Field(default="", max_length=2000)
    description: Optional[str] = Field(default="", max_length=1000)
    discount_code: Optional[str] = Field(default="", max_length=50)
    custom_fields: Optional[List[CustomField]] = []
    social_links: Optional[List[SocialLink]] = []

class ProductOut(BaseModel):
    id: str
    name: str
    image_url: str
    price: Optional[float] = None
    currency: str
    link: str
    description: str
    position: int
    discount_code: Optional[str] = ""
    custom_fields: Optional[List[CustomField]] = []
    social_links: Optional[List[SocialLink]] = []
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class DuplicateProductRequest(BaseModel):
    target_baglist_id: str = Field(min_length=1, max_length=100)

class ProductClick(BaseModel):
    baglist_id: str
    product_id: str

class FollowerCapture(BaseModel):
    email: EmailStr