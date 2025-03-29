// src/app/api/upload/route.js
import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'user_documents';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Create a base64 string from the buffer
    const base64String = buffer.toString('base64');
    const fileType = file.type;
    const dataURI = `data:${fileType};base64,${base64String}`;
    
    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        dataURI,
        {
          folder,
          resource_type: 'auto',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });
    
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { error: error.message || 'Error uploading file' },
      { status: 500 }
    );
  }
}