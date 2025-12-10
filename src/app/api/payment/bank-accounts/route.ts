import { NextResponse } from 'next/server';
import { BANK_ACCOUNTS } from '@/lib/constants';

export async function GET() {
  return NextResponse.json(BANK_ACCOUNTS);
}
