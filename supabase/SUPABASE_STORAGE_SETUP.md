# Supabase Storage Setup Guide

## Overview

This guide covers setting up Supabase Storage buckets for the PS Feedback Platform, including bucket creation, file management, and RLS policies.

---

## 📋 Table of Contents

1. [Create Storage Buckets](#create-storage-buckets)
2. [Bucket Configuration](#bucket-configuration)
3. [File Upload Implementation](#file-upload-implementation)
4. [File Management](#file-management)
5. [CDN & Image Optimization](#cdn--image-optimization)
6. [Troubleshooting](#troubleshooting)

---

## Create Storage Buckets

### Via Supabase Dashboard

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket** for each:

#### 1. Product Logos Bucket

```
Bucket Name: product_logos
Public: Yes
File Size Limit: 5 MB
```

**Purpose**: Primary logo for each product

**Path Structure**:
```
product_logos/
└── {product_id}/
    └── logo.png
```

#### 2. Product Images Bucket

```
Bucket Name: product_images
Public: Yes
File Size Limit: 10 MB
```

**Purpose**: Additional product screenshots/images

**Path Structure**:
```
product_images/
└── {product_id}/
    ├── image_1.png
    ├── image_2.png
    └── image_3.png
```

#### 3. User Avatars Bucket

```
Bucket Name: avatars
Public: Yes
File Size Limit: 5 MB
```

**Purpose**: User profile pictures

**Path Structure**:
```
avatars/
└── {user_id}/
    └── avatar.png
```

#### 4. Category Icons Bucket

```
Bucket Name: category_icons
Public: Yes
File Size Limit: 2 MB
```

**Purpose**: Category visual icons

**Path Structure**:
```
category_icons/
└── {category_id}/
    └── icon.svg
```

#### 5. Attachments Bucket

```
Bucket Name: attachments
Public: No (Private)
File Size Limit: 25 MB
```

**Purpose**: User-uploaded documents (private)

**Path Structure**:
```
attachments/
└── {user_id}/
    ├── document_1.pdf
    └── document_2.docx
```

---

## Bucket Configuration

### Image Optimization

1. Go to **Storage → product_images**
2. Click **Settings**
3. Enable **Image Transformations**:
   - ✓ Optimize images
   - ✓ Generate thumbnails

### Access Control

**For Public Buckets** (`product_logos`, `product_images`, `avatars`, `category_icons`):

1. Click **Policies** tab
2. Create policy:
   - **Operation**: SELECT
   - **Roles**: Public (or anon, authenticated)
   - **Conditions**: Allow all

**For Private Buckets** (`attachments`):

1. Create policy for INSERT:
   - **Operation**: INSERT
   - **Roles**: Authenticated
   - **Conditions**: `(storage.foldername(name))[1]::uuid = auth.uid()`

2. Create policy for SELECT:
   - **Operation**: SELECT
   - **Roles**: Authenticated
   - **Conditions**: `(storage.foldername(name))[1]::uuid = auth.uid()`

### Cache Control

1. **Storage → Settings**
2. Set **Cache-Control** headers:

```
# For images (cache for 7 days)
Cache-Control: public, max-age=604800

# For avatars (cache for 30 days)
Cache-Control: public, max-age=2592000

# For dynamic content
Cache-Control: public, max-age=3600
```

---

## File Upload Implementation

### Backend Upload (FastAPI)

**backend/app/services/storage.py**:

```python
from supabase import create_client
from app.core.config import get_settings
from fastapi import HTTPException, status
import os

settings = get_settings()
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

class StorageService:
    """Service for managing file uploads to Supabase Storage"""
    
    @staticmethod
    def upload_product_logo(file_bytes: bytes, product_id: int, filename: str) -> str:
        """Upload product logo"""
        file_path = f"{product_id}/logo"
        
        try:
            response = supabase.storage.from_('product_logos').upload(
                file_path,
                file_bytes,
                {"cacheControl": "3600", "upsert": "true"}
            )
            
            # Return public URL
            url = supabase.storage.from_('product_logos').get_public_url(file_path)
            return url
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Upload failed: {str(e)}"
            )
    
    @staticmethod
    def upload_product_image(file_bytes: bytes, product_id: int, filename: str) -> str:
        """Upload product image"""
        import uuid
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = f"{product_id}/images/{unique_filename}"
        
        try:
            response = supabase.storage.from_('product_images').upload(
                file_path,
                file_bytes,
                {"cacheControl": "3600"}
            )
            
            url = supabase.storage.from_('product_images').get_public_url(file_path)
            return url
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Upload failed: {str(e)}"
            )
    
    @staticmethod
    def upload_avatar(file_bytes: bytes, user_id: str, filename: str) -> str:
        """Upload user avatar"""
        file_path = f"{user_id}/avatar"
        
        try:
            response = supabase.storage.from_('avatars').upload(
                file_path,
                file_bytes,
                {"cacheControl": "2592000", "upsert": "true"}
            )
            
            url = supabase.storage.from_('avatars').get_public_url(file_path)
            return url
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Upload failed: {str(e)}"
            )
    
    @staticmethod
    def delete_file(bucket: str, file_path: str) -> bool:
        """Delete file from storage"""
        try:
            supabase.storage.from_(bucket).remove([file_path])
            return True
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Delete failed: {str(e)}"
            )
```

### API Endpoint for Upload

**backend/app/api/routes/storage.py**:

```python
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.models import get_db
from app.core import get_current_user
from app.services import StorageService
import mimetypes

router = APIRouter(prefix="/api/upload", tags=["Upload"])

ALLOWED_IMAGE_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/gif'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/product-logo/{product_id}")
async def upload_product_logo(
    product_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload product logo"""
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Allowed: JPEG, PNG, WebP, GIF"
        )
    
    # Validate file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Max 10 MB"
        )
    
    # Upload file
    url = StorageService.upload_product_logo(
        file_content,
        product_id,
        file.filename or "logo"
    )
    
    return {"url": url}

@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload user avatar"""
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type"
        )
    
    file_content = await file.read()
    if len(file_content) > 5 * 1024 * 1024:  # 5 MB for avatars
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Max 5 MB"
        )
    
    url = StorageService.upload_avatar(
        file_content,
        current_user["id"],
        file.filename or "avatar.jpg"
    )
    
    return {"url": url}
```

### Frontend Upload (React)

**frontend/src/lib/storage.ts**:

```typescript
import { supabase } from './supabase';

export class StorageService {
  static async uploadProductLogo(file: File, productId: number): Promise<string> {
    const filePath = `${productId}/logo`;
    
    const { data, error } = await supabase.storage
      .from('product_logos')
      .upload(filePath, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: publicUrl } = supabase.storage
      .from('product_logos')
      .getPublicUrl(filePath);
    
    return publicUrl.publicUrl;
  }
  
  static async uploadAvatar(file: File, userId: string): Promise<string> {
    const filePath = `${userId}/avatar`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    
    if (error) throw error;
    
    const { data: publicUrl } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    return publicUrl.publicUrl;
  }
  
  static async deleteFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) throw error;
  }
}
```

**frontend/src/components/AvatarUpload.tsx**:

```typescript
import { useState } from 'react';
import { StorageService } from '../lib/storage';

export function AvatarUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);
      
      const file = event.target.files?.[0];
      if (!file) return;
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5 MB');
      }
      
      // Upload file
      const url = await StorageService.uploadAvatar(
        file,
        'current_user_id'
      );
      
      console.log('Avatar uploaded:', url);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

---

## File Management

### Organize Files by User

Database table to track uploads:

```sql
CREATE TABLE file_uploads (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  bucket_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### File Cleanup

Remove old/unused files:

```typescript
async function cleanupOldFiles(bucketName: string, daysOld: number = 30) {
  const date = new Date();
  date.setDate(date.getDate() - daysOld);
  
  const { data: files, error } = await supabase.storage
    .from(bucketName)
    .list('', {
      limit: 100,
      offset: 0
    });
  
  if (error) throw error;
  
  for (const file of files) {
    if (file.created_at && new Date(file.created_at) < date) {
      await supabase.storage.from(bucketName).remove([file.name]);
    }
  }
}
```

---

## CDN & Image Optimization

### Image Transformations URL

Supabase automatically transforms images:

```
https://<project>.supabase.co/storage/v1/object/public/bucket_name/path/to/image.jpg?width=500&height=500&resize=cover
```

### Supported Parameters

- `width`: Image width in pixels
- `height`: Image height in pixels
- `resize`: Resize mode (contain, cover, fill)
- `quality`: JPEG quality (1-100)

### Example

```typescript
// Get resized image (500x500)
const imageUrl = `${supabase.storageUrl}/product_images/123/image.jpg?width=500&height=500&resize=cover`;

// Get thumbnail (100x100)
const thumbnailUrl = `${supabase.storageUrl}/product_images/123/image.jpg?width=100&height=100&resize=cover`;
```

---

## Troubleshooting

### Issue: "Access Denied" on Upload
- Check bucket is public (if needed)
- Verify RLS policies allow operation
- Ensure authentication is valid

### Issue: File Not Found
- Verify file path is correct
- Check bucket name spelling
- Ensure file was uploaded successfully

### Issue: Slow Uploads
- Use presigned URLs for large files
- Enable resumable uploads
- Compress files before upload

### Issue: Storage Quota Exceeded
- Delete old unused files
- Reduce image quality
- Use image compression tools

---

## Best Practices

### Security
- Validate file types on backend
- Implement file size limits
- Use virus scanning for user uploads
- Never store sensitive data in filenames

### Performance
- Use CDN for image delivery
- Compress images before upload
- Generate thumbnails for galleries
- Use lazy loading for images

### Organization
- Use consistent naming conventions
- Organize by user/product ID
- Implement file versioning
- Track file metadata in database

### Cost Optimization
- Implement automatic cleanup of old files
- Use image optimization
- Monitor storage usage
- Archive old data regularly
