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
    
    // Get current max order number
    const maxOrderResult = await pool.query('SELECT MAX(order_number) as max_order FROM contracts');
    let currentOrderNumber = (maxOrderResult.rows[0]?.max_order || 0);
    
    console.log(`📊 Starting from order number: ${currentOrderNumber + 1}`);
    
    const contractsToGenerate = 1000;
    const contractValue = 1000;
    const currencies = ['RON', 'EUR', 'USD'];
    
    console.log("📝 Generating contracts...");
    
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
          currentOrderNumber,
          randomTemplate.id,
          randomPartner.id,
          contractValue,
          randomCurrency,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          1, // status_id = 1 for draft
          createdDate
        ]);
        
        // Log progress every 100 contracts
        if ((i + 1) % 100 === 0) {
          console.log(`✅ Generated ${i + 1}/${contractsToGenerate} contracts`);
        }
      } catch (error) {
        console.error(`❌ Error generating contract ${i + 1}:`, error.message);
      }
    }
    
    console.log(`🎉 Successfully generated ${contractsToGenerate} contracts!`);
    console.log(`📊 Final order number: ${currentOrderNumber}`);
    
  } catch (error) {
    console.error("❌ Error in contract generation:", error);
  } finally {
    await pool.end();
  }
}

// Run the script
generateContracts();