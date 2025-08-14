import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool });

async function generateContracts() {
  console.log("🚀 Starting contract generation...");
  
  try {
    // Get all partners
    const partnersResult = await pool.query('SELECT * FROM partners ORDER BY id');
    const partners = partnersResult.rows;
    console.log(`📋 Found ${partners.length} partners`);
    
    // Get all templates
    const templatesResult = await pool.query('SELECT * FROM contract_templates ORDER BY id');
    const templates = templatesResult.rows;
    console.log(`📄 Found ${templates.length} templates`);
    
    if (partners.length === 0 || templates.length === 0) {
      console.log("❌ No partners or templates found. Cannot generate contracts.");
      return;
    }
    
    // Get current max order number - cast to integer since order_number might be text
    const maxOrderResult = await pool.query('SELECT MAX(CAST(order_number AS INTEGER)) as max_order FROM contracts');
    let currentOrderNumber = parseInt(maxOrderResult.rows[0]?.max_order || 0);
    
    console.log(`📊 Starting from order number: ${currentOrderNumber + 1}`);
    
    const contractsToGenerate = 10000;
    const contractValue = 1000;
    const currencies = ['RON', 'EUR', 'USD'];
    
    console.log("📝 Generating contracts...");
    
    let successfulContracts = 0;
    let skippedContracts = 0;
    
    for (let i = 0; i < contractsToGenerate; i++) {
      // Select random partner and template
      const randomPartner = partners[Math.floor(Math.random() * partners.length)];
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
      
      // Generate random dates
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30)); // 0-30 days from now
      
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 365) + 30); // 30-395 days after start
      
      const createdDate = new Date();
      
      currentOrderNumber++;
      
      // Skip if order number already exists
      const existsResult = await pool.query('SELECT 1 FROM contracts WHERE order_number = $1', [currentOrderNumber.toString()]);
      if (existsResult.rows.length > 0) {
        skippedContracts++;
        // Find next available order number
        while (true) {
          currentOrderNumber++;
          const checkResult = await pool.query('SELECT 1 FROM contracts WHERE order_number = $1', [currentOrderNumber.toString()]);
          if (checkResult.rows.length === 0) break;
        }
      }
      
      try {
        await pool.query(`
          INSERT INTO contracts (
            order_number, 
            template_id, 
            beneficiary_id, 
            value, 
            currency, 
            start_date, 
            end_date, 
            status_id,
            created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `, [
          currentOrderNumber.toString(),
          randomTemplate.id,
          randomPartner.id,
          contractValue,
          randomCurrency,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          1, // status_id = 1 for draft
          createdDate
        ]);
        
        successfulContracts++;
        
        // Log progress every 500 contracts
        if (successfulContracts % 500 === 0) {
          console.log(`✅ Generated ${successfulContracts}/${contractsToGenerate} contracts (skipped ${skippedContracts} duplicates)`);
        }
      } catch (error) {
        console.error(`❌ Error generating contract ${i + 1}:`, error.message);
        skippedContracts++;
      }
    }
    
    console.log(`🎉 Successfully generated ${successfulContracts}/${contractsToGenerate} contracts!`);
    console.log(`📊 Skipped ${skippedContracts} duplicates`);
    console.log(`📊 Final order number: ${currentOrderNumber}`);
    
  } catch (error) {
    console.error("❌ Error in contract generation:", error);
  } finally {
    await pool.end();
  }
}

// Run the script
generateContracts();