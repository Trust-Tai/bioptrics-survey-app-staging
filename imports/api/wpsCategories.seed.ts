import { WPSCategories } from './wpsCategories';

const seedCategories = [
  {
    name: 'Behavior Safety',
    color: '#f7b32b',
    description: 'Fostering safe behaviors and practices to prevent incidents and promote a culture of responsibility.'
  },
  {
    name: 'Workplace Safety',
    color: '#6a5acd',
    description: 'Ensuring physical, procedural, and regulatory safety in the workplace for all employees.'
  },
  {
    name: 'Knowledge Equity',
    color: '#27b7b7',
    description: 'Promoting equal access to information, training, and opportunities for learning and growth.'
  },
  {
    name: 'Well-Being Safety',
    color: '#ff6f61',
    description: 'Supporting mental, emotional, and physical well-being as integral components of a safe environment.'
  },
  {
    name: 'Built Environment Safety',
    color: '#4caf50',
    description: 'Maintaining and designing physical spaces to minimize hazards and enhance safety for all.'
  },
  {
    name: 'Inclusion Safety',
    color: '#b0802b',
    description: 'Creating an environment where everyone feels valued, respected, and empowered to contribute.'
  },
];

export async function seedWPSCategories() {
  for (const cat of seedCategories) {
    const existing = await WPSCategories.findOneAsync({ name: { $regex: `^${cat.name}$`, $options: 'i' } });
    if (!existing) {
      await WPSCategories.insertAsync(cat);
    }
  }
}

// To run this seed, import and call seedWPSCategories() from Meteor startup on the server side.
