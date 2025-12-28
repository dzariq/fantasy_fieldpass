import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        const response = await fetch('https://n8n.fieldpass.com.my/webhook/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to verify OTP' },
            { status: 500 }
        );
    }
}