// src/app/api/generate-receipt/route.js
import { NextResponse } from 'next/server';
import { generateReceiptHTML } from '@/lib/receiptGenerator';

export async function POST(request) {
  try {
    const data = await request.json();
    const { receiptData } = data;
    
    if (!receiptData) {
      return NextResponse.json({ error: 'Receipt data is required' }, { status: 400 });
    }
    
    const htmlContent = generateReceiptHTML(receiptData);
    
    return new Response(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 });
  }
}