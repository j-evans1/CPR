import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';

export async function POST() {
  try {
    console.log('Initializing database...');
    await initDb();
    console.log('Database initialized successfully');
    return NextResponse.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to initialize database' },
      { status: 500 }
    );
  }
}
