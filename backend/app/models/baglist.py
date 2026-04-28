from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.product import ProductOut

class BagListCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(default="", max_length=500)
    category: Optional[str] = "Other"
    cover_image_url: Optional[str] = Field(default="", max_length=500)
    tags: Optional[List[str]] = []
    is_public: Optional[bool] = True
    slug: Optional[str] = None

class BagListUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=100)
    description: Optional[str] = Field(default=None, max_length=500)
    category: Optional[str] = None
    cover_image_url: Optional[str] = Field(default=None, max_length=500)
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None
    products: Optional[List[dict]] = None

class BagListOut(BaseModel):
    id: str
    user_id: str
    username: str
    display_name: str
    title: str
    description: str
    category: str
    cover_image_url: str
    tags: List[str]
    is_public: bool
    products: List[ProductOut]
    favorites_count: int
    saves_count: int
    created_at: str
    updated_at: str
    slug: Optional[str] = None
    is_favorited: Optional[bool] = False
    is_saved: Optional[bool] = False