const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { createStrapi } = require('@strapi/strapi');
const bcrypt = require('bcryptjs');

/**
 * Robust Seeder for Rano Store
 * Usage:
 *   npm run seed          - Seeds the database with test data
 *   npm run seed:clean    - Cleans test data only (keeps admin users)
 * 
 * Strapi v5 uses Document Service API with documentId for relations
 */

(async () => {
    const shouldClean = process.argv.includes('--clean');
    
    // Initialize Strapi
    const strapi = await createStrapi({ appDir: process.cwd(), distDir: './dist' }).load();

    try {
        if (shouldClean) {
            console.log('🧹 Cleaning up database...');
            try {
                // Delete in order to respect foreign key constraints
                await strapi.db.query('api::product.product').deleteMany({});
                await strapi.db.query('api::category.category').deleteMany({});
                // Only delete test users (not admin)
                await strapi.db.query('plugin::users-permissions.user').deleteMany({
                    where: { email: { $contains: 'test' } }
                });
                console.log('✨ Database cleaned');
                console.log('✅ Clean finished successfully');
                return;
            } catch (err) {
                console.error('Error during cleanup:', err.message);
                throw err;
            }
        }
        
        console.log('🌱 Starting seeder...');
        console.log('Using Strapi Document Service API (v5)');

        // ============================================
        // 1. CREATE CATEGORIES
        // ============================================
        const categoriesData = [
            { name: 'Hombres', slug: 'hombres', description: 'Ropa y accesorios para hombres' },
            { name: 'Mujeres', slug: 'mujeres', description: 'Ropa y accesorios para mujeres' },
            { name: 'Accesorios', slug: 'accesorios', description: 'Gorras, mochilas, cinturones y más' },
            { name: 'Ofertas', slug: 'ofertas', description: 'Productos en oferta y promociones' }
        ];

        const categoryMap = {};

        for (const cat of categoriesData) {
            // Check if exists using db.query (low-level)
            const existing = await strapi.db.query('api::category.category').findOne({ 
                where: { slug: cat.slug } 
            });
            
            if (!existing) {
                // Use documents() API for v5 - creates and publishes
                const created = await strapi.documents('api::category.category').create({
                    data: { ...cat },
                    status: 'published'
                });
                categoryMap[cat.slug] = created;
                console.log(`✓ Created category: ${cat.name} (documentId: ${created.documentId})`);
            } else {
                categoryMap[cat.slug] = existing;
                console.log(`○ Category exists: ${cat.name}`);
            }
        }

        // ============================================
        // 2. CREATE PRODUCTS
        // ============================================
        const productsData = [
            // == HOMBRES ==
            {
                name: 'Camiseta Básica Negra',
                slug: 'camiseta-basica-negra',
                sku: 'CAM-BAS-BLK-001',
                description: 'Camiseta de algodón 100% de alta calidad. Corte regular, perfecta para el día a día.',
                price: 15,
                comparePrice: 18,
                stock: 50,
                categorySlug: 'hombres',
                featured: true,
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colors: ['Negro', 'Blanco', 'Gris'],
                tags: ['basico', 'algodón', 'casual']
            },
            {
                name: 'Jeans Slim Fit Azul',
                slug: 'jeans-slim-fit',
                sku: 'JNS-SLIM-BLU-002',
                description: 'Jeans ajustados color azul clásico. Denim premium con elastano para mayor comodidad.',
                price: 45,
                comparePrice: null,
                stock: 30,
                categorySlug: 'hombres',
                featured: false,
                sizes: ['28', '30', '32', '34', '36', '38'],
                colors: ['Azul Clásico', 'Azul Oscuro'],
                tags: ['denim', 'slim', 'casual']
            },
            {
                name: 'Camisa Oxford Celeste',
                slug: 'camisa-oxford-celeste',
                sku: 'CAM-OXF-CEL-003',
                description: 'Camisa Oxford de algodón premium. Ideal para ocasiones formales o casual smart.',
                price: 38,
                comparePrice: 42,
                stock: 25,
                categorySlug: 'hombres',
                featured: true,
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Celeste', 'Blanco', 'Rosa'],
                tags: ['formal', 'oxford', 'algodón']
            },
            {
                name: 'Pantalón Chino Beige',
                slug: 'pantalon-chino-beige',
                sku: 'PAN-CHI-BEI-004',
                description: 'Pantalón chino de corte recto. Versátil para cualquier ocasión.',
                price: 35,
                comparePrice: null,
                stock: 40,
                categorySlug: 'hombres',
                featured: false,
                sizes: ['28', '30', '32', '34', '36'],
                colors: ['Beige', 'Azul Marino', 'Verde Oliva'],
                tags: ['chino', 'casual', 'smart']
            },
            // == MUJERES ==
            {
                name: 'Vestido Floral Verano',
                slug: 'vestido-floral',
                sku: 'DRS-FLR-SUM-005',
                description: 'Vestido ligero con estampado floral perfecto para el verano. Tela fresca y fluida.',
                price: 35,
                comparePrice: 45,
                stock: 20,
                categorySlug: 'mujeres',
                featured: true,
                sizes: ['XS', 'S', 'M', 'L'],
                colors: ['Floral Azul', 'Floral Rosa'],
                tags: ['verano', 'floral', 'vestido']
            },
            {
                name: 'Chaqueta de Cuero Negra',
                slug: 'chaqueta-cuero',
                sku: 'JKT-LEA-BLK-006',
                description: 'Chaqueta estilo biker de cuero sintético premium. Forro interior suave.',
                price: 85,
                comparePrice: 95,
                stock: 10,
                categorySlug: 'mujeres',
                featured: true,
                sizes: ['S', 'M', 'L'],
                colors: ['Negro', 'Marrón'],
                tags: ['cuero', 'biker', 'premium']
            },
            {
                name: 'Blusa Seda Natural',
                slug: 'blusa-seda',
                sku: 'BLS-SLK-NAT-007',
                description: 'Blusa elegante de seda natural. Perfecta para ocasiones especiales.',
                price: 55,
                comparePrice: null,
                stock: 15,
                categorySlug: 'mujeres',
                featured: false,
                sizes: ['XS', 'S', 'M', 'L'],
                colors: ['Champagne', 'Blanco', 'Negro'],
                tags: ['seda', 'elegante', 'formal']
            },
            {
                name: 'Jeans Mom Fit',
                slug: 'jeans-mom-fit',
                sku: 'JNS-MOM-BLU-008',
                description: 'Jeans estilo mom fit de tiro alto. Denim 100% algodón.',
                price: 42,
                comparePrice: null,
                stock: 35,
                categorySlug: 'mujeres',
                featured: false,
                sizes: ['24', '26', '28', '30', '32'],
                colors: ['Azul Claro', 'Azul Medio'],
                tags: ['denim', 'mom', 'tiro alto']
            },
            // == ACCESORIOS ==
            {
                name: 'Gorra Urbana Snapback',
                slug: 'gorra-urbana',
                sku: 'HAT-URB-GRY-009',
                description: 'Gorra estilo snapback con logo bordado. Ajuste regulable.',
                price: 12,
                comparePrice: 15,
                stock: 100,
                categorySlug: 'accesorios',
                featured: false,
                sizes: ['Única'],
                colors: ['Negro', 'Gris', 'Blanco'],
                tags: ['gorra', 'snapback', 'urbano']
            },
            {
                name: 'Mochila Canvas Premium',
                slug: 'mochila-canvas',
                sku: 'BAG-CNV-GRN-010',
                description: 'Mochila resistente de lona canvas. Compartimento para laptop 15".',
                price: 28,
                comparePrice: null,
                stock: 25,
                categorySlug: 'accesorios',
                featured: true,
                sizes: ['Única'],
                colors: ['Verde Oliva', 'Negro', 'Beige'],
                tags: ['mochila', 'canvas', 'laptop']
            },
            {
                name: 'Cinturón Cuero Premium',
                slug: 'cinturon-cuero',
                sku: 'BLT-LEA-BRN-011',
                description: 'Cinturón de cuero genuino con hebilla metálica clásica.',
                price: 22,
                comparePrice: 25,
                stock: 45,
                categorySlug: 'accesorios',
                featured: false,
                sizes: ['85cm', '90cm', '95cm', '100cm', '105cm'],
                colors: ['Marrón', 'Negro'],
                tags: ['cuero', 'cinturón', 'clásico']
            },
            {
                name: 'Bufanda Lana Merino',
                slug: 'bufanda-lana',
                sku: 'SCF-WOL-GRY-012',
                description: 'Bufanda suave de lana merino. Perfecta para invierno.',
                price: 18,
                comparePrice: null,
                stock: 30,
                categorySlug: 'accesorios',
                featured: false,
                sizes: ['Única'],
                colors: ['Gris', 'Azul Marino', 'Burdeos'],
                tags: ['lana', 'invierno', 'merino']
            },
            // == OFERTAS ==
            {
                name: 'Pack 3 Camisetas Básicas',
                slug: 'pack-camisetas',
                sku: 'PCK-BAS-MIX-013',
                description: 'Pack de 3 camisetas básicas (Negro, Blanco, Gris). Ahorrá comprando el pack.',
                price: 35,
                comparePrice: 45,
                stock: 20,
                categorySlug: 'ofertas',
                featured: true,
                sizes: ['S', 'M', 'L', 'XL'],
                colors: ['Negro/Blanco/Gris'],
                tags: ['pack', 'básico', 'oferta']
            },
            {
                name: 'Sweater Oversize Outlet',
                slug: 'sweater-outlet',
                sku: 'SWT-OUT-BLK-014',
                description: 'Sweater oversize de temporada pasada. ¡Precio especial!',
                price: 25,
                comparePrice: 48,
                stock: 8,
                categorySlug: 'ofertas',
                featured: false,
                sizes: ['M', 'L', 'XL'],
                colors: ['Negro', 'Beige'],
                tags: ['outlet', 'sweater', 'oversize']
            }
        ];

        for (const prod of productsData) {
            const { categorySlug, ...productFields } = prod;
            
            // Check if product exists
            const existing = await strapi.db.query('api::product.product').findOne({ 
                where: { slug: productFields.slug } 
            });
            
            if (!existing) {
                // Get category documentId for relation
                const category = categoryMap[categorySlug];
                
                if (!category) {
                    console.warn(`⚠ Category not found for ${productFields.name}: ${categorySlug}`);
                    continue;
                }

                // Strapi v5: Use connect with documentId for relations
                const created = await strapi.documents('api::product.product').create({
                    data: {
                        ...productFields,
                        // For many-to-one relation, use connect syntax
                        category: {
                            connect: [{ documentId: category.documentId }]
                        }
                    },
                    status: 'published'
                });

                console.log(`✓ Created product: ${productFields.name} (${productFields.sku}) -> ${categorySlug}`);
            } else {
                console.log(`○ Product exists: ${productFields.name}`);
            }
        }

        // ============================================
        // 3. CREATE TEST USERS
        // ============================================
        const roles = await strapi.db.query('plugin::users-permissions.role').findMany();
        
        for (const role of roles) {
            // Skip creating public role users (doesn't make sense)
            if (role.type === 'public') continue;
            
            const username = `test_${role.type}`;
            const email = `test_${role.type}@example.com`;
            const password = 'Password123!';
            
            const existingUser = await strapi.db.query('plugin::users-permissions.user').findOne({ 
                where: { email } 
            });
            
            if (!existingUser) {
                // Hash password using bcrypt (same as Strapi uses internally)
                const hashedPassword = await bcrypt.hash(password, 10);
                
                await strapi.db.query('plugin::users-permissions.user').create({
                    data: {
                        username,
                        email,
                        password: hashedPassword,
                        role: role.id,
                        confirmed: true,
                        blocked: false,
                        provider: 'local'
                    }
                });
                console.log(`✓ Created user: ${username} (${role.name}) - password: ${password}`);
            } else {
                console.log(`○ User exists: ${username}`);
            }
        }

        // ============================================
        // SUMMARY
        // ============================================
        console.log('\n========================================');
        console.log('✅ Seeder finished successfully!');
        console.log('========================================');
        console.log(`Categories: ${Object.keys(categoryMap).length}`);
        console.log(`Products: ${productsData.length}`);
        console.log(`Test Users: ${roles.filter(r => r.type !== 'public').length}`);
        console.log('\nTest user credentials:');
        console.log('  Email: test_authenticated@example.com');
        console.log('  Password: Password123!');
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Seeder failed:', error);
    } finally {
        process.exit(0);
    }
})();
