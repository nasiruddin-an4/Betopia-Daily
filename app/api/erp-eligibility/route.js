import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, microsoft_access_token } = await request.json();

    if (!email && !microsoft_access_token) {
      return NextResponse.json({ success: false, error: 'Email or Microsoft access token is required' }, { status: 400 });
    }

    let erpRes;

    if (microsoft_access_token) {
      // New eligibility endpoint using microsoft_access_token
      erpRes = await fetch('https://erp.betopiagroup.com/grocery-api/eligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${microsoft_access_token}`
        },
        body: JSON.stringify({})
      });
    } else {
      // Legacy eligibility endpoint using email and API Key
      erpRes = await fetch('https://erp.betopiagroup.com/grocery-api/eligibility/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_ERP_API_KEY || ''
        },
        body: JSON.stringify({ email })
      });
    }

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
