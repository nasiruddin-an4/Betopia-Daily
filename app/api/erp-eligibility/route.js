import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const erpRes = await fetch('https://erp.betopiagroup.com/grocery-api/eligibility/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.NEXT_PUBLIC_ERP_API_KEY || ''
      },
      body: JSON.stringify({ email })
    });

    if (!erpRes.ok) {
      const errorText = await erpRes.text();
      console.error('ERP API Error:', erpRes.status, errorText);
      return NextResponse.json({ success: false, error: `ERP API returned ${erpRes.status}` }, { status: erpRes.status });
    }

    const data = await erpRes.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('ERP Eligibility proxy error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch from ERP eligibility API' }, { status: 500 });
  }
}
