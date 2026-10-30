export interface PromptOption {
  id: string;
  category: 'ABOUT ME' | 'FUN' | 'LIFESTYLE';
  text: string;
}

export const PROMPT_OPTIONS: PromptOption[] = [
  // ABOUT ME
  { id: 'am1', category: 'ABOUT ME', text: "I'm known for..." },
  { id: 'am2', category: 'ABOUT ME', text: 'A random fact I love is...' },
  { id: 'am3', category: 'ABOUT ME', text: 'My most irrational fear is...' },
  { id: 'am4', category: 'ABOUT ME', text: 'The key to my heart is...' },
  { id: 'am5', category: 'ABOUT ME', text: 'I go crazy for...' },
  { id: 'am6', category: 'ABOUT ME', text: "We'll get along if..." },
  { id: 'am7', category: 'ABOUT ME', text: 'I bet you can\'t...' },
  { id: 'am8', category: 'ABOUT ME', text: 'My love language is...' },
  // FUN
  { id: 'f1', category: 'FUN', text: 'My most useless skill is...' },
  { id: 'f2', category: 'FUN', text: 'Two truths and a lie...' },
  { id: 'f3', category: 'FUN', text: 'I\'m overly competitive when it comes to...' },
  { id: 'f4', category: 'FUN', text: 'The dorkiest thing about me is...' },
  { id: 'f5', category: 'FUN', text: 'Change my mind...' },
  { id: 'f6', category: 'FUN', text: 'I\'ll never shut up about...' },
  { id: 'f7', category: 'FUN', text: 'My therapist would say...' },
  { id: 'f8', category: 'FUN', text: 'Unpopular opinion...' },
  // LIFESTYLE
  { id: 'l1', category: 'LIFESTYLE', text: 'My perfect weekend looks like...' },
  { id: 'l2', category: 'LIFESTYLE', text: 'I feel most alive when...' },
  { id: 'l3', category: 'LIFESTYLE', text: 'The one thing I\'d change about the world is...' },
  { id: 'l4', category: 'LIFESTYLE', text: 'What I value most in a relationship is...' },
  { id: 'l5', category: 'LIFESTYLE', text: 'My favorite way to unwind is...' },
  { id: 'l6', category: 'LIFESTYLE', text: 'If I could travel anywhere tomorrow...' },
];
