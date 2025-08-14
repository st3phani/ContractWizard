import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function bulkInsertContracts() {
  console.log("🚀 Starting bulk contract generation...");
  
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
    const maxOrderResult = await pool.query('SELECT MAX(CAST(order_number AS INTEGER)) as max_order FROM contracts');
    let startOrderNumber = parseInt(maxOrderResult.rows[0]?.max_order || 0) + 1;
    
    console.log(`📊 Starting from order number: ${startOrderNumber}`);
    
    const contractsToGenerate = 10000;
    const contractValue = 1000;
    const currencies = ['RON', 'EUR', 'USD'];
    const batchSize = 100; // Insert in batches for better performance
    
    console.log("📝 Generating contracts in batches...");
    
    let totalGenerated = 0;
    
    for (let batch = 0; batch < Math.ceil(contractsToGenerate / batchSize); batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, contractsToGenerate);
      const batchContracts = [];
      
      for (let i = batchStart; i < batchEnd; i++) {
        // Select random partner and template
        const randomPartner = partners[Math.floor(Math.random() * partners.length)];
        const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
        const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
        
        // Generate random dates
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 365) + 30);
        
        const createdDate = new Date();
        const orderNumber = startOrderNumber + i;
        
        batchContracts.push({
          orderNumber: orderNumber.toString(),
          templateId: randomTemplate.id,
          beneficiaryId: randomPartner.id,
          value: contractValue,
          currency: randomCurrency,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          statusId: 1,
          createdAt: createdDate
        });
      }
      
      // Build batch INSERT query
      const valuePlaceholders = batchContracts.map((_, idx) => {
        const base = idx * 9;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`;
      }).join(', ');
      
      const values = batchContracts.flatMap(contract => [
        contract.orderNumber,
        contract.templateId,
        contract.beneficiaryId,
        contract.value,
        contract.currency,
        contract.startDate,
        contract.endDate,
        contract.statusId,
        contract.createdAt
      ]);
      
      const insertQuery = `
        INSERT INTO contracts (
          order_number, template_id, beneficiary_id, value, currency,
          start_date, end_date, status_id, created_at
        ) VALUES ${valuePlaceholders}
        ON CONFLICT (order_number) DO NOTHING
      `;
      
      try {
        const result = await pool.query(insertQuery, values);
        totalGenerated += result.rowCount || 0;
        console.log(`✅ Batch ${batch + 1}/${Math.ceil(contractsToGenerate / batchSize)}: Inserted ${result.rowCount || 0} contracts (Total: ${totalGenerated})`);
      } catch (error) {
        console.error(`❌ Error in batch ${batch + 1}:`, error.message);
      }
    }
    
    console.log(`🎉 Successfully generated ${totalGenerated} new contracts!`);
    console.log(`📊 Final order number: ${startOrderNumber + contractsToGenerate - 1}`);
    
  } catch (error) {
    console.error("❌ Error in bulk contract generation:", error);
  } finally {
    await pool.end();
  }
}

// Run the script
bulkInsertContracts();