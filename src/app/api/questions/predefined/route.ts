import { getServerSession, User } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/options';

const predefinedQuestions = [
  {
    id: 1,
    text: "What's your name?",
    type: 'predefined',
    category: 'personal',
  },
  {
    id: 2,
    text: 'What do you do for a living?',
    type: 'predefined',
  },
  {
    id: 3,
    text: 'What are your main interests or hobbies?',
    type: 'predefined',
  },
  {
    id: 4,
    text: 'How would you describe your personality?',
    type: 'predefined',
  },
  {
    id: 5,
    text: 'What kind of tone do you prefer in communication?',
    type: 'predefined',
  },
];

export async function GET() {

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !user) {
        return NextResponse.json({
            statusCode: 401,
            message: 'Unauthorized',
        });
    }
  return NextResponse.json({
    statusCode: 200,
    message: 'Predefined questions retrieved successfully',
    data: predefinedQuestions,
  });
}


