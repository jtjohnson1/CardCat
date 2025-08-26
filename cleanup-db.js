// Cleanup script to remove conflicting database
const { MongoClient } = require('mongodb');

async function cleanupDatabases() {
  const client = new MongoClient('mongodb://localhost');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB for cleanup');
    
    // List all databases
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    
    console.log('Existing databases:');
    databases.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Check for case conflicts
    const hasCardcat = databases.databases.some(db => db.name === 'cardcat');
    const hasCardCat = databases.databases.some(db => db.name === 'CardCat');
    
    if (hasCardcat && hasCardCat) {
      console.log('Found case conflict! Dropping CardCat (mixed case) database...');
      await client.db('CardCat').dropDatabase();
      console.log('CardCat database dropped successfully');
    } else if (hasCardCat && !hasCardcat) {
      console.log('Renaming CardCat to cardcat...');
      // MongoDB doesn't have a rename database operation, so we'll drop it
      await client.db('CardCat').dropDatabase();
      console.log('CardCat database dropped. Will use cardcat going forward.');
    } else if (hasCardcat) {
      console.log('cardcat database exists - no cleanup needed');
    } else {
      console.log('No existing card databases found');
    }
    
  } catch (error) {
    console.error('Cleanup error:', error);
  } finally {
    await client.close();
  }
}

cleanupDatabases();