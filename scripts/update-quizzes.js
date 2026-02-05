const { MongoClient } = require('mongodb');

// Connection URL - adjust for production
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_INITDB_DATABASE || 'treinavagaai';

async function updateQuizzes() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const quizzesCollection = db.collection('quizzes');

    // Update all quizzes to isFree: true, except those with "SYDLE" in the title
    const result = await quizzesCollection.updateMany(
      { titulo: { $not: /SYDLE/i } }, // Case insensitive regex
      { $set: { isFree: true } }
    );

    console.log(`Updated ${result.modifiedCount} quizzes to free`);

    // Ensure SYDLE quiz is not free
    const sydleResult = await quizzesCollection.updateMany(
      { titulo: /SYDLE/i },
      { $set: { isFree: false } }
    );

    console.log(`Ensured ${sydleResult.modifiedCount} SYDLE quizzes are not free`);

    // Show current state
    const allQuizzes = await quizzesCollection.find({}, { titulo: 1, isFree: 1 }).toArray();
    console.log('\nCurrent quiz states:');
    allQuizzes.forEach(quiz => {
      console.log(`${quiz.titulo}: ${quiz.isFree ? 'FREE' : 'PAID'}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateQuizzes();